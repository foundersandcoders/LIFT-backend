import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/auth/neo4jCred.ts";

export async function constrainVerb() {
  console.groupCollapsed(`====== FUNCTION constrainVerb() ======`);
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

    console.info(`[:VERB { dbId }]`);
  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
  } finally {
    driver?.close()
  }
  console.groupEnd();
}
