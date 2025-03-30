import { Kysely } from "npm:kysely";
import { PostgresJSDialect } from "npm:kysely-postgres-js";
import postgres from "npm:postgres";
import type { Database } from "types/kyselyTypes.ts";

const connection = Deno.env.get("SUPABASE_CONNECTION_STRING") || "";

console.group(`|====== Kysely ======|`)
export const kysely = new Kysely<Database>({
  dialect: new PostgresJSDialect({
    postgres: postgres(connection),
  }),
})

console.log(kysely);

const intro = kysely.introspection;
console.log(intro);

console.groupEnd();