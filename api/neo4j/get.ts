import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4jCred.ts";

export async function getNouns() {
  let driver: Driver | null = null;
  let records;
  const nounSet: Set<string> = new Set();
  const nounArr: string[] = [];

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    const result = await driver.executeQuery(`
      MATCH ( p )
      RETURN p.name as name
      LIMIT 100
    `, {}, { database: "neo4j" });

    records = result.records;
    for (const record of records) {
      nounSet.add(record.get("name"));
    }

    nounSet.forEach((noun) => {
      nounArr.push(noun)
    });
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  }

  return nounArr;
}

export async function getVerbs() {
  let driver: Driver | null = null;
  let records;
  const verbSet: Set<string> = new Set();
  const verbArr: string[] = [];

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    const result = await driver.executeQuery(`
      MATCH ( p )-[ r ]->( q )
      RETURN type(r) as rType
      LIMIT 100
    `, {}, { database: "neo4j" });

    const records = result.records;
    for (const record of records) {
      verbSet.add(record.get("rType"));
    }

    verbSet.forEach((verb) => {
      verbArr.push(verb.replace("_", " ").toLowerCase());
    });
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  }

  return verbArr;
}