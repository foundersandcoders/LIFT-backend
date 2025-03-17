import { PingProps, PingInfo } from "types/pingTypes.ts";

export function generatePing(entries: string[], userName: string, managerName: string) {
  console.groupCollapsed(`|=== Running generatePing() ===`);

  console.group(`| Parameters`);
  console.table([ /* Show Parameters */
    { is: "entries", value: entries },
    { is: "userName", value: userName },
    { is: "managerName", value: managerName }
  ]);
  console.groupEnd();

  console.group(`| New Ping`);
  const ping = new PingInfo();
  console.table([ /* Show Ping */
    {is: "isValid", value: ping.isValid},
    {is: "content", value: ping.content}
  ])
  console.groupEnd();

  const quantity = entries.length;
  const noun = quantity == 1 ? "beacon" : "beacons";
  const article = quantity >= 2 ? "some" : quantity == 1 ? "a " : "no";

  console.group(`| Final Ping`);
  if (quantity >= 1) {
    ping.isValid = true;
    ping.content = (`<div><p>
      Hi ${managerName},
      <br/><br/>
      ${userName} has shared ${article} ${noun} with you.
      <br/><br/>
      <ul>
        ${entries.map(entry => `<li>${entry}</li>`).join('')}
      </ul>
    </p></div>`);
  }
  console.table([ /* Show Ping */
    {is: "isValid", value: ping.isValid},
    {is: "content", value: ping.content}
  ])
  console.groupEnd();

  console.groupEnd();
  console.info(`|==============================`);
  return ping;
}
