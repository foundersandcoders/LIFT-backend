import { Router } from "oak";
import { Subrouter } from "../types/project.ts";
import { getRouter, getRoutes } from "./neo4j/getRoutes.ts";
import { findRouter, findRoutes } from "./neo4j/findRoutes.ts";
import { emailRouter, emailRoutes } from "./resend/emailRoutes.ts";
import { toolRouter, toolRoutes } from "./neo4j/toolRoutes.ts";
import { writeRouter, writeRoutes } from "./neo4j/writeRoutes.ts";

const router = new Router();

/* Note: Registered Routes
  This is longwinded, but...
  We explicitly track an array of routes & subrouters
  Then we can use `router.get("/")` to create a dynamic menu of routes
  */
const registeredRoutes: string[] = [];
const registerRoutes = (prefix: string, subRouter: Subrouter) => {
  subRouter.routes.forEach((route) => {
    console.info(`${route} -->`);
    registeredRoutes.push(`${prefix}${route}`)
    console.log(`--> ${route} Done`);
  });

  router.use(
    prefix,
    subRouter.router.routes(),
    subRouter.router.allowedMethods()
  );
};

const subRouters = {
  "/get": {
    router: getRouter,
    routes: getRoutes
  },
  "/email": {
    router: emailRouter,
    routes: emailRoutes
  },
  "/find": {
    router: findRouter,
    routes: findRoutes
  },
  "/tool": {
    router: toolRouter,
    routes: toolRoutes
  },
  "/write": {
    router: writeRouter,
    routes: writeRoutes
  },
};
for (const [prefix, subRouter] of Object.entries(subRouters)) {
  console.group(`Registering ${prefix} routes`);
    registerRoutes(prefix, subRouter);
    console.groupEnd();
  console.info(`============================`);
}

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
router.use("/email", emailRouter.routes());
router.use("/get", getRouter.routes());
router.use("/tool", toolRouter.routes());
router.use("/write", writeRouter.routes());

export default router;
