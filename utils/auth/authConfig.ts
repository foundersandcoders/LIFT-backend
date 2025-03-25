import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore as denoKvUserStore } from "utils/auth/denoKvUserStore.ts";
import { sendMagicLinkEmail } from "resendApi/sendMagicLink.ts";

// Environment Variables
// const JWT_SECRET = Deno.env.get("JWT_SECRET");
// const frontendUrl = Deno.env.get("FRONTEND_URL");
// const isDev = Deno.env.get("DENO_ENV") !== "production";
// const enableTestEmails = Deno.env.get("ENABLE_TEST_EMAILS") === "true";
const SECRET_KEY = Deno.env.get("SECRET_KEY");
const BASE_URL = Deno.env.get("BASE_URL");

const importLogger = {
  betterAuth: typeof betterAuth,
  magicLink: typeof magicLink,
  denoKvUserStore: typeof denoKvUserStore,
  sendMagicLinkEmail: typeof sendMagicLinkEmail
};

console.groupCollapsed("|=== Imports loaded ===|");
console.table(importLogger);
console.groupEnd();

if (typeof magicLink !== 'function') {
  console.error("| ❌ ERROR: magicLink import is not a function:", magicLink);
  throw new Error("Magic link plugin not correctly imported");
}

console.group(`|=== Magic Link Plugin ===|`);

// console.group(`|=== Magic Link Plugin Props (Verbose) ===|`);
// console.log(magicLink.toString())
// console.groupEnd();

console.group(`|=== Magic Link Plugin Props (Concise) ===|`);
console.log("| Magic link function name:", magicLink.name);
console.groupEnd();

// console.group(`|=== authConfig (Verbose) ===|`);
// console.log(JSON.stringify(authConfig, null, 2));
// console.groupEnd();

console.log("| Auth config created successfully");
console.log("| Calling betterAuth with config...");

export const authInstance = betterAuth({
  secret: SECRET_KEY,
  baseUrl: BASE_URL,
  userStore: denoKvUserStore,
  // basePath: "/auth",
  debug: true,
  plugins: [
    magicLink({
      disableSignUp: false,
      rateLimit: { window: 60, max: 5 },
      expiresIn: 1200,
      sendMagicLink: async ({ email, url, token }, request) => {
        throw new Error("Function not implemented.")
      },
      generateToken: async (email) => {
        throw new Error("Function not implemented.")
      }
    })
  ]
});

console.group(`|=== authInstance ===|`);
for (const key of Object.keys(authInstance)) console.log(`| ✓ ${key}`);

// console.groupCollapsed(`|=== handler ===|`);
// console.log(authInstance.handler.toString());
// console.groupEnd();

console.group(`|=== options ===|`);
for (const key of Object.keys(authInstance.options)) console.log(`| ✓ ${key}`);
console.groupEnd();

console.group(`|=== api ===|`);
for (const key of Object.keys(authInstance.api)) console.log(`| ✓ ${key}`);

console.groupCollapsed(`|=== signInMagicLink ===|`);
for (const key of Object.keys(authInstance.api.signInMagicLink)) console.log(`| ✓ ${key}`);
console.groupCollapsed(`|=== options ===|`);
for (const key of Object.keys(authInstance.api.signInMagicLink.options)) console.log(`| ✓ ${key}`);
// console.groupCollapsed(`|=== body ===|`);
// for (const key of Object.keys(authInstance.api.signInMagicLink.options.body)) console.log(`| ✓ ${key}`);
// console.groupEnd();
console.groupEnd();
console.groupEnd();

// console.groupCollapsed(`|=== magicLinkVerify ===|`);
// for (const key of Object.keys(authInstance.api.magicLinkVerify)) console.log(`| ✓ ${key}`);
// console.groupCollapsed(`|=== options ===|`);
// for (const key of Object.keys(authInstance.api.magicLinkVerify.options)) console.log(`| ✓ ${key}`);
// console.groupEnd();
// console.groupEnd();

// console.groupCollapsed(`|=== getSession ===|`);
// for (const key of Object.keys(authInstance.api.getSession)) console.log(`| ✓ ${key}`);
// console.groupEnd();
console.groupEnd();
console.groupEnd();

console.log("✅ better-auth initialized successfully");

console.groupEnd();