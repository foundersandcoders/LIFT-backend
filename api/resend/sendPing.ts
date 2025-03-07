import { EmailContent } from "../../types/emails.ts";
import { generatePing } from "content/generatePing.ts";

const resendKey = Deno.env.get("RESEND_KEY");

export async function sendPing (
  userId: number,
  userName: string,
  readerName: string,
  readerEmail: string
): Promise<Response | undefined> {
  console.group(`=== sendPing() ===`);
    console.group(`=== Call generatePing() ===`);
      const content:EmailContent = await generatePing(
        userId,
        userName,
        readerName
      );
      console.info(`===========================`);
    console.groupEnd();

    console.group(`=== Check Content ===`);
      console.log(content.sendable ? 
        content.html : `No entries to send`
      );
      console.info(`===============`);
    console.groupEnd();

    if (content.sendable) {
      console.group(`=== Fetch Resend API ===`);
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
          console.log(data);
      
          console.info(`===========================`);
          console.groupEnd();
          return new Response(
            data,
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        } else {
          const errorData = await res.text();
          console.warn("Error:", errorData);
        }
        console.info(`=======================`);
      console.groupEnd();
    }
    console.info(`===============`);
  console.groupEnd();
  
  return;
};