import { Router } from "acorn";
import { EntryInput as In } from "../utils/interfaces.ts";
import { getSubject } from "../queries/get.ts";

const router = new Router();

/* ?? What is ctx?
  "ctx" is an alias for the "context" object.
  Provides access to Request object & other useful props/methods for handling requests.
*/

// = Get Routes
// note: get all
  // returns a list of every node in the DB.
router.get("/get", async (ctx) => {
  try {
    const records = await get();

    if (!records) { return {
      status: 500,
      body: { error: "Failed to fetch records from the database" },
    }} else { return {
      status: 200,
      body: records
    }};
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      status: 500,
      body: { error: "Internal Server Error" },
    };
  }
});

// note: subject search
  // returns a named node, all its relationships & linked nodes
router.get("/subject/:noun", async (ctx) => {
  try {
    const records = await getSubject(ctx.params.noun);
    
    if (!records) { return {
      status: 500,
      body: { error: "Failed to fetch records from the database" },
    }} else { return {
      status: 200,
      body: records
    }}
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      status: 500,
      body: { error: "Internal Server Error" },
    };
  }
});

// = Post Routes
router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.body();
    const entry = body as In;

    if (
      !entry.subject
      || !entry.verb
      || !entry.object
      || typeof entry.isPublic !== "boolean"
    ) {throw new Error("Missing or invalid required fields") }

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

// !! Test Routes
router.get("/test/getAlex", async (ctx) => {
  try {
    const records = await get("Alex");
    
    if (!records) { return {
      status: 500,
      body: { error: "Failed to fetch records from the database" },
    }} else { return {
      status: 200,
      body: records
    }}
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      status: 500,
      body: { error: "Internal Server Error" },
    };
  }
});

// = Exports
export default router;