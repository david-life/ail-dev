import { neon } from "@neondatabase/serverless";

// Dynamic timeout based on environment
const sql = neon(process.env.DATABASE_URL!);

// Function to run database queries with automatic retries (Neon format)
export async function queryWithRetry(text: TemplateStringsArray, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await sql`${text}`; // ✅ Correct for Neon Serverless
      return result;
    } catch (error) {
      console.error(`❌ Query failed (Attempt ${i + 1}):`, error);
      if (error instanceof Error) {
        console.error(error.stack); // Log stack trace for deeper insight
      }
      if (i === retries - 1) return { error: error instanceof Error ? error.message : String(error), success: false };
      await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000)); // Exponential backoff (1s, 2s, 4s)
    }
  }
}

// Health check for database connectivity
export async function healthCheck(): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`SELECT 1`; // ✅ Correct format for Neon Serverless
    console.log("✅ Database connection is healthy");
    return { success: true };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
