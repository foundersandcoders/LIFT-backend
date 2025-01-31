import neo4j, { Driver } from "neo4j";
import { creds as c } from "../utils/creds/neo4j.ts";

export async function getSubject(subject?: string) {
  let driver: Driver;
  let records;

  try {
    driver = neo4j.driver(
      c.URI,
      neo4j.auth.basic(c.USER, c.PASSWORD),
    );
    await driver.verifyConnectivity();

    if (subject) {
      // Use parameterized query with $subject
      const result = await driver.executeQuery(
        `MATCH (p:Person {name: $subject})-[r]->(q) RETURN p, r, q`,
        { subject }
      );
      records = result.records;
    } else {
      const result = await driver.executeQuery(
        `MATCH (n) RETURN n LIMIT 25`
      );
      records = result.records;
    }

    console.groupCollapsed(`=== Subject Search ===`);
      console.log(`Subject: ${subject ? subject : "All"}"`);
      console.log(`Results: ${records?.length || 0}`);
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    if (driver) await driver.close();
  }

  return records;
}