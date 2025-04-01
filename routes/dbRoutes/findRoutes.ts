import { Router } from "oak";
import { Search } from "types/serverTypes.ts";
import { verifyUser } from "utils/auth/authMiddleware.ts";
import { checkId } from "utils/check/checkId.ts";
import { checkName } from "utils/check/checkName.ts";
import {
  findUserById,
  findUserByName,
  findSubject,
  findObject,
  findVerb
} from "neo4jApi/find.ts";

const router = new Router();
const routes: string[] = [];

router.post("/user", verifyUser, async (ctx) => {
  console.groupCollapsed("|=== POST /find/user ===|");
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);

  try {
    const body = ctx.request.body;
    const bodyJson = await body.json();

    const authId:string = checkId(bodyJson.authId);
    const name:string = checkName(bodyJson.name);
    const publicOnly:boolean = bodyJson.publicOnly;

    const search = new Search(publicOnly, "init", authId, name);

    if (search.authId != "") {
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
        records = await findUserById(search.authId, search.publicOnly);
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
routes.push("/user");

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
routes.push("/subject/:subject");

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
routes.push("/object/:object");

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
routes.push("/verb/:verb");

export {
  router as findRouter,
  routes as findRoutes
};