import { Router } from "oak";
import { breaker } from "utils/language/breaker.ts";
import { write } from "neo4jApi/write.ts";

const router = new Router();
const routes: string[] = [];

router.post("/write", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const e = breaker(body.statement);
    
    /* TODO(@AlexVOiceover)
      Checks all input fields are passed, delete when this is handled on front end
    */ if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }

    console.log("Received new entry:", e);
    ctx.response.status = 200;
    ctx.response.body = { message: "Entry received successfully" };

    await write(e);
  } catch (error) {
    console.error("Error processing entry:", error);
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid input format" };
  }
});
routes.push("/write");

export {
  router as writeRouter,
  routes as writeRoutes
};