import { Router } from "oak";
import { sendTest } from "../api/email/sendTest.ts";

const router = new Router();
const routes: string[] = [];

router.get("/test", async () => { await sendTest() });
routes.push("/test");

export { 
  router as pingRouter,
  routes as pingRoutes
};