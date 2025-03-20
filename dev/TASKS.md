# Authentication Implementation Task Plan

Based on the frontend team's response and review of the current codebase, here's a comprehensive task-by-task plan for implementing authentication in the LIFT backend.

## Task 1: Set Up Dependencies and Interfaces

### Task 1 Overview

Install JWT library for Deno and create auth-related interfaces.

### Task 1 Justification

Before implementing any functionality, we need to set up the required dependencies and define interfaces for our authentication system. JWT is the industry standard for tokens, and properly defining interfaces will ensure type safety throughout the implementation.

### Task 1 Steps

1. Add the JWT library to the project:
  - Add "djwt": "https://deno.land/x/djwt@v2.8/mod.ts", to the imports in deno.jsonc
2. Create a new file at /types/authTypes.ts with the following interfaces:

```ts
// Define interfaces for authentication
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}
```

```ts
export interface UserWithManager extends AuthUser {
  manager?: {
    name?: string;
    email?: string;
  } | null;
}

export interface MagicLinkRequest {
  email: string;
  callbackURL?: string;
}

export interface MagicLinkResponse {
  success: boolean;
}

export interface VerifyResponse {
  success: boolean;
  user: AuthUser | null;
}

export interface MagicLinkToken {
  email: string;
  exp: number;
  iat: number;
  type: "magic-link";
}

export interface SessionToken {
  userId: string;
  email: string;
  exp: number;
  iat: number;
  type: "session";
}
```

## Task 2: Create Token Utility Functions

### Task 2 Overview

Create utility functions for token generation, validation, and cookie management.

### Task 2 Justification

We need a centralized place for token-related functions that can be reused across routes. These functions
will handle token generation, validation, and cookie management according to frontend requirements.

### Task 2 Steps

1. Create a new file at /utils/auth/tokenUtils.ts with the following code:

```ts
export
import { create, verify } from "djwt";
import { Context } from "oak";
import { MagicLinkToken, SessionToken } from "types/authTypes.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";

// Token expiration times (in seconds)
const MAGIC_LINK_EXPIRES_IN = 10 * 60; // 10 minutes
const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days

export async function createMagicLinkToken(email: string): Promise<string> {
  const payload: MagicLinkToken = {
    email,
    exp: Math.floor(Date.now() / 1000) + MAGIC_LINK_EXPIRES_IN,
    iat: Math.floor(Date.now() / 1000),
    type: "magic-link",
  };

  return await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET);
}

export async function createSessionToken(userId: string, email: string): Promise<string> {
  const payload: SessionToken = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRES_IN,
    iat: Math.floor(Date.now() / 1000),
    type: "session",
  };

  return await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET);
}

export async function verifyMagicLinkToken(token: string): Promise<MagicLinkToken | null> {
  try {
    const payload = await verify(token, JWT_SECRET);
    if (payload && payload.type === "magic-link") {
      return payload as MagicLinkToken;
    }
    return null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    const payload = await verify(token, JWT_SECRET);
    if (payload && payload.type === "session") {
      return payload as SessionToken;
    }
    return null;
  } catch (error) {
    console.error("Session token verification error:", error);
    return null;
  }
}

export function setSessionCookie(ctx: Context, token: string): void {
  const isProduction = Deno.env.get("ENVIRONMENT") === "production";

  ctx.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRES_IN,
  });
}

export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.delete("auth_token");
}
```

## Task 3: Create Database Functions for User Management

### Overview

Create Neo4j functions to manage users in the database.

### Justification

We need functions to create, retrieve, and update users in the Neo4j database. These functions will be used
by the authentication routes.

### Steps

1. Create a new file at /api/neo4j/userOperations.ts:

```ts
import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/auth/neo4jCred.ts";
import { v4 } from "https://deno.land/std@0.159.0/uuid/mod.ts";
import { AuthUser, UserWithManager } from "types/authTypes.ts";

export async function findOrCreateUser(email: string): Promise<AuthUser> {
  let driver: Driver | undefined;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();

    // Generate UUID if user doesn't exist
    const userId = v4.generate();

    const result = await driver.executeQuery(
      `MERGE (u:User {email: $email})
        ON CREATE SET u.id = $userId, u.createdAt = datetime()
        RETURN u.id as id, u.email as email, u.username as username`,
      { email, userId },
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
    throw new Error("Failed to find or create user");
  } finally {
    await driver?.close();
  }
}

export async function getUserById(userId: string): Promise<UserWithManager | null> {
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
    const user: UserWithManager = {
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
    } else {
      user.manager = null;
    }

    return user;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  } finally {
    await driver?.close();
  }
}

export async function updateUserManager(
  userId: string, 
  managerName?: string, 
  managerEmail?: string
): Promise<boolean> {
  if (!managerName && !managerEmail) {
    return false;
  }

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
```

## Task 4: Implement the Email Sending Function for Magic Links

### Task 4 Overview

Create a function to send magic link emails.

### Task 4 Justification

The authentication flow requires sending emails with magic links. We'll use the existing Resend API
integration to implement this functionality.

### Task 4 Steps

1. Create a new file at /api/resend/sendMagicLink.ts:

```ts
import { MagicLinkToken } from "types/authTypes.ts";

const resendKey = Deno.env.get("RESEND_KEY");
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

export async function sendMagicLink(
  email: string,
  token: string,
  callbackURL = "/main"
): Promise<{ success: boolean; error?: string }> {
  try {
    console.group("|=== sendMagicLink() ===");
    console.info("| Parameters");
    console.table([
      { is: "email", value: email },
      { is: "callbackURL", value: callbackURL },
    ]);

    const magicLinkUrl = `${frontendUrl}/auth/verify?token=${token}&redirect=${encodeURIComponent(callbackURL)}`;

    console.info("| Fetching from Resend API");
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

## Task 5: Implement the Magic Link Request Endpoint

### Task 5 Overview

Implement the /auth/signin/magic-link endpoint to handle magic link requests.

### Task 5 Justification

This is the entry point for the authentication flow. Users will request a magic link by providing their
email address.

### Task 5 Steps

1. Update /routes/authRoutes/authRoutes.ts with the magic link endpoint:
```ts
import { Router } from "oak";
import { z } from "zod";
import { createMagicLinkToken } from "utils/auth/tokenUtils.ts";
import { sendMagicLink } from "api/resend/sendMagicLink.ts";
import { MagicLinkRequest } from "types/authTypes.ts";

const router = new Router();
const routes: string[] = [];

// Schema validation for magic link request
const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
  callbackURL: z.string().optional(),
});

router.post("/signin/magic-link", async (ctx) => {
  try {
    const body = await ctx.request.body.json();

    // Validate request body
    const result = magicLinkSchema.safeParse(body);
    if (!result.success) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Invalid request data" }
      };
      return;
    }

    const { email, callbackURL = "/main" } = result.data as MagicLinkRequest;

    // Create a JWT token for magic link
    const token = await createMagicLinkToken(email);

    // Send magic link email
    const sendResult = await sendMagicLink(email, token, callbackURL);

    if (sendResult.success) {
      ctx.response.status = 200;
      ctx.response.body = { success: true };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: { message: "Failed to send magic link" }
      };
    }
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: { message: "Internal server error" }
    };
  }
});

// Keep existing route definitions...

routes.push("/signin/magic-link");
// Keep other route entries...

export {
  router as authRouter,
  routes as authRoutes
};
```

## Task 6: Implement Token Verification Endpoint

### Task 6 Overview

Implement the /auth/verify endpoint to verify magic link tokens.

### Task 6 Justification

When users click the magic link, the frontend will extract the token and call this endpoint to verify it and
  establish a session.

### Task 6 Steps

1. Update the existing verify endpoint in /routes/authRoutes/authRoutes.ts:

```ts
router.get("/verify", async (ctx) => {
  try {
    const token = ctx.request.url.searchParams.get("token");

    if (!token) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "No token provided" }
      };
      return;
    }

    // Verify the magic link token
    const payload = await verifyMagicLinkToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        error: { message: "Invalid or expired token" }
      };
      return;
    }

    // Find or create user
    const user = await findOrCreateUser(payload.email);

    // Create session token
    const sessionToken = await createSessionToken(user.id, user.email);

    // Set session cookie
    setSessionCookie(ctx, sessionToken);

    // Return success with user data
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: { message: "Internal server error" }
    };
  }
});
```

## Task 7: Create Authentication Middleware

### Task 7 Overview

Create a middleware to verify session tokens for protected routes.

### Task 7 Justification

We need a reusable middleware to check if users are authenticated before allowing access to protected
routes.

### Task 7 Steps

1. Create a new file at /utils/auth/authMiddleware.ts:

```ts
import { Context, Next } from "oak";
import { verifySessionToken } from "./tokenUtils.ts";
import { getUserById } from "api/neo4j/userOperations.ts";

export async function authMiddleware(ctx: Context, next: Next) {
  // Get token from cookies
  const token = await ctx.cookies.get("auth_token");

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = {
      error: { message: "Not authenticated" }
    };
    return;
  }

  // Verify token
  const payload = await verifySessionToken(token);

  if (!payload) {
    ctx.cookies.delete("auth_token");
    ctx.response.status = 401;
    ctx.response.body = {
      error: { message: "Invalid or expired session" }
    };
    return;
  }

  // Get user from database
  const user = await getUserById(payload.userId);

  if (!user) {
    ctx.cookies.delete("auth_token");
    ctx.response.status = 404;
    ctx.response.body = {
      error: { message: "User not found" }
    };
    return;
  }

  // Attach user to context state
  ctx.state.user = user;

  await next();
}
```

## Task 8: Implement User Info Endpoint

### Task 8 Overview

Implement the /auth/user endpoint to get the current user's information.

### Task 8 Justification

The frontend needs to retrieve the current user's information, including manager details, when the
application loads or refreshes.

### Task 8 Steps

1. Update the route in /routes/authRoutes/authRoutes.ts:

```ts
// Update imports at the top
import { authMiddleware } from "utils/auth/authMiddleware.ts";

// Update the route name and implementation
router.get("/user", authMiddleware, async (ctx) => {
  // User is already verified in middleware and attached to ctx.state
  const user = ctx.state.user;

  ctx.response.status = 200;
  ctx.response.body = { user };
});

// Update routes array
routes.push("/user");
```

## Task 9: Implement Sign Out Endpoint

### Task 9 Overview

Implement the /auth/signout endpoint to sign users out.

### Task 9 Justification

Users need to be able to sign out, which clears their session cookies.

### Task 9 Steps

1. Update the signout endpoint in /routes/authRoutes/authRoutes.ts:

```ts
// Update imports if needed
import { clearSessionCookie } from "utils/auth/tokenUtils.ts";

// Update the signout route
router.post("/signout", async (ctx) => {
  try {
    // Clear the session cookie
    clearSessionCookie(ctx);

    ctx.response.status = 200;
    ctx.response.body = { success: true };
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: { message: "Internal server error" }
    };
  }
});

// Make sure we're using the correct route name in the routes array
// (Check if "sign-out" needs to be updated to "signout")
```

## Task 10: Register Auth Routes in Hub Router

### Task 10 Overview

Register the auth routes in the main hub router.

### Task 10 Justification

We need to make the auth routes available through the main router.

### Task 10 Steps

1. Update /routes/hubRoutes.ts to include the auth router:

```ts
// Add import at the top
import { authRouter, authRoutes } from "routes/authRoutes/authRoutes.ts";

// Update the subs object to include auth routes
const subs = {
  "/get": { router: getRouter, routes: getRoutes },
  "/edit": { router: editRouter, routes: editRoutes },
  "/find": { router: findRouter, routes: findRoutes },
  "/send": { router: sendRouter, routes: sendRoutes },
  "/tool": { router: toolRouter, routes: toolRoutes },
  "/write": { router: writeRouter, routes: writeRoutes },
  "/auth": { router: authRouter, routes: authRoutes },
};

// At the end of the file, make sure to use the auth router
router.use("/auth", authRouter.routes());
```

## Task 11: Update Environment Configuration

### Task 11 Overview

Update environment configuration for authentication-related variables.

### Task 11 Justification

The authentication system needs several environment variables, which need to be defined in the project.

### Task 11 Steps

1. Add the following to your .env.local file:

```env
# Authentication
JWT_SECRET=your_development_secret_key_here
FRONTEND_URL=http://localhost:3000
```

2. Update the README.md to include information about these new environment variables.

## Task 12: Enable CORS for Cookies

### Task 12 Overview

Update the CORS middleware to support cookies and credentials.

### Task 12 Justification

Our authentication uses cookies, which require special CORS settings.

### Task 12 Steps

1. Update the customCors function in main.ts:

```ts
async function customCors(ctx: Context, next: () => Promise<unknown>) {
  const allowedOrigin = Deno.env.get("FRONTEND_ORIGIN") || "*";
  console.info(`|`);
  console.info(`|-----------------------------------------------`);
  console.info(`|`);
  console.log(`| Allowed Origin ${allowedOrigin}`);
  console.info(`|`);

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

  // Add this header for cookies
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

## Task 13: Implement Update User Endpoint

### Task 13 Overview

Implement the endpoint to update user information, including manager details.

### Task 13 Justification

After initial authentication, users need to be able to update their profile and set their manager's
information.

### Task 13 Steps

1. Add a new endpoint in /routes/dbRoutes/editRoutes.ts:

```ts
import { authMiddleware } from "utils/auth/authMiddleware.ts";
import { updateUserManager } from "api/neo4j/userOperations.ts";
import { z } from "zod";

// Add schema validation
const editUserSchema = z.object({
  username: z.string().optional(),
  managerName: z.string().optional(),
  managerEmail: z.string().email("Invalid manager email").optional(),
});

// Add new route
router.put("/editUser", authMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const user = ctx.state.user;

    // Validate request body
    const result = editUserSchema.safeParse(body);
    if (!result.success) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Invalid request data" }
      };
      return;
    }

    const { managerName, managerEmail } = result.data;

    // Update manager information if provided
    if (managerName || managerEmail) {
      const updateResult = await updateUserManager(
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
    }

    ctx.response.status = 200;
    ctx.response.body = { success: true };
  } catch (error) {
    console.error("Error updating user:", error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: { message: "Internal server error" }
    };
  }
});

// Add to routes array
routes.push("/editUser");
```

## Task 14: Add Authentication to Existing Routes

### Task 14 Overview

Update existing routes to require authentication where appropriate.

### Task 14 Justification

Many existing routes should be protected and should use the authenticated user's information.

### Task 14 Steps

1. Update the beacon creation route in /routes/dbRoutes/writeRoutes.ts:

```ts
import { authMiddleware } from "utils/auth/authMiddleware.ts";

// Update the route to use auth middleware
router.post("/newBeacon", authMiddleware, async (ctx) => {
  console.groupCollapsed(`========= POST: /write/newBeacon =========`);
  try {
    const match: Match = await ctx.request.body.json();
    const user = ctx.state.user;

    // Use authenticated user's ID
    match.authId = user.id;

    const shards: Shards = breaker(match);
    const candidate: Lantern = { ...match, shards: shards };
    const attempt: Attempt = await writeBeacon(candidate);

    // Rest of the function remains the same...
  } catch (error) {
    // Error handling remains the same...
  }
  console.groupEnd();
});
```

2. Apply similar updates to other routes that should require authentication.

## Task 15: Create Simple Test Script

### Task 15 Overview

Create a simple test script to verify the authentication flow.

### Task 15 Justification

We need to test the authentication system to ensure it works correctly before integrating with the frontend.

### Task 15 Steps

1. Create a new file at /tests/authTest.ts:

```ts
import * as dotenv from "dotenv";

await dotenv.load({ export: true });

async function testMagicLink() {
  console.log("=== Testing Magic Link Flow ===");
  const email = "test@example.com";

  console.log(`1. Requesting magic link for ${email}`);
  const magicLinkResponse = await fetch("http://localhost:8080/auth/signin/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const magicLinkResult = await magicLinkResponse.json();
  console.log("Response:", magicLinkResult);

  console.log("\nNote: In a real-world scenario, the user would receive an email with a magic link.");
  console.log("Since this is a test, you would need to check your server logs for the generated token.");
  console.log("You can then use that token to continue testing the verification endpoint.");
}

await testMagicLink();
1. Add a task for running the test in deno.jsonc:
"authTest": {
  "description": "Test the authentication flow",
  "command": "deno run -A --env-file=.env.local ./tests/authTest.ts"
}
```

## Conclusion

Now you have a complete task plan for implementing authentication in the LIFT backend. Each task builds upon the previous ones, gradually building up the full authentication system. The tasks are designed to be achievable in about an hour each by a competent but inexperienced developer.
