import neo4j, { Driver } from "neo4j";

const people = [
  { name: "Alex",
    worksFor: ["Dan"],
    worksWith: ["Jason"],
    species: "Human",
    enjoys: []
  },
  { name: "Alphonso",
    worksFor: ["Biela", "Islington Council"],
    worksWith: ["Nich"],
    species: "Human",
    enjoys: []
  },
  { name: "Anna",
    worksFor: ["Dan"],
    worksWith: ["Jess"],
    species: "Human",
    enjoys: []
  },
  { name: "Biela",
    worksFor: [],
    worksWith: ["Jess"],
    species: "Dog",
    enjoys: []
  },
  { name: "Dan",
    worksFor: [],
    worksWith: [],
    species: "Human",
    enjoys: []
  },
  { name: "Harriet",
    worksFor: [],
    worksWith: [],
    species: "Human",
    enjoys: ["blanket", "treat"]
  },
  { name: "Jack",
    worksFor: ["Dan"],
    worksWith: ["Max"],
    species: "Human",
    enjoys: []
  },
  { name: "Jason",
    worksFor: ["Dan"],
    worksWith: ["Alex"],
    species: "Goblin",
    enjoys: []
  },
  { name: "Jess",
    worksFor: ["Dan"],
    worksWith: ["Biela", "Anna"],
    species: "Human",
    enjoys: []
  },
  { name: "Max",
    worksFor: ["Dan"],
    worksWith: ["Jack"],
    species: "Human",
    enjoys: []
  },
  { name: "Nich",
    worksFor: ["Dan"],
    worksWith: [],
    species: "Human",
    enjoys: []
  },
  { name: "Shaughn",
    worksFor: ["Dan"],
    worksWith: [],
    species: "Human",
    enjoys: []
  },
]

const items = [
  { name: "blanket" },
  { name: "treat" }
]

const testSentence = [
  "Harriet enjoys blankets",
  "Harriet is partial to a treat"
]

export async function query() {
  const URI:string = await Deno.env.get("NEO4J_URI") ?? "";
  const USER:string = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD:string = await Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return
  }

  for(const person of people) {
    await driver.executeQuery(
      'MERGE (p:Person {name: $person.name})',
      { person: person },
      { database: 'neo4j' }
    )
  }

  for(const item of items) {
    await driver.executeQuery(
      'MERGE (i:Item {name: $item.name})',
      { item: item },
      { database: 'neo4j' }
    )
  }

  for(const person of people) {
    if(person.worksFor != undefined) {
      await driver.executeQuery(`
        MATCH (p:Person {name: $person.name})
        UNWIND $person.worksFor AS bossName
        MATCH (boss:Person {name: bossName})
        MERGE (p)-[:WORKS_FOR]->(boss)
        `, { person: person },
        { database: 'neo4j' }
      )
    }

    if(person.worksWith != undefined) {
      await driver.executeQuery(`
        MATCH (p:Person {name: $person.name})
        UNWIND $person.worksFor AS colleagueName
        MATCH (colleague:Person {name: colleagueName})
        MERGE (p)-[:WORKS_WITH]->(colleague)
        `, { person: person },
        { database: 'neo4j' }
      )
    }

    if(person.enjoys != undefined) {
      await driver.executeQuery(`
        MATCH (p:Person {name: $person.name})
        UNWIND $person.enjoys AS funThing
        MATCH (i:Item {name: funThing})
        MERGE (p)-[:ENJOYS]->(i)
        `, { person: person },
        { database: 'neo4j' }
      )
    }
  }
  
  result = await driver.executeQuery(`
    MATCH (p:Person)-[:WORKS_FOR]-(boss:Person)
    WHERE boss.species = $species
    RETURN boss
    `, { species: "Dog" },
    { database: 'neo4j' }
  )

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
};

query();