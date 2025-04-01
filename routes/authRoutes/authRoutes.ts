import { Router } from "oak";
import { createClient } from "supabase";
import { verifyUser } from "utils/auth/authMiddleware.ts";

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  console.group(`|============ Sign In Request ============|`);
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
    options: { emailRedirectTo: "http://localhost:5000/auth/callback" },
  });

  // [ ] tdHi: Get callback URL from Alex

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

  console.groupEnd();
});
routes.push("signin/magic-link");

router.get("/user", verifyUser, (ctx) => {});
// routes.push("user");

router.post("/signout", verifyUser, async (ctx) => {});
// routes.push("signout");

export { router as authRouter, routes as authRoutes };