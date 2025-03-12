import * as dotenv from "dotenv";
import neo4j, { Driver } from "neo4j";
import type { Lantern, Beacon, Ash } from "types/beaconTypes.ts";
import { creds as c } from "utils/creds/neo4j.ts";

dotenv.load({ export: true });

export async function writeBeacon(entry:Lantern):Promise<Beacon|Ash> {
  console.groupCollapsed(`====== FUNCTION writeBeacon(${entry.input}) ======`);
  let driver: Driver|null = null;
  let newEntry: Beacon|Ash;
  
  try {
    console.groupCollapsed(`--- Neo4j ---`);
    console.info("Initialising Driver...");
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));

    console.info("Connecting to Aura...");
    await driver.getServerInfo();

    console.info("Building Query Params...");
    const verbProps = {
      dbId: entry.id ?? "no id",
      presetId: entry.presetId ?? "no preset id",
      input: entry.input,
      atoms: {
        client: {
          subject: entry.atoms.client.subject,
          verb: entry.atoms.client.verb,
          object: entry.atoms.client.object,
          adverbial: entry.atoms.client.adverbial
        },
        server: {
          subject: entry.atoms.server.subject,
          verb: entry.atoms.server.verb,
          object: entry.atoms.server.object,
          adverbial: entry.atoms.server.adverbial
        }
      },
      isPublic: entry.isPublic ?? false,
      isArchived: entry.isArchived ?? false,
      isSnoozed: entry.isSnoozed ?? false,
      category: entry.category ?? "",
      actions: entry.actions ?? []
    };

    console.info("Executing Cypher Query...");
    const result = await driver.executeQuery(
      `MERGE (s:User {name:$sName})-[v:VERB {input: $vInput}]->(o:Concept {name:$oName})
      SET v = $vProps
      RETURN s, v, o`,
      {
        sName: entry.atoms.server.subject.head,
        vInput: verbProps.input,
        vProps: {
          id: verbProps.id,
          presetId: verbProps.presetId,
          input: verbProps.input,
          name: verbProps.atoms.server.verb.head,
          atomsClientSubject: verbProps.atoms.client.subject,
          atomsClientVerb: verbProps.atoms.client.verb,
          atomsClientObject: verbProps.atoms.client.object,
          atomsClientAdverbial: verbProps.atoms.client.adverbial,
          atomsServerSubjectHead: verbProps.atoms.server.subject.head,
          atomsServerSubjectArticle: verbProps.atoms.server.subject.article,
          atomsServerSubjectQuantity: verbProps.atoms.server.subject.quantity,
          atomsServerSubjectDescriptors: verbProps.atoms.server.subject.descriptors,
          atomsServerSubjectPhrase: verbProps.atoms.server.subject.phrase,
          atomsServerVerbHead: verbProps.atoms.server.verb.head,
          atomsServerVerbPhrase: verbProps.atoms.server.verb.phrase,
          atomsServerVerbDescriptors: verbProps.atoms.server.verb.descriptors,
          atomsServerObjectHead: verbProps.atoms.server.object.head,
          atomsServerObjectArticle: verbProps.atoms.server.object.article,
          atomsServerObjectQuantity: verbProps.atoms.server.object.quantity,
          atomsServerObjectDescriptors: verbProps.atoms.server.object.descriptors,
          atomsServerObjectPhrase: verbProps.atoms.server.object.phrase,
          isPublic: verbProps.isPublic,
          isArchived: verbProps.isArchived,
          isSnoozed: verbProps.isSnoozed,
          category: verbProps.category,
          actions: verbProps.actions
        },
        oName: entry.atoms.server.object.head
      }, { database: "neo4j" }
    );

    console.info(`Assembling Return Object...`);
    newEntry = {
      // ...entry,
      // id: result.records[0].get("id")
      subject: result.records[0].get("s"),
      verb: result.records[0].get("v"),
      object: result.records[0].get("o")
    };
  } catch (err) {
    console.warn(`Connection error`);
    // console.warn(err);
    const cause = err instanceof Error ? err.cause : "Cause Unknown";
    console.warn(cause);

    newEntry = {
      ...entry,
      errorLogs: [{ isError: true, errorCause: cause }]
    };
    
    return newEntry as Ash;
  } finally {
    console.info("Closing Driver...");
    driver?.close();
    console.groupEnd();
  }

  console.groupCollapsed(`--- Return ---`);
  console.log(newEntry.shards.subject);
  console.log(newEntry.shards.verb);
  console.log(newEntry.shards.object);
  console.groupEnd();
  
  return newEntry;
}

export async function writeBeacons(entries:Lantern[]) {
  console.groupCollapsed(`====== FUNCTION writeBeacons(${entries.length} entries) ======`);
  let i = 0;
  for (const entry of entries) {
    console.log(`--- Passing Beacon ${i}: "${entry.input}" ---`);
    await writeBeacon(entry);
    i++;
  };
  console.groupEnd();
}
