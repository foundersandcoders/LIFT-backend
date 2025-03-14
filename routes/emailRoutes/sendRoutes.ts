import { Router } from "oak";
import { z } from "zod";
import { EmailRequest } from "types/emailTypes.ts";
import { sendPing } from "resendApi/sendPing.ts";
import { sendTest } from "resendApi/sendTest.ts";

const router = new Router();
const routes: string[] = [];

router.post("/ping", async (ctx) => {
  console.group(`=== POST("/email/ping") ===`);
    const data:EmailRequest = await ctx.request.body.json();

    const { userId, userName, managerName, managerEmail } = data;

    console.table([ /* Show Parameters */
      {is: "userId", value: userId },
      {is: "userName", value: userName},
      {is: "managerName", value: managerName},
      {is: "managerEmail", value: managerEmail}
    ])

    if ( !userName || !managerName || !managerEmail ) {
      ctx.throw(400, "Missing required parameters")
    }

    console.group(`=== Calling sendPing() ===`);
      console.log(`Sending (${userId}, ${userName}, ${managerName}, ${managerEmail})`);
      
      await sendPing(userId, userName, managerName, managerEmail);
      
      console.groupEnd();
    console.info(`===========================`);

    ctx.response.status = 200;
    ctx.response.body = { success: true };
    
    console.groupEnd();
  console.info(`==========================`);
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