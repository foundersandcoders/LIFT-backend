import { Router } from "oak";
import { reset } from "api/neo4j/reset.ts";

const router = new Router();
const routes: string[] = [];

router.delete("/reset", async (ctx) => {
  const result = await reset();
  ctx.response.body = result;
});
routes.push("/reset");

export {
  router as toolRouter,
  routes as toolRoutes
};