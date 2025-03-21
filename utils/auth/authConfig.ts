import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore } from "./denoKvUserStore.ts";
import { sendMagicLinkEmail } from "../../api/resend/sendMagicLink.ts";

// Log imports to verify
console.log("✓ Imports loaded:");
console.log("  - betterAuth:", typeof betterAuth);
console.log("  - magicLink:", typeof magicLink);
console.log("  - userStore:", typeof userStore);
console.log("  - sendMagicLinkEmail:", typeof sendMagicLinkEmail);

// Environment variables
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
const isDev = Deno.env.get("DENO_ENV") !== "production";

// Prepare a placeholder auth object in case initialization fails
let authInstance = {
  handleRequest: async () => ({ success: false, error: "Auth not initialized" }),
  getSession: async () => null,
  signIn: {
    magicLink: async () => ({ success: false, error: "Auth not initialized" })
  },
  magicLink: {
    verify: async () => ({ success: false, error: "Auth not initialized" })
  },
  signOut: async () => ({ success: false, error: "Auth not initialized" }),
  config: null
};

console.group("|=== Auth Configuration ===|");
console.log(`| JWT_SECRET: ${JWT_SECRET.substring(0, 3)}...`); // Only log first 3 chars for security
console.log(`| frontendUrl: ${frontendUrl}`);
console.log(`| isDev: ${isDev}`);

try {
  // Create the configuration object first
  const authConfig = {
    secretKey: JWT_SECRET,
    baseUrl: frontendUrl,
    userStore,
    plugins: [
      magicLink({
        expiresIn: 600, // 10 minutes
        disableSignUp: false, // Allow new users to sign up
        sendMagicLink: async ({ email, token, url }, request) => {
          console.group("|=== sendMagicLink ===|");
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
  };
  
  console.log("| Auth config object created successfully");
  console.log("| Calling betterAuth with config...");
  
  // Now initialize better-auth with the configuration
  authInstance = betterAuth(authConfig);
  
  console.log("| better-auth initialization successful");
  console.log("| Auth instance has these properties:", Object.keys(authInstance));
  
  // Log confirmation of initialization
  console.log("✅ better-auth initialized successfully");
} catch (error) {
  console.error("❌ Error initializing better-auth:", error);
}

console.groupEnd();

// Export the auth instance (either the real one or the placeholder)
export const auth = authInstance;