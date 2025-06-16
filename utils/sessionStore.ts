// lib/sessionStore.ts
// Update the import path if your db utility is in a different location, e.g. '../db' or '../lib/db'
// import { query } from '../db';

// If the file does not exist, create a new db.ts file in the same directory with a 'query' export:
import { queryWithRetry, healthCheck } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function createSearchSession() {
  const sessionId = uuidv4();
  const tempTableName = `temp_search_${sessionId.replace(/-/g, '_')}`;
  
  try {
    // Validate tempTableName to contain only allowed characters (alphanumeric and underscores)
    if (!/^temp_search_[a-zA-Z0-9_]+$/.test(tempTableName)) {
      throw new Error('Invalid table name');
    }
    await query(`
      CREATE TEMP TABLE "${tempTableName}" (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding vector(1536)
      ) ON COMMIT DROP;
    `);
    return { sessionId, tempTableName };
  } catch (error) {
    console.error('Error creating search session:', error);
    throw error;
  }
}

export async function cleanupSearchSession(sessionId: string) {
  const tempTableName = `temp_search_${sessionId.replace(/-/g, '_')}`;
  try {
    await query(`DROP TABLE IF EXISTS ${tempTableName};`);
  } catch (error) {
    console.error('Error cleaning up search session:', error);
    throw error;
  }
}
function query(arg0: string) {
  throw new Error('Function not implemented.');
}

