import { PingInfo } from "types/pingTypes.ts";

export function generatePing(entries: string[], userName: string, managerName: string): PingInfo {
  console.groupCollapsed(`|=== generatePing() ===`);
  console.info(`| Parameters`);
  console.table([
    { is: "entries", value: entries },
    { is: "userName", value: userName },
    { is: "managerName", value: managerName }
  ]);

  const ping = new PingInfo();
  console.info(`| New Ping`);
  console.table([
    {is: "isValid", value: ping.isValid},
    {is: "content length", value: ping.content?.length}
  ])

  const quantity = entries.length;
  const noun = quantity == 1 ? "beacon" : "beacons";
  const article = quantity >= 2 ? "some" : quantity == 1 ? "a " : "no";

  if (quantity >= 1) {
    ping.isValid = true;
    ping.content = (`<div>
      <p>Hi ${managerName},</p>
      <p>${userName} has shared ${article} ${noun} with you.</p>
      <ul>
        ${entries.map(entry => `<li>${entry}</li>`).join('')}
      </ul>
    </div>`);
  }
  console.info(`| Return`);
  console.table([
    {is: "isValid", value: ping.isValid},
    {is: "content length", value: ping.content?.length}
  ])

  console.groupEnd();
  console.info(`|==============================`);

  return ping;
}
