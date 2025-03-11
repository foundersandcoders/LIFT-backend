import * as dotenv from "dotenv";
import neo4j, { Driver } from "neo4j";
import type { Entry as ServerEntry } from "types/outputTypes.ts";
import { creds as c } from "utils/creds/neo4j.ts";

dotenv.load({ export: true });

export async function writeBeacon(entry: ServerEntry)/* : Promise<ServerEntry> */ {
  console.groupCollapsed(`=== writeBeacon(${entry.input}) ===`);
  let driver: Driver;
  let newEntry/* :ServerEntry */;
    
  const subjectTerms:string[] = entry.atoms.server.subject.head;
  const objectTerms:string[] = entry.atoms.server.object.head;
  const verbTerms:string[] = entry.atoms.server.verb.head;

  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();

    // =1 Node Queries
    /* Subject Query */ await driver.executeQuery(
      // [ ] tdMd: Use authentication ID for matching subject 
      `MERGE (subject {name: $name})`,
      { name: subjectTerms[0] },
      { database: "neo4j" },
    );
  
    /* Object Query */ await driver.executeQuery(
      `MERGE (object:Person {name: $name})`,
      { name: objectTerms[0] },
      { database: "neo4j" },
    );
  
    // =1 Edge Queries
    /* Verb Props */
    const verbProps = {
      id: entry.id ?? "no id",
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
    
    /* Verb Query Builder */
    const query =`
      MATCH (s {name: $subject})
      MATCH (o {name: $object})
      MERGE (s)-[v :\`${verbTerms[0]} \`]->(o)
      SET v = $verbProps
      RETURN v
    `;

    /* Verb Query */
    const result = await driver.executeQuery(
      query,
      {
        subject: subjectTerms[0],
        object: objectTerms[0],
        verbProps: {
          id: verbProps.id,
          presetId: verbProps.presetId,
          input: verbProps.input,
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
      },
      { database: "neo4j" },
    );
  
    // =1 Build New Entry
    newEntry = {
      statement: result.records[0].get("v"),
      /* ...entry, */
      /* id: result.records[0].get("id") */
    };

  } catch (err) {
    console.warn(`Connection error`);
    console.warn(err);
    console.warn(err instanceof Error ? err.cause : "Cause Unknown");
    
    console.groupEnd();

    return {...entry, error: { isError: true, errorCause: "Connection Error" }};
  } finally {
    await driver?.close();
  }

  console.groupEnd();

  return newEntry;
}

export async function writeBeacons(entries: ServerEntry[]) {
  console.groupCollapsed(`=== writeBeacons(${entries.length}) ===`);
  let i = 0;

  for (const entry of entries) {
    console.groupCollapsed(`=== ${i}: ${entry.input} ===`);
    await writeBeacon(entry);
    i++;
    console.groupEnd();
  };
  console.groupEnd();
}
