import * as dotenv from "jsr:@std/dotenv";
import neo4j, { Driver } from "neo4j";
import { Grammar } from "../utils/types/language.ts";

await dotenv.load({ export: true });

export async function write(input: Grammar) {
  const URI = await Deno.env.get("NEO4J_URI") ?? "";
  const USER = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD = await Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await driver.verifyConnectivity();
  } catch (err) {
    /* @ts-ignore */
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  const ogSubject = input.subject.head;
  const ogObject = input.object?.head;
  const ogVerb = input.verb.head;

  // deno-lint-ignore prefer-const
  let subjectMain: string, objectMain: string, verbMain: string;

  console.log("=== Subject ===");
  await driver.executeQuery(
    `
    MERGE (subject:Person {name: $name})`,
    { name: ogSubject[0] },
    { database: "neo4j" },
  );
  subjectMain = ogSubject[0];
  console.log(`Created ${subjectMain}`);
  ogSubject.shift();
  console.log("Not Encoded:");
  for (const term of ogSubject) console.log(term);

  console.log("=== Object ===");
  await driver.executeQuery(
    `
    MERGE (object:Person {name: $name})`,
    { name: ogObject[0] },
    { database: "neo4j" },
  );
  objectMain = ogObject[0];
  console.log(`Created ${objectMain}`);
  ogObject.shift();
  console.log("Not Encoded:");
  for (const term of ogObject) console.log(term);

  console.log("=== Verb ===");
  const verbName = ogVerb[0];
  const query = `
      MATCH (subject:Person {name: $subject})
      MATCH (object:Person {name: $object})
      MERGE (subject)-[:\`${verbName}\`]->(object)
  `;

  await driver.executeQuery(
    query,
    { subject: subjectMain, object: objectMain },
    { database: "neo4j" },
  );

  verbMain = ogVerb[0];
  console.log(`Created ${verbMain}`);
  ogVerb.shift();

  console.log("=== Not Encoded ===");
  for (const term of ogVerb) console.log(term);

  console.log("Entry Complete");
  await driver.close();
}
