import { findUser } from "db/find.ts";

export async function generatePing(
  userId: number,
  userName: string,
  managerName: string
) {
  const entries = await findUser(userId, true);
  const quantity = entries.length;

  return (`<div>
    <p>
      Dear ${managerName},

      ${userName} has shared ${ quantity > 1 ? "some beacons" : "a beacon" } with you.

      <ul>
        ${entries.map(entry => `<li>${entry}</li>`).join('')}
      </ul>
    </p>
  </div>`)
}