import { Context, Next } from "oak";
import { auth } from "./authConfig.ts";
import { getNeo4jUserData } from "./neo4jUserLink.ts";

export async function authMiddleware(ctx: Context, next: Next) {
  try {
    // Get the session from better-auth
    const session = await auth.getSession(ctx.request);
    
    if (!session || !session.user) {
      ctx.response.status = 401;
      ctx.response.body = {
        error: { message: "Not authenticated" }
      };
      return;
    }
    
    // Attach user to context state
    ctx.state.user = session.user;
    
    // Optionally get Neo4j data if needed
    if (ctx.request.url.pathname.includes("/beacon") || 
        ctx.request.url.pathname.includes("/write")) {
      const neo4jData = await getNeo4jUserData(session.user.authId);
      if (neo4jData) {
        ctx.state.neo4jUser = neo4jData;
      }
    }
    
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    ctx.response.status = 401;
    ctx.response.body = {
      error: { message: "Authentication failed" }
    };
  }
}