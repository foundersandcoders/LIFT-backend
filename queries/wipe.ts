import * as dotenv from "jsr:@std/dotenv";
await dotenv.load({ export: true });

import neo4j, { Driver } from "neo4j";

export async function wipe() {
  const URI: string = await Deno.env.get("NEO4J_URI") ?? "";
  const USER: string = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD: string = await Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await driver.verifyConnectivity();
    console.log(`Connected`);
  } catch (err) { /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  await driver.executeQuery(
    `MATCH (n)
    DETACH DELETE n`,
    { database: "neo4j" },
  );

  console.log(`DB Wiped`);

  await driver.close();

  console.log(`Driver closed`);
}

wipe();
