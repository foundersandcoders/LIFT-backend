import * as env from "env";
import router from "router";

await env.load({ export: true });

const port = await parseInt(
  Deno.env.get("PORT") ?? "8080",
);

router.listen({ port: port });
console.log(`Router awake on ${port}`);