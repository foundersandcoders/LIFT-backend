import { Application } from "jsr:@oak/oak/application";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as dotenv from "jsr:@std/dotenv";
import router from "./routes/main.ts";
import neo4j from "neo4j";

await dotenv.load({export: true});

const app = new Application();
const port: number = 8080;

app.use( oakCors({ 
  origin: "http://localhost:8000" 
}));

(async () => {
  const URI:string = Deno.env.get("NEO4J_URI") ?? "";
  const USER:string = Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD:string = Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver, result;

  const people = [
    { 
      name: "Alex",
      worksFor: ["Dan"],
      worksWith: ["Jason"],
      species: "Human"
    },
    { 
      name: "Alphonso",
      worksFor: ["Biela", "Islington Council"],
      worksWith: ["Nich"],
      species: "Human"
    },
    { 
      name: "Anna",
      worksFor: ["Dan"],
      worksWith: ["Jess"],
      species: "Human"
    },
    { 
      name: "Biela",
      worksFor: [],
      worksWith: ["Jess"],
      species: "Dog"
    },
    { 
      name: "Dan",
      worksFor: [],
      worksWith: [],
      species: "Human"
    },
    { 
      name: "Jack",
      worksFor: ["Dan"],
      worksWith: ["Max"],
      species: "Human"
    },
    { 
      name: "Jason",
      worksFor: ["Dan"],
      worksWith: ["Alex"],
      species: "Goblin"
    },
    { 
      name: "Jess",
      worksFor: ["Dan"],
      worksWith: ["Biela", "Anna"],
      species: "Human"
    },
    { 
      name: "Max",
      worksFor: ["Dan"],
      worksWith: ["Jack"],
      species: "Human"
    },
    { 
      name: "Nich",
      worksFor: ["Dan"],
      worksWith: [],
      species: "Human"
    },
    { 
      name: "Shaughn",
      worksFor: ["Dan"],
      worksWith: [],
      species: "Human"
    },
  ]

  try {
    driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
    console.log("DB On")
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
        UNWIND $person.worksWith AS colleagueName
        MATCH (colleague:Person {name: colleagueName})
        MERGE (p)-[:WORKS_WITH]->(colleague)
        `, { person: person },
        { database: 'neo4j' }
      )
    }
  }

  result = await driver.executeQuery(`
    MATCH (p:Person)-[r:WORKS_WITH]-(c:Person)
    RETURN p, r, c
    `,
    { database: 'neo4j' }
  )

  for(const person of result.records) {
    console.log(person.get('p', 'r', 'c'))
  }

  // Summary information
  console.log(
    `The query \`${result.summary.query.text}\` ` +
    `returned ${result.records.length} records ` +
    `in ${result.summary.resultAvailableAfter} ms.`
  )

  await driver.close()
})();


app.use(router.routes());
app.use(router.allowedMethods());

app.listen({port});
console.log(`Server is running on port ${port}`);