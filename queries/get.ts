import neo4j, { Driver } from "neo4j";
import { creds } from "../utils/creds/neo4j.ts";

export async function get(subject?: string) {
  let driver: Driver;

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

  let query: string;
  let params: Record<string, unknown> | undefined = undefined;

  if (subject) {
    query = `
      MATCH (n { name: $subject })
      RETURN n
    `;
    params = { subject };
  } else {
    query = `
      MATCH (n)
      RETURN n
      LIMIT 25
    `;
  }

  const { records } = await driver.executeQuery(query, params);
  console.log(records);

  await driver.close();
  return records;
}