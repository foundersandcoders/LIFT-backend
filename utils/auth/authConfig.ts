import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore } from "utils/auth/denoKvUserStore.ts";
import { sendMagicLinkEmail } from "api/resend/sendMagicLink.ts";

// Environment variables
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
const isDev = Deno.env.get("DENO_ENV") !== "production";

console.groupCollapsed("|=== Auth Configuration ===|");
console.log(`| JWT_SECRET: ${JWT_SECRET.substring(0, 3)}...`); // Only log first 3 chars for security
console.log(`| frontendUrl: ${frontendUrl}`);
console.log(`| isDev: ${isDev}`);
console.groupEnd();

// Initialize better-auth with proper configuration
export const auth = betterAuth({
  secretKey: JWT_SECRET,
  baseUrl: frontendUrl,
  userStore: userStore,
  plugins: [
    magicLink({
      expiresIn: 600, // 10 minutes
      disableSignUp: false, // Allow new users to sign up
      sendMagicLink: async ({ email, token, url }, request) => {
        console.groupCollapsed("|=== sendMagicLink ===|");
        console.log(`| Sending magic link to: ${email}`);
        
        if (isDev) {
          // In development, just log the URL instead of sending email
          console.log(`| [DEV] Magic Link URL: ${url}`);
          console.log(`| [DEV] Token: ${token}`);
          console.groupEnd();
          return { success: true };
        }
        
        // In production, send actual email
        const result = await sendMagicLinkEmail(email, url);
        console.log(`| Email sent result: ${JSON.stringify(result)}`);
        console.groupEnd();
        return result;
      }
    })
  ]
});

// Log confirmation of initialization
console.log("✅ better-auth initialized successfully");