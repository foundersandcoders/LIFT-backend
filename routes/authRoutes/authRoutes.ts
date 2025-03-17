import { Router } from "oak";
import { z } from "zod";

const router = new Router();
const routes: string[] = [];

router.post("/", async (ctx) => { });

routes.push("/");

export {
  router as authRouter,
  routes as authRoutes
};
