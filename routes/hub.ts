import { Router } from "acorn";
import { EntryInput } from "types";

const router = new Router();

// ALEX
// The endpoint you want is "/newEntry"
// The type definitions are in "../types/input.ts"

router.get("/", () => ({
  query: `( ??? )`,
}));

router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.body();
    const entry = body as EntryInput;

    if (
      !entry.subject
      || !entry.verb
      || !entry.object
      || typeof entry.isPublic !== "boolean"
    ) {
      throw new Error("Missing or invalid required fields");
    }

    console.log("Received new entry:", entry);

    return {
      message: "Entry received successfully",
    };
  } catch (error) {
    console.error("Error processing entry:", error);

    return {
      status: 400,
      body: {
        error: "Invalid input format",
      },
    };
  }
});

router.get("/subject/:name", (ctx) => {
  return {
    query: `( ${ctx.params.name} )---[ ??? ]-->( ??? )`,
  };
});

router.get("/object/:name", (ctx) => {
  return {
    query: `( ??? )---[ ??? ]-->( ${ctx.params.name} )`,
  };
});

router.get("/verb/:name", (ctx) => {
  return {
    query: `( ??? )---[ ${ctx.params.name} ]--> ( ??? )`,
  };
});

export default router;
