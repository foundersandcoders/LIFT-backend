import neo4j, { Driver } from "neo4j";
import { creds as c } from "utils/creds/neo4jCred.ts";
import { Context, Next } from "oak";

/**
 * Middleware that links authenticated users to Neo4j
 * Run this after authMiddleware to ensure user exists in both systems
 */
export async function neo4jUserLinkMiddleware(ctx: Context, next: Next) {
  try {
    const user = ctx.state.user;
    
    if (!user || !user.id || !user.authId) { return await next() };
    
    await ensureUserInNeo4j(user.authId, user.email, user.username);
    
    await next();
  } catch (error) {
    console.error("Neo4j user link error:", error);
    await next();
  }
}

/**
 * Creates or updates a user in Neo4j with the authId
 */
async function ensureUserInNeo4j(authId: string, email: string, username?: string) {
  let driver: Driver | undefined;
  
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
    
    await driver.executeQuery(
      `MERGE (u:User {authId: $authId})
       ON CREATE SET 
         u.email = $email,
         u.username = $username,
         u.createdAt = datetime()
       ON MATCH SET
         u.email = $email,
         u.username = $username
       RETURN u`,
      { 
        authId, 
        email,
        username: username || null
      },
      { database: "neo4j" }
    );
    
    return true;
  } catch (error) {
    console.error("Neo4j user ensure error:", error);
    return false;
  } finally {
    await driver?.close();
  }
}

/**
 * Utility function to get a user's Neo4j data
 */
export async function getNeo4jUserData(authId: string) {
  let driver: Driver | undefined;
  
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    await driver.getServerInfo();
    
    const result = await driver.executeQuery(
      `MATCH (u:User {authId: $authId})
       OPTIONAL MATCH (u)-[:HAS_MANAGER]->(m:User)
       RETURN u, m.name as managerName, m.email as managerEmail`,
      { authId },
      { database: "neo4j" }
    );
    
    if (result.records.length === 0) {
      return null;
    }
    
    const record = result.records[0];
    const user = record.get("u").properties;
    
    const managerName = record.get("managerName");
    const managerEmail = record.get("managerEmail");
    
    if (managerName || managerEmail) {
      user.manager = {
        name: managerName,
        email: managerEmail,
      };
    }
    
    return user;
  } catch (error) {
    console.error("Neo4j user data error:", error);
    return null;
  } finally {
    await driver?.close();
  }
}