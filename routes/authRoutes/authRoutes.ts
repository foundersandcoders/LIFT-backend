import { Router } from "oak";
import { z } from "zod";
import { createClient } from "jsr:@supabase/supabase-js";
// import { auth } from "utils/auth.ts";
// import { APIError } from "better-auth/api";

const router = new Router();

// const frontendUrl = Deno.env.get("BETTER_AUTH_URL") || "no frontend url";
// const magicLinkRequestSchema = z.object({
//   email: z.string().email(),
//   callbackURL: z.string().optional().default("/"),
//   redirect: z.string().url("Invalid URL format").optional(),
// }).strict();

// router.post("/signin/magic-link", async (ctx) => {
//   console.groupCollapsed("|========= POST: /auth/magic-link =========|");
//   try {
//     const reqBody = await ctx.request.body.json();

//     const parseResult = magicLinkRequestSchema.safeParse(reqBody);
//     if (!parseResult.success) {
//       console.group(`|====== Validation Error ======|`);
//       const errorDetails = parseResult.error.format();
      
//       console.log(`| Validation error: ${JSON.stringify(errorDetails)}`);

//       ctx.response.status = 400;
//       ctx.response.body = {
//         success: false,
//         error: { message: "Invalid request body", details: errorDetails }
//       };

//       console.group(`|====== Response ======|`);
//       console.table(ctx.response.body);
//       console.groupEnd();
//       console.groupEnd();
//       console.groupEnd();
//       return;
//     }
//     const { email, callbackURL, redirect } = parseResult.data;
    
//     console.table(parseResult.data);

//     const redirectUrl = redirect || `${frontendUrl}${callbackURL}`;

//     console.log(`| • Email: ${email}`);
//     console.log(`| • Callback URL: ${callbackURL}`);
//     console.log(`| • Redirect URL: ${redirectUrl}`);

//     const url = new URL(ctx.request.url);
//     url.pathname = "/auth/signin/magic-link";

//     try {
//       console.info(`| Calling auth.api.signInMagicLink`);
//       const { headers, response } = await auth.api.signInMagicLink({
//         method: "POST",
//         headers: getHeaders(ctx.request.headers),
//         body: {
//           email: email,
//           callbackURL: redirectUrl
//         },
//         returnHeaders: true,
//         asResponse: true
//       });

//       console.group(`|====== Response Body ======|`);
//       console.table(response);
//       ctx.response.body = response;
//       console.groupEnd();
      
//       console.group(`|====== Response Headers ======|`);
//       console.log(`| headers`);
//       console.table(headers);
//       headers.forEach((value, key) => { ctx.response.headers.set(key, value) });

//       console.log(`|====== headersOutput ======|`);
//       const headersOutput = headers.get("x-custom-header");
//       console.table(headersOutput);
//       console.groupEnd();
//       console.groupEnd();

//       console.group(`|====== Response Cookies ======|`);
//       const cookiesOutput = headers.get("set-cookie");
//       console.table(cookiesOutput);
//       console.groupEnd();
//     } catch (error) {
//       if (error instanceof APIError) {
//         console.error(error.message, error.status)
//       } else {
//         console.error(error)
//       }
//     }
//     console.groupEnd();
    
//     console.info("| ✓ Processed with better-auth handler");

//     console.groupEnd();
//     console.groupEnd();
//     return;
//   } catch (error) {
//     console.error("Error in magic-link handler:", error);
//     ctx.response.status = 500;
//     ctx.response.body = { 
//       success: false, 
//       error: { message: error instanceof Error ? error.message : "Failed to send magic link" } 
//     };
//     console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
//     console.groupEnd();
//     console.groupEnd();
//   }
// });

router.post("/signin/magic-link", async (ctx) => {
  const body = await ctx.request.body.json();
  const email = body.email;
  
  if (!email) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Email is required" };
    return;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
  });

  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  } else {
    ctx.response.status = 200;
    ctx.response.body = { message: "Magic link sent", data };
  }
});

router.get("/verify", async (ctx) => {
//   console.groupCollapsed("|========= GET: /auth/verify =========|");
//   console.log(`| URL: ${ctx.request.url.toString()}`);
//   
//   try {
//     // Extract token from query params
//     const token = ctx.request.url.searchParams.get("token");
//     console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
//     if (!token) {
//       ctx.response.status = 400;
//       ctx.response.body = {
//         success: false,
//         error: { message: "Token is required" }
//       };
//       console.log("| Error: Token is required");
//       console.groupEnd();
//       return;
//     }
    
//     console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
//     // Try better-auth handler first
//     if (auth.handler) {
//       console.log("| Using better-auth handler for token verification");
      
//       // Create a new Request object with the token
//       const url = new URL(ctx.request.url);
//       url.pathname = "/auth/verify";
//       url.searchParams.set("token", token);
      
//       const request = new Request(url, {
//         method: "GET",
//         headers: getHeaders(ctx.request.headers)
//       });
      
//       // Create a new Response object for better-auth to modify
//       const response = new Response();
      
//       // Let the better-auth handler process the request
//       await auth.handler(request/* , response */);
      
//       // Get the response status
//       const status = response.status;
//       console.log(`| Handler response status: ${status}`);
      
//       // If status indicates success, try to parse the response
//       if (status >= 200 && status < 300) {
//         try {
//           const responseData = await response.clone().json();
//           console.log(`| Handler response: ${JSON.stringify(responseData)}`);
          
//           // Set our response based on better-auth's response
//           ctx.response.status = status;
//           ctx.response.body = responseData;
          
//           // Copy any headers from better-auth's response
//           response.headers.forEach((value, key) => {
//             ctx.response.headers.set(key, value);
//           });
          
//           console.log("| Successfully processed with better-auth handler");
//           console.groupEnd();
//           return;
//         } catch (jsonError) {
//           // If JSON parsing fails, get the response as text
//           console.log("| Could not parse response as JSON, trying text");
//           const responseText = await response.text();
          
//           if (responseText.trim()) {
//             console.log(`| Handler response (text): ${responseText}`);
//           } else {
//             console.log("| Empty response from handler");
//           }
//         }
//       } else {
//         console.log(`| Handler failed with status ${status}`);
//       }
//     }
    
//     // Manual verification for tokens starting with "manual-"
//     if (typeof token === 'string' && token.startsWith("manual-")) {
//       console.log("| Manually verifying token with manual- prefix");
      
//       // In a real implementation, you would check against a database
//       // For now, we'll accept any manual token for testing
//       ctx.response.status = 200;
//       ctx.response.body = {
//         success: true,
//         user: {
//           id: "mock-user-id",
//           email: "dev@example.com",
//           authId: "mock-auth-id"
//         }
//       };
      
//       console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
//       console.groupEnd();
//       return;
//     }
    
//     // Fallback for development mode
//     const isDev = Deno.env.get("DENO_ENV") !== "production";
//     if (isDev) {
//       console.log("| Development mode: Returning mock user");
//       ctx.response.status = 200;
//       ctx.response.body = {
//         success: true,
//         user: {
//           id: "dev-user-id",
//           email: "dev@example.com",
//           authId: "dev-auth-id"
//         }
//       };
//     } else {
//       // In production, reject invalid tokens
//       ctx.response.status = 401;
//       ctx.response.body = {
//         success: false,
//         error: { message: "Invalid or expired token" }
//       };
//     }
    
//     console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
//     console.groupEnd();
//   } catch (error) {
//     console.error("Verification error:", error);
//     ctx.response.status = 500;
//     ctx.response.body = { 
//       success: false, 
//       error: { message: error instanceof Error ? error.message : "Token verification failed" } 
//     };
//     console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
//     console.groupEnd();
//   }
});

router.get("/user", async (ctx) => {
//   console.groupCollapsed("|========= GET: /auth/user =========|");
//   console.log(`| URL: ${ctx.request.url.toString()}`);
  
//   try {
//     // Get token from header or cookies
//     const authHeader = ctx.request.headers.get("Authorization");
//     const token = authHeader?.startsWith("Bearer ") 
//       ? authHeader.substring(7) 
//       : ctx.cookies.get("auth_token") || null;
    
//     console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
//     if (!token) {
//       ctx.response.status = 401;
//       ctx.response.body = {
//         success: false,
//         error: { message: "Authentication required" }
//       };
//       console.log("| Error: No token provided");
//       console.groupEnd();
//       return;
//     }
    
//     console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
//     // Try better-auth handler first
//     if (auth.handler) {
//       console.log("| Using better-auth handler for user info");
      
//       const url = new URL(ctx.request.url);
//       url.pathname = "/auth/user";
      
//       const request = new Request(url, {
//         method: "GET",
//         headers: getHeaders(ctx.request.headers)
//       });
      
//       // Pass auth token via Authorization header
//       if (token) {
//         request.headers.set("Authorization", `Bearer ${token}`);
//       }
      
//       const response = new Response();
      
//       await auth.handler(request/* , response */);
      
//       const status = response.status;
//       console.log(`| Handler response status: ${status}`);
      
//       // Forward the better-auth response
//       ctx.response.status = status;
      
//       try {
//         const responseData = await response.clone().json();
//         ctx.response.body = responseData;
//         console.log(`| Handler response: ${JSON.stringify(responseData)}`);
//       } catch (jsonError) {
//         const responseText = await response.text();
//         if (responseText) {
//           ctx.response.body = responseText;
//           console.log(`| Handler response (text): ${responseText}`);
//         } else {
//           ctx.response.status = 500;
//           ctx.response.body = { 
//             success: false, 
//             error: { message: "Could not retrieve user information" } 
//           };
//           console.log("| Empty response from handler");
//         }
//       }
      
//       // Copy response headers
//       response.headers.forEach((value, key) => {
//         ctx.response.headers.set(key, value);
//       });
      
//       console.log("| Processed with better-auth handler");
//       console.groupEnd();
//       return;
//     }
    
//     // Use API if available
//     if (auth.api?.getSession) {
//       console.log("| Using better-auth API for session");
      
//       try {
//         const session = await auth.api.getSession({ token });
//         console.log(`| Session: ${JSON.stringify(session)}`);
        
//         if (session?.user) {
//           ctx.response.status = 200;
//           ctx.response.body = {
//             success: true,
//             user: session.user
//           };
          
//           console.log("| Processed with better-auth API");
//           console.groupEnd();
//           return;
//         }
//       } catch (apiError) {
//         console.log(`| API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
//         // Fall through to manual handling
//       }
//     }
    
//     // Manual session handling for development
//     if (typeof token === 'string' && token.startsWith("manual-")) {
//       console.log("| Manual token handling for development");
      
//       ctx.response.status = 200;
//       ctx.response.body = {
//         success: true,
//         user: {
//           id: "dev-user-id",
//           email: "dev@example.com",
//           authId: "manual-auth-id"
//         }
//       };
      
//       console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
//       console.groupEnd();
//       return;
//     }
    
//     // Default response for invalid tokens
//     ctx.response.status = 401;
//     ctx.response.body = { 
//       success: false, 
//       error: { message: "Invalid token" } 
//     };
    
//     console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
//     console.groupEnd();
//   } catch (error) {
//     console.error("Error in user handler:", error);
//     ctx.response.status = 500;
//     ctx.response.body = { 
//       success: false, 
//       error: { message: error instanceof Error ? error.message : "Failed to get user information" } 
//     };
//     console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
//     console.groupEnd();
//   }
});

router.post("/signout", async (ctx) => {
  //   console.groupCollapsed("|========= POST: /auth/signout =========|");
  //   console.log(`| URL: ${ctx.request.url.toString()}`);
  
  //   try {
  //     // Get token from header or cookies
  //     const authHeader = ctx.request.headers.get("Authorization");
  //     const token = authHeader?.startsWith("Bearer ") 
  //       ? authHeader.substring(7) 
  //       : ctx.cookies.get("auth_token") || null;
    
  //     console.log(`| Token provided: ${token ? "Yes" : "No"}`);
    
  //     if (!token) {
  //       ctx.response.status = 400;
  //       ctx.response.body = {
  //         success: false,
  //         error: { message: "No token provided" }
  //       };
  //       console.log("| Error: No token provided");
  //       console.groupEnd();
  //       return;
  //     }
    
  //     console.log(`| Auth object has properties: ${Object.keys(auth)}`);
    
  //     // Try better-auth handler first
  //     if (auth.handler) {
  //       console.log("| Using better-auth handler for signout");
      
  //       const url = new URL(ctx.request.url);
  //       url.pathname = "/auth/signout";
      
  //       const request = new Request(url, {
  //         method: "POST",
  //         headers: getHeaders(ctx.request.headers)
  //       });
      
  //       const response = new Response();
      
  //       await auth.handler(request, response);
      
  //       const status = response.status;
  //       console.log(`| Handler response status: ${status}`);
      
  //       ctx.response.status = status;
      
  //       try {
  //         const responseData = await response.clone().json();
  //         ctx.response.body = responseData;
  //         console.log(`| Handler response: ${JSON.stringify(responseData)}`);
  //       } catch (jsonError) {
  //         const responseText = await response.text();
  //         if (responseText) {
  //           ctx.response.body = responseText;
  //           console.log(`| Handler response (text): ${responseText}`);
  //         } else {
  //           ctx.response.body = { success: true };
  //           console.log("| Empty response from handler, assuming success");
  //         }
  //       }
      
  //       // Clear auth cookies
  //       ctx.cookies.set("auth_token", "", { 
  //         expires: new Date(0),
  //         path: "/"
  //       });
      
  //       console.log("| Processed with better-auth handler");
  //       console.groupEnd();
  //       return;
  //     }
    
  //     // Manual signout
  //     ctx.cookies.set("auth_token", "", { 
  //       expires: new Date(0),
  //       path: "/"
  //     });
    
  //     ctx.response.status = 200;
  //     ctx.response.body = {
  //       success: true,
  //       message: "Signed out successfully"
  //     };
    
  //     console.log(`| Response: ${JSON.stringify(ctx.response.body)}`);
  //     console.groupEnd();
  //   } catch (error) {
  //     console.error("Error in signout handler:", error);
  //     ctx.response.status = 500;
  //     ctx.response.body = { 
  //       success: false, 
  //       error: { message: error instanceof Error ? error.message : "Sign out failed" } 
  //     };
  //     console.log(`| Error: ${error instanceof Error ? error.message : String(error)}`);
  //     console.groupEnd();
  //   }
  // });

  // Add test route to verify auth configuration
  // router.get("/test", (_ctx: any) => {
  //   return new Response("Auth routes are functioning");
  // });

  // async function magicLinkVerifyHandler(ctx: any) {
  //   const { token, callbackURL } = ctx.query;
  //   const toRedirectTo = callbackURL && callbackURL.startsWith("http")
  //     ? callbackURL
  //     : authConfig.baseUrl + (callbackURL || "");

  //   // Retrieve the stored verification value
  //   const tokenValue = await ctx.context.internalAdapter.findVerificationValue(token);
  //   if (!tokenValue) {
  //     return ctx.redirect(`${toRedirectTo}?error=INVALID_TOKEN`);
  //   }

  //   // Check if the token is expired
  //   if (new Date() > tokenValue.expiresAt) {
  //     await ctx.context.internalAdapter.deleteVerificationValue(tokenValue.id);
  //     return ctx.redirect(`${toRedirectTo}?error=EXPIRED_TOKEN`);
  //   }

  //   // Delete token to prevent reuse
  //   await ctx.context.internalAdapter.deleteVerificationValue(tokenValue.id);

  //   // Parse stored data
  //   const { email, name } = JSON.parse(tokenValue.value);

  //   // Look up the user in your user store
  //   let user = await ctx.context.internalAdapter.findUserByEmail(email).then(res => res?.user);

  //   // If user doesn't exist, create the user
  //   if (!user) {
  //     if (!authConfig.disableSignUp) {
  //       user = await ctx.context.internalAdapter.createUser({
  //         email,
  //         emailVerified: true,
  //         name: name || ""
  //       }, ctx);

  //       // After creating the user in your store, create a corresponding node in Neo4j
  //       await createNeo4jUserNode(user.id, user.email, name);
  //     } else {
  //       return ctx.redirect(`${toRedirectTo}?error=USER_CREATION_FAILED`);
  //     }
  //   }

  //   // Ensure the user’s email is marked as verified
  //   if (!user.emailVerified) {
  //     await ctx.context.internalAdapter.updateUser(user.id, { emailVerified: true }, ctx);
  //   }

  //   // Create a session using better-auth's session creation mechanism
  //   const session = await ctx.context.internalAdapter.createSession(user.id, ctx.headers);
  //   if (!session) {
  //     return ctx.redirect(`${toRedirectTo}?error=SESSION_CREATION_FAILED`);
  //   }

  //   // Set the session cookie (assumes a helper function exists)
  //   await setSessionCookie(ctx, { session, user });

  //   // If no callback URL is provided, return session data as JSON; otherwise, redirect
  //   if (!callbackURL) {
  //     return ctx.json({
  //       token: session.token,
  //       user: {
  //         id: user.id,
  //         email: user.email,
  //         name: user.name,
  //         emailVerified: user.emailVerified
  //       }
  //     });
  //   }
  //   return ctx.redirect(callbackURL);
  // }

  // async function signInMagicLinkHandler(ctx: any) {
  //   const parsedBody = magicLinkRequestSchema.safeParse(ctx.body);
  //   if (!parsedBody.success) throw("Invalid request body");

  //   const { email, callbackURL, redirect } = {...parsedBody.data};

  //   const verificationToken = authConfig.generateToken
  //     ? await authConfig.generateToken(email)
  //     : generateRandomString(32, "a-z", "A-Z");

  //   await ctx.context.internalAdapter.createVerificationValue({
  //     identifier: verificationToken,
  //     value: JSON.stringify({ email, name }),
  //     expiresAt: new Date(Date.now() + (authConfig.expiresIn || 300) * 1000)
  //   });

  //   const url = `${authConfig.baseUrl}/auth/verify?token=${verificationToken}${(callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : "")}`;

  //   await authConfig.sendMagicLinkEmail({ email, url, verificationToken }, ctx.request);

  //   return ctx.json({ success: true });
});

const routes: string[] = [
  "signin/magic-link",
  // "verify",
  // "user",
  // "signout",
  // "test"
];

const getHeaders = (sourceHeaders: Headers): HeadersInit => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (sourceHeaders.has("user-agent")) {
    const userAgent = sourceHeaders.get("user-agent");
    if (userAgent) headers["User-Agent"] = userAgent;
  }
  
  if (sourceHeaders.has("x-forwarded-for")) {
    const forwardedFor = sourceHeaders.get("x-forwarded-for");
    if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
  }
  
  return headers;
};

export { router as authRouter, routes as authRoutes };