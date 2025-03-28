import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore as denoKvUserStore } from "utils/auth/denoKvUserStore.ts";
import { sendMagicLinkEmail } from "resendApi/sendMagicLink.ts";

const SECRET_KEY: string | undefined = Deno.env.get("SECRET_KEY");
const BASE_URL: string | undefined = Deno.env.get("BASE_URL");
const enableTestEmails: boolean = Deno.env.get("ENABLE_TEST_EMAILS") === "true";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

if (logger) { /* Auth Imports */
  console.groupCollapsed(`|============ auth Imports ============|`);
  console.log(`| betterAuth: ${typeof betterAuth}`);
  console.log(`| magicLink: ${typeof magicLink}`);
  console.log(`| denoKvUserStore: ${typeof denoKvUserStore}`);
  console.log(`| sendMagicLinkEmail: ${typeof sendMagicLinkEmail}`);
  console.groupEnd();
}

export const auth = betterAuth({
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
      sendMagicLink: async ({ email, url, token }, request) => { throw new Error("| Not implemented") },
      generateToken: async (email) => { throw new Error("| Not implemented") }
    })
  ]
});

if (logger) { /* Auth Init */
  console.log("| ✅ better-auth initialized successfully");
}

if (logger) { /* Auth Methods */
  console.group(`|============ auth Methods ============|`);
  console.log(Object.keys(auth.api).sort());
  console.groupEnd();
}