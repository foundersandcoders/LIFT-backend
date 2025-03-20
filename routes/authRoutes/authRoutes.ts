import { Router } from "oak";
import { z } from "zod";
import { auth } from "utils/auth/authConfig.ts";

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  try {
    // Extract email from request body
    const body = await ctx.request.body.json();
    const email = body.email;
    const callbackURL = body.callbackURL || "/dashboard";
    
    if (!email) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Email is required" }
      };
      return;
    }
    
    // Use the auth handler (temporary implementation)
    const result = await auth.handleRequest(ctx.request, ctx.response);
    
    // Return success response
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: `Magic link email would be sent to ${email} (development mode)`
    };
  } catch (error) {
    console.error("Magic link error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: "Failed to send magic link" } 
    };
  }
});

router.get("/verify", async (ctx) => {
  try {
    // Extract token from query params
    const token = ctx.request.url.searchParams.get("token");
    
    if (!token) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Token is required" }
      };
      return;
    }
    
    // Use the auth handler (temporary implementation)
    await auth.handleRequest(ctx.request, ctx.response);
    
    // Return success with mock user data
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      user: {
        id: "temp-user-id",
        email: "test@example.com"
      }
    };
  } catch (error) {
    console.error("Verification error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: "Token verification failed" } 
    };
  }
});

router.get("/user", async (ctx) => {
  try {
    // Get session from auth (temporary implementation)
    const session = await auth.getSession(ctx.request);
    
    if (!session || !session.user) {
      ctx.response.status = 401;
      ctx.response.body = { 
        error: { message: "Not authenticated" } 
      };
      return;
    }
    
    // Return mock user data
    ctx.response.status = 200;
    ctx.response.body = {
      id: "temp-user-id",
      email: "test@example.com",
      username: "testuser"
    };
  } catch (error) {
    console.error("User fetch error:", error);
    ctx.response.status = 401;
    ctx.response.body = { 
      error: { message: "Not authenticated" } 
    };
  }
});

router.post("/signout", async (ctx) => {
  try {
    // Clear auth cookie (temporary implementation)
    ctx.cookies.delete("auth_token", { path: "/" });
    
    // Return success
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true
    };
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