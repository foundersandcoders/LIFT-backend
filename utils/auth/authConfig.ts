import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore } from "./denoKvUserStore.ts";
import { sendMagicLinkEmail } from "../../api/resend/sendMagicLink.ts";

// Log imports to verify
console.groupCollapsed("|=== Imports loaded ===|");
console.log("|- betterAuth:", typeof betterAuth);
console.log("|- magicLink:", typeof magicLink);
console.log("|- userStore:", typeof userStore);
console.log("|- sendMagicLinkEmail:", typeof sendMagicLinkEmail);
console.groupEnd();

// Environment variables
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
const isDev = Deno.env.get("DENO_ENV") !== "production";
const enableTestEmails = Deno.env.get("ENABLE_TEST_EMAILS") === "true";

// Create a test magic link function that can be called directly to verify
// if the sendMagicLink callback is ever reached
const testMagicLinkFunction = async ({ email, token, url }: { email: string, token: string, url: string }): Promise<void> => {
  console.log("\n==============================================================");
  console.log("||               DIRECT CALLBACK TEST                        ||");
  console.log("||        sendMagicLink FUNCTION WAS CALLED DIRECTLY         ||");
  console.log("==============================================================");
  console.log(`EMAIL: ${email}`);
  console.log(`TOKEN: ${token}`);
  console.log(`URL: ${url}`);
  console.log("==============================================================\n");
};

// Make this function available globally for testing
// @ts-ignore - ignore the global type issues
globalThis.__testMagicLink = testMagicLinkFunction;

// Export the auth instance outside the try-catch block
let auth: any;

try {
  // Verify the magicLink plugin import
  if (typeof magicLink !== 'function') {
    console.error("| ❌ ERROR: magicLink import is not a function:", magicLink);
    throw new Error("Magic link plugin not correctly imported");
  }
  
  console.log("| Creating magicLink plugin with explicit callback");
  
  // Debug what better-auth magicLink plugin expects
  console.log("| Magic link function properties:", Object.keys(magicLink));
  console.log("| Magic link function name:", magicLink.name);
  
  // Create auth config with proper plugin setup following Better Auth documentation
  const authConfig = {
    secretKey: JWT_SECRET,
    baseUrl: frontendUrl,
    userStore,
    basePath: "/auth",
    debug: true, // Enable debug mode to see detailed logs
    plugins: [
      magicLink({
        expiresIn: 600, // 10 minutes (in seconds)
        disableSignUp: false, // Allow new users to sign up
        sendMagicLink: async ({ email, token, url }) => {
          // Log magic link details for debugging
          console.log("\n==============================================================");
          console.log("||                  MAGIC LINK CREATED                       ||");
          console.log("==============================================================");
          console.log(`📧 EMAIL: ${email}`);
          console.log(`🔑 TOKEN: ${token}`);
          console.log(`🔗 URL: ${url}`);
          console.log("==============================================================\n");
          
          // In development, don't actually send emails unless explicitly enabled
          if (isDev) {
            if (enableTestEmails) {
              console.log(`📤 Development mode: Sending actual test email (ENABLE_TEST_EMAILS=true)`);
              await sendMagicLinkEmail(email, url);
              console.log(`📨 Email sent successfully`);
            } else {
              console.log(`🚫 Development mode: Skipping actual email (ENABLE_TEST_EMAILS=false)`);
            }
          } else {
            // In production, always send actual email
            await sendMagicLinkEmail(email, url);
            console.log(`📨 Email sent successfully`);
          }
        }
      })
    ]
  };
  
  console.log("| Auth config created successfully");
  console.log("| Calling betterAuth with config...");
  
  // Initialize better-auth with our configuration
  const authInstance = betterAuth(authConfig);
  
  console.log("| better-auth initialization successful");
  
  // Log auth instance properties for debugging
  const authKeys = Object.keys(authInstance);
  console.log("| Auth instance has these properties:", authKeys);
  
  // Verify api methods
  if (authInstance.api) {
    console.log("| Available API methods:", Object.keys(authInstance.api));
  }
  
  // Verify that the handler exists and is a function
  const hasHandler = authInstance.handler !== undefined && typeof authInstance.handler === 'function';
  console.log(`| ✓ Auth handler property exists: ${hasHandler}`);
  console.log(`| ✓ Auth handler is a function: ${typeof authInstance.handler === 'function'}`);
  
  // Set the auth instance
  auth = authInstance;
  
  console.log("✅ better-auth initialized successfully");
} catch (error) {
  console.error("❌ Error initializing better-auth:", error);
  
  // Create a placeholder auth object in case initialization fails
  auth = {
    // Primary handler function for routing requests - Simplified response creation
    handler: async (request: Request) => {
      const response = new Response(
        JSON.stringify({ success: false, error: "Auth not initialized" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
      return response;
    },
    
    // API methods
    api: {
      signInMagicLink: async () => ({ success: false, error: "Auth not initialized" })
    },
    
    // Session management
    getSession: async () => null,
    
    // Legacy/compatibility methods
    signIn: {
      magicLink: async () => ({ success: false, error: "Auth not initialized" })
    },
    
    // Config storage
    options: {},
  };
}

// Export the auth instance
export { auth };
export default auth;

console.groupEnd();