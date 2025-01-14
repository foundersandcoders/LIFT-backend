import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

const router = new Router();

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

router.get("/", (ctx /* ctx means "context" */) => {
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head><title>LIFT Server</title><head>
      <body>
        <h1>LIFT Server?</h1>
        <pre>LIFT Server!</pre>
        <p>Running on...</p>
        <ul>
          <li>Deno</li>
          <li>Oak</li>
        </ul>
      </body>
    </html>
  `;
});

await app.listen({ port: 8000 })
console.log("Server is running");

// app.listen({ port: 8080 });