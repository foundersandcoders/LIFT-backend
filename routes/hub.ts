// import { Router } from "acorn";
import { Router } from "https://deno.land/x/oak/mod.ts";
import langRouter from "./language.ts"

import { EntryInput as In } from "../utils/types/interfaces.ts";
import { getNouns, getObject, getSubject, getVerbs } from "../queries/get.ts";
import { write } from "../queries/write.ts";

const router = new Router();

// = Imported Routes
router.use("/dev", langRouter.routes)

// = Get Routes
router.get("/", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = {
    "Routes": {
      "/n": 'Return all nodes with the label ":Person"',
      "/n/s/:name": 'Return relationships with ":name" as subject',
      "/n/o/:name": 'Return relationships with ":name" as object',
      "/v": "Return relationships",
    },
  };
});

router.get("/n", async (ctx) => {
  try {
    const records = await getNouns();

    if (!records) {
      ctx.response.status = 500,
        ctx.response.body = {
          error: "Failed to fetch records from the database",
        };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500,
      ctx.response.body = { error: "Internal Server Error" };
  }
});

router.get("/n/s/:n", async (ctx) => {
  try {
    const records = await getSubject(ctx.params.n);
    if (!records) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Failed to fetch records from the database",
      };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

router.get("/n/o/:n", async (ctx) => {
  try {
    const records = await getObject(ctx.params.n);
    if (!records) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Failed to fetch records from the database",
      };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

router.get("/v", async (ctx) => {
  try {
    const records = await getVerbs();

    if (!records) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Failed to fetch records from the database",
      };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

// = Post Routes
router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const entry = body as In; // Ensure your type cast if needed

    if (
      !entry.subject ||
      !entry.verb ||
      !entry.object ||
      typeof entry.isPublic !== "boolean"
    ) {
      throw new Error("Missing or invalid required fields");
    }

    console.log("Received new entry:", entry);
    ctx.response.status = 200;
    ctx.response.body = { message: "Entry received successfully" };

    // Write to the database.
    // Since your write() function expects arrays, pass the values as arrays.
    await write(
      [entry.subject],
      [entry.object],
      [entry.verb],
      [], // Pass additional data if needed, otherwise an empty array.
    );
  } catch (error) {
    console.error("Error processing entry:", error);
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid input format" };
  }
});

// = Exports
export default router;
