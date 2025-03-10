import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4j.ts";

// [ ] tdMd: I need to store Client.Atoms AND Server.Atoms
export async function findUserById(id:number, publicOnly: boolean = true):Promise<string[]> {
  console.group(`=== Running findUserById() ===`);
    console.log(`Received (id: ${id}, publicOnly: ${publicOnly})`);

    let driver: Driver | null = null, records, result;
    const statements:string[] = [];

    console.info(`Running try/catch`);
    try {
      driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

      console.info(`Selecting Query Type`);
      if (id && publicOnly) {
        console.info(`Query: Public Beacons for user #${id}`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user {id: $id})-[link {isPublic: true}]-()
          RETURN statement`,
          { id },
          {database: 'neo4j'}
        );
      } else if (id && !publicOnly) {
        console.info(`Query: All Beacons for user #${id}`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user {id: $id})-[link]-()
          RETURN statement`,
          { id },
          {database: 'neo4j'}
        );
      } else {
        console.info(`Query: All Public Beacons`);
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
      console.error(`DB Get Error: ${err}`);
    } finally {
      console.info(`Closing Driver`);
      await driver?.close();
      console.info(`Driver Closed`);
    }

    console.info(`==================`);
  console.groupEnd();

  return statements;
}

export async function findUserByName(name:string, publicOnly: boolean = true):Promise<string[]> {
  console.group(`=== Running findUserByName() ===`);
    console.log(`Received (name: ${name}, publicOnly: ${publicOnly})`);

    let driver: Driver | null = null, records, result;
    const statements:string[] = [];

    console.info(`Running try/catch`);
    try {
      driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

      console.info(`Selecting Query Type`);
      if (name == "Piglet") {
        console.info(`Test: Beacons for ${name}`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user {name: $name})-[link]-(thing)
          RETURN statement`,
          { name },
          {database: 'neo4j'}
        );
      } else if (name && publicOnly) {
        console.info(`Query: Public Beacons for user ${name}`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user {name: $name})-[link {isPublic: true}]-(thing)
          RETURN statement`,
          { name },
          {database: 'neo4j'}
        );
      } else if (name && !publicOnly) {
        console.info(`Query: All Beacons for user ${name}`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user {name: $name})-[link]-(thing)
          RETURN statement`,
          { name },
          {database: 'neo4j'}
        );
      } else {
        console.info(`Query: All Public Beacons`);
        result = await driver.executeQuery(
          `MATCH statement =
            (user)-[link {isPublic: true}]->(thing)
          RETURN statement
          LIMIT 25`,
          {},
          {database: 'neo4j'}
        );
      }
      records = result.records;

      for (const record of records) {
        console.log(record);
        statements.push(record.get("statement"));
        // const subject = record.get("user.name");
        // const verb = record.get("linkype");
        // const object = record.get("thing.name");

        // statements.push(`${subject} ${verb} ${object}`);
      }
    } catch (err) {
      console.error(`DB Get Error: ${err}`);
    } finally {
      console.info(`Closing Driver`);
      await driver?.close();
      console.info(`Driver Closed`);
    }

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
      const result = await driver.executeQuery(
        `MATCH
          statement = (p {name: $subject})-[r {isPublic: true}]->()
        RETURN statement`,
        { subject },
        { database: "neo4j" }
      );
      
      records = result.records;
    } else {
      const result = await driver.executeQuery(
        `MATCH (p)-[r]->(q)
        RETURN p, r, q
        LIMIT 100`,
        {},
        { database: "neo4j" }
      );
      records = result.records;
    }

    for (const record of records) {
      // const subject = record.get("statement.p.name");
      // const verb = record.get("statement.rType");
      // const object = record.get("statement.q.name");
      // statements.push(`${subject} ${verb} ${object}`);
      statements.push(record.get("statement.r"));
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