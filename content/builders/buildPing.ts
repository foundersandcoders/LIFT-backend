import { findUser } from "neo4jApi/find.ts";
import { generatePing } from "content/generators/generatePing.ts";

export async function buildPing(userId: number, userName: string, managerName: string) {
  console.group(`=== Running buildPing() ===`);
    console.log(`Received (${userId}, ${userName}, ${managerName})`);

    console.group(`=== Calling findUser() ===`);
      console.log(`Sending (${userId}, true)`);
      const entries = await findUser(userId, true);
      console.groupEnd();
    console.info(`==========================`);

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
