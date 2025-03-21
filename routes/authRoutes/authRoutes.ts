import { Router } from "oak";
import { z } from "zod";
import { auth } from "utils/auth/authConfig.ts";

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  console.groupCollapsed("|========= POST: /auth/signin/magic-link =========|");

  try {
    const body = await ctx.request.body.json();
    console.log(`| body: ${JSON.stringify(body)}`);
    const email = body.email;
    console.log(`| email: ${email}`);
    const callbackURL = body.callbackURL || "/dashboard";
    console.log(`| callbackURL: ${callbackURL}`);
    
    if (!email) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Email is required" }
      };
      console.log("| Error: email is required");
      console.groupEnd();
      return;
    }
    
    // Use the auth handler (temporary implementation)
    const result = await auth.handleRequest(ctx.request, ctx.response);
    console.log("| result", result);
    
    // Return success response
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: `Magic link email would be sent to ${email} (development mode)`
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
  console.log("| verify");

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
  console.log("| user");

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
  console.log("| signout");

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

routes.push("/signin/magic-link", "/verify", "/user", "/signout");

export {
  router as authRouter,
  routes as authRoutes
};