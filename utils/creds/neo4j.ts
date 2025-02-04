//import * as dotenv from "dotenv";
import { CredsN4J } from "types";

const uri = await Deno.env.get("NEO4J_URI") ?? "";
const user = await Deno.env.get("NEO4J_USERNAME") ?? "";
const password = await Deno.env.get("NEO4J_PASSWORD") ?? "";

export const creds: CredsN4J = {
  URI: uri,
  USER: user,
  PASSWORD: password,
};

console.log(`🔍 ENVIRONMENT CHECK`);
console.log(`NEO4J_URI: ${Deno.env.get("NEO4J_URI")}`);
console.log(`NEO4J_USERNAME: ${Deno.env.get("NEO4J_USERNAME")}`);
console.log(`🔗 Connecting to Neo4j at: ${creds.URI}`);