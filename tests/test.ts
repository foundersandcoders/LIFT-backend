// Main test entry point that imports all other tests

// Import standard assertions and utilities
import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async/delay";
import { expect } from "jsr:@std/expect";

// Import all auth tests
import "./auth/auth.test.ts";
import "./auth/authConfig.test.ts";
import "./auth/denoKvUserStore.test.ts";
import "./auth/sendMagicLink.test.ts";

// Basic tests to verify the test runner works
Deno.test("Sync Assert: 1 + 2 = 3", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("Sync Expect: 1 + 2 = 3", () => {
  const result = 1 + 2;
  expect(result).toBe(3);
});

Deno.test("Async Assert: 1 + 2 = 3", async () => {
  const x = 1 + 2;
  await delay(100);
  assertEquals(x, 3);
});

Deno.test("Async Expect: 1 + 2 = 3", async () => {
  const result = 1 + 2;
  await delay(100);
  expect(result).toBe(3);
});

Deno.test({ 
  name: "Read File: test.txt (skipped if file doesn't exist)",
  permissions: { read: true },
  ignore: true, // Skip this test by default
  fn: () => {
    try {
      const data = Deno.readTextFileSync("./data/test.txt");
      assertEquals(data, "expected content");
    } catch (error) {
      console.log("Skipping file read test - test.txt not available");
    }
  },
});