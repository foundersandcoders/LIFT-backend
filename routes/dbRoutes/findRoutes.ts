import { Router } from "oak";
import { Search } from "types/serverTypes.ts";
import { checkId, checkName } from "utils/checkId.ts";
import {
  findUserById,
  findUserByName,
  findSubject,
  findObject,
  findVerb
} from "neo4jApi/find.ts";

const router = new Router();
const routes: string[] = [];

router.post("/user", async (ctx) => {
  console.groupCollapsed("=== POST /find/user ===");
  try {
    const body = ctx.request.body;
    const bodyJson = await body.json();

    const id:number = checkId(bodyJson.id);
    const name:string = checkName(bodyJson.name);
    const search = new Search(true, "init", id, name);

    if (search.id != -1) {
      search.type = "id";
      // [ ] tdWait: Change this once auth is implemented
      search.publicOnly = false;
    } else if (search.name != "") {
      search.type = "name";
      search.name = bodyJson.name;
    } else {
      search.type = "error";
    }

    console.groupCollapsed("Search Object: Input Type");
      console.log(search);
    console.groupEnd();

    // [ ] tdWait: This should check for and pass the authentication ID
    let records:string[] = [];
    switch (search.type) {
      case "id": {
        records = await findUserById(search.id, search.public);
        break; 
      }
      case "name": {
        records = await findUserByName(search.name, search.public);
        break;
      }
      case "error": {
        ctx.response.status = 400;
        ctx.response.body = { error: "No user ID or name provided" };
        break;
      }
      default: {
        ctx.response.status = 500;
        ctx.response.body = { error: "Unhandled request type" };
        break;
      }
    }

    if (records.length === 0) {
      console.info("No records found");
      ctx.response.status = 200;
      ctx.response.body = { message: "No records found" };
    } else {
      console.info("Records found");
      ctx.response.status = 200;
      ctx.response.body = records;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
  console.groupEnd();
  console.info("=======================");
});

// [ ] tdFix: This is just returning the subject's name
router.get("/subject/:subject", async (ctx) => {
  try {
    const records = await findSubject(ctx.params.subject);

    if (!records) {
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to fetch records from the database" };
      return;
    } else {
      ctx.response.status = 200;
      ctx.response.body = records;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
});

router.get("/object/:object", async (ctx) => {
  try {
    const records = await findObject(ctx.params.object);
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

router.get("/verb/:verb", async (ctx) => {
  try {
    const records = await findVerb(ctx.params.verb);
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

routes.push("/user");
routes.push("/subject/:subject");
routes.push("/object/:object");
routes.push("/verb/:verb");

export {
  router as findRouter,
  routes as findRoutes
};