import neo4j, { Driver } from "neo4j";
import { nextDate } from "jsr:@coven/cron";
import { creds as c } from "utils/creds/neo4jCred.ts";

export const nudgeSched = "0 */4 * * *"; // Once every 4 hours

const nextRun = () => {
  return nextDate(new Date())(nudgeSched);
};

export async function nudgeDb() {
  let driver: Driver | null = null;
  console.groupCollapsed("|============ DB Nudger ============|");

  console.log(`| Opening driver`);
  try {
    driver = neo4j.driver(c.URI, neo4j.auth.basic(c.USER, c.PASSWORD));
    console.log(`| Nudge successful`);
  } catch (err) {
    console.error(`| Nudge failed: ${err}`);
  } finally {
    if (driver) await driver.close();
    console.log(`| Driver closed`);
    console.log(`| Next run: ${nextRun()}`);
  }

  console.groupEnd();
}
