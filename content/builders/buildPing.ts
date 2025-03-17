import { findUserById, findUserByName } from "neo4jApi/find.ts";
import { generatePing } from "content/generators/generatePing.ts";
import { PingInfo } from "types/pingTypes.ts";

export async function buildPing(authId: string, userName: string, managerName: string) {
  console.group(`|=== buildPing() ===`);
  console.info(`| Parameters`);
  console.table([
    {is: "authId", value: authId},
    {is: "userName", value: userName},
    {is: "managerName", value: managerName}
  ])
  
  const entries = authId != "0" ?
    await findUserById(authId, true) :
    await findUserByName(userName, true);
  
  const ping: PingInfo = generatePing(entries, userName, managerName);

  !ping.isValid ?
    console.warn(`| No beacons found for ${userName}`) :
    console.log(`| Ping for ${userName} generated successfully`);

  console.group(`|--- Ping to Send ---`);
  console.log(ping);
  console.groupEnd();

  console.groupEnd();
  console.info(`|===========================`);

  return ping
}
