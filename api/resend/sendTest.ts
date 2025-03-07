import * as who from "../../data/address.json" with { type: "json" };

const resendKey = Deno.env.get("RESEND_KEY");

export async function sendTest (): Promise<Response | undefined> {
  console.log(`Starting email test`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'Beacons <nudger@beacons.ink>',
      to: who.default.liftTeam.to,
      subject: "I was sent by calling a route",
      html: `<div>
        <h1>Route-Based!</h1>

        <p>
          Hello, ${who.default.liftTeam.names}!
          This email was created by going to an endpoint!"
        </p>
      </div>`,
    }),
  });

  console.log(`Request sent`);

  if (res.ok) {
    const data = await res.json();
    console.log(data)

    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    const errorData = await res.text();
    console.log("Error details:", errorData);
    return;
  }
};