import { Context, Next } from "oak";
import { createClient } from "supabase";
import { getNeo4jUserData } from "./neo4jUserLink.ts";

const devMode:boolean = true;

export async function verifyUser(ctx: Context, next: () => Promise<unknown>) {
  console.groupCollapsed("|=== Verification Middleware ===|");
  console.log(`| Path: ${ctx.request.url.pathname}`);
  
  const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");

  console.groupCollapsed("|====== Token ======|");
  if ((!token || token == undefined) && !devMode) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized" };
    return;
  } else if (devMode) {
    console.log(token);
  };
  console.groupEnd();

  console.groupCollapsed("|====== Supabase ======|");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(Object.keys(supabase));
  console.groupEnd();

  console.groupCollapsed("|====== Get User ======|");
  const { data: user, error } = await supabase.auth.getUser(token);
  if (!devMode && (error || !user)) {
    console.log("| Error found");
    console.log(error);

    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };

    return;
  } else if (!devMode) {
    console.log("| User found");
    console.log(user);
  } else if (devMode) {
    console.log(`| User not found`);
    console.log(`| Bypassing verification for dev mode`);
  }
  console.groupEnd();

  const linkPaths = ["/beacon", "/write"];

  if (linkPaths.some(path => ctx.request.url.pathname.includes(path))) {
    console.log("| Neo4j data collected at this point");
    const neo4jData = await getNeo4jUserData(user.user.id);
    
    if (neo4jData) {
      console.log("| Neo4j data found and attached to context");
      ctx.state.neo4jUser = neo4jData;
    } else {
      console.log("| No Neo4j data found for user");
    }
  }

  ctx.state.user = user;
  console.groupEnd();

  await next();
}
