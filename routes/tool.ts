import { Router } from "oak";
import { breaker } from "utils/language/breaker.ts";

const router = new Router();
const routes: string[] = [];

router.get("/breaker", async (ctx) => {
  try {
    const text: string = await ctx.request.body.text() ?? "The user submitted an empty text";
    console.log(`Calling breaker(${text})`);
    
    const result = breaker(text);
    console.log(`Subject: ${Object.values(result.subject)}`);
    console.log(`Verb: ${Object.values(result.verb)}`);
    console.log(`Object: ${result.object ? Object.values(result.object) : "None"}`);

    ctx.response.body = JSON.stringify(result);
  } catch (error: unknown) {
    ctx.response.status = 500;
    ctx.response.body = { error: error instanceof Error ?
      error.message :
      "unknown error"
    };
  }
});
routes.push("/breaker")

export {
  router as toolRouter,
  routes as toolRoutes
};