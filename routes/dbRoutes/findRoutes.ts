import { Router } from "oak";
import { Search } from "types/serverTypes.ts";
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
  try {
    const body = ctx.request.body;
    console.groupCollapsed("Body");
      console.log(body);
    console.groupEnd();

    const bodyJson = await body.json();
    console.groupCollapsed("Body JSON");
      console.log(bodyJson);
    console.groupEnd();

    let records:string[] = [];
    console.groupCollapsed("Records");
      console.log(records);
    console.groupEnd();

    const search:Search = {
      public: true,
      type: "init",
      id: parseInt(bodyJson.id) ?? -1,
      name: bodyJson.name ?? ""
    }
    console.groupCollapsed("Search Object: Init");
      console.log(search);
    console.groupEnd();

    if (search.id != -1) {
      search.type = "id";
      // [ ] tdWait: Change this once auth is implemented
      search.public = false;
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
        ctx.response.body = {
          error: "No user ID or name provided"
        };
        break;
      }
      default: {
        ctx.response.status = 500;
        ctx.response.body = {
          error: "Unhandled request type"
        };
        break;
      }
    }

    if (records.length === 0) {
      ctx.response.status = 200;
      ctx.response.body = { 
        message: "No records found"
      };
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