import neo4j, { Driver } from "neo4j";
import { creds } from "../utils/creds/neo4j.ts";

export async function queryAll() {
  let driver: Driver, result;

  try {
    driver = neo4j.driver(
      creds.URI,
      neo4j.auth.basic(creds.USER, creds.PASSWORD)
    );
    await driver.verifyConnectivity();
  } catch (err) {
    /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  const { records } = await driver.executeQuery(`
    MATCH (n)
    RETURN n
    LIMIT 25
  `);
  console.log(records);

  await driver.close();
  return records;
}