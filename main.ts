import { Application } from "jsr:@oak/oak/application";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as dotenv from "jsr:@std/dotenv";

import router from "./routes/hub.ts";
import { seed } from "./dbUtils/seed.ts";

await dotenv.load({export: true});

const app = new Application();
const port: number = 8080;

app.use( oakCors({ 
  origin: "http://localhost:8000" 
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({port});
console.log(`Server is running on port ${port}`);