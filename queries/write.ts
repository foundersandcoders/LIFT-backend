import * as dotenv from "jsr:@std/dotenv";
import neo4j, { Driver } from "neo4j";

await dotenv.load({ export: true });

interface Input {
  s: string[];
  o: string[];
  v: string[];
  a: string[];
}

export async function write(
  s: Input["s"],
  o: Input["o"],
  v: Input["v"],
  a: Input["a"],
) {
  const URI = await Deno.env.get("NEO4J_URI") ?? "";
  const USER = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD = await Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await driver.verifyConnectivity();
  } catch (err) { /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  // Store original subject and object before shifting
  const ogSubject = s[0];
  const ogObject = o[0];
  const relationshipName = v[0];

  console.groupCollapsed("=== === Subject === ===");
  await driver.executeQuery(
    /* Subject */
    "MERGE (subject:Person {name: $subject[0]})",
    { subject: s },
    { database: "neo4j" },
  );

  console.log(`Created ${s[0]}`);
  s.shift();

  console.groupCollapsed("=== Not Encoded ===");
  for (const term of s) { console.log(term) };
  console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Object === ===");
  await driver.executeQuery(
    /* Object */
    "MERGE (object:Person {name: $object[0]})",
    { object: o },
    { database: "neo4j" },
  );

  console.log(`Created ${o[0]}`);
  o.shift();

  console.groupCollapsed("=== Not Encoded ===");
  for (const term of o) { console.log(term) };
  console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Verb === ===");
  const query = `
      MATCH (subject:Person {name: $subject})
      MATCH (object:Person {name: $object})
      MERGE (subject)-[:\`${relationshipName}\`]->(object)
  `;
  
  await driver.executeQuery(
    query,
    { subject: ogSubject, object: ogObject }, // Correct references
    { database: "neo4j" }
  );

  console.log(`Created ${v[0]}`);
  v.shift();

  console.groupCollapsed("=== Not Encoded ===");
  for (const term of v) { console.log(term) };
  console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Additional === ===");
  console.groupCollapsed("=== Not Encoded ===");
  for (const term of a) { console.log(term) };
  console.groupEnd();
  console.groupEnd();

  console.log("Entry Complete");

  await driver.close();
}

write(
  ["pig", "small"],
  ["idea", "ambitious"],
  ["steal", "attempts to"],
  ["regularly"],
);

write(
  ["Alex", "Galician"],
  ["Jason", "???"],
  ["ignore"],
  [""],
);
