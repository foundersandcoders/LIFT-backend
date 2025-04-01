// Entry point for running only auth tests

// Import auth tests
import "./auth/auth.test.ts";
import "./auth/authConfig.test.ts";
import "./auth/denoKvUserStore.test.ts";
import "./auth/sendMagicLink.test.ts";

console.log("Running authentication tests only...");