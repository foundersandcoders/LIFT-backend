import { Router } from "acorn";
const router = new Router();

router.get("/", () => ({
  query: `( ??? )`,
}));

router.get("/subject/:name", (ctx) => {
  return {
    query: `( ${ctx.params.name} )---[ ??? ]-->( ??? )`,
  };
});

router.get("/object/:name", (ctx) => {
  return {
    query: `( ??? )---[ ??? ]-->( ${ctx.params.name} )`,
  };
});

router.get("/verb/:name", (ctx) => {
  return {
    query: `( ??? )---[ ${ctx.params.name} ]--> ( ??? )`,
  };
});

export default router;
