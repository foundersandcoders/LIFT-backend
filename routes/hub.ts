import { Router } from "acorn";
import { EntryInput as In } from "../utils/interfaces.ts";
import { getNouns, getSubject, getObject } from "../queries/get.ts";

const router = new Router();

/* ?? What is ctx?
  "ctx" is an alias for the "context" object.
  Provides access to Request object & other useful props/methods for handling requests.
*/

// = Get Routes
router.get("/", (ctx) => {
  return { body: {
    "Routes": {
      "/n": "Return all nodes with the label \":Person\"",
      "/n/s/:name": "Return relationships with \":name\" as subject",
      "/n/o/:name": "Return relationships with \":name\" as object"
    }
  }}
});

router.get("/n", async (ctx) => {
  try {
    const records = await getNouns();

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

router.get("/n/s/:n", async (ctx) => {
  try {
    const records = await getSubject(ctx.params.n);
    
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

router.get("/n/o/:n", async (ctx) => {
  try {
    const records = await getObject(ctx.params.n);
    
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

// = Exports
export default router;