import { Pool } from 'pg';

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use your DATABASE_URL from the environment
  connectionTimeoutMillis: process.env.NODE_ENV === "production" ? 5000 : 15000, // Timeout for connections
});

// Function to run database queries with automatic retries
export async function queryWithRetry(text: string, values: any[] = [], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, values);
      return result; // Return the query result
    } catch (error) {
      console.error(`❌ Query failed (Attempt ${i + 1}):`, error);
      if (i === retries - 1) {
        return { error: error instanceof Error ? error.message : String(error), success: false }; // Return the error after final attempt
      }
      await new Promise((res) => setTimeout(res, 1000)); // Wait 1s before retrying
    }
  }
}

// Health check for database connectivity
export async function healthCheck(): Promise<{ success: boolean; error?: string }> {
  try {
    // Run a simple query to check the database connectivity
    const result = await pool.query('SELECT 1');
    console.log("✅ Database connection is healthy");
    return { success: true };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
