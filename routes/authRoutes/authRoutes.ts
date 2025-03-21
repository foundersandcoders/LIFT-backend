import { Router } from "oak";
import { z } from "zod";
import { auth } from "utils/auth/authConfig.ts";

// Create zod schema for magic link request validation
const magicLinkSchema = z.object({
  email: z.string().email("Invalid email format"),
  callbackURL: z.string().optional().default("/dashboard"),
});

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  console.groupCollapsed("|========= POST: /auth/signin/magic-link =========|");

  try {
    // Parse and validate request body
    const body = await ctx.request.body.json();
    console.log(`| body: ${JSON.stringify(body)}`);
    
    // Validate with zod schema
    const validationResult = magicLinkSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log(`| Validation error: ${JSON.stringify(validationResult.error)}`);
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { 
          message: "Invalid request data",
          details: validationResult.error.format() 
        }
      };
      console.groupEnd();
      return;
    }
    
    const { email, callbackURL } = validationResult.data;
    console.log(`| email: ${email}`);
    console.log(`| callbackURL: ${callbackURL}`);
    
    // Use better-auth magic link implementation
    const result = await auth.signIn.magicLink({
      email,
      callbackURL
    });
    
    console.log(`| Auth result: ${JSON.stringify(result)}`);
    
    if (result.success === false) {
      ctx.response.status = 500;
      ctx.response.body = { 
        success: false, 
        error: { message: result.error || "Failed to send magic link" } 
      };
      console.log(`| Error: ${JSON.stringify(result.error)}`);
      console.groupEnd();
      return;
    }
    
    // Return success response
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: `Magic link email sent to ${email}`
    };
    
    console.log("| success", ctx.response.body);
    console.groupEnd();
  } catch (error) {
    console.error("Magic link error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: "Failed to send magic link" } 
    };
    console.log("| error", ctx.response.body);
    console.groupEnd();
  }
  console.log("|=================================================|");
});

router.get("/verify", async (ctx) => {
  console.groupCollapsed("|========= GET: /auth/verify =========|");
  console.log(`| URL: ${ctx.request.url.toString()}`);

  try {
    // Extract token from query params
    const token = ctx.request.url.searchParams.get("token");
    console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
    if (!token) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Token is required" }
      };
      console.log("| Error: Token is required");
      console.groupEnd();
      return;
    }
    
    // Use better-auth's token verification
    const result = await auth.magicLink.verify({
      query: { token },
    });
    
    console.log(`| Verification result: ${JSON.stringify(result)}`);
    
    if (result.success === false) {
      ctx.response.status = 401;
      ctx.response.body = { 
        success: false, 
        error: { 
          message: result.error || "Token verification failed" 
        } 
      };
      console.log(`| Error: ${JSON.stringify(result.error)}`);
      console.groupEnd();
      return;
    }
    
    // Get user data and return success
    const session = await auth.getSession(ctx.request);
    console.log(`| Session: ${JSON.stringify(session)}`);
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      user: session?.user || null
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Verification error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: "Token verification failed" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

router.get("/user", async (ctx) => {
  console.groupCollapsed("|========= GET: /auth/user =========|");

  try {
    // Get session from better-auth
    const session = await auth.getSession(ctx.request);
    console.log(`| Session: ${JSON.stringify(session)}`); 
    
    if (!session || !session.user) {
      console.log("| No authenticated user found");
      ctx.response.status = 401;
      ctx.response.body = { 
        success: false,
        error: { message: "Not authenticated" } 
      };
      console.groupEnd();
      return;
    }
    
    // Get Neo4j user data if available
    let userData = { ...session.user };
    
    try {
      const { getNeo4jUserData } = await import("../../utils/auth/neo4jUserLink.ts");
      const neo4jData = await getNeo4jUserData(session.user.authId);
      
      if (neo4jData) {
        console.log("| Found Neo4j user data");
        userData = { ...userData, ...neo4jData };
      } else {
        console.log("| No Neo4j user data found");
      }
    } catch (e) {
      console.log(`| Error getting Neo4j data: ${e instanceof Error ? e.message : String(e)}`);
      // Continue without Neo4j data
    }
    
    // Return complete user data
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      user: userData
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("User fetch error:", error);
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false,
      error: { message: "Not authenticated" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

router.post("/signout", async (ctx) => {
  console.groupCollapsed("|========= POST: /auth/signout =========|");

  try {
    // Use better-auth's signOut method
    const result = await auth.signOut(ctx.request, ctx.response);
    console.log(`| SignOut result: ${JSON.stringify(result)}`);
    
    // Return success
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true
    };
    console.log("| Sign out successful");
    console.groupEnd();
  } catch (error) {
    console.error("Sign out error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: "Failed to sign out" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

// Add test route to verify auth configuration
router.get("/test", async (ctx) => {
  console.groupCollapsed("|========= GET: /auth/test =========|");
  
  try {
    // Return basic configuration details (without secrets)
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      config: {
        baseUrl: auth.config?.baseUrl || "Unknown",
        plugins: auth.config?.plugins?.map(p => p.name || "unknown-plugin") || [],
        initialized: !!auth.config,
        userStore: !!auth.config?.userStore
      }
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Auth test error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: { message: "Failed to get auth configuration" }
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

routes.push("/signin/magic-link", "/verify", "/user", "/signout", "/test");

export {
  router as authRouter,
  routes as authRoutes
};