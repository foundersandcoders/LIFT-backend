import { Router } from "oak";
import { Subrouter } from "types/serverTypes.ts";
import { editRouter, editRoutes } from "routes/dbRoutes/editRoutes.ts";
import { getRouter, getRoutes } from "routes/dbRoutes/getRoutes.ts";
import { findRouter, findRoutes } from "routes/dbRoutes/findRoutes.ts";
import { sendRouter, sendRoutes } from "routes/emailRoutes/sendRoutes.ts";
import { toolRouter, toolRoutes } from "routes/dbRoutes/toolRoutes.ts";
import { writeRouter, writeRoutes } from "routes/dbRoutes/writeRoutes.ts";

const router = new Router();
const registeredRoutes: string[] = [];

const registerRoutes = (pre: string, sub: Subrouter) => {
  const registeredSubs:string[] = [];

  sub.routes.forEach((route) => {
    registeredSubs.push(`${pre}${route}`);
  });

  if (registeredSubs.length == 0) {
    console.log(`No routes found for ${pre}`);  
  } else {
    registeredSubs.forEach((sub) => { registeredRoutes.push(sub) });
  }

  router.use(
    pre,
    sub.router.routes(),
    sub.router.allowedMethods()
  );
};

const subs = {
  "/get": { router: getRouter, routes: getRoutes },
  "/edit": { router: editRouter, routes: editRoutes },
  "/find": { router: findRouter, routes: findRoutes },
  "/send": { router: sendRouter, routes: sendRoutes },
  "/tool": { router: toolRouter, routes: toolRoutes },
  "/write": { router: writeRouter, routes: writeRoutes },
};

for (const [pre, sub] of Object.entries(subs)) {
  registerRoutes(pre, sub)
};

router.get("/", (ctx) => {
  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dev Menu</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 10px; }
            a { text-decoration: none; color: #007bff; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>Dev Menu</h1>
        <ul>
            ${registeredRoutes.map((route) => `<li><a href="${route}">${route}</a></li>`).join("")}
        </ul>
    </body>
    </html>
  `;

  ctx.response.status = 200;
  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = html;
});

router.use("/find", findRouter.routes());
router.use("/get", getRouter.routes());
router.use("/tool", toolRouter.routes());
router.use("/write", writeRouter.routes());
router.use("/send", sendRouter.routes());

export default router;
