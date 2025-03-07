import { Router } from "oak";
import { findSubject, findObject, findVerb } from "neo4jApi/find.ts";

const router = new Router();
const routes: string[] = [];

router.get("/subject/:subject", async (ctx) => {
  try {
    const records = await findSubject(ctx.params.subject);
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
routes.push("/subject/:subject");

router.get("/object/:object", async (ctx) => {
  try {
    const records = await findObject(ctx.params.object);
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
routes.push("/object/:object");

router.get("/verb/:verb", async (ctx) => {
  try {
    const records = await findVerb(ctx.params.verb);
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
routes.push("/verb/:verb");

export {
  router as findRouter,
  routes as findRoutes
};