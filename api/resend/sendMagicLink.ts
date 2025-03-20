const resendKey = Deno.env.get("RESEND_KEY");

export async function sendMagicLinkEmail(
  email: string,
  magicLinkUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.group("|=== sendMagicLinkEmail() ===");
    console.info("| Parameters");
    console.table([
      { is: "email", value: email },
      { is: "magicLinkUrl", value: magicLinkUrl },
    ]);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "LIFT <auth@beacons.ink>",
        to: `<${email}>`,
        subject: "Sign in to Beacons",
        html: `
          <div>
            <h1>Sign in to Beacons</h1>
            <p>Click the link below to sign in:</p>
            <a href="${magicLinkUrl}">Sign In</a>
            <p>This link will expire in 10 minutes.</p>
          </div>
        `,
      }),
    });
    
    if (res.ok) {
      console.info("| Magic link email sent successfully");
      console.groupEnd();
      return { success: true };
    } else {
      const errorData = await res.text();
      console.warn(`| Error: ${errorData}`);
      console.groupEnd();
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error("Error sending magic link:", error);
    console.groupEnd();
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}