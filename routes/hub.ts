import { Router } from "oak";
import { getRoutes } from "routes/get.ts";
import { findRoutes } from "routes/find.ts";
import { writeRoutes } from "routes/write.ts";
import { toolRoutes } from "routes/tool.ts";

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = {
    "Routes": {
      "/n": 'Return all nodes with the label ":Person"',
      "/n/s/:name": 'Return relationships with ":name" as subject',
      "/n/o/:name": 'Return relationships with ":name" as object',
      "/v": "Return relationships",
    },
  };
});

router.use("/get", getRoutes.routes());
router.use("/find", findRoutes.routes());
router.use("/write", writeRoutes.routes());
router.use("/tool", toolRoutes.routes());

export default router;
