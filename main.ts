import * as dotenv from "dotenv";
import router from "router";
import { nudgeDb, nudgeSched } from "./utils/nudgeDb.ts";

await dotenv.load({ export: true });

// = Start Up
const port = await parseInt(
  Deno.env.get("PORT") ?? "8080",
);

router.listen({ port: port });
console.log(`Router awake on ${port}`);

// = Scheduled Jobs
Deno.cron("Keep the DB awake", nudgeSched, nudgeDb);