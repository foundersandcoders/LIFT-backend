import { Router } from "oak";
import { createClient } from "supabase";
import { verifyUser } from "utils/auth/authMiddleware.ts";

const router = new Router();
const routes: string[] = [];

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

  // [ ] tdHi: Get callback URL from Alex

  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  } else {
    ctx.response.status = 200;
    ctx.response.body = { message: "Magic link sent", data };
  }
});
routes.push("signin/magic-link");

router.get("/user", verifyUser, (ctx) => {
  const user = ctx.state.user;
  ctx.response.body = { user };
});
routes.push("user");

router.post("/signout", verifyUser, async (ctx) => {
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
routes.push("signout");

export { router as authRouter, routes as authRoutes };