import { Router } from "oak";
import { breaker } from "utils/language/breaker.ts";

const router = new Router();

router.get("/breaker", async (ctx) => {
  console.groupCollapsed(`=== get "/breaker" ===`);
  console.groupCollapsed(`=== Input ===`);
  try {
    const testText: string = "The user submitted an empty text";
    console.log(`Fallback Text: ${testText}`);

    // const { text:string } = await ctx.request.body.text();
    let text: string = await ctx.request.body.text();
    text = text ? text : testText;

    console.log(`Submitted Text: ${text}`);

    if (!text) {
      console.log("Error: No Text");
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing 'text' in request body" };
      return;
    }

    console.groupEnd();

    console.log(`Calling breaker(${text})`);
    const result = await breaker(text);

    console.group(`=== Result ===`);
    // console.log(`Result: ${Object.entries(result)}`);
    console.log(`Subject: ${Object.values(result.subject)}`);
    console.log(`Verb: ${Object.values(result.verb)}`);
    console.log(
      `Object: ${result.object ? Object.values(result.object) : "None"}`,
    );
    console.groupEnd();

    ctx.response.body = JSON.stringify(result);
  } catch (error: unknown) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
  console.groupEnd();
});

export { router as toolRoutes };