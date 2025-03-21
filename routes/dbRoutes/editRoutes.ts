import { Router } from "oak";
import { authMiddleware } from "utils/auth/authMiddleware.ts";
const router = new Router();
const routes: string[] = [];

router.put("/editBeacon", authMiddleware, async (ctx) => {
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  try {
    // const body = await ctx.request.body.json();
    // const e = breaker(body.statement);
    
    // if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }

    // console.log("Received new entry:", e);
    // ctx.response.status = 200;
    // ctx.response.body = { message: "Entry received successfully" };

    // await writeBeacon(e);
  } catch (error) {
    // console.error("Error processing entry:", error);
    // ctx.response.status = 400;
    // ctx.response.body = { error: "Invalid input format" };
  }
});

router.put("/deleteBeacon", authMiddleware, async (ctx) => {
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  try {
    // const body = await ctx.request.body.json();
    // const e = breaker(body.statement);
    
    // if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }

    // console.log("Received new entry:", e);
    // ctx.response.status = 200;
    // ctx.response.body = { message: "Entry received successfully" };

    // await writeBeacon(e);
  } catch (error) {
    // console.error("Error processing entry:", error);
    // ctx.response.status = 400;
    // ctx.response.body = { error: "Invalid input format" };
  }
});

router.put("/editManager", authMiddleware, async (ctx) => {
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  try {
    // const body = await ctx.request.body.json();
    // const e = breaker(body.statement);
    
    // if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }
  } catch (error) {
    // console.error("Error processing entry:", error);
    // ctx.response.status = 400;
    // ctx.response.body = { error: "Invalid input format" };
  }
});

routes.push("/editBeacon", "/deleteBeacon", "/editManager");

export {
  router as editRouter,
  routes as editRoutes
};
