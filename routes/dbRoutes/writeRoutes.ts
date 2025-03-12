import { Router } from "oak";
// import type * as Client from "types/inputTypes.ts";
// import type * as Server from "types/outputTypes.ts";
import type { Entry as ClientEntry, Atoms as ClientAtoms } from "types/inputTypes.ts";
import type { Entry as ServerEntry, Atoms as ServerAtoms } from "../../types/beaconTypes.ts";
import { breaker } from "utils/language/breaker.ts";
import { writeBeacon } from "neo4jApi/writeBeacon.ts";

const router = new Router();
const routes: string[] = [];

// [ ] tdMd: pass the invidiual Atoms to the breaker instead of the whole statement
router.post("/newBeacon", async (ctx) => {
  console.groupCollapsed(`=== POST: /write/newBeacon ===`);
  try {
    const body:ClientEntry = await ctx.request.body.json();
    console.log(`body.input: ${body.input}`);

    const serverAtoms:ServerAtoms = breaker(body);
    const entry:ServerEntry = {
      ...body,
      atoms: {
        client: body.atoms,
        server: serverAtoms
      },
      actions: []
    };

    // [ ] tdHi: Reinstate the type for newEntry
    const newEntry/* :ServerEntry */ = await writeBeacon(entry);

    if (newEntry.error?.isError) {
      console.log("Error Creating Beacon");
      ctx.response.status = 400;
      ctx.response.body = { newEntry };
    } else {
      console.log("Beacon Created");
      ctx.response.status = 200;
      ctx.response.body = { newEntry };
    }
  } catch (error) {
    console.error("Error processing entry:", error);
    ctx.response.status = 400;
    ctx.response.body = {
      details: error instanceof Error ? error.message : String(error)
    };
  }

  console.groupEnd();
});

router.post("/createUser", (ctx) => {
  console.log("Not Implemented");
});

routes.push("/newBeacon");
routes.push("/createUser");

export { router as writeRouter, routes as writeRoutes };
