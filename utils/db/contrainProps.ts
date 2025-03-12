import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4j.ts";
/* 
  
*/

export async function constrainProps() {
  console.groupCollapsed(`====== FUNCTION constrainProps() ======`);
  let driver: Driver|null = null;
  
  try {
    console.groupCollapsed(`--- Neo4j ---`);
    console.info("Initialising Driver...");
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    console.info("Connecting to Aura...");
    await driver.getServerInfo();
    
    console.groupCollapsed("--- `beaconId` ---");
    await driver.executeQuery(
      `CREATE CONSTRAINT beacon_id IF NOT EXISTS
      FOR ()-[v:VERB]-()
      REQUIRE v.beaconId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );
    console.info("Constraint imposed");
    console.groupEnd();
    
    console.groupCollapsed("--- `userId` ---");
    await driver.executeQuery(
      `CREATE CONSTRAINT userId IF NOT EXISTS
      FOR (s:User)
      REQUIRE s.userId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );
    console.info("Constraint imposed");
    console.groupEnd();

  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
  } finally {
    console.info("Closing Driver...");
    driver?.close();
    console.groupEnd();
  }
  console.groupEnd();
}