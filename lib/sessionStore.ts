// lib/sessionStore.ts
import { queryWithRetry } from "./db";
import { v4 as uuidv4 } from "uuid";

export async function createSearchSession() {
  const sessionId = uuidv4();
  const tempTableName = `temp_search_${sessionId.replace(/-/g, "_")}`;

  try {
    await queryWithRetry(`
      CREATE TEMP TABLE ${tempTableName} (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding vector(1536)
      ) ON COMMIT DROP;
    `);
    return { sessionId, tempTableName };
  } catch (error) {
    console.error("Error creating search session:", error);
    throw error;
  }
}

export async function cleanupSearchSession(sessionId: string) {
  const tempTableName = `temp_search_${sessionId.replace(/-/g, "_")}`;
  try {
    await queryWithRetry(`DROP TABLE IF EXISTS ${tempTableName};`);
  } catch (error) {
    console.error("Error cleaning up search session:", error);
    throw error;
  }
}
