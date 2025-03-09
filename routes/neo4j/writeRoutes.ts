import { Router } from "oak";
import type * as Client from "types/input.ts";
import type * as Server from "types/output.ts";
import { breaker } from "utils/language/breaker.ts";
import { writeBeacon } from "neo4jApi/writeBeacon.ts";

const router = new Router();
const routes: string[] = [];

// TODO: pass the invidiual Atoms to the breaker instead of the whole statement
router.post("/beacon", async (ctx) => {
  try {
    const body:Client.Entry = await ctx.request.body.json();

    const atoms:Server.Atoms = breaker(body);
    const entry:Server.Entry = { ...body, atoms };

    const newEntry:Server.Entry = await writeBeacon(entry);

    if (newEntry.error?.isError) {
      ctx.response.status = 400;
      ctx.response.body = { newEntry };
    } else {
      ctx.response.status = 200;
      ctx.response.body = { newEntry };
    }
  } catch (error) {
    console.error("Error processing entry:", error);
    ctx.response.status = 400;
    ctx.response.body = {  details: error instanceof Error ? error.message : String(error) };
  }
});
routes.push("/beacon");

export { router as writeRouter, routes as writeRoutes };
