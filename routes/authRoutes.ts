import { Router } from "oak";
import { createClient } from "supabase";
import { verifyUser } from "utils/auth/authMiddleware.ts";

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  console.group(`|============ Sign In Request ============|`);
  const body = await ctx.request.body.json();
  const name = body.name;
  const email = body.email;
  
  if (!email) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Email is required" };
    return;
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:8080/auth/callback",
        // [ ] tdHi: Get callback URL from Alex
        data: {
          name: name
        }
      },
    });

    console.group(`|====== Sign In Result ======|`);
    if (error) {
      console.info(`| Error`);
      console.error(error);

      ctx.response.status = 500;
      ctx.response.body = { error: error.message };
    } else {
      console.info(`| Success`);
      console.log(data);

      ctx.response.status = 200;
      ctx.response.body = { message: "Magic link sent", data };
    }
    console.groupEnd();
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error };
  }

  console.groupEnd();
});
routes.push("signin/magic-link");

router.get("/auth/callback", async (ctx) => {
  console.group("|============ Auth Callback ============|");
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the access_token and refresh_token from URL params
    const params = new URLSearchParams(ctx.request.url.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      throw new Error("No tokens provided in callback");
    }

    // Get the user data using the tokens
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(access_token);
    
    if (getUserError || !user) {
      throw getUserError || new Error("No user found");
    }

    // Get the user's profile
    

    console.group(`|============ Supabase Auth User ============|`);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log(user);
    console.groupEnd();

    console.group(`|============ Neo4j User ============|`)
    const neoUser = {
      authId: user.id,
      name: user.user_metadata.name,
      email: user.email
    };
    console.log(neoUser);
    console.groupEnd();
    
    // Redirect to frontend with success
    ctx.response.redirect(`${Deno.env.get("FRONTEND_URL")}/login/success`);

  } catch (error: unknown) {
    console.error("Callback error:", error);
    // Redirect to frontend with error
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    ctx.response.redirect(`${Deno.env.get("FRONTEND_URL")}/login/error?message=${encodeURIComponent(errorMessage)}`);
  }

  console.groupEnd();
});
routes.push("auth/callback");

router.get("/user", verifyUser, (ctx) => {});
// routes.push("user");

router.post("/signout", verifyUser, async (ctx) => {});
// routes.push("signout");

export { router as authRouter, routes as authRoutes };