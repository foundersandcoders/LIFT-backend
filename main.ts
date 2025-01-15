import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const app = new Application();
const router = new Router();
const port: number = 8080;

router.get("/", (ctx) => {
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>LIFT Server</title>
      <head>
      <body>
        <header>
          <h1>LIFT Server?</h1>
          <pre>LIFT Server!</pre>
        </header>
        <hr/>
        <nav>
          <ul>
            <li><a href="/who">WHO??¿???</a></li>
          </ul>
        </nav>
        <hr/>
        <main>
          <section>
            <h2>Tech Stack</h2>

            <div>
              <h3>Running on...</h3>
              <ul>
                <li><a href="https://deno.com/">Deno</a></li>
                <li><a href="https://oakserver.org/">Oak</a></li>
              </ul>
            </div>

            <div>
              <h3>Will Run on...</h3>
              <ul>
                <li><a href="https://neo4j.com/">neo4j</a></li>
              </ul>
            </div>
          <section>
          <hr/>
          <section>
            <h2>Links</h2>

            <ul>
              <li><a href="https://github.com/foundersandcoders/LIFT-backend">Back End Repo</a></li>
              <li><a href="https://console-preview.neo4j.io/tools/query">AuraDB Instance</a></li>
            </ul>
          </section>
        </main>
        <hr/>
        <footer>
          <pre>© Alex & the Pig 2025</pre>
        </footer>
      </body>
    </html>
  `;
});

router.get("/who", (ctx) => {
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head>
        <title>LIFT Server</title>
      <head>
      <body>
        <header>
          <h1>LIFT Server?</h1>
          <pre>LIFT Server!</pre>
        </header>
        <hr/>
        <nav>
          <ul>
            <li><a href="/">WHAT????⸮</a></li>
          </ul>
        </nav>
        <hr/>
        <main>
          <section>
            <h2>Who Made This?</h2>
            <div>
              <h3><a href="https://github.com/AlexVOiceover">Alex Rodriguez</a></h3>
              <ul>
                <li>Tall</li>
                <li>Good bone structure</li>
              </ul>
            </div>
            <div>
              <h3><a href="https://github.com/JasonWarrenUK">A Pig</a></h3>
              <ul>
                <li>Enthusiastic</li>
              </ul>
            </div>
          <section>
        </main>
        <hr/>
        <footer>
          <pre>© Alex & the Pig 2025</pre>
        </footer>
      </body>
    </html>
  `;
});

app.use( /* CORS module goez hir */
  oakCors({ 
    origin: "http://localhost:8000" 
  })
);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({port});

console.log(`Server is running on port ${port}`);