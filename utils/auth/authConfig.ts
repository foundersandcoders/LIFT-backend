import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "api/resend/sendMagicLink.ts";

// Environment variables
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

export const auth = betterAuth({
  secretKey: JWT_SECRET,
  baseUrl: frontendUrl,
  plugins: [
    magicLink({
      expiresIn: 600,
      disableSignUp: true,
      sendMagicLink: async ({ email, token, url }, request) => {
        await sendMagicLinkEmail(email, url);
      }
    })
  ]
});