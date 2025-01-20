import * as dotenv from "jsr:@std/dotenv";
await dotenv.load({export: true});

import neo4j, { Driver } from "neo4j";
import { Credentials as C, credentials as c } from "./credentials.ts";

interface Input{
  s: string[],
  o: string[],
  v: string[],
  a: string[]
}

export async function write(
  s: Input["s"],
  o:Input["o"],
  v:Input["v"],
  a:Input["a"]
) {
  const URI = await Deno.env.get("NEO4J_URI") ?? "";
  const USER = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD = await Deno.env.get("NEO4J_PASSWORD") ?? "";
  
  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return
  }

  console.groupCollapsed("=== === Subject === ===");
    await driver.executeQuery( /* Subject */
      'MERGE (subject:Person {name: $subject[0]})',
      { subject: s[0] },
      { database: 'neo4j' }
    );

    console.log(`Created ${s[0]}`);

    s.shift;

    console.groupCollapsed("=== Not Encoded ===")
      for (const term of s) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Object === ===");
    await driver.executeQuery( /* Object */
      'MERGE (object:Person {name: $object[0]})',
      { object: o[0] },
      { database: 'neo4j' }
    );

    console.log(`Created ${o[0]}`);
    
    o.shift;

    console.groupCollapsed("=== Not Encoded ===")
      for (const term of o) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Verb === ===");
    console.groupCollapsed("=== Not Encoded ===")
      for (const term of v) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Additional === ===");
    console.groupCollapsed("=== Not Encoded ===")
      for (const term of a) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.log("Entry Complete")

  await driver.close();
};

write(
  ["pig", "small"],
  ["idea", "ambitious"],
  ["realise", "attempts to"],
  ["regularly"]
);