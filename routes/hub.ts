import { Router } from "acorn";
import { EntryInput } from "types";
import { queryAll } from "../queries/queryAll.ts";

const router = new Router();

router.get("/all", async (ctx) => {
  try {
    const records = await queryAll();
    
    if (!records) { return {
      status: 500,
      body: { error: "Failed to fetch records from the database" },
    }}

    return {
      status: 200,
      body: records,
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      status: 500,
      body: { error: "Internal Server Error" },
    };
  }
});

/* Get By Part of Speech
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
*/

router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.body();
    const entry = body as EntryInput;

    if (
      !entry.subject
      || !entry.verb
      || !entry.object
      || typeof entry.isPublic !== "boolean"
    ) { throw new Error("Missing or invalid required fields") }

    console.log("Received new entry:", entry);

    return { message: "Entry received successfully" };
  } catch (error) {
    console.error("Error processing entry:", error);

    return {
      status: 400,
      body: {error: "Invalid input format"}
    };
  }
});

export default router;