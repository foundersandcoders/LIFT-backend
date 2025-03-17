import { Router } from "oak";
import { z } from "zod";

const router = new Router();
const routes: string[] = [];

router.post("/sign-in", async (ctx) => { });

router.get("/verify?token={token}", async (ctx) => { });

router.get("/get-user", async (ctx) => { });

router.post("/sign-out", async (ctx) => { });


routes.push("/sign-in");
routes.push("/verify");
routes.push("/get-user");
routes.push("/sign-out");

export {
  router as authRouter,
  routes as authRoutes
};
