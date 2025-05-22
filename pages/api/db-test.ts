import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const value = "Connected!";
    
    const result = await sql`SELECT ${value}`;

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("❌ Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
}
