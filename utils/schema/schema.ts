import { constrainUser } from "utils/schema/constrainUser.ts";
import { constrainVerb } from "utils/schema/constrainVerb.ts";

export const isDev: boolean = Deno.env.get("DENO_ENV") !== "production";
export const logger: boolean = false;

export async function defineSchema() {
  if (logger) console.groupCollapsed(`|============== Schema ==============|`);
  await constrainUser();
  await constrainVerb();
  if (logger) console.groupEnd();
}
