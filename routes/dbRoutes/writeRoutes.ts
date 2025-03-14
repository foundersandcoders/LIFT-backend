import { Router } from "oak";
import type { Match, Lantern, Ember, Ash, Shards, Atoms } from "types/beaconTypes.ts";
import type { Attempt } from "types/serverTypes.ts";
import { breaker } from "../../utils/convert/breakInput.ts";
import { writeBeacon } from "neo4jApi/writeBeacon.ts";

const router = new Router();
const routes: string[] = [];

router.post("/newBeacon", async (ctx) => {
  console.groupCollapsed(`========= POST: /write/newBeacon =========`);
  try {
    const match:  Match = await ctx.request.body.json();
    const shards: Shards = breaker(match);
    const candidate: Lantern = { ...match, shards: shards };    
    const attempt: Attempt = await writeBeacon(candidate);
    
    console.groupCollapsed(`Try: Done`);
    if (attempt.error) {
      console.log(`Error`);

      ctx.response.status = 400;
      ctx.response.body = attempt.record;

      console.warn(ctx.response);
    } else {
      console.log(`Success`);

      ctx.response.status = 200;
      ctx.response.body = attempt.record;
      
      console.log(ctx.response);
    }
    console.groupEnd();
  } catch (error) {
    console.groupCollapsed(`Try: Catch`);
    console.error("Error processing entry:", error);

    const details = error instanceof Error ? error.message : String(error);

    ctx.response.status = 400;
    ctx.response.body = { details };

    console.error(ctx.response);
    console.groupEnd();
  }
  console.groupEnd();
});

router.post("/newUser", (ctx) => {
  console.log("Not Implemented")
});

routes.push("/newBeacon");
routes.push("/newUser");

export { router as writeRouter, routes as writeRoutes };
