import {Kysely, PostgresDialect} from "ky"
import Pool from "pg-pool"
import type { Database } from "types/kyselyTypes.ts";

const connection = Deno.env.get("SUPABASE_CONNECTION_STRING") || "";

console.group(`|====== Kysely (pg) ======|`)

export const kysely = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connection,
    }),
  }),
})

console.log(Object.keys(kysely));
console.log(Object.keys(kysely.introspection));
console.log(Object.keys(kysely.schema));

console.groupEnd();