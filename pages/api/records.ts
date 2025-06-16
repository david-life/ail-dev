import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const result = await sql`
      WITH counted_records AS (
        SELECT 
          id, title, description,
          CASE 
            WHEN LENGTH(content) > 500 THEN LEFT(content, 500) || '...'
            ELSE content 
          END as content,
          category, "Date", url, sub_category_old, export,
          COUNT(*) OVER() as total_count
        FROM aildb
        ORDER BY "Date" DESC
        LIMIT ${limit} OFFSET ${offset}
      ) 
      SELECT * FROM counted_records
    `;

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error fetching records:", error);
    console.log("Fetched records:", result);
    console.log("API Records Data:", result);


    res.status(500).json({ error: "Failed to retrieve records", details: error.message });
  }
}
