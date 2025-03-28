import { Context, Next } from "oak";
import { auth } from "utils/auth.ts";
import { getNeo4jUserData } from "./neo4jUserLink.ts";

export async function authMiddleware(ctx: Context, next: Next) {
  try {
    console.groupCollapsed("|=== Auth Middleware ===|");
    console.log(`| Path: ${ctx.request.url.pathname}`);
    
    // Get the session from better-auth
    const session = await auth.api.getSession(ctx.request);
    console.log(`| Session: ${session ? "Found" : "Not found"}`);
    
    if (!session || !session.user) {
      console.log("| No authenticated user found");
      console.groupEnd();
      
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        error: { message: "Not authenticated" }
      };
      return;
    }
    
    console.log(`| User: ${session.user.id} (${session.user.email || "no email"})`);
    
    // Attach user to context state
    ctx.state.user = session.user;
    
    // Optionally get Neo4j data if needed
    if (ctx.request.url.pathname.includes("/beacon") || 
        ctx.request.url.pathname.includes("/write")) {
      console.log("| Getting Neo4j user data");
      const neo4jData = await getNeo4jUserData(session.user.id);
      
      if (neo4jData) {
        console.log("| Neo4j data found and attached to context");
        ctx.state.neo4jUser = neo4jData;
      } else {
        console.log("| No Neo4j data found for user");
      }
    }
    
    console.groupEnd();
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    ctx.response.status = 401;
    ctx.response.body = {
      success: false,
      error: { message: "Authentication failed" }
    };
  }
}