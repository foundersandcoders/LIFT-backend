import * as dotenv from "dotenv";
import neo4j, { Driver } from "neo4j";
import type * as Server from "types/language/server.ts";

dotenv.load({ export: true });

// TODO: Use authentication ID for matching subject 
export async function writeBeacon(entry:Server.Entry): Promise<Server.Entry> {
  const URI = Deno.env.get("NEO4J_URI") ?? "";
  const USER = Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD = Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await driver.getServerInfo();
  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
    console.warn(err instanceof Error ? err.cause : "Cause Unknown");
    return {...entry, error: { isError: true, errorCause: "Connection Error" }};
  }

  // note: Subject 
  const subjectTerms:string[] = entry.atoms.subject.head;
  await driver.executeQuery(
    `MERGE (subject {name: $name})`,
    { name: subjectTerms[0] },
    { database: "neo4j" },
  );

  // note: Object 
  const objectTerms:string[] = entry.atoms.object.head;
  await driver.executeQuery(
    `MERGE (object:Person {name: $name})`,
    { name: objectTerms[0] },
    { database: "neo4j" },
  );

  // note: Build Query
  const verbTerms:string[] = entry.atoms.verb.head;
  const verbProps = `{
    input: ${entry.input},
    isPublic: ${entry.isPublic},
    category: ${entry.category},
    presetId: ${entry.presetId},
    isResolved: ${entry.isResolved},
    actions: []
  }`;

  // note: Verb
  const query = `
    MATCH (subject {name: $subject})
    MATCH (object {name: $object})
    MERGE (subject)-[verb :\`${verbTerms[0]} ${verbProps}\`]->(object)
    RETURN verb.id as id
  `;

  const result = await driver.executeQuery(
    query,
    { subject: subjectTerms[0], object: objectTerms[0] },
    { database: "neo4j" },
  );

  // note: Build New Entry
  const newEntry:Server.Entry = {
    ...entry,
    id: result.records[0].get("id")
  };

  await driver?.close();
  return newEntry;
}
