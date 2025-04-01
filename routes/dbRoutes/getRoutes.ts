import { Router } from "oak";
import { getNouns, getVerbs } from "neo4jApi/get.ts";

const router = new Router();
const routes: string[] = [];

/**
 * Get all nouns
 */
router.get("/n", async (ctx) => {
  try {
    const records = await getNouns();

    if (!records) {
      ctx.response.status = 500,
        ctx.response.body = {
          error: "Failed to fetch records from the database",
        };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500,
      ctx.response.body = { error: "Internal Server Error" };
  }
});
routes.push("/n");

/**
 * Get all verbs
 */
router.get("/v", async (ctx) => {
  try {
    const records = await getVerbs();

    if (!records) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Failed to fetch records from the database",
      };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});
routes.push("/v");

export { 
  router as getRouter,
  routes as getRoutes
};