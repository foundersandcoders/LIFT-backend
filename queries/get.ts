import neo4j, { Driver } from "neo4j";
import { creds as c } from "../utils/creds/neo4j.ts";

export async function getNouns() {
  let driver: Driver | null = null;
  let records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(
      `MATCH (p:Person)
      RETURN p.name
      LIMIT 25`,
    );

    records = result.records;

    console.groupCollapsed(`=== Unfiltered Search ===`);
    console.log(`Subject: "All People"`);
    console.log(`Results: ${records?.length || 0}`);
    for (const record of records) {
      console.log(record.get("p.name"));
    }
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  }

  return records;
}

export async function getSubject(subject: string) {
  let driver: Driver | null = null;
  let records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    if (subject) {
      const result = await driver.executeQuery(
        `MATCH (p:Person {name: $subject})-[r]->(q)
        RETURN p.name, type(r) as rType, q.name`,
        { subject },
      );
      records = result.records;
    } else {
      const result = await driver.executeQuery(
        `MATCH (p)-[r]->(q)
        RETURN p, r, q
        LIMIT 25`,
      );
      records = result.records;
    }

    console.groupCollapsed(`=== Subject Search ===`);
    console.log(`Subject: ${subject}"`);
    console.log(`Results: ${records?.length || 0}`);
    for (const record of records) {
      console.log(
        record.get("p.name"),
        record.get("rType"),
        record.get("q.name"),
      );
    }
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    if (driver) await driver.close();
  }

  return records;
}

export async function getObject(object: string) {
  let driver: Driver | null = null;
  let records;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(
      `MATCH (p)-[r]->(q:Person {name: $object})
      RETURN p.name, type(r) as rType, q.name`,
      { object },
    );

    records = result.records;

    console.groupCollapsed(`=== Object Search ===`);
    console.log(`Subject: ${object}`);
    console.log(`Results: ${records?.length || 0}`);
    for (const record of records) {
      console.log(
        record.get("p.name"),
        record.get("rType"),
        record.get("q.name"),
      );
    }
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  } // ✅ If driver is null, it won’t call close() }

  return records;
}

export async function getVerbs() {
  let driver: Driver | null = null;
  let records;
  const verbSet: Set<string> = new Set();
  const verbArr: string[] = [];

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(
      `MATCH (p)-[r]->(q)
      RETURN type(r) as rType
      LIMIT 25`,
    );

    const records = result.records;

    for (const record of records) {
      verbSet.add(record.get("rType"));
    }

    verbSet.forEach((verb) => {
      verbArr.push(
        verb.replace("_", " ").toLowerCase(),
      );
    });

    console.groupCollapsed(`=== Unfiltered Search ===`);
    console.log(`Subject: "All Verbs"`);
    console.log(`Results: ${verbArr.length}`);
    let listNum = 0;
    verbArr.forEach((verb) => {
      listNum++;
      console.log(`${listNum}. ${verb}`);
    });
    console.groupEnd();
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await await driver?.close();
  } // ✅ If driver is null, it won’t call close() }

  return verbArr;
}

// getNouns();
// getVerbs();
