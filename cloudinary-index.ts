import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { v2 as cloudinary } from "cloudinary";
import { Pipeline } from "@xenova/transformers"; // Correct import for Pipeline

dotenv.config();
const app = express();
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PostgreSQL Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

// 🗂️ **Fetch All PDFs from Cloudinary (Admin API)**
app.get("/documents", async (req, res) => {
  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: "pdfs/",
      resource_type: "raw",
    });
    res.json(response.resources);
  } catch (error) {
    console.error("Cloudinary Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// 🔍 **Semantic Search (pgvector + Transformers)**
app.post("/api/semantic-search", async (req, res) => {
  try {
    const queryText = req.body.query;

    // Instantiate the Pipeline class (no arguments)
    const embedModel = new Pipeline();

    // Execute the model to get the query vector
    const queryVector = await embedModel.call("feature-extraction", queryText);

    // Perform vector similarity search in PostgreSQL
    const searchQuery = `
      SELECT document_url, text_content 
      FROM aildb 
      ORDER BY vector <-> $1 
      LIMIT 5;
    `;
    const { rows } = await pool.query(searchQuery, [
      JSON.stringify(queryVector),
    ]);

    res.json({ results: rows });
  } catch (error) {
    console.error("Semantic Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// 🚀 Start Server
app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
