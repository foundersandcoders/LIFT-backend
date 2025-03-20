# Backend Authentication Implementation Plan

## Overview

This document outlines the plan for implementing secure authentication in the LIFT backend using the better-auth library, which is already being used by the frontend. This approach will ensure perfect compatibility between frontend and backend authentication flows, particularly for the magic link authentication method.

## Authentication Flow with better-auth

1. **User requests a Magic Link**
   - Frontend client calls `authClient.signIn.magicLink({email, callbackURL})`
   - Backend receives request at `/auth/signin/magic-link` endpoint
   - Backend generates a secure token and calls our custom email sending function
   - Email with magic link is sent to the user

2. **User clicks Magic Link**
   - User is redirected to the frontend application with token in URL
   - Frontend extracts token and calls `authClient.magicLink.verify({query: {token}})`
   - Backend verifies token, creates or retrieves user, and establishes session
   - Backend returns user data to frontend

3. **Session Management**
   - Sessions are maintained via HTTP-only cookies (handled by better-auth)
   - User data is accessible via `/auth/user` endpoint
   - Sessions expire after configured time period

## Implementation Tasks

### Task 1: Install better-auth Dependencies

**Overview:** Install better-auth packages and update project dependencies.

**Steps:**

1. Add better-auth to the project:

   ```json
   "better-auth": "npm:better-auth@1.2.3",
   "better-auth-plugins": "npm:better-auth-plugins@1.2.3"
   ```

2. Update imports in deno.jsonc to include these packages

### Task 2: Create Auth Configuration

**Overview:** Create a configuration file for better-auth.

**Steps:**

1. Create `/utils/auth/authConfig.ts`:

   ```typescript
   import { betterAuth } from "better-auth";
   import { magicLink } from "better-auth/plugins";
   import { sendMagicLinkEmail } from "api/resend/sendMagicLink.ts";
   
   // Environment variables
   const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
   const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
   
   export const auth = betterAuth({
     secretKey: JWT_SECRET,
     baseUrl: frontendUrl,
     plugins: [
       magicLink({
         // Magic link expires in 10 minutes (600 seconds)
         expiresIn: 600,
         // Allow new user sign-up with magic links
         disableSignUp: false,
         // Send magic link emails via our custom function
         sendMagicLink: async ({ email, token, url }, request) => {
           // Our custom function to send email using Resend API
           await sendMagicLinkEmail(email, url);
         }
       })
     ]
   });
   ```

### Task 3: Create Magic Link Email Function

**Overview:** Create a function to send magic link emails using the Resend API.

**Steps:**

1. Create `/api/resend/sendMagicLink.ts`:

   ```typescript
   const resendKey = Deno.env.get("RESEND_KEY");
   
   export async function sendMagicLinkEmail(
     email: string,
     magicLinkUrl: string
   ): Promise<{ success: boolean; error?: string }> {
     try {
       console.group("|=== sendMagicLinkEmail() ===");
       console.info("| Parameters");
       console.table([
         { is: "email", value: email },
         { is: "magicLinkUrl", value: magicLinkUrl },
       ]);
       
       const res = await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${resendKey}`,
         },
         body: JSON.stringify({
           from: "LIFT <auth@beacons.ink>",
           to: `<${email}>`,
           subject: "Sign in to LIFT",
           html: `
             <div>
               <h1>Sign in to LIFT</h1>
               <p>Click the link below to sign in:</p>
               <a href="${magicLinkUrl}">Sign In</a>
               <p>This link will expire in 10 minutes.</p>
             </div>
           `,
         }),
       });
       
       if (res.ok) {
         console.info("| Magic link email sent successfully");
         console.groupEnd();
         return { success: true };
       } else {
         const errorData = await res.text();
         console.warn(`| Error: ${errorData}`);
         console.groupEnd();
         return { success: false, error: errorData };
       }
     } catch (error) {
       console.error("Error sending magic link:", error);
       console.groupEnd();
       return { success: false, error: error.message };
     }
   }
   ```

### Task 4: Create Neo4j User Store

**Overview:** Create a custom user store for better-auth that uses Neo4j.

**Steps:**

1. Create `/utils/auth/neo4jUserStore.ts`:

   ```typescript
   import neo4j, { Driver } from "neo4j";
   import { creds as c } from "utils/auth/neo4jCred.ts";
   import { v4 } from "https://deno.land/std@0.159.0/uuid/mod.ts";
   
   // This will implement the UserStore interface from better-auth
   export class Neo4jUserStore {
     async findUserByEmail(email: string) {
       let driver: Driver | undefined;
       
       try {
         driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
         await driver.getServerInfo();
         
         const result = await driver.executeQuery(
           `MATCH (u:User {email: $email})
            RETURN u.id as id, u.email as email, u.username as username`,
           { email },
           { database: "neo4j" }
         );
         
         if (result.records.length === 0) {
           return null;
         }
         
         const record = result.records[0];
         return {
           id: record.get("id"),
           email: record.get("email"),
           username: record.get("username"),
         };
       } catch (error) {
         console.error("Database error:", error);
         return null;
       } finally {
         await driver?.close();
       }
     }
     
     async createUser(userData: { email: string; username?: string }) {
       let driver: Driver | undefined;
       
       try {
         driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
         await driver.getServerInfo();
         
         const userId = v4.generate();
         
         const result = await driver.executeQuery(
           `CREATE (u:User {
              id: $userId,
              email: $email,
              username: $username,
              createdAt: datetime()
            })
            RETURN u.id as id, u.email as email, u.username as username`,
           { 
             userId,
             email: userData.email,
             username: userData.username || null,
           },
           { database: "neo4j" }
         );
         
         const record = result.records[0];
         return {
           id: record.get("id"),
           email: record.get("email"),
           username: record.get("username"),
         };
       } catch (error) {
         console.error("Database error:", error);
         throw new Error("Failed to create user");
       } finally {
         await driver?.close();
       }
     }
     
     async getUserById(userId: string) {
       let driver: Driver | undefined;
       
       try {
         driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
         await driver.getServerInfo();
         
         const result = await driver.executeQuery(
           `MATCH (u:User {id: $userId})
            OPTIONAL MATCH (u)-[:HAS_MANAGER]->(m:User)
            RETURN u.id as id, u.email as email, u.username as username,
                  m.name as managerName, m.email as managerEmail`,
           { userId },
           { database: "neo4j" }
         );
         
         if (result.records.length === 0) {
           return null;
         }
         
         const record = result.records[0];
         const user = {
           id: record.get("id"),
           email: record.get("email"),
           username: record.get("username"),
         };
         
         const managerName = record.get("managerName");
         const managerEmail = record.get("managerEmail");
         
         if (managerName || managerEmail) {
           user.manager = {
             name: managerName,
             email: managerEmail,
           };
         }
         
         return user;
       } catch (error) {
         console.error("Database error:", error);
         return null;
       } finally {
         await driver?.close();
       }
     }
     
     async updateUserManager(userId: string, managerName: string, managerEmail: string) {
       let driver: Driver | undefined;
       
       try {
         driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
         await driver.getServerInfo();
         
         await driver.executeQuery(
           `MATCH (u:User {id: $userId})
            MERGE (u)-[:HAS_MANAGER]->(m:User {email: $managerEmail})
            ON CREATE SET m.name = $managerName
            ON MATCH SET m.name = $managerName`,
           { userId, managerName, managerEmail },
           { database: "neo4j" }
         );
         
         return true;
       } catch (error) {
         console.error("Database error:", error);
         return false;
       } finally {
         await driver?.close();
       }
     }
   }
   
   export const userStore = new Neo4jUserStore();
   ```

2. Update the auth configuration to use this store:

   ```typescript
   // In authConfig.ts
   import { userStore } from "./neo4jUserStore.ts";
   
   export const auth = betterAuth({
     secretKey: JWT_SECRET,
     baseUrl: frontendUrl,
     userStore: userStore,
     plugins: [
       // ...
     ]
   });
   ```

### Task 5: Implement Authentication Routes

**Overview:** Create routes that integrate with better-auth.

**Steps:**

1. Update `/routes/authRoutes/authRoutes.ts`:

   ```typescript
   import { Router } from "oak";
   import { auth } from "utils/auth/authConfig.ts";
   
   const router = new Router();
   const routes: string[] = [];
   
   // Magic link request endpoint
   router.post("/signin/magic-link", async (ctx) => {
     try {
       // This delegates to better-auth's magic link handler
       await auth.handleRequest(ctx.request, ctx.response);
     } catch (error) {
       console.error("Magic link error:", error);
       ctx.response.status = 500;
       ctx.response.body = { 
         success: false, 
         error: { message: "Failed to send magic link" } 
       };
     }
   });
   
   // Verify token endpoint
   router.get("/verify", async (ctx) => {
     try {
       // This delegates to better-auth's verify handler
       await auth.handleRequest(ctx.request, ctx.response);
     } catch (error) {
       console.error("Verification error:", error);
       ctx.response.status = 500;
       ctx.response.body = { 
         success: false, 
         error: { message: "Token verification failed" } 
       };
     }
   });
   
   // Get current user endpoint
   router.get("/user", async (ctx) => {
     try {
       // This delegates to better-auth's user handler
       await auth.handleRequest(ctx.request, ctx.response);
     } catch (error) {
       console.error("User fetch error:", error);
       ctx.response.status = 401;
       ctx.response.body = { 
         error: { message: "Not authenticated" } 
       };
     }
   });
   
   // Sign out endpoint
   router.post("/signout", async (ctx) => {
     try {
       // This delegates to better-auth's sign out handler
       await auth.handleRequest(ctx.request, ctx.response);
     } catch (error) {
       console.error("Sign out error:", error);
       ctx.response.status = 500;
       ctx.response.body = { 
         success: false, 
         error: { message: "Failed to sign out" } 
       };
     }
   });
   
   routes.push("/signin/magic-link");
   routes.push("/verify");
   routes.push("/user");
   routes.push("/signout");
   
   export {
     router as authRouter,
     routes as authRoutes
   };
   ```

### Task 6: Create Authentication Middleware

**Overview:** Create a middleware for protecting routes with better-auth.

**Steps:**

1. Create `/utils/auth/authMiddleware.ts`:

   ```typescript
   import { Context, Next } from "oak";
   import { auth } from "./authConfig.ts";
   
   export async function authMiddleware(ctx: Context, next: Next) {
     try {
       // Get the session from better-auth
       const session = await auth.getSession(ctx.request);
       
       if (!session || !session.user) {
         ctx.response.status = 401;
         ctx.response.body = {
           error: { message: "Not authenticated" }
         };
         return;
       }
       
       // Attach user to context state
       ctx.state.user = session.user;
       
       await next();
     } catch (error) {
       console.error("Auth middleware error:", error);
       ctx.response.status = 401;
       ctx.response.body = {
         error: { message: "Authentication failed" }
       };
     }
   }
   ```

### Task 7: Update CORS Configuration for Cookies

**Overview:** Configure CORS for better-auth's cookie-based sessions.

**Steps:**

1. Update CORS middleware in `main.ts`:

   ```typescript
   async function customCors(ctx: Context, next: () => Promise<unknown>) {
     const allowedOrigin = Deno.env.get("FRONTEND_ORIGIN") || "*";
     
     ctx.response.headers.set(
       "Access-Control-Allow-Origin",
       allowedOrigin
     );
     
     ctx.response.headers.set(
       "Access-Control-Allow-Methods",
       "GET, POST, PUT, DELETE, OPTIONS",
     );
     
     ctx.response.headers.set(
       "Access-Control-Allow-Headers",
       "Content-Type, Authorization",
     );
     
     // Required for better-auth cookie sessions
     ctx.response.headers.set(
       "Access-Control-Allow-Credentials",
       "true",
     );
     
     if (ctx.request.method === "OPTIONS") {
       ctx.response.status = 204;
       return;
     }
     
     await next();
   }
   ```

### Task 8: Register Auth Routes in Hub Router

**Overview:** Register auth routes in the main hub router.

**Steps:**

1. Update `/routes/hubRoutes.ts` to include the auth router:

   ```typescript
   // Add import
   import { authRouter, authRoutes } from "routes/authRoutes/authRoutes.ts";
   
   // Add to subs object
   const subs = {
     // ... existing routers
     "/auth": { router: authRouter, routes: authRoutes },
   };
   
   // Make sure it's used at the end of the file
   router.use("/auth", authRouter.routes());
   ```

### Task 9: Update Protected Routes

**Overview:** Secure existing routes that should require authentication.

**Steps:**

1. Update routes in `/routes/dbRoutes/writeRoutes.ts`:

   ```typescript
   import { authMiddleware } from "utils/auth/authMiddleware.ts";
   
   // Update route to use auth middleware
   router.post("/newBeacon", authMiddleware, async (ctx) => {
     // Now ctx.state.user contains the authenticated user
     const user = ctx.state.user;
     
     // Rest of the code...
   });
   ```

2. Apply similar updates to other routes that should require authentication.

### Task 10: Environment Configuration

**Overview:** Add environment variables for better-auth.

**Steps:**

1. Add to `.env.local`:

   ```env
   # Authentication
   JWT_SECRET=your_development_secret_key_here
   FRONTEND_URL=http://localhost:3000
   ```

### Task 11: Create Manager Update Endpoint

**Overview:** Create an endpoint to update the user's manager information.

**Steps:**

1. Add to `/routes/dbRoutes/editRoutes.ts`:

   ```typescript
   import { authMiddleware } from "utils/auth/authMiddleware.ts";
   import { userStore } from "utils/auth/neo4jUserStore.ts";
   import { z } from "zod";
   
   // Add schema validation
   const editManagerSchema = z.object({
     managerName: z.string(),
     managerEmail: z.string().email("Invalid manager email"),
   });
   
   router.put("/editManager", authMiddleware, async (ctx) => {
     try {
       const body = await ctx.request.body.json();
       const user = ctx.state.user;
       
       // Validate request body
       const result = editManagerSchema.safeParse(body);
       if (!result.success) {
         ctx.response.status = 400;
         ctx.response.body = { 
           success: false,
           error: { message: "Invalid request data" }
         };
         return;
       }
       
       const { managerName, managerEmail } = result.data;
       
       // Update manager information
       const updateResult = await userStore.updateUserManager(
         user.id, 
         managerName, 
         managerEmail
       );
       
       if (!updateResult) {
         ctx.response.status = 500;
         ctx.response.body = { 
           success: false,
           error: { message: "Failed to update manager information" }
         };
         return;
       }
       
       ctx.response.status = 200;
       ctx.response.body = { success: true };
     } catch (error) {
       console.error("Error updating manager:", error);
       
       ctx.response.status = 500;
       ctx.response.body = { 
         success: false,
         error: { message: "Internal server error" }
       };
     }
   });
   ```

## Integration with Frontend

The backend implementation will now integrate seamlessly with the frontend that uses better-auth:

1. **Complete API Compatibility**:
   - All endpoints (`/auth/signin/magic-link`, `/auth/verify`, `/auth/user`, `/auth/signout`) are directly handled by better-auth
   - Request and response formats match exactly what the better-auth client expects

2. **Session Management**:
   - Cookie-based sessions handled by better-auth
   - HTTP-only cookies for security
   - Same session format expected by the frontend client

3. **Authentication Flow**:
   - Matching flow for magic link requests and verification
   - Consistent user data format
   - Proper error handling according to better-auth expectations

## Security Considerations

1. **Token Security**:
   - Secure token generation and validation handled by better-auth
   - 10-minute expiration for magic links
   - Signed cookies for session management

2. **Cookie Security**:
   - HTTP-only cookies prevent JavaScript access
   - Secure flag in production ensures HTTPS only
   - SameSite policy prevents CSRF attacks

3. **Input Validation**:
   - Zod schema validation for custom endpoints
   - better-auth's built-in validation for auth endpoints

4. **Error Handling**:
   - Consistent error response format aligned with better-auth
   - Limited error details to prevent information leakage

## Testing

To test the authentication system:

1. Set up environment variables
2. Request a magic link for a test email
3. Check the logs or email service for the sent link
4. Test the verification flow by using the link
5. Test protected routes with and without authentication
6. Verify manager update functionality

## Conclusion

This implementation plan leverages the better-auth library directly, ensuring perfect compatibility with the frontend client. By using better-auth's built-in functionality combined with our custom Neo4j user store, we get the best of both worlds: seamless frontend integration and persistence in our existing database structure.
