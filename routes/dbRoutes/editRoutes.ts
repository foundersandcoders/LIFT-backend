import { Router } from "oak";
import neo4j, { Driver } from "neo4j";
import { z } from "zod";
import { authMiddleware } from "utils/auth/authMiddleware.ts";
import { creds as c } from "utils/auth/neo4jCred.ts";
import { getNeo4jUserData } from "utils/auth/neo4jUserLink.ts";

const router = new Router();
const routes: string[] = [];

router.put("/editBeacon", authMiddleware, async (ctx) => {
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  try {
    // const body = await ctx.request.body.json();
    // const e = breaker(body.statement);
    
    // if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }

    // console.log("Received new entry:", e);
    // ctx.response.status = 200;
    // ctx.response.body = { message: "Entry received successfully" };

    // await writeBeacon(e);
  } catch (error) {
    // console.error("Error processing entry:", error);
    // ctx.response.status = 400;
    // ctx.response.body = { error: "Invalid input format" };
  }
});

router.put("/deleteBeacon", authMiddleware, async (ctx) => {
  const user = ctx.state.user;
  console.log(`| user: ${JSON.stringify(user)}`);
  try {
    // const body = await ctx.request.body.json();
    // const e = breaker(body.statement);
    
    // if (!e.subject || !e.verb || !e.object) { throw new Error("Missing required fields") }

    // console.log("Received new entry:", e);
    // ctx.response.status = 200;
    // ctx.response.body = { message: "Entry received successfully" };

    // await writeBeacon(e);
  } catch (error) {
    // console.error("Error processing entry:", error);
    // ctx.response.status = 400;
    // ctx.response.body = { error: "Invalid input format" };
  }
});

const editManagerSchema = z.object({
  managerName: z.string(),
  managerEmail: z.string().email("Invalid manager email"),
});

router.put("/editManager", authMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const user = ctx.state.user;
    
    // Validate request body
    const result = editManagerSchema.safeParse(body);
    if (!result.success) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false,
        error: { message: "Invalid request data" }
      };
      return;
    }
    
    const { managerName, managerEmail } = result.data;
    
    // Update manager in Neo4j
    let driver: Driver | undefined;
    
    try {
      driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
      await driver.getServerInfo();
      
      await driver.executeQuery(
        `MATCH (u:User {authId: $authId})
         MERGE (u)-[:HAS_MANAGER]->(m:User {email: $managerEmail})
         ON CREATE SET m.name = $managerName
         ON MATCH SET m.name = $managerName`,
        { authId: user.authId, managerName, managerEmail },
        { database: "neo4j" }
      );
      
      ctx.response.status = 200;
      ctx.response.body = { success: true };
    } catch (error) {
      console.error("Database error:", error);
      ctx.response.status = 500;
      ctx.response.body = { 
        success: false,
        error: { message: "Failed to update manager information" }
      };
    } finally {
      await driver?.close();
    }
  } catch (error) {
    console.error("Error updating manager:", error);
    
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false,
      error: { message: "Internal server error" }
    };
  }
});

routes.push("/editBeacon", "/deleteBeacon", "/editManager");

export {
  router as editRouter,
  routes as editRoutes
};
