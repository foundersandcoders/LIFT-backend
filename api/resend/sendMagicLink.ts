const resendKey = Deno.env.get("RESEND_KEY");
const isDev = Deno.env.get("DENO_ENV") !== "production";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

// A function to generate and send a magic link manually
// This bypasses better-auth entirely for testing
export async function generateManualMagicLink(email: string, callbackURL = "/") {
  // Create a simple token (this is for testing only!)
  const token = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  // Create verification URLs
  const frontendVerifyUrl = `${FRONTEND_URL}/auth/verify?token=${token}`;
  const apiVerifyUrl = `${FRONTEND_URL}/api/auth/verify?token=${token}`;
  
  console.log("\n==============================================================");
  console.log("||             MANUAL MAGIC LINK CREATED                     ||");
  console.log("||        THIS BYPASSES BETTER-AUTH COMPLETELY               ||");
  console.log("==============================================================");
  console.log(`📧 EMAIL: ${email}`);
  console.log(`🔑 TOKEN: ${token}`);
  console.log(`🔗 FRONTEND URL: ${frontendVerifyUrl}`);
  console.log(`🔗 API URL: ${apiVerifyUrl}`);
  console.log("==============================================================\n");
  
  // In development, don't actually send the email
  if (isDev) {
    return { 
      success: true, 
      message: "Manual magic link created (not sent in dev mode)",
      token,
      url: frontendVerifyUrl
    };
  }
  
  // In production, send an actual email
  try {
    await sendMagicLinkEmail(email, frontendVerifyUrl);
    return { 
      success: true, 
      message: "Manual magic link email sent",
      token,
      url: frontendVerifyUrl
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Sends a magic link email to the specified email address.
 * In development mode, it will not send an actual email and just log the URL.
 * 
 * @param email The email address to send the magic link to
 * @param magicLinkUrl The full magic link URL including token
 * @returns Promise<void> to match Better Auth's expected return type
 */
export async function sendMagicLinkEmail(
  email: string,
  magicLinkUrl: string
): Promise<void> {
  try {
    console.group("|=== sendMagicLinkEmail() ===|");
    console.info("| Parameters");
    console.table([
      { is: "email", value: email },
      { is: "magicLinkUrl", value: magicLinkUrl },
    ]);
    
    // Extract token from URL for testing purposes
    const urlObj = new URL(magicLinkUrl);
    const token = urlObj.searchParams.get("token") || "unknown-token";
    
    // Always log the token and URL during development
    if (isDev) {
      console.groupCollapsed("|=== 🧪 DEVELOPMENT MODE ===|");
      console.log(`| 📧 Would send magic link to: ${email}`);
      console.log(`| 🔗 Magic Link URL: ${magicLinkUrl}`);
      console.log(`| 🔑 Token: ${token}`);
      
      // Generate a test verification URL for easier testing
      const verifyUrl = `${FRONTEND_URL}/api/auth/verify?token=${token}`;
      console.log(`| 🔍 Verification URL: ${verifyUrl}`);
      console.groupEnd();

      console.groupEnd();
      return;
    }
    
    // In production, send actual email via Resend
    if (!resendKey) {
      console.error("| ❌ RESEND_KEY environment variable is not set");
      console.groupEnd();
      return;
    }
    
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; text-align: center;">Sign in to Beacons</h1>
            <p style="color: #555; font-size: 16px;">Click the link below to sign in:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLinkUrl}" style="background-color: #4361EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sign In to Beacons</a>
            </div>
            <p style="color: #777; font-size: 14px;">This link will expire in 10 minutes and can only be used once.</p>
            <p style="color: #777; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© LIFT Beacons ${new Date().getFullYear()}</p>
          </div>
        `,
      }),
    });
    
    if (res.ok) {
      console.info("| ✅ Magic link email sent successfully");
      console.groupEnd();
      return;
    } else {
      const errorData = await res.text();
      console.warn(`| ❌ Error from Resend API: ${errorData}`);
      console.groupEnd();
      return;
    }
  } catch (error) {
    console.error("| ❌ Error sending magic link:", error);
    console.groupEnd();
    return;
  }
}