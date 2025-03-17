import { PingInfo } from "types/pingTypes.ts";
import { buildPing } from "content/builders/buildPing.ts";

const resendKey = Deno.env.get("RESEND_KEY");

export async function sendPing (
  authId: string,
  userName: string,
  managerName: string,
  managerEmail: string
): Promise<Response | Error> {
  console.group(`|=== sendPing() ===`);
  console.info(`| Parameters`);
  console.table([
    {is: "authId", value: authId},
    {is: "userName", value: userName},
    {is: "managerName", value: managerName}
  ])  
  
  const content:PingInfo = await buildPing(authId, userName, managerName);

  if (content.isValid) {
    console.info(`| Fetching from Resend API`);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Beacons <nudger@beacons.ink>',
        to: `${managerName} <${managerEmail}>`,
        subject: `${userName} Lit a Beacon`,
        html: content.content,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.info(`| Email sent successfully`);
      console.table(data);

      console.groupEnd();
      console.info(`|===========================`);

      return new Response(data, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const errorData = await res.text();
      console.warn(`| Error: ${errorData}`);

      console.groupEnd();
      console.info(`|===========================`);

      return new Error(errorData);
    }
  } else {
    console.groupEnd();
    console.info(`|===========================`);

    return new Error(`Cannot send email: No entries to send`);
  }
};