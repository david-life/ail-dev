import { NextApiRequest, NextApiResponse } from "next";
import { queryWithRetry } from "../../lib/db";
import { preprocessQuery } from "../../lib/search-utils";
import { pipeline } from "@xenova/transformers";
import { SearchResponse } from "../../types/search";

// Constants for error messages
const ERROR_QUERY_REQUIRED = "Query parameter is required.";
const ERROR_GENERATION_FAILED = "Failed to generate embedding.";
const ERROR_SERVER = "Internal server error.";
const ERROR_METHOD_NOT_ALLOWED = "Method not allowed.";
const ERROR_MODEL_LOAD_FAILED =
  "Embedding model failed to load. Check dependencies.";

// Cache pipeline to avoid redundant downloads
let extractor: any | null = null;

// Function to initialize model once
async function initializeModel() {
  if (!extractor) {
    console.log("🔍 Loading embedding model...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    if (!extractor) {
      throw new Error(ERROR_MODEL_LOAD_FAILED);
    }
    console.log("✅ Model loaded successfully.");
  }
}

// Function to extract valid query text from nested objects
function extractValidText(query: any): string {
  if (typeof query === "string") return query.trim();
  if (typeof query === "object" && query !== null) {
    for (const key in query) {
      if (typeof query[key] === "string") {
        console.log(`✅ Extracted valid query text: ${query[key]}`);
        return query[key].trim();
      }
    }
  }
  return "";
}

// Function to generate local embeddings
async function generateLocalEmbedding(query: string): Promise<number[]> {
  await initializeModel();

  if (typeof query !== "string") {
    console.error(
      "❌ Invalid query type before embedding:",
      typeof query,
      query
    );
    query = JSON.stringify(query);
  }

  console.log("🔍 Generating embedding for query:", query);

  const embeddingRaw = await extractor(query.trim(), {
    pooling: "mean",
    normalize: true,
  });
  const embedding = Array.isArray(embeddingRaw)
    ? embeddingRaw
    : Array.from(embeddingRaw.data);

  console.log("✅ Generated embedding:", embedding);

  if (!embedding || embedding.length !== 384) {
    throw new Error(ERROR_GENERATION_FAILED);
  }

  return embedding;
}

// API handler function for semantic search
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  console.log("=== Starting Semantic Search ===");

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: ERROR_METHOD_NOT_ALLOWED,
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }

  const startTime = Date.now();
  let searchQuery = req.body?.query;

  console.log("🔍 Debug full request body:", req.body);

  if (typeof searchQuery !== "string") {
    console.error("❌ Invalid query type:", typeof searchQuery, searchQuery);
    searchQuery = extractValidText(searchQuery);
  }

  searchQuery = searchQuery.trim();
  console.log("✅ Final query type:", typeof searchQuery);
  console.log("✅ Final query value:", searchQuery);

  if (!searchQuery) {
    return res.status(400).json({
      success: false,
      error: ERROR_QUERY_REQUIRED,
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }

  try {
    const vectorCountResult = await queryWithRetry(`
      SELECT COUNT(*) FROM aildb WHERE vector IS NOT NULL
    `);

    const vectorCount = parseInt(vectorCountResult.rows[0].count);
    console.log(`✅ Found ${vectorCount} documents with vectors`);

    if (vectorCount === 0) {
      return res.status(200).json({
        success: true,
        results: [],
        metadata: { queryTime: `${Date.now() - startTime}ms`, totalResults: 0 },
      });
    }

    console.log(`🔍 Generating vector for: "${searchQuery}"`);

    const preprocessedQuery = await preprocessQuery(searchQuery);
    console.log("🔍 Preprocessed query:", preprocessedQuery);

    const searchVector = await generateLocalEmbedding(preprocessedQuery);
    console.log("✅ Generated search vector:", searchVector);

    if (!Array.isArray(searchVector) || searchVector.length !== 384) {
      console.error("❌ Invalid search vector format:", searchVector);
      throw new Error(
        "Search vector must be a valid 384-dimension float array."
      );
    }

    console.log(
      "🔍 Checking search vector format before DB query:",
      searchVector
    );

    // ✅ Convert searchVector to properly formatted PGvector string
    const formattedVector = `[${searchVector.join(",")}]`; // ✅ Uses square brackets

    console.log("✅ Formatted search vector for DB:", formattedVector);

    const searchResults = await queryWithRetry(
      `
      SELECT id, title, content, category, "Date", url, 1 - (vector <-> $1) as similarity
      FROM aildb
      WHERE vector IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 10
      `,
      [formattedVector]
    );

    if (!searchResults || !searchResults.rows) {
      console.error("❌ Query returned no results:", searchResults);
      throw new Error("No matching results found.");
    }

    const results = searchResults.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      Date: row.Date,
      url: row.url,
      similarityScore: parseFloat(row.similarity),
    }));

    return res.status(200).json({
      success: true,
      results,
      metadata: {
        queryTime: `${Date.now() - startTime}ms`,
        totalResults: results.length,
      },
    });
  } catch (error) {
    console.error("❌ Semantic search error:", error);
    return res.status(500).json({
      success: false,
      error: ERROR_SERVER,
      results: [],
      metadata: { queryTime: "0ms", totalResults: 0 },
    });
  }
}
