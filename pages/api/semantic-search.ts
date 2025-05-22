import type { NextApiRequest, NextApiResponse } from "next";
import { createEmbedding } from "../../lib/embeddings";
import { preprocessQuery } from "../../lib/search-utils";
import { SearchResponse } from "../../types/search";
import { query, healthCheck } from "../../lib/db-connector"; // Use the centralized connector

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  console.log("=== 🚀 Starting Hybrid Semantic Search ===");

  if (req.method !== "POST") {
    console.error("❌ Invalid request method:", req.method);
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }

  const startTime = Date.now();
  const { query: searchQuery } = req.body;

  if (!searchQuery?.trim()) {
    console.error("❌ Empty search query received.");
    return res.status(400).json({
      success: false,
      error: "Query is required",
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }

  try {
    console.log("🔎 Checking vector count in DB...");
    const vectorCountResult = await query(`
      SELECT COUNT(*) AS count
      FROM aildb
      WHERE vector IS NOT NULL
    `);

    console.log("📊 Raw Vector Count Query Result:", JSON.stringify(vectorCountResult, null, 2));

    const vectorCount = parseInt(vectorCountResult?.rows?.[0]?.count || "0");
    console.log(`🛠 Found ${vectorCount} documents with vectors`);

    if (vectorCount === 0) {
      console.warn("⚠️ No vectors found in the database.");
      return res.status(200).json({
        success: true,
        results: [],
        metadata: {
          queryTime: `${Date.now() - startTime}ms`,
          totalResults: 0,
          message: "No vectors found in the database",
        },
      });
    }

    console.log("✨ Generating vector for search query:", searchQuery);
    const searchVector = await createEmbedding(preprocessQuery(searchQuery));

    if (!searchVector || !Array.isArray(searchVector) || searchVector.length === 0) {
      throw new Error("❌ Failed to generate search vector.");
    }

    console.log("🔹 Generated search vector:", JSON.stringify(searchVector));

    // Serialize the search vector as a string for parameterized queries
    const searchVectorString = `{${searchVector.join(",")}}`; // Format as a PostgreSQL array
    console.log("💡 Executing search query...");

    const searchQueryText = `
      SELECT 
        id, title, content, category, "Date", url, 
        1 - (vector <-> $1) as similarity
      FROM aildb
      WHERE vector IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 10
    `;

    console.log("🛠 FINAL Search Query Being Executed:", searchQueryText);

    // Use the dynamic query based on the DB provider
    const searchResults = await query(searchQueryText, [searchVectorString]);

    console.log("📊 Raw Search Query Result:", JSON.stringify(searchResults, null, 2));

    if (!searchResults?.rows || searchResults.rows.length === 0) {
      console.warn("⚠️ No matching documents found.");
      return res.status(200).json({
        success: true,
        results: [],
        metadata: {
          queryTime: `${Date.now() - startTime}ms`,
          totalResults: 0,
          message: "No matching documents found",
        },
      });
    }

    const results = searchResults.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      date: row.Date,
      url: row.url,
      similarity: parseFloat(row.similarity),
    }));

    console.log("✅ Formatted search results:", JSON.stringify(results, null, 2));

    const queryTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      results,
      metadata: {
        queryTime: `${queryTime}ms`,
        totalResults: results.length,
      },
    });
  } catch (error) {
    console.error("❌ Semantic search error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }
}
