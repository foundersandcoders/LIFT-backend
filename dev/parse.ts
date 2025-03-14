import nlp from "npm:compromise@14.10.0";
import { breaker } from "../utils/convert/breakInput.ts";

const input = Deno.args.join(" ");

if (!input) {
  console.log("Please provide a sentence to parse.");
  console.log("Example: deno task parse The cat quickly ate the mouse");
  Deno.exit(1);
}

try {
  const doc = nlp(input);
  // console.log("NLP Doc:", doc);
  // console.log("Terms data:", doc.terms().data());

  if (!doc) {
    throw new Error("NLP initialization failed");
  }

  const result = breaker(input);

  const grammar = JSON.stringify(result, null, 2);
  // console.log(grammar);

  console.log(`=== Subject ===
    ${result.subject.head[0]} (${result.subject.quantity})
    Modifiers: ${result.subject.descriptors}
    `);

  console.log(`=== Verb ===
    ${result.verb.head[0]}
    Modifiers: ${result.verb.descriptors}
    `);

  console.log(`=== Object ===
    ${result.object?.head[0]} (${result.object?.quantity})
    Modifiers: ${result.object?.descriptors}
    `);
} catch (error: unknown) {
  console.error(
    "Error parsing sentence:",
    error instanceof Error ? error.message : String(error),
  );
  console.error("Full error:", error);
  Deno.exit(1);
}
