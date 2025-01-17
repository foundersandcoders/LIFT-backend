import { Router } from "jsr:@oak/oak/router";
import * as stuff from "../piles/html.tsx";

// Router
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = (stuff.pageStart
    + stuff.header
    + stuff.nav
    + stuff.home
    + stuff.footer
  + stuff.pageEnd);
});

router.get("/who", (ctx) => {
  ctx.response.body = (stuff.pageStart
    + stuff.header
    + stuff.nav
    + stuff.who
    + stuff.footer
  + stuff.pageEnd);
});

router.get("/neo4j", (ctx) => {
  ctx.response.body = (stuff.pageStart
    + stuff.header
    + stuff.nav
    + stuff.neo4j
    + stuff.footer
  + stuff.pageEnd);
});

export default router;