import neo4j, { Driver } from "neo4j";
import { creds } from "../../utils/creds/neo4j.ts";

const data = JSON.parse(
  await Deno.readTextFile("./data/seeds/facSeed.json"),
);

export async function seed() {
  let driver: Driver;

  try {
    driver = neo4j.driver(
      creds.URI,
      neo4j.auth.basic(creds.USER, creds.PASSWORD),
    );
    await driver.verifyConnectivity();
  } catch (err) {
    /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  for (const person of data.people) {
    await driver.executeQuery(
      "MERGE (p:Person {name: $person.name})",
      { person: person },
      { database: "neo4j" },
    );
  }

  for (const item of data.items) {
    await driver.executeQuery(
      "MERGE (i:Item {name: $item.name})",
      { item: item },
      { database: "neo4j" },
    );
  }

  for (const person of data.people) {
    if (person.worksFor != undefined) {
      await driver.executeQuery(
        `
        MATCH (p:Person {name: $person.name})
        UNWIND $person.worksFor AS bossName
        MATCH (boss:Person {name: bossName})
        MERGE (p)-[:WORKS_FOR]->(boss)
        `,
        { person: person },
        { database: "neo4j" },
      );
    }

    if (person.worksWith != undefined) {
      await driver.executeQuery(
        `
        MATCH (p:Person {name: $person.name})
        UNWIND $person.worksFor AS colleagueName
        MATCH (colleague:Person {name: colleagueName})
        MERGE (p)-[:WORKS_WITH]->(colleague)
        `,
        { person: person },
        { database: "neo4j" },
      );
    }

    if (person.enjoys != undefined) {
      await driver.executeQuery(
        `
        MATCH (p:Person {name: $person.name})
        UNWIND $person.enjoys AS funThing
        MATCH (i:Item {name: funThing})
        MERGE (p)-[:ENJOYS]->(i)
        `,
        { person: person },
        { database: "neo4j" },
      );
    }
  }

  const result = await driver.executeQuery(
    `MATCH (p:Person)-[:WORKS_FOR]-(boss:Person)
    WHERE boss.species = $species
    RETURN boss`,
    { species: "Dog" },
    { database: "neo4j" },
  );

  /*
    // Loop through results and do something with them
    for(let person of result.records) {
      // `person.friend` is an object of type `Node`
      console.log(person.get('friend'))
    }

    // Summary information
    console.log(
      `The query \`${result.summary.query.text}\` ` +
      `returned ${result.records.length} records ` +
      `in ${result.summary.resultAvailableAfter} ms.`
    )
  */

  await driver.close();
}

await seed();
