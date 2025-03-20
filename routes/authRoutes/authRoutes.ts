import { Router } from "oak";
import { z } from "zod";

const router = new Router();
const routes: string[] = [];

router.post("/signin/magic-link", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const { email, callbackURL = "/" } = body;

    /* Overview
      **Content-Type**: application/json
      **Credentials**: include
      */
    
    /* Behaviour
      - Generate a secure, time-limited token (typically 5-10 minutes)
      - Associate token with the provided email
      - Send an email to the user containing a link to the application with the token as a URL parameter
      - The email link should be formatted as: `https://your-app-url.com?token=GENERATED_TOKEN`
      - Note: While the frontend code uses `/main` in some places, the actual app structure routes to the root path `/` after authentication, as shown in the App.tsx component
      */
    
    console.log("WIP");
    
    ctx.response.status = 200;
    ctx.response.body = { message: "Magic link sent" };
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
});

router.get("/verify?token={token}", /* async */ (ctx) => {
  try {
    /* Overview
      **Content-Type**: application/json
      **Credentials**: include
      **Query Parameters**:
      - `token`: The token to verify
      */
    
    const token = ctx.request.url.searchParams.get("token");
    console.log(token);

    /* Behaviour
      - Validate the token (check expiration, integrity)
      - If valid, create or retrieve the user associated with the email
      - Set authentication cookies or session information
      - Return user data
      */
    
    ctx.response.status = 200;
    ctx.response.body = {
      "user": {
        "id": "user_id_string",
        "email": "user@example.com",
        "username": "optional_username"
      }
    };
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
});

router.get("/get-user", /* async */ (ctx) => {
  try {
    /* Overview
      - **URL**: `/auth/user`
      - **Method**: GET
      - **Content-Type**: application/json
      - **Credentials**: include
      */
    
    /* Response
      - Success: HTTP 200 with user data:
        ```json
        {
          "user": {
            "id": "user_id_string",
            "email": "user@example.com",
            "username": "optional_username"
          }
        }
        ```
      
      */
  } catch {
    ctx.response.status = 401;
    // ctx.response.status = 404;
    ctx.response.body = {
      message: "Not authenticated"
    };
  }
  
  /* Behaviour
  - Check for valid session or authentication cookies
  - If authenticated, return the current user's data
  - Otherwise, indicate that no user is authenticated
  */
});

router.post("/sign-out", async (ctx) => {
  try {
    /* Overview
      - **URL**: `/auth/signout`
      - **Method**: POST
      - **Content-Type**: application/json
      - **Credentials**: include
    */
    const body = await ctx.request.body.json();
    
    /* Behaviour
      - Clear authentication cookies or invalidate the session
      - Perform any necessary cleanup
    */
    console.log("WIP");

    /* Response
      - Success: HTTP 200 with confirmation
      - Error: Appropriate HTTP error code
    */
    ctx.response.status = 200;
    ctx.response.body = { message: "Signed out" };
  } catch (error) {
    console.error(error);

    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
});

routes.push("/sign-in");
routes.push("/verify");
routes.push("/get-user");
routes.push("/sign-out");

export {
  router as authRouter,
  routes as authRoutes
};
