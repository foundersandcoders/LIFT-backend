import { join } from "node:path";
import { EmailContent } from "../../types/emailTypes.ts";

export function generatePing(entries: string[], userName: string, managerName: string) {
  console.group(`=== Running generatePing() ===`);
    console.log(`Received (${entries}, ${userName}, ${managerName})`);

    // tdIdea: Turn this into a class
    const content:EmailContent = { sendable: false, html: `` };

    const quantity = entries.length;
    const noun = (quantity == 1 ? "beacon" : "beacons");
    const article = (quantity > 1 ? "some" :
      quantity < 1 ? "a " : "no"
    );

    if (quantity >= 1) {
      content.sendable = true;
      content.html = (
        "<div><p>Hi "
        + managerName
        + "<br/><br/>"
        + userName
        + " has shared "
        + article
        + " "
        + noun
        + " with you.<br/><br/><ul>"
        + entries.map(entry => `<li>${entry}</li>`).join('')
        + "</ul></p></div>"
      );
    }

    console.log(`Content is a ${typeof content.html}`);

    console.groupEnd();
  console.info(`==============================`);

  return content;
}
