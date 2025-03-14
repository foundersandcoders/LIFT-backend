import { DBCreds } from "types/serverTypes.ts";

const uri = Deno.env.get("NEO4J_URI") ?? "";
const user = Deno.env.get("NEO4J_USERNAME") ?? "";
const password = Deno.env.get("NEO4J_PASSWORD") ?? "";

export const creds: DBCreds = {
  URI: uri,
  USER: user,
  PASSWORD: password,
};

console.groupCollapsed(`🔍 ENVIRONMENT CHECK`);
console.log(`NEO4J_URI: ${Deno.env.get("NEO4J_URI")}`);
console.log(`NEO4J_USERNAME: ${Deno.env.get("NEO4J_USERNAME")}`);
console.log(`🔗 Connecting to Neo4j at: ${creds.URI}`);
console.groupEnd();
