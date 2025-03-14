import neo4j, { Driver } from "neo4j";
import { creds as c } from "../../utils/auth/neo4jCred.ts";

export async function reset() {
  let driver: Driver, result;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();

    await driver.executeQuery(
      `MATCH (n)
      DETACH DELETE n`,
      {},
      { database: "neo4j" },
    );
  
    console.log(`DB Wiped`);
  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
    console.warn(err instanceof Error ? err.cause : "Cause Unknown");
    return { error: { errorCause: "Connection Error" }};
  } finally {
    await driver?.close();
    console.log(`Driver closed`);
  }
}

