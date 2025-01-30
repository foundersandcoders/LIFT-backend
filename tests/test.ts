import { expect } from "jsr:@std/expect";
import { add } from "calc";

Deno.test("add function adds two numbers correctly", () => {
  const result = add(2, 3);
  expect(result).toBe(5);
});
