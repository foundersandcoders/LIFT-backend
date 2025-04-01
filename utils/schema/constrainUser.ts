import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4jCred.ts";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

export async function constrainUser() {
  if (logger) { console.info(`| ":User" Node Props`); }
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

    if (logger) { console.info(`|- authId is unique`); }
  } catch (err) {
    if (logger) { console.warn(`| Connection error`); }
    if (logger) { console.warn(`| ${err}`); }
  } finally {
    driver?.close()
  }
}
