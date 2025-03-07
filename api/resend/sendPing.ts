import { EmailContent } from "../../types/emails.ts";
import { buildPing } from "../../content/builders/buildPing.ts";

const resendKey = Deno.env.get("RESEND_KEY");

export async function sendPing (userId: number, userName: string, readerName: string, readerEmail: string): Promise<Response | Error> {
  console.group(`=== Running sendPing() ===`);
    console.log(`Received (${userId}, ${userName}, ${readerName}, ${readerEmail})`);
    
    console.group(`=== Calling buildPing() ===`);
      console.log(`Sending (${userId}, ${userName}, ${readerName})`);
      const content:EmailContent = await buildPing(userId, userName, readerName);
      console.groupEnd();
    console.info(`===========================`);

    if (content.sendable) {
      console.info(`fetching from Resend API`);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Beacons <nudger@beacons.ink>',
            to: `${readerName} <${readerEmail}>`,
            subject: `${userName} Lit a Beacon`,
            html: content,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.info(`Email sent successfully`);
          console.log(data);

          console.groupEnd();
          console.info(`===========================`);

          return new Response(data, {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          const errorData = await res.text();
          console.warn("Error:", errorData);

          console.groupEnd();
          console.info(`===========================`);

          return new Error(errorData);
        }
    } else {
      console.groupEnd();
      console.info(`===========================`);
      
      return new Error(`Cannot send email: No entries to send`);
    }
};