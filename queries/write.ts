import * as dotenv from "jsr:@std/dotenv";
import neo4j, { Driver } from "neo4j";
import { Grammar } from "../utils/types/language.ts";

await dotenv.load({ export: true });

export async function write(input:Grammar) {
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

  // Store original subject and object before shifting
  const ogSubject = input.subject.head;
  const ogObject = input.object?.head;
  const ogVerb = input.verb.head;

  let subjectMain:string;
  let objectMain:string;
  let verbMain:string;

  console.groupCollapsed("=== === Subject === ===");
    await driver.executeQuery( /* Subject */
      "MERGE (subject:Person {name: $ogSubject[0]})",
      { subject: ogSubject },
      { database: "neo4j" },
    );

    subjectMain = ogSubject[0];
    console.log(`Created ${subjectMain}`);
    ogSubject.shift();

    console.groupCollapsed("=== Not Encoded ===");
      for (const term of ogSubject) console.log(term);
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Object === ===");
    await driver.executeQuery( /* Object */
      "MERGE (object:Person {name: $ogObject[0]})",
      { object: ogObject },
      { database: "neo4j" },
    );

    objectMain = ogObject[0];
    console.log(`Created ${objectMain}`);
    ogObject.shift();

    console.groupCollapsed("=== Not Encoded ===");
      for (const term of ogObject) console.log(term);
    console.groupEnd();
  console.groupEnd();

  console.groupCollapsed("=== === Verb === ===");
    const query = `
        MATCH (subject:Person {name: $subject})
        MATCH (object:Person {name: $object})
        MERGE (subject)-[:\`${ogVerb[0]}\`]->(object)
    `;

    await driver.executeQuery(
      query,
      { subject: subjectMain, object: objectMain }, // Correct references
      { database: "neo4j" },
    );

    verbMain = ogVerb[0];
    console.log(`Created ${verbMain}`);
    ogVerb.shift();

    console.groupCollapsed("=== Not Encoded ===");
      for (const term of ogVerb) console.log(term);
    console.groupEnd();
  console.groupEnd();

  console.log("Entry Complete");

  await driver.close();
}