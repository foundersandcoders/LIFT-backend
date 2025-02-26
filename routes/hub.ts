import { Router } from "oak";
import { Subrouter } from "types/project.ts";
import { getRouter, getRoutes } from "routes/get.ts";
import { findRouter, findRoutes } from "routes/find.ts";
import { writeRouter, writeRoutes } from "routes/write.ts";
import { toolRouter, toolRoutes } from "routes/tool.ts";

const router = new Router();
const registeredRoutes: string[] = []; /* Notes
  This is longwinded, but...
  We explicitly track an array of routes & subrouters
  Then we can use `router.get("/")` to create a dynamic menu of routes
*/
const registerRoutes = (prefix: string, subRouter: Subrouter) => {
  subRouter.routes.forEach((route) => {
    registeredRoutes.push(`${prefix}${route}`)
  });

  router.use(
    prefix,
    subRouter.router.routes(),
    subRouter.router.allowedMethods()
  );
};

const subRouters = {
  "/get": { router: getRouter, routes: getRoutes },
  "/find": { router: findRouter, routes: findRoutes },
  "/write": { router: writeRouter, routes: writeRoutes },
  "/tool": { router: toolRouter, routes: toolRoutes },
};
for ( const [prefix, subRouter] of Object.entries(subRouters) ) {
  registerRoutes(prefix, subRouter)
}

router.get("/", (ctx) => {
  const html = `
    <!DOCTYPE html>
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

router.use("/get", getRouter.routes());
router.use("/find", findRouter.routes());
router.use("/write", writeRouter.routes());
router.use("/tool", toolRouter.routes());

export default router;
