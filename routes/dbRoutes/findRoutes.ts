import { Router } from "oak";
import { Search } from "types/serverTypes.ts";
import { checkId } from "../../utils/check/checkId.ts";
import { checkName } from "../../utils/check/checkName.ts";
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
    const publicOnly:boolean = bodyJson.publicOnly;

    const search = new Search(publicOnly, "init", id, name);

    if (search.id != -1) {
      search.type = "id";
    } else if (search.name != "") {
      search.type = "name";
    } else {
      search.type = "error";
    }

    console.log(search);

    let records:string[] = [];
    switch (search.type) {
      case "id": {
        records = await findUserById(search.id, search.publicOnly);
        break; 
      }
      case "name": {
        records = await findUserByName(search.name, search.publicOnly);
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
    console.log(`${records.length} records found`);

    ctx.response.status = 200;
    ctx.response.body = records;
  } catch (error) {
    console.error("Error fetching data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
  console.groupEnd();
  console.info("=======================");
});

// [ ] tdLo: This is just returning the subject's name
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