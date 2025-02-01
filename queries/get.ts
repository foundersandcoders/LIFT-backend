import neo4j, { Driver } from "neo4j";
import { creds as c } from "../utils/creds/neo4j.ts";

export async function getNouns() {
  let driver: Driver, records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(
      `MATCH (p:Person)
      RETURN p
      LIMIT 25`
    );

    records = result.records;

    console.groupCollapsed(`=== Unfiltered Search ===`);
      console.log(`Subject: "All People"`);
      console.log(`Results: ${records?.length || 0}`);
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally { await driver.close() }

  return records;
}

export async function getSubject(subject: string) {
  let driver: Driver, records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    if (subject) {
      const result = await driver.executeQuery(
        `MATCH (p:Person {name: $subject})-[r]->(q)
        RETURN p, r, q`,
        { subject }
      );
      records = result.records;
    } else {
      const result = await driver.executeQuery(
        `MATCH (p)-[r]->(q)
        RETURN p, r, q
        LIMIT 25`
      );
      records = result.records;
    }

    console.groupCollapsed(`=== Subject Search ===`);
      console.log(`Subject: ${subject}"`);
      console.log(`Results: ${records?.length || 0}`);
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    if (driver) await driver.close();
  }

  return records;
}

export async function getObject(object: string) {
  let driver: Driver, records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(
      `MATCH (p)-[r]->(q:Person {name: $object})
      RETURN p, r, q`,
      { object }
    );

    records = result.records;

    console.groupCollapsed(`=== Object Search ===`);
      console.log(`Subject: ${object}"`);
      console.log(`Results: ${records?.length || 0}`);
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally { await driver.close() }

  return records;
}