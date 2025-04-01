// import { Kysely, PostgresDialect } from "ky";
// import Pool from "pg-pool";
// import type { Database } from "types/kyselyTypes.ts";

import { Kysely } from 'ky';
import { PostgresJSDialect } from 'ky-postgres';
import postgres from 'postgres';
import type { Database } from 'types/kyselyTypes.ts';

const connection = Deno.env.get("SUPABASE_STRING") || "";

console.group(`|====== Kysely (pg) ======|`);

// const dialect = new PostgresDialect({
//   pool: new Pool({
//     connectionString: connection
//   }),
// });

// console.log(dialect);

// export const kysely = new Kysely<Database>({ dialect });

export const kysely = new Kysely<Database>({
  dialect: new PostgresJSDialect({
    postgres: postgres(connection),
  }),
});

console.log(kysely);

console.group(`|====== Keys ======|`);
console.log(Object.keys(kysely));
console.log(Object.keys(kysely.introspection));
console.log(Object.keys(kysely.schema));
console.groupEnd();

console.groupEnd();

// Use Deno.env.get if you are running in Deno (recommended) or process.env if in Node.
// Here, for Deno, replace process.env with Deno.env.get:

