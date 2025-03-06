import * as dotenv from "dotenv";
import { Application, Context } from "oak";
import router from "./routes/hubRoutes.ts";
import { nudgeDb, nudgeSched } from "utils/nudgeDb.ts";
console.log("Imports Done");

await dotenv.load({ export: true });
console.log("dotenv loaded");

const port = parseInt(Deno.env.get("PORT") ?? "8080");
console.log(`Port parsed: ${port}`);

const app = new Application();
console.log("App created");


// == CORS
async function customCors(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const allowedOrigin = Deno.env.get("FRONTEND_ORIGIN") || "*"; /*
    Retrieve the allowed origin from the environment.
    In production, FRONTEND_ORIGIN will be set (e.g., "https://lift-backend.deno.dev/").
    In development, it will default to "*" if not provided.
  */ console.log(`Allowed Origin ${allowedOrigin}`);

  ctx.response.headers.set(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );

  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }

  await next();
}
app.use(customCors);

// = Router
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port });
console.log(`Server running on port ${port}`);

// = Scheduled Jobs
Deno.cron("Keep the DB awake",
  nudgeSched,
  nudgeDb
);
