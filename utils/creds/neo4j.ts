import { CredsN4J } from "types/security.ts";

const uri = Deno.env.get("NEO4J_URI") ?? "";
const user = Deno.env.get("NEO4J_USERNAME") ?? "";
const password = Deno.env.get("NEO4J_PASSWORD") ?? "";

export const creds: CredsN4J = {
  URI: uri,
  USER: user,
  PASSWORD: password,
};

console.log(`🔍 ENVIRONMENT CHECK`);
console.log(`NEO4J_URI: ${Deno.env.get("NEO4J_URI")}`);
console.log(`NEO4J_USERNAME: ${Deno.env.get("NEO4J_USERNAME")}`);
console.log(`🔗 Connecting to Neo4j at: ${creds.URI}`);
