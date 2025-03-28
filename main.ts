import * as dotenv from "dotenv";
import { Application, Context } from "oak";
// Router
import { router } from "routes/hubRoutes.ts";
// Database
import { nudgeDb, nudgeSched } from "utils/cron/nudgeDb.ts";
import { defineSchema } from "utils/schema/schema.ts";

await dotenv.load({ export: true });
export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

const port = parseInt(Deno.env.get("PORT") ?? "8080");
const app = new Application();

async function customCors(ctx: Context, next: () => Promise<unknown>) {
  const allowedOrigin = Deno.env.get("FRONTEND_ORIGIN") || "*";
  
  console.log(`| Allowed Origin ${allowedOrigin}`);

  ctx.response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }

  await next();
}

app.use(customCors);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port });

console.info(``);
console.info(`|====================================|`);
console.info(`|=====| WELCOME | TO | BEACONS |=====|`);
console.info(`|==============| ${port} |==============|\n`);

await defineSchema();

Deno.cron("Keep the DB awake", nudgeSched, nudgeDb);
