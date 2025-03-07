import { Router } from "oak";
import { z } from "zod";
import { EmailRequest } from "../../types/emails.ts";
import { sendPing } from "../../api/resend/sendPing.ts";
import { sendTest } from "../../api/resend/sendTest.ts";

const router = new Router();
const routes: string[] = [];

router.get("/test", async (ctx) => {
  await sendTest();
  ctx.response.status = 200;
  ctx.response.body = ctx.params;
});
routes.push("/test");

/* Note: Old GET Route
  router.get("/ping", async (ctx) => {
    const { userId, managerName, managerEmail, userName } = ctx.params;
    if (!userId || !managerName || !managerEmail || !userName) { ctx.throw(400, "Missing required parameters") };
    const userIdNum = parseInt(userId!, 10);
    await sendPing(userIdNum, userName!, managerName!, managerEmail!);
  }); */

router.post("/ping", async (ctx) => {
  console.group(`=== POST("/email/ping") ===`);
    console.group(`=== Parse Request ===`)
      const data:EmailRequest = await ctx.request.body.json();
      console.log(data);
      const {
        userId,
        userName,
        managerName,
        managerEmail
      } = data;

      if (
        !userId
        || !userName
        || !managerName
        || !managerEmail
      ) { ctx.throw(400, "Missing required parameters") } else {
        console.table([
          {is: "userId", value: userId},
          {is: "userName", value: userName},
          {is: "managerName", value: managerName},
          {is: "managerEmail", value: managerEmail}
        ]);
      }
      console.info(`=====================`);
    console.groupEnd();

    console.group(`=== Call sendPing() ===`);
      await sendPing(
        userId,
        userName,
        managerName,
        managerEmail
      );
      console.info(`=======================`);
    console.groupEnd();

    ctx.response.status = 200;
    ctx.response.body = { success: true };
    console.info(`===========================`);
  console.groupEnd();
});
routes.push("/ping");

export { router as emailRouter, routes as emailRoutes };