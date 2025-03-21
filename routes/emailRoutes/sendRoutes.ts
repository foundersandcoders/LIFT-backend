import { Router } from "oak";
import { z } from "zod";
import { PingRequest } from "../../types/pingTypes.ts";
import { sendPing } from "resendApi/sendPing.ts";
import { sendTest } from "resendApi/sendTest.ts";
import { authMiddleware } from "utils/auth/authMiddleware.ts";
const router = new Router();
const routes: string[] = [];

router.post("/ping", authMiddleware, async (ctx) => {
  console.group(`|=== POST "/email/ping" ===`);
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  
  const data: PingRequest = await ctx.request.body.json();

  let { authId, userName, managerName, managerEmail } = data;
  if (!authId) { authId = "0" };
  console.table([
    {is: "authId", value: authId ?? "0" },
    {is: "userName", value: userName},
    {is: "managerName", value: managerName},
    {is: "managerEmail", value: managerEmail}
  ])

  if (!userName || !managerName || !managerEmail) {
    ctx.throw(400, "Missing required parameters");
  };

  const result = await sendPing(authId, userName, managerName, managerEmail);

  ctx.response.status = 200;
  ctx.response.body = {
    success: true,
    result
  };
  
  console.groupEnd();
  console.info(`|==========================`);
});

router.get("/test", async (ctx) => {
  await sendTest();
  ctx.response.status = 200;
  ctx.response.body = ctx.params;
});

routes.push("/ping");
routes.push("/test");

export {
  router as sendRouter,
  routes as sendRoutes
};