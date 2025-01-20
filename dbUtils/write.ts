import * as dotenv from "jsr:@std/dotenv";
await dotenv.load({export: true});

import neo4j, { Driver } from "neo4j";

interface Input{
  s: string[],
  o: string[],
  v: string[],
  a: string[]
}

export async function write(
  s:Input["s"],
  o:Input["o"],
  v:Input["v"],
  a:Input["a"]
) {
  const URI = await Deno.env.get("NEO4J_URI") ?? "";
  const USER = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD = await Deno.env.get("NEO4J_PASSWORD") ?? "";
  
  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    await driver.verifyConnectivity()
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return
  }

  console.groupCollapsed("=== === Subject === ===");
    await driver.executeQuery( /* Subject */
      'MERGE (subject:Person {name: $subject[0]})',
      { subject: s },
      { database: 'neo4j' }
    );

    console.log(`Created ${s[0]}`);
    s.shift();

    console.groupCollapsed("=== Not Encoded ===")
      for (const term of s) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Object === ===");
    await driver.executeQuery( /* Object */
      'MERGE (object:Person {name: $object[0]})',
      { object: o },
      { database: 'neo4j' }
    );

    console.log(`Created ${o[0]}`);    
    o.shift();

    console.groupCollapsed("=== Not Encoded ===")
      for (const term of o) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Verb === ===");
    // /* Verb */
      // await driver.executeQuery(
      //   `MATCH (subject:Person {name: $subject[0]})
      //   MATCH (object:Person {name: $object[0]})
      //   MERGE (s)-[:WORKS_FOR]->(o)`,
      //   { subject: s },
      //   { object: o },
      //   { verb: v },
      //   { database: 'neo4j' }
      // )

    const relationshipName = v[0];
    const query = `
      MATCH (subject:Person {name: $subject[0]})
      MATCH (object:Person {name: $object[0]})
      MERGE (subject)-[:\`${relationshipName}\`]->(object)
    `;
    await driver.executeQuery(
      query,
      { subject: s, object: o },  // your parameter object
      { database: 'neo4j' }
    );

    console.log(`Created ${v[0]}`);
    v.shift();

    console.groupCollapsed("=== Not Encoded ===")
      for (const term of v) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Additional === ===");
    console.groupCollapsed("=== Not Encoded ===")
      for (const term of a) { console.log(term) };
    console.groupEnd();
  console.groupEnd();

  console.log("Entry Complete")

  await driver.close();
};

write(
  ["pig", "small"],
  ["idea", "ambitious"],
  ["realise", "attempts to"],
  ["regularly"]
);

write(
  ["Alex", "Galician"],
  ["Jason", "???"],
  ["tolerate"],
  [""]
);