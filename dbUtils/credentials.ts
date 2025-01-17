export interface Credentials{
  URI: string,
  USER: string,
  PASSWORD: string
}

export const credentials: Credentials = {
  URI: await Deno.env.get("NEO4J_URI") ?? "",
  USER: await Deno.env.get("NEO4J_USERNAME") ?? "",
  PASSWORD: await Deno.env.get("NEO4J_PASSWORD") ?? ""
}