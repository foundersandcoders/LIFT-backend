// deno-lint-ignore-file ban-ts-comment
import neo4j, { Driver } from "neo4j";

export async function queryAll() {
  const URI: string = await Deno.env.get("NEO4J_URI") ?? "";
  const USER: string = await Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD: string = await Deno.env.get("NEO4J_PASSWORD") ?? "";

  let driver: Driver, result;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await driver.verifyConnectivity();
  } catch (err) {
    // @ts-ignore
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    return;
  }

  const { records } = await driver.executeQuery(`
    MATCH (n)
    RETURN n
    LIMIT 25
  `);

  console.log(records);

  await driver.close();

  return records;
}

queryAll();
