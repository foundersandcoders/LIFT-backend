import { generatePing } from "content/generatePing.ts";

const resendKey = Deno.env.get("RESEND_KEY");

export async function sendPing (
  userId: number,
  userName: string,
  readerName: string,
  readerEmail: string
): Promise<Response | undefined> {
  const content = generatePing(
    userId,
    userName,
    readerName
  );

  const res = await fetch("https://api.resend.com/emails",
    {
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
    }
  );

  console.log(`--- Ping Sent ---
    - From: ${sender} (${id})
    - To: ${reader} (${destination})
  `);

  if (res.ok) {
    const data = await res.json();
    console.log(data)
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } else {
    const errorData = await res.text();
    console.log("Error details:", errorData);
    return;
  }
};