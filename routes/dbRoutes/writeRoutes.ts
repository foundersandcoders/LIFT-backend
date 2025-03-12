import { Router } from "oak";
import type { Match, Lantern, Beacon, Ash, Shards, Atoms } from "types/beaconTypes.ts";
import { breaker } from "utils/language/breaker.ts";
import { writeBeacon } from "neo4jApi/writeBeacon.ts";

const router = new Router();
const routes: string[] = [];

router.post("/newBeacon", async (ctx) => {
  console.groupCollapsed(`========= POST: /write/newBeacon =========`);

  try {
    const match:  Match = await ctx.request.body.json();
    const shards: Shards = breaker(match);
    const lantern: Lantern = { ...match, shards: shards };
    
    const beaconAttempt:  Beacon | Ash = await writeBeacon(lantern);

    if (beaconAttempt.errorLogs) {
      console.log("Error Creating Beacon");
      ctx.response.status = 400;
      ctx.response.body = { beaconAttempt };
    } else {
      console.log("Beacon Created");
      ctx.response.status = 200;
      ctx.response.body = { beaconAttempt };
    }
  } catch (error) {
    console.error("Error processing entry:", error);
    const details = error instanceof Error ? error.message : String(error);
    ctx.response.status = 400;
    ctx.response.body = { details };
  }

  console.groupEnd();
});

router.post("/newUser", (ctx) => {console.log("Not Implemented")});

routes.push("/newBeacon");
routes.push("/newUser");

export { router as writeRouter, routes as writeRoutes };
