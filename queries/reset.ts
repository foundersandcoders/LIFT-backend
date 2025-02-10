import neo4j, { Driver } from "neo4j";
import { creds } from "../utils/creds/neo4j.ts";

export async function reset() {
  let driver: Driver, result;

  try {
    driver = neo4j.driver(
      creds.URI,
      neo4j.auth.basic(creds.USER, creds.PASSWORD),
    );
    await driver.verifyConnectivity();
  } catch (err) {
    /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  await driver.executeQuery(
    `
    MATCH (n)
    DETACH DELETE n
  `,
    { database: "neo4j" },
  );

  console.log(`DB Wiped`);

  await driver.close();

  console.log(`Driver closed`);
}
await reset();
