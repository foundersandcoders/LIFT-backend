import { Router } from "oak";
import { EmailRequest } from "types/emails.ts";
import { sendPing } from "email/sendPing.ts";
import { sendTest } from "email/sendTest.ts";

const router = new Router();
const routes: string[] = [];

router.get("/test", async (ctx) => {
  await sendTest();
  ctx.response.status = 200;
  ctx.response.body = ctx.params;
});
routes.push("/test");

// Note: Old GET Route
//   router.get("/ping", async (ctx) => {
//     const { userId, managerName, managerEmail, userName } = ctx.params;
//     if (!userId || !managerName || !managerEmail || !userName) { ctx.throw(400, "Missing required parameters") };
//     const userIdNum = parseInt(userId!, 10);
//     await sendPing(userIdNum, userName!, managerName!, managerEmail!);
//   });

router.post("/ping", async (ctx) => {
  console.groupCollapsed(`Starting Ping Route`);
  const body = ctx.request.body;
  const data:EmailRequest = await body.json();
  console.log(data);

  const userId = data.userId;
  console.log(userId);

  
  // let params = {};

  // if (bodyResult && bodyResult.type === "json") {
  //   params = await bodyResult.value;
  // } else {
  //   params = { // Fallback: read parameters from headers.
  //     userId: ctx.request.headers.get("userId"),
  //     userName: ctx.request.headers.get("userName"),
  //     managerName: ctx.request.headers.get("managerName"),
  //     managerEmail: ctx.request.headers.get("managerEmail"),
  //   };
  // }

  // const { userId, userName, managerName, managerEmail } = params;
  // if (!userId || !userName || !managerName || !managerEmail) {
  //   ctx.throw(400, "Missing required parameters");
  // }

  // const userIdNum = parseInt(userId, 10);
  // await sendPing(userIdNum, userName, managerName, managerEmail);

  ctx.response.status = 200;
  ctx.response.body = { success: true };
  console.groupEnd();
});
routes.push("/ping");

export { 
  router as emailRouter,
  routes as emailRoutes
};