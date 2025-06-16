import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';

// Check for environment variable to determine database provider (e.g., "NEON" or "POSTGRES")
const DB_PROVIDER = process.env.DB_PROVIDER || 'POSTGRES'; // Default to PostgreSQL

// Ensure that DATABASE_URL is defined for both providers
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For traditional PostgreSQL (using pg)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 60000, // Increase this timeout
  idleTimeoutMillis: 30000,
  max: 20,
});

// For Neon serverless database
const neonClient = neon(process.env.DATABASE_URL);

// Define a function for querying the database
export async function query(text: string, params: any[] = []) {
  try {
    console.log(`Executing query: ${text} with params: ${JSON.stringify(params)}`);
    
    if (DB_PROVIDER === 'NEON') {
      console.log('Using Neon serverless for query');
      // For Neon, use the tagged template query method
      const result = await neonClient.query(text, ...params);
      return result;
    } else {
      console.log('Using PostgreSQL for query');
      const result = await pgPool.query(text, params);
      return result;
    }
  } catch (error) {
    console.error('Query execution failed:', error);
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Stack Trace:', error.stack);
    }
    if (error instanceof Error) {
      throw new Error(`Database query error: ${error.message}`);
    } else {
      throw new Error('Database query error: Unknown error');
    }
  }
}

// Health check for both databases
export async function healthCheck(): Promise<{ success: boolean; error?: string }> {
  try {
    if (DB_PROVIDER === 'NEON') {
      // For Neon, use the Neon-specific query
      await neonClient.query('SELECT 1'); // A simple query to check the connection
    } else {
      // For PostgreSQL, use a pg query to check the connection
      await pgPool.query('SELECT 1');
    }
    console.log("✅ Database connection is healthy");
    return { success: true };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return { success: false, error: errorMessage };
  }
}

