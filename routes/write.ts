import { Router } from "oak";
import { breaker } from "utils/language/breaker.ts";
import { write } from "queries/write.ts";

const router = new Router();

router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const statement = body.statement;

    console.log(`=== Statement ===`);
    console.log(statement);

    const entry = breaker(statement);

    console.log("=== Entry ===");
    console.log(entry);

    // TODO(@AlexVOiceover)
    // Checks all input fields are passed, delete when this is handled on front end
    if (!entry.subject || !entry.verb || !entry.object) {
      throw new Error("Missing or invalid required fields");
    }

    console.log("Received new entry:", entry);
    ctx.response.status = 200;
    ctx.response.body = { message: "Entry received successfully" };

    await write(entry);
  } catch (error) {
    console.error("Error processing entry:", error);
    ctx.response.status = 400;
    ctx.response.body = {
      error: "Invalid input format",
    };
  }
});

export { router as writeRoutes };