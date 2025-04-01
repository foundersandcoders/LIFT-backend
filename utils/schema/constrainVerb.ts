import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4jCred.ts";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

export async function constrainVerb() {
  if (logger) console.info(`| ":VERB" Edge Props`);
  let driver: Driver | null = null;
  
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
    
    await driver.executeQuery(
      `CREATE CONSTRAINT verb_dbId IF NOT EXISTS
      FOR ()-[v:VERB]-() REQUIRE v.dbId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );

    if (logger) console.info(`|- • dbId is unique`);
  } catch (err) {
    console.warn(`| Connection error`);
    console.warn(`| ${err}`);
  } finally {
    driver?.close()
  }
}
