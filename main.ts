import * as dotenv from "dotenv";
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import router from "router";
import { nudgeDb, nudgeSched } from "./utils/nudgeDb.ts";

await dotenv.load({ export: true });

// = Start Up
const port = parseInt(Deno.env.get("PORT") ?? "8080");

// Create an Oak application instance
const app = new Application();

// Custom CORS middleware
async function customCors(ctx: Context, next: () => Promise<unknown>) {

  // Retrieve the allowed origin from the environment.
  // In production, FRONTEND_ORIGIN will be set (e.g., "https://lift-backend.deno.dev/").
  // In development, it will default to "*" if not provided.

  const allowedOrigin = Deno.env.get('FRONTEND_ORIGIN') || '*';
  console.log(`Allowed Origin ${allowedOrigin}`)
  // Set CORS headers
  ctx.response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    return;
  }
  await next();
}

// Register middleware in the proper order:
// 1. CORS middleware
app.use(customCors);
// 2. Router middleware
app.use(router.routes());
app.use(router.allowedMethods());

// Start listening
await app.listen({ port });
console.log(`Server running on port ${port}`);

// = Scheduled Jobs
Deno.cron("Keep the DB awake", nudgeSched, nudgeDb);
