import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { userStore } from "utils/auth/denoKvUserStore.ts";
import { sendMagicLinkEmail } from "resendApi/sendMagicLink.ts";

// Environment variables
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "development_secret_key";
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

// Create auth handlers manually with support for Oak context
const handleRequest = async (request: Request, response: Response) => {
  // Implementation will depend on better-auth API
  console.log("Auth handleRequest called");
  return { success: true };
};

const getSession = async (request: Request) => {
  // Implementation will depend on better-auth API
  console.log("Auth getSession called");
  return { user: null };
};

// Temporary solution until better-auth is properly integrated
export const auth = {
  handleRequest,
  getSession,
  config: {
    secretKey: JWT_SECRET,
    baseUrl: frontendUrl,
    userStore: userStore,
    plugins: [
      magicLink({
        expiresIn: 600,
        disableSignUp: true,
        sendMagicLink: async ({ email, token, url }, request) => {
          await sendMagicLinkEmail(email, url);
        }
      })
    ]
  }
};