import * as dotenv from "env";
import { CredsN4J } from "types";

await dotenv.load({ export: true });

const uri = await Deno.env.get("NEO4J_URI") ?? "";
const user = await Deno.env.get("NEO4J_USERNAME") ?? "";
const password = await Deno.env.get("NEO4J_PASSWORD") ?? "";

export const creds: CredsN4J = {
  URI: uri,
  USER: user,
  PASSWORD: password,
};