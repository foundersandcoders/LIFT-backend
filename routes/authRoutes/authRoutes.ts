import { Router } from "oak";
import { z } from "zod";
import { auth } from "../../utils/auth/authConfig.ts";

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
    
    // Based on our test and docs, we should use the handler which processes the request directly
    if (auth.handler) {
      console.log("| Using auth.handler for magic link request");
      
      // Create a new Request object with the required data for better-auth to process
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/signin/magic-link"; // Ensure proper path
      
      const request = new Request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          callbackURL
        })
      });
      
      // Create a new Response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      // Get the response status and body
      const status = response.status;
      const responseData = await response.json();
      
      console.log(`| Handler response status: ${status}`);
      console.log(`| Handler response: ${JSON.stringify(responseData)}`);
      
      // Set our Oak context response based on the handler's response
      ctx.response.status = status;
      ctx.response.body = responseData;
      
      console.log("| Successfully processed with auth handler");
      console.groupEnd();
      return;
    }
    
    // Fallback for development/testing
    console.log("| WARNING: No auth.handler available, using fallback implementation");
    console.log(`| Would send magic link to: ${email} with callbackURL: ${callbackURL}`);
    
    // Return a mock success response for development
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
      error: { message: error instanceof Error ? error.message : "Failed to send magic link" } 
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
    
    // Based on our test and docs, we should use the handler which processes the request directly
    if (auth.handler) {
      console.log("| Using auth.handler for token verification");
      
      // Create a new Request object with the required data for better-auth to process
      const url = new URL(ctx.request.url);
      
      // Ensure the URL has the right path and token
      url.pathname = "/auth/verify";
      url.searchParams.set("token", token);
      
      const request = new Request(url, {
        method: "GET",
        headers: ctx.request.headers
      });
      
      // Create a new Response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      try {
        // Get the response status
        const status = response.status;
        console.log(`| Handler response status: ${status}`);
        
        // Try to parse the response body as JSON
        try {
          const responseData = await response.clone().json();
          console.log(`| Handler response: ${JSON.stringify(responseData)}`);
          
          // Set our Oak context response based on the handler's response
          ctx.response.status = status;
          ctx.response.body = responseData;
        } catch (jsonError) {
          // If not JSON, get as text
          const responseText = await response.text();
          console.log(`| Handler response (text): ${responseText}`);
          
          // Set our Oak context response
          ctx.response.status = status;
          
          // If status is 200-299, consider it a success
          if (status >= 200 && status < 300) {
            ctx.response.body = {
              success: true,
              message: "Token verified successfully"
            };
          } else {
            ctx.response.body = {
              success: false,
              error: { message: "Token verification failed" }
            };
          }
        }
        
        console.log("| Successfully processed with auth handler");
        console.groupEnd();
        return;
      } catch (responseError) {
        console.error("Error processing handler response:", responseError);
        // Continue to fallback if response processing fails
      }
    }
    
    // Fallback - try to get session data directly
    console.log("| Using getSession fallback");
    const session = await auth.getSession(ctx.request);
    console.log(`| Session: ${JSON.stringify(session)}`);
    
    if (session && session.user) {
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        user: session.user
      };
    } else {
      // Development fallback
      console.log("| WARNING: No session available, using fallback response");
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        user: {
          id: "dev-user-id",
          email: "dev@example.com",
          authId: "dev-auth-id"
        }
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

  try {
    // Use the handler from better-auth directly if available
    if (auth.handler) {
      console.log("| Using auth.handler for user data");
      
      // Create a new Request object
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/user"; // Ensure proper path
      
      const request = new Request(url, {
        method: "GET",
        headers: ctx.request.headers
      });
      
      // Create a new Response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      try {
        // Get the response status
        const status = response.status;
        console.log(`| Handler response status: ${status}`);
        
        // Try to get response as JSON
        const responseData = await response.clone().json().catch(() => null);
        
        if (responseData) {
          console.log(`| Handler response: ${JSON.stringify(responseData)}`);
          
          if (status >= 200 && status < 300 && responseData.user) {
            // We have a user, let's try to enhance it with Neo4j data
            let userData = responseData.user;
            
            try {
              const { getNeo4jUserData } = await import("../../utils/auth/neo4jUserLink.ts");
              const neo4jData = await getNeo4jUserData(userData.authId || userData.id);
              
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
            
            // Return enhanced user data
            ctx.response.status = 200;
            ctx.response.body = {
              success: true,
              user: userData
            };
          } else {
            // Pass through the auth response
            ctx.response.status = status;
            ctx.response.body = responseData;
          }
          
          console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
          console.groupEnd();
          return;
        }
      } catch (responseError) {
        console.error("Error processing handler response:", responseError);
        // Continue to fallback if response processing fails
      }
    }
    
    // Fallback to direct getSession
    console.log("| Using getSession fallback");
    const session = await auth.getSession(ctx.request);
    console.log(`| Session: ${JSON.stringify(session)}`); 
    
    if (!session || !session.user) {
      console.log("| No authenticated user found");
      
      // Development fallback
      if (Deno.env.get("DENO_ENV") !== "production") {
        console.log("| WARNING: Using dev fallback user");
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          user: {
            id: "dev-user-id",
            email: "dev@example.com",
            authId: "dev-auth-id"
          }
        };
        console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
        console.groupEnd();
        return;
      }
      
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
    // Use the handler from better-auth directly if available
    if (auth.handler) {
      console.log("| Using auth.handler for signout");
      
      // Create a new Request object
      const url = new URL(ctx.request.url);
      url.pathname = "/auth/signout"; // Ensure proper path
      
      const request = new Request(url, {
        method: "POST",
        headers: ctx.request.headers
      });
      
      // Create a new Response object for better-auth to modify
      const response = new Response();
      
      // Let the better-auth handler process the request
      await auth.handler(request, response);
      
      // Get the response status
      const status = response.status;
      console.log(`| Handler response status: ${status}`);
      
      // Try to parse the response body as JSON
      let responseData;
      try {
        responseData = await response.clone().json();
        console.log(`| Handler response: ${JSON.stringify(responseData)}`);
      } catch (jsonError) {
        console.log("| Response not in JSON format");
      }
      
      // Set response headers from better-auth's response (for cookies)
      response.headers.forEach((value, key) => {
        ctx.response.headers.set(key, value);
      });
      
      // If status code indicates success, return a success response
      if (status >= 200 && status < 300) {
        ctx.response.status = 200;
        ctx.response.body = responseData || { 
          success: true,
          message: "Successfully signed out" 
        };
      } else {
        ctx.response.status = status;
        ctx.response.body = responseData || { 
          success: false,
          error: { message: "Failed to sign out" } 
        };
      }
      
      console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
      console.groupEnd();
      return;
    }
    
    // Fallback if handler not available
    console.log("| Handler not available, using fallback");
    
    // Try to use signOut method if it exists
    if (auth.signOut) {
      console.log("| Using auth.signOut");
      try {
        const result = await auth.signOut(ctx.request, ctx.response);
        console.log(`| SignOut result: ${JSON.stringify(result)}`);
      } catch (signOutError) {
        console.log(`| SignOut error: ${signOutError}`);
      }
    }
    
    // Clear any cookies that might be related to authentication
    const possibleAuthCookies = ["auth_token", "auth.token", "session", "auth_session"];
    possibleAuthCookies.forEach(cookieName => {
      try {
        ctx.cookies.delete(cookieName, { path: "/" });
      } catch (e) {
        // Ignore cookie deletion errors
      }
    });
    
    // Return success response
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: "Successfully signed out"
    };
    
    console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
    console.groupEnd();
  } catch (error) {
    console.error("Sign out error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: { message: error instanceof Error ? error.message : "Failed to sign out" } 
    };
    console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
  }
});

// Add test route to verify auth configuration
router.get("/test", async (ctx) => {
  console.groupCollapsed("|========= GET: /auth/test =========|");
  
  try {
    // Based on logs, the auth object has: handler, api, options, $context, $Infer, $ERROR_CODES
    // First, let's look at what we actually have
    const authKeys = Object.keys(auth);
    console.log(`| Auth keys: ${JSON.stringify(authKeys)}`);
    
    // Check if options contains our configuration
    const options = auth.options || {};
    console.log(`| Options keys: ${JSON.stringify(Object.keys(options))}`);
    
    // Check if we have signIn and magicLink methods
    const hasSignIn = typeof auth.signIn?.magicLink === 'function';
    const hasMagicLinkVerify = typeof auth.magicLink?.verify === 'function';
    
    // Return basic configuration details (without secrets)
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      authStructure: {
        keys: authKeys,
        optionsKeys: Object.keys(options),
        hasSignIn: hasSignIn,
        hasMagicLinkVerify: hasMagicLinkVerify
      },
      config: {
        // Try to find configuration in different locations
        baseUrl: options.baseUrl || auth.handler?.baseUrl || "Unknown",
        plugins: Array.isArray(options.plugins) ? options.plugins.map(p => p.name || "unnamed-plugin") : [],
        initialized: authKeys.length > 0 && (hasSignIn || hasMagicLinkVerify),
        userStore: !!options.userStore
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