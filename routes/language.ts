import { Router } from "https://deno.land/x/oak/mod.ts";
import { breaker } from "../utils/language/breakerB.ts";

const router = new Router();

router.post("/breakerB", async (ctx) => {
  try {
    const { text } = await ctx.request.body({ type: "json" }).value;
    
    if (!text) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing 'text' in request body" };
      return;
    }

    const result = breaker(text);
    ctx.response.body = result;
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: err.message };
  }
});

export default router;
