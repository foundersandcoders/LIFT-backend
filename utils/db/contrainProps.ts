import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4j.ts";

export async function constrainProps() {
  console.groupCollapsed(`====== FUNCTION constrainProps() ======`);

  let driver: Driver|null = null;
  
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
    
    await driver.executeQuery(
      `CREATE CONSTRAINT beacon_id IF NOT EXISTS
      FOR ()-[v:VERB]-() REQUIRE v.beaconId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );
    console.info(`Constrained: [:VERB { beaconId }]`);
    
    await driver.executeQuery(
      `CREATE CONSTRAINT userId IF NOT EXISTS
      FOR (s:User) REQUIRE s.userId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );
    console.info(`Constrained: (:VERB { userId })`);

    await driver.executeQuery(
      `SHOW KEY CONSTRAINTS`,
      {},
      { database: "neo4j" }
    );
    
  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
  } finally { driver?.close() }

  console.groupEnd();
}
