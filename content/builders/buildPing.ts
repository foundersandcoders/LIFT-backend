import { findUserById, findUserByName } from "neo4jApi/find.ts";
import { generatePing } from "content/generators/generatePing.ts";

export async function buildPing(authId: number = 0, userName: string, managerName: string) {
  console.group(`|=== Running buildPing() ===`);
  console.log(`| Received (${authId}, ${userName}, ${managerName})`);

  let entries: string[] = [];

  if (authId != 0) {
    console.log(`| authId is ${authId}`);
    console.group(`|=== Calling findUserById() ===`);
    console.table([
      {is: "authId", value: authId},
      {is: "publicOnly", value: userName}
    ])
    entries = await findUserById(authId, true);
    console.groupEnd();
    console.info(`|==========================`);
  } else {
    console.log(`| authId is ${authId}`);
    console.group(`|=== Calling findUserByName() ===`);
    console.table([
      {is: "userName", value: userName},
      {is: "publicOnly", value: true}
    ])
    entries = await findUserByName(userName, true);
    console.groupEnd();
    console.info(`|==========================`);
  }

  if (entries.length > 0) {
    console.groupCollapsed(`|=== Beacon Log ===`);
    for (let x = 0; x < entries.length; x++) {
      console.log(`| Beacon ${x + 1} • ${entries[x]}`);
    };
    console.groupEnd();
    console.info(`|==================`);
  }

  console.group(`|=== Calling generatePing() ===`);
  const content = generatePing(entries, userName, managerName);
  
  if (!content.isValid) {
    console.warn(`| Cannot send email: No beacons found for ${userName}`);
  } else {
    console.log(`| Email generated successfully`);
  }
  console.groupEnd();
  console.info(`|==============================`);

  console.groupEnd();
  console.info(`|===========================`);

  return content;
}
