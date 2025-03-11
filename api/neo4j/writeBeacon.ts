import * as dotenv from "dotenv";
import neo4j, { Driver } from "neo4j";
import type * as Server from "types/outputTypes.ts";
import { creds as c } from "utils/creds/neo4j.ts";

dotenv.load({ export: true });

export async function writeBeacon(
  entry: Server.Entry
)/* : Promise<Server.Entry> */ {
  console.group(`writeBeacon(${entry.input})`);
  let driver: Driver;
  let newEntry/* :Server.Entry */;
    
  const subjectTerms:string[] = entry.atoms.server.subject.head;
  const objectTerms:string[] = entry.atoms.server.object.head;
  const verbTerms:string[] = entry.atoms.server.verb.head;

  try {
    // tdLo: use creds
    driver = neo4j.driver(
      c.URI,
      neo4j.auth.basic(
        c.USER,
        c.PASSWORD
      )
    );
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
      input: entry.input,
      isPublic: entry.isPublic,
      category: entry.category,
      atoms: {},
      presetId: entry.presetId,
      isResolved: entry.isResolved,
      actions: []
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
          input: verbProps.input,
          isPublic: verbProps.isPublic,
          category: verbProps.category,
          presetId: verbProps.presetId,
          isResolved: verbProps.isResolved,
          actions: verbProps.actions
        },
        atoms: {},
        atomsClient: {},
        atomsServer: {}
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
