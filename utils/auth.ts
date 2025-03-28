import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore } from "utils/auth/denoKvUserStore.ts";
import { authLogger } from "utils/auth/authLogger.ts";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

const secret: string | undefined = Deno.env.get("BETTER_AUTH_SECRET");
const baseURL: string | undefined = Deno.env.get("BETTER_AUTH_URL");

export const auth = betterAuth({
  appName: "Beacons",
  debug: true,
  secret: secret,
  baseUrl: baseURL,
  basePath: "/auth",
  userStore: userStore,
  database: {
		dialect: "postgres",
		type: "postgres",
		casing: "camel"
	},
  // secondaryStorage: userStore,
  plugins: [
    magicLink({
      rateLimit: { window: 60, max: 5 },
      expiresIn: 1200,
      disableSignUp: false,
      // [ ] tdHi: Create a user
      // generateToken: async (email) => {},
      // [ ] tdHi: Generate a link
      sendMagicLink: async ({ email, url, token }, request) => {},
      // [ ] tdHi: magicLinkVerify
      // [ ] tdHi: signOut
      // [ ] tdMd: getSession
      // [ ] tdLo: listSessions
      // [ ] tdHi: updateUser
      // [ ] tdHi: changeEmail
      // [ ] tdHi: deleteUser
      // [ ] tdLo: listUserAccounts
    })
  ],
  session: {
		modelName: "sessions",
		fields: {
			userId: "user_id"
		},
		expiresIn: 604800, // 7 days
		updateAge: 86400, // 1 day
		additionalFields: {
			customField: {
				type: "string",
				nullable: true
			}
		},
		storeSessionInDatabase: true,
		preserveSessionInDatabase: false,
		cookieCache: {
			enabled: true,
			maxAge: 300 // 5 minutes
		}
  },
});

if (logger) authLogger();