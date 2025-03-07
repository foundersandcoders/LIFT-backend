import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async/delay";
import { expect } from "jsr:@std/expect";

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

Deno.test({ /* Read File: test.txt */
  name: "Read File: test.txt",
  permissions: { read: true },
  fn: () => {
    const data = Deno.readTextFileSync("./data/test.txt");
    assertEquals(data, "expected content");
  },
});
