import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/auth/neo4jCred.ts";

export async function constrainUser() {
  console.groupCollapsed(`|=== constrainUser() ===`);
  let driver: Driver | null = null;
  
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
    
    await driver.executeQuery(
      `CREATE CONSTRAINT authId IF NOT EXISTS
      FOR (s:User) REQUIRE s.authId IS UNIQUE`,
      {},
      { database: "neo4j" }
    );

    console.info(`|- User { authId }`);
  } catch (err) {
    console.warn(`| Connection error`);
    console.warn(`| ${err}`);
  } finally {
    driver?.close()
  }
  console.groupEnd();
}
