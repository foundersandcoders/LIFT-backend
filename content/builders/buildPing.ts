import { findUserById, findUserByName } from "neo4jApi/find.ts";
import { generatePing } from "content/generators/generatePing.ts";

export async function buildPing(userId: number = 0, userName: string, managerName: string) {
  console.group(`=== Running buildPing() ===`);
    console.log(`Received (${userId}, ${userName}, ${managerName})`);

    let entries: string[] = [];

    if (userId != 0) {
      console.log(`userId is ${userId}`);
      console.group(`=== Calling findUserById() ===`);
        console.log(`Sending (${userId}, true)`);
        entries = await findUserById(userId, true);
        console.groupEnd();
      console.info(`==========================`);
    } else {
      console.log(`userId is ${userId}`);
      console.group(`=== Calling findUserByName() ===`);
        console.log(`Sending (${userName}, true)`);
        entries = await findUserByName(userName, true);
        console.groupEnd();
      console.info(`==========================`);
    }

    if (entries.length > 0) {
      console.groupCollapsed(`=== Beacon Log ===`);
        for (let x = 0; x < entries.length; x++) {
          console.log(`Beacon ${x + 1} • ${entries[x]}`);
        };
      console.groupEnd();
      console.info(`==================`);
    }

    console.group(`=== Calling generatePing() ===`);
      const content = generatePing(entries, userName, managerName);
      
      if (!content.sendable) {
        console.warn(`Cannot send email: No beacons found for ${userName}`);
      } else {
        console.log(`Email generated successfully`);
      }
      console.groupEnd();
    console.info(`==============================`);

    console.groupEnd();
  console.info(`===========================`);

  return content;
}
