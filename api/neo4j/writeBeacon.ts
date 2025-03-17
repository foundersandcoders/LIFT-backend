import * as dotenv from "dotenv";
import neo4j, { Driver } from "neo4j";
import type { Lantern, Ember, DBError } from "types/beaconTypes.ts";
import type { Attempt } from "types/serverTypes.ts";
import { creds as c } from "utils/auth/neo4jCred.ts";

dotenv.load({ export: true });

export async function writeBeacon(entry:Lantern):Promise<Attempt> {
  console.groupCollapsed(`====== FUNCTION writeBeacon(${entry.input}) ======`);

  let driver: Driver | undefined;
  let attempt: Attempt;
  let attemptError: DBError | undefined;

  try {
    console.info("Initialising Driver...");
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
  
    const userId = entry.authId ? entry.authId : "test-auth-id";

    console.info("Executing Cypher Query...");
    const result = await driver.executeQuery(
      `MERGE (s:User {name:$sProps.name})-[v:VERB]->(o:Concept {name:$oProps.name})
      SET v.dbId = randomUUID(),
          v += $vProps
      RETURN s, v, o`,
      {
        sProps: { name: entry.shards.subject.head },
        oProps: { name: entry.shards.object.head },
        vProps: {
          authId: userId,
          presetId: entry.presetId ?? "",
          input: entry.input,
          name: entry.shards.verb.head,
          atoms_subject: entry.atoms.subject,
          atoms_verb: entry.atoms.verb,
          atoms_object: entry.atoms.object,
          atoms_adverbial: entry.atoms.adverbial,
          shards_subject_head: entry.shards.subject.head,
          shards_subject_phrase: entry.shards.subject.phrase,
          shards_subject_article: entry.shards.subject.article,
          shards_subject_quantity: entry.shards.subject.quantity,
          shards_subject_descriptors: entry.shards.subject.descriptors,
          shards_verb_head: entry.shards.verb.head,
          shards_verb_phrase: entry.shards.verb.phrase,
          shards_verb_descriptors: entry.shards.verb.descriptors,
          shards_object_head: entry.shards.object.head,
          shards_object_phrase: entry.shards.object.phrase,
          shards_object_article: entry.shards.object.article,
          shards_object_quantity: entry.shards.object.quantity,
          shards_object_descriptors: entry.shards.object.descriptors,
          shards_adverbial: entry.shards.adverbial,
          isPublic: entry.isPublic ?? false,
          isArchived: entry.isArchived ?? false,
          isSnoozed: entry.isSnoozed ?? false,
          category: entry.category ?? "",
          actions: [],
          errorLogs: []
        }
      },
      { database: "neo4j" }
    );

    const record = result.records[0].get("v").properties;

    // [ ] tdIdea: Separate the Ember assignment into a new function that instantiates a Class
    console.groupCollapsed(`Ember`);
    const ember: Ember = {
      authId: record.authId,
      dbId: record.dbId,
      presetId: record.presetId,
      input: record.input,
      atoms: {
        subject: record.atoms_subject,
        verb: record.atoms_verb,
        object: record.atoms_object,
        adverbial: record.atoms_adverbial
      },
      category: record.category,
      isPublic: record.isPublic,
      isArchived: record.isArchived,
      isSnoozed: record.isSnoozed,
      actions: record.actions,
      errorLogs: record.errorLogs
    };
    console.info(`Ember assembled`);
    console.log(ember);
    console.groupEnd();

    attempt = { record: ember };
  } catch (err) {
    console.groupCollapsed(`--- Error ---`);

    console.groupCollapsed(`Details`);
    console.warn(err);
    const cause = err instanceof Error ? err.cause : "Cause Unknown";
    console.info(`Error Cause:`);
    console.warn(cause);
    console.groupEnd();

    console.groupCollapsed(`Ash`);
    attemptError = { isError: true, errorCause: cause };
    attempt = {
      record: { ...entry, errorLogs: [attemptError] },
      error: attemptError
    }
    console.log(attempt);
    console.groupEnd();

    console.groupEnd();
  } finally {
    console.info("Closing Driver...");
    driver?.close();
  }

  console.groupEnd();
  console.info(`==================================================`);
  return attempt;
}

export async function writeBeacons(entries:Lantern[]) {
  console.groupCollapsed(`====== FUNCTION writeBeacons(${entries.length} entries) ======`);
  let i = 0;
  for (const entry of entries) {
    console.log(`Passing Beacon ${i}: "${entry.input}"`);
    await writeBeacon(entry);
    i++;
  };
  console.groupEnd();
}
