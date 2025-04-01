import { Router } from "oak";
import { reset } from "neo4jApi/reset.ts";

const devMode = Deno.env.get("DENO_ENV") !== "production";

const router = new Router();
const routes: string[] = [];

/**
 * Reset the database
 */
router.delete("/reset", async (ctx) => {
  const result = await reset();
  ctx.response.body = result;
});
if (devMode) { routes.push("/reset") };

export { router as toolRouter, routes as toolRoutes };