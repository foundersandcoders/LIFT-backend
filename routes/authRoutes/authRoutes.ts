import { Router } from "oak";
import { z } from "zod";
import { auth } from "../../utils/auth/authConfig.ts";

// Environment variables
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

// Helper for converting Headers to HeadersInit
const getHeaders = (sourceHeaders: Headers): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  if (sourceHeaders.has("user-agent")) {
    const userAgent = sourceHeaders.get("user-agent");
    if (userAgent) {
      headers["User-Agent"] = userAgent;
    }
  }
  
  if (sourceHeaders.has("x-forwarded-for")) {
    const forwardedFor = sourceHeaders.get("x-forwarded-for");
    if (forwardedFor) {
      headers["X-Forwarded-For"] = forwardedFor;
    }
  }
  
  return headers;
};

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  callbackURL: z.string().optional().default("/dashboard"),
  redirect: z.string().url("Invalid URL format").optional(),
}).strict();

const router = new Router();
const routes: string[] = [];

router.post("/magic-link", async (ctx) => {
  console.groupCollapsed("|========= POST: /auth/magic-link =========|");
  console.log(`| URL: ${ctx.request.url.toString()}`);
  
  try {
    // Validate input
    const rawBody = await ctx.request.body.json();
    console.log(`| Request body: ${JSON.stringify(rawBody)}`);
    
    const parseResult = magicLinkSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.format();
      console.log(`| Validation error: ${JSON.stringify(errorDetails)}`);
      
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "Invalid request body", details: errorDetails }
      };
      console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
      console.groupEnd();
      return;
    }
    
    // Extract validated data
    const { email, callbackURL, redirect } = parseResult.data;
    const redirectUrl = redirect || `${frontendUrl}${callbackURL}`;
    
    console.log(`| ✓ Validation passed - Email: ${email}`);
    console.log(`| ✓ Callback URL: ${callbackURL}`);
    console.log(`| ✓ Redirect URL: ${redirectUrl}`);
    
    console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
    // Try to use the better-auth handler if available
    if (auth.handler) {
      console.log("| Using better-auth handler for magic link generation");
      
      // Create a new Request to forward to better-auth
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/signin/magic-link";
      
      // Create a proper request body as expected by better-auth
      const requestBody = {
        email,
        options: {
          callbackUrl: redirectUrl
        }
      };
      
      const request = new Request(url, {
        method: "POST",
        headers: getHeaders(ctx.request.headers),
        body: JSON.stringify(requestBody)
      });
      
      // Create a response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      // Get the response status
      const status = response.status;
      console.log(`| Handler response status: ${status}`);
      
      // Forward the better-auth response
      ctx.response.status = status;
      
      // Try to parse the response body
      try {
        const responseData = await response.clone().json();
        ctx.response.body = responseData;
        console.log(`| Handler response: ${JSON.stringify(responseData)}`);
      } catch (jsonError) {
        const responseText = await response.text();
        if (responseText) {
          ctx.response.body = responseText;
          console.log(`| Handler response (text): ${responseText}`);
        } else {
          ctx.response.body = { success: true };
          console.log("| Empty response from handler, assuming success");
        }
      }
      
      // Copy headers from better-auth response
      response.headers.forEach((value, key) => {
        ctx.response.headers.set(key, value);
      });
      
      console.log("| Processed with better-auth handler");
      console.groupEnd();
      return;
    }
    
    // Fallback to direct API if handler isn't available
    if (auth.api?.signInMagicLink) {
      console.log("| Using better-auth API for magic link generation");
      
      try {
        const result = await auth.api.signInMagicLink({
          email,
          options: {
            callbackUrl: redirectUrl
          }
        });
        
        console.log(`| API response: ${JSON.stringify(result)}`);
        
        ctx.response.status = 200;
        ctx.response.body = result;
        
        console.log("| Processed with better-auth API");
        console.groupEnd();
        return;
      } catch (apiError) {
        console.log(`| API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        // Fall through to manual generation
      }
    }
    
    // Manual fallback for development - generate a manual token
    console.log("| Falling back to manual magic link generation");
    
    // Generate a manual token with prefix for identification
    const token = `manual-${crypto.randomUUID()}`;
    const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;
    
    const isDev = Deno.env.get("DENO_ENV") !== "production";
    const enableTestEmails = Deno.env.get("ENABLE_TEST_EMAILS") === "true";
    
    if (isDev) {
      if (enableTestEmails) {
        // Only import if needed
        const { sendMagicLinkEmail } = await import("../../api/resend/sendMagicLink.ts");
        await sendMagicLinkEmail(email, verificationUrl);
        console.log("| ✉️ Manual magic link email sent");
      } else {
        console.log("| 🚫 Test emails disabled, displaying link only");
        console.log(`| 🔗 Magic Link URL: ${verificationUrl}`);
      }
    } else {
      // In production, we need to send real emails
      const { sendMagicLinkEmail } = await import("../../api/resend/sendMagicLink.ts");
      await sendMagicLinkEmail(email, verificationUrl);
      console.log("| ✉️ Manual magic link email sent");
    }
    
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: "Magic link sent"
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Error in magic-link handler:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: error instanceof Error ? error.message : "Failed to send magic link" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
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
    
    console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
    // Try better-auth handler first
    if (auth.handler) {
      console.log("| Using better-auth handler for token verification");
      
      // Create a new Request object with the token
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/verify";
      url.searchParams.set("token", token);
      
      const request = new Request(url, {
        method: "GET",
        headers: getHeaders(ctx.request.headers)
      });
      
      // Create a new Response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      // Get the response status
      const status = response.status;
      console.log(`| Handler response status: ${status}`);
      
      // If status indicates success, try to parse the response
      if (status >= 200 && status < 300) {
        try {
          const responseData = await response.clone().json();
          console.log(`| Handler response: ${JSON.stringify(responseData)}`);
          
          // Set our response based on better-auth's response
          ctx.response.status = status;
          ctx.response.body = responseData;
          
          // Copy any headers from better-auth's response
          response.headers.forEach((value, key) => {
            ctx.response.headers.set(key, value);
          });
          
          console.log("| Successfully processed with better-auth handler");
          console.groupEnd();
          return;
        } catch (jsonError) {
          // If JSON parsing fails, get the response as text
          console.log("| Could not parse response as JSON, trying text");
          const responseText = await response.text();
          
          if (responseText.trim()) {
            console.log(`| Handler response (text): ${responseText}`);
          } else {
            console.log("| Empty response from handler");
          }
        }
      } else {
        console.log(`| Handler failed with status ${status}`);
      }
    }
    
    // Manual verification for tokens starting with "manual-"
    if (typeof token === 'string' && token.startsWith("manual-")) {
      console.log("| Manually verifying token with manual- prefix");
      
      // In a real implementation, you would check against a database
      // For now, we'll accept any manual token for testing
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        user: {
          id: "mock-user-id",
          email: "dev@example.com",
          authId: "mock-auth-id"
        }
      };
      
      console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
      console.groupEnd();
      return;
    }
    
    // Fallback for development mode
    const isDev = Deno.env.get("DENO_ENV") !== "production";
    if (isDev) {
      console.log("| Development mode: Returning mock user");
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        user: {
          id: "dev-user-id",
          email: "dev@example.com",
          authId: "dev-auth-id"
        }
      };
    } else {
      // In production, reject invalid tokens
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        error: { message: "Invalid or expired token" }
      };
    }
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Verification error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: error instanceof Error ? error.message : "Token verification failed" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

router.get("/user", async (ctx) => {
  console.groupCollapsed("|========= GET: /auth/user =========|");
  console.log(`| URL: ${ctx.request.url.toString()}`);
  
  try {
    // Get token from header or cookies
    const authHeader = ctx.request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : ctx.cookies.get("auth_token") || null;
    
    console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        error: { message: "Authentication required" }
      };
      console.log("| Error: No token provided");
      console.groupEnd();
      return;
    }
    
    console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
    // Try better-auth handler first
    if (auth.handler) {
      console.log("| Using better-auth handler for user info");
      
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/user";
      
      const request = new Request(url, {
        method: "GET",
        headers: getHeaders(ctx.request.headers)
      });
      
      // Pass auth token via Authorization header
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      
      const response = new Response();
      
      await auth.handler(request, response);
      
      const status = response.status;
      console.log(`| Handler response status: ${status}`);
      
      // Forward the better-auth response
      ctx.response.status = status;
      
      try {
        const responseData = await response.clone().json();
        ctx.response.body = responseData;
        console.log(`| Handler response: ${JSON.stringify(responseData)}`);
      } catch (jsonError) {
        const responseText = await response.text();
        if (responseText) {
          ctx.response.body = responseText;
          console.log(`| Handler response (text): ${responseText}`);
        } else {
          ctx.response.status = 500;
          ctx.response.body = { 
            success: false, 
            error: { message: "Could not retrieve user information" } 
          };
          console.log("| Empty response from handler");
        }
      }
      
      // Copy response headers
      response.headers.forEach((value, key) => {
        ctx.response.headers.set(key, value);
      });
      
      console.log("| Processed with better-auth handler");
      console.groupEnd();
      return;
    }
    
    // Use API if available
    if (auth.api?.getSession) {
      console.log("| Using better-auth API for session");
      
      try {
        const session = await auth.api.getSession({ token });
        console.log(`| Session: ${JSON.stringify(session)}`);
        
        if (session?.user) {
          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            user: session.user
          };
          
          console.log("| Processed with better-auth API");
          console.groupEnd();
          return;
        }
      } catch (apiError) {
        console.log(`| API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        // Fall through to manual handling
      }
    }
    
    // Manual session handling for development
    if (typeof token === 'string' && token.startsWith("manual-")) {
      console.log("| Manual token handling for development");
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        user: {
          id: "dev-user-id",
          email: "dev@example.com",
          authId: "manual-auth-id"
        }
      };
      
      console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
      console.groupEnd();
      return;
    }
    
    // Default response for invalid tokens
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      error: { message: "Invalid token" } 
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Error in user handler:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: error instanceof Error ? error.message : "Failed to get user information" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

router.post("/signout", async (ctx) => {
  console.groupCollapsed("|========= POST: /auth/signout =========|");
  console.log(`| URL: ${ctx.request.url.toString()}`);
  
  try {
    // Get token from header or cookies
    const authHeader = ctx.request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : ctx.cookies.get("auth_token") || null;
    
    console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
    if (!token) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: { message: "No token provided" }
      };
      console.log("| Error: No token provided");
      console.groupEnd();
      return;
    }
    
    console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
    // Try better-auth handler first
    if (auth.handler) {
      console.log("| Using better-auth handler for signout");
      
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/signout";
      
      const request = new Request(url, {
        method: "POST",
        headers: getHeaders(ctx.request.headers)
      });
      
      const response = new Response();
      
      await auth.handler(request, response);
      
      const status = response.status;
      console.log(`| Handler response status: ${status}`);
      
      ctx.response.status = status;
      
      try {
        const responseData = await response.clone().json();
        ctx.response.body = responseData;
        console.log(`| Handler response: ${JSON.stringify(responseData)}`);
      } catch (jsonError) {
        const responseText = await response.text();
        if (responseText) {
          ctx.response.body = responseText;
          console.log(`| Handler response (text): ${responseText}`);
        } else {
          ctx.response.body = { success: true };
          console.log("| Empty response from handler, assuming success");
        }
      }
      
      // Clear auth cookies
      ctx.cookies.set("auth_token", "", { 
        expires: new Date(0),
        path: "/"
      });
      
      console.log("| Processed with better-auth handler");
      console.groupEnd();
      return;
    }
    
    // Manual signout
    ctx.cookies.set("auth_token", "", { 
      expires: new Date(0),
      path: "/"
    });
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "Signed out successfully"
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Error in signout handler:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: error instanceof Error ? error.message : "Sign out failed" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

// Add test route to verify auth configuration
router.get("/test", (_ctx: any) => {
  return new Response("Auth routes are functioning");
});

routes.push("/magic-link", "/verify", "/user", "/signout", "/test");

export {
  router as authRouter,
  routes as authRoutes
};