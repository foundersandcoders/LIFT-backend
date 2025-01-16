import { Application } from "jsr:@oak/oak/application";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as dotenv from "jsr:@std/dotenv";
import router from "./routes/main.ts";
import neo4j from "neo4j";
import { toNumber } from "../../../Library/Caches/deno/npm/registry.npmjs.org/neo4j-driver-core/5.27.0/types/integer.d.ts";

console.groupCollapsed("=== Loading ENV ===");
await dotenv.load({export: true});
console.groupEnd();

const app = new Application();
const port: number = 8080;

app.use( oakCors({ 
  origin: "http://localhost:8000" 
}));

// Database
(async () => {
  console.groupCollapsed("=== Defining ENV ===");
  const URI:string = Deno.env.get("NEO4J_URI") ?? "";
  const USER:string = Deno.env.get("NEO4J_USERNAME") ?? "";
  const PASSWORD:string = Deno.env.get("NEO4J_PASSWORD") ?? "";

  console.log(`URI: ${URI}`);
  console.log(`USER: ${USER}`);
  console.log(`PASSWORD: ${PASSWORD}`);
  console.groupEnd();

  let driver:neo4j.Driver;

  console.groupCollapsed("=== Attempting DB Connection ===");
  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established')
    console.log(serverInfo)
    console.groupCollapsed("=== Closing DB ===");
    driver.close();
    console.groupEnd();
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
  }
  console.groupEnd();
})();


// Router
console.groupCollapsed("=== Calling Routes ===");
app.use(router.routes());
app.use(router.allowedMethods());
console.groupEnd();

console.groupCollapsed("=== Starting Server ===");
app.listen({port});
console.log(`Server is running on port ${port}`);
console.groupEnd();