import { Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";

// = Processing
import { breaker } from "utils/language/breaker.ts";

// = DB Queries
import { getNouns, getVerbs } from "queries/get.ts";
import { findSubject, findObject, findVerb } from "queries/find.ts";
import { write } from "queries/write.ts";

const router = new Router();

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

// = Routes

// == Get
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

// == Find
router.get("/n/s/:n", async (ctx) => {
  try {
    const records = await findSubject(ctx.params.n);
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
    const records = await findObject(ctx.params.n);
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

router.get("/v/:v", async (ctx) => {
  try {
    const records = await findVerb(ctx.params.v);
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

// == Write
router.post("/newEntry", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const statement = body.statement;

    console.log(`=== Statement ===`);
    console.log(statement);

    const entry = await breaker(statement);

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

// == Test
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

// = Exports
export default router;
