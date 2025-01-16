import neo4j from "neo4j";

(async () => {
  const URI:string = Deno.env.get("NEO4J_URI") ?? "";
  const USER:string = Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD:string = Deno.env.get("NEO4J_PASSWORD") ?? "";
  let driver, result;

  const people = [
    { name: "Alex",
      worksFor: ["Dan"],
      worksWith: ["Jason"],
      species: "Human"
    },
    { name: "Alphonso",
      worksFor: ["Biela", "Islington Council"],
      worksWith: ["Nich"],
      species: "Human"
    },
    { name: "Anna",
      worksFor: ["Dan"],
      worksWith: ["Jess"],
      species: "Human"
    },
    { name: "Biela",
      worksFor: [],
      worksWith: ["Jess"],
      species: "Dog"
    },
    { name: "Dan",
      worksFor: [],
      worksWith: [],
      species: "Human"
    },
    { name: "Jack",
      worksFor: ["Dan"],
      worksWith: ["Max"],
      species: "Human"
    },
    { name: "Jason",
      worksFor: ["Dan"],
      worksWith: ["Alex"],
      species: "Goblin"
    },
    { name: "Jess",
      worksFor: ["Dan"],
      worksWith: ["Biela", "Anna"],
      species: "Human"
    },
    { name: "Max",
      worksFor: ["Dan"],
      worksWith: ["Jack"],
      species: "Human"
    },
    { name: "Nich",
      worksFor: ["Dan"],
      worksWith: [],
      species: "Human"
    },
    { name: "Shaughn",
      worksFor: ["Dan"],
      worksWith: [],
      species: "Human"
    },
  ]

  try {
    driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
    await driver.close()
    return
  }

  for(const person of people) {
    await driver.executeQuery(
      'MERGE (p:Person {name: $person.name})',
      { person: person },
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
  ) */

  await driver.close()
})();