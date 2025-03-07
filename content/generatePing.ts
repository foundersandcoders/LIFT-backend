import { EmailContent } from "../types/emails.ts";
import { findUser } from "neo4jApi/find.ts";

export async function generatePing(
  userId: number,
  userName: string,
  managerName: string
) {
  console.group(`=== generatePing() ===`);
    const content:EmailContent = {
      sendable: false,
      html: ``
    };

    console.group(`=== Call findUser() ===`);
      const entries = await findUser(userId, true);
      console.info(`=======================`);
    console.groupEnd();

    const quantity = entries.length;
    const noun = (quantity > 1 ?
      "some beacons" : quantity < 1 ?
      "a beacon" : "no beacons"
    );

    console.groupCollapsed(`=== Entries ===`);
      console.log(`Showing ${quantity} Entries`);
      for (const entry of entries) { console.log(entry) }
      console.info(`===============`)
    console.groupEnd();

    console.group(`=== Build Email ===`);
      if (quantity >= 1) {
        content.sendable = true;
        content.html = `<div>
          <p>
            Dear ${managerName},
          </p>

          <p>
            ${userName} has shared ${noun} with you.
          </p>

          <ul>
            ${entries.map(entry => `<li>${entry}</li>`).join('')}
          </ul>
        </div>`;
      }
      console.info(`===================`);
    console.groupEnd();
    console.info(`======================`);
  console.groupEnd();

  return content;
}
