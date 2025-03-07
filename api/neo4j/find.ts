import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4j.ts";

export async function findUser(
  id:number,
  publicOnly: boolean = true
):Promise<string[]> {
  console.group(`=== findUser() ===`);
    let driver: Driver | null = null, records, result;
    const statements:string[] = [];

    try {
      driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

      if (id && publicOnly) {
        result = await driver.executeQuery(
          `MATCH statement =
            (user {id: $id})-[link {isPublic: true}]-()
          RETURN statement`,
          { id },
          {database: 'neo4j'}
        );
      } else if (id && !publicOnly) {
        result = await driver.executeQuery(
          `MATCH statement =
            (user {id: $id})-[link]-()
          RETURN statement`,
          { id },
          {database: 'neo4j'}
        );
      } else {
        result = await driver.executeQuery(
          `MATCH statement =
            (p)-[r {isPublic: true}]->(q)
          RETURN statement
          LIMIT 25`,
          {},
          {database: 'neo4j'}
        );
      }
      records = result.records;

      for (const record of records) {
        const subject = record.get("p.name");
        const verb = record.get("rType");
        const object = record.get("q.name");

        statements.push(`${subject} ${verb} ${object}`);
      }
    } catch (err) {
      console.error("Error in get function:", err);
    } finally { await driver?.close() }

    console.info(`==================`);
  console.groupEnd();

  return statements;
}

export async function findSubject(subject:string):Promise<string[]> {
  console.log(`Subject: ${subject}`);
  let driver: Driver | null = null;
  let records;
  const statements:string[] = [];

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    if (subject) {
      const result = await driver.executeQuery(`
        MATCH (p {name: $subject})-[r {isPublic: true}]->(q)
        RETURN p.name, type(r) as rType, q.name
      `, { subject }, { database: "neo4j" });
      
      records = result.records;
    } else {
      const result = await driver.executeQuery(`
        MATCH (p)-[r]->(q)
        RETURN p, r, q
        LIMIT 100
      `, {}, { database: "neo4j" });
      records = result.records;
    }

    for (const record of records) {
      const subject = record.get("p.name");
      const verb = record.get("rType");
      const object = record.get("q.name");
      statements.push(`${subject} ${verb} ${object}`);
    }
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    if (driver) await driver.close();
  }

  return statements;
}

export async function findObject(object:string):Promise<string[]> {
  let driver: Driver | null = null;
  let records;
  const statements:string[] = [];

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(`
      MATCH (p)-[r {isPublic: true}]->(q {name: $object})
      RETURN p.name, type(r) as rType, q.name
    `, { object }, {database: 'neo4j'});
    records = result.records;

    for (const record of records) {
      const subject = record.get("p.name");
      const verb = record.get("rType");
      const object = record.get("q.name");
      statements.push(`${subject} ${verb} ${object}`);
    }
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  }

  return statements;
}

export async function findVerb(relationship:string):Promise<string[]>{
  let driver: Driver | null = null;
  let records;
  const statements:string[] = [];
  const clean = relationship.replace(/`/g, '``');

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    const result = await driver.executeQuery(`
      MATCH (p)-[r:` + clean + `{isPublic: true}]->(q)
      RETURN p.name, type(r) as rType, q.name
    `, {}, {database: 'neo4j'});
    records = result.records;

    for (const record of records) {
      const subject = record.get("p.name");
      const verb = record.get("rType");
      const object = record.get("q.name");
      statements.push(`${subject} ${verb} ${object}`);
    }
    
  } catch (err) {
    console.error("Error in get function:", err);
  } finally {
    await driver?.close();
  }

  return statements;
}