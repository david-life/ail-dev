import formidable from "formidable"; // File upload handling
// @ts-ignore
import { pipeline } from "@xenova/transformers";

import { pipeline } from "@xenova/transformers"; // Correct embedding model usage
import { v2 as cloudinary } from "cloudinary";
import { Pool } from "pg";
import pdf from "pdf-parse";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Define processing steps
export const PROCESSING_STEPS = {
  UPLOAD: "Uploading file...",
  PARSE: "Parsing file...",
  EXTRACT_TEXT: "Extracting text...",
  GENERATE_VECTOR: "Generating vector embedding...",
  SAVE_TO_DB: "Saving document to database...",
};

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database connection using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// API config for handling file uploads
export const config = {
  api: {
    bodyParser: false, // Disabling body parser to handle file uploads
  },
};

// Parse uploaded file using formidable
const parseFile = async (req: NextApiRequest): Promise<any> => {
  const form = formidable({
    uploadDir: "/tmp",
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB limit
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("File parsing error:", err);
        reject(new Error(`Upload error: ${err.message}`));
        return;
      }
      if (!files || !files.pdf) {
        reject(new Error("No PDF file uploaded"));
        return;
      }
      resolve(files);
    });
  });
};

// Upload PDF to Cloudinary
const uploadToCloudinary = async (
  filepath: string
): Promise<{ pdfUrl: string; thumbnailUrl: string }> => {
  try {
    console.log(PROCESSING_STEPS.UPLOAD);

    if (!fs.existsSync(filepath))
      throw new Error(`File not found: ${filepath}`);

    const pdfUpload = await cloudinary.uploader.upload(filepath, {
      resource_type: "raw",
      folder: "pdfs",
      access_mode: "authenticated",
    });
    if (!pdfUpload?.secure_url) throw new Error("Failed to upload PDF.");

    const thumbnailUpload = await cloudinary.uploader.upload(filepath, {
      resource_type: "image",
      format: "jpg",
      folder: "pdf_thumbnails",
      pages: "1",
      transformation: [{ width: 300, height: 200, crop: "fill" }],
    });
    if (!thumbnailUpload?.secure_url)
      throw new Error("Failed to upload thumbnail.");

    return {
      pdfUrl: pdfUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Extract text from PDF
const extractText = async (
  filepath: string
): Promise<{ text: string; pages: number; info: any }> => {
  try {
    console.log(PROCESSING_STEPS.EXTRACT_TEXT);

    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer);
    return {
      text: data.text.replace(/\s+/g, " ").trim(),
      pages: data.numpages,
      info: data.info || {},
    };
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

// Load embedding model globally
let extractor: pipeline | null = null;
const loadModel = async () => {
  if (!extractor) {
    console.log("Loading embedding model...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model loaded successfully.");
  }
};

// Generate vector embedding
const generateVector = async (text: string): Promise<number[]> => {
  await loadModel(); // Ensure model is loaded

  try {
    console.log(PROCESSING_STEPS.GENERATE_VECTOR);

    console.log("Processing text for embedding...");
    const result = await extractor(text, { pooling: "mean", normalize: true });

    if (!result?.data || Object.keys(result.data).length === 0) {
      throw new Error("Embedding generation failed: No valid data returned.");
    }

    console.log("Raw embedding result:", JSON.stringify(result.data, null, 2));

    // Convert token embeddings object to array
    const vector = Object.values(result.data).map((value) =>
      isNaN(value) ? 0 : value
    ); // Prevent division by zero

    console.log("Final averaged vector:", vector);
    if (vector.every((v) => v === 0)) {
      throw new Error(
        "Embedding generation failed: Vector contains only zeros."
      );
    }

    return vector;
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
};

// Save document info to database
const saveDocument = async (
  title: string,
  content: string,
  pdfUrl: string,
  thumbnailUrl: string,
  vector: number[]
): Promise<{ documentId: number; pdfUrl: string; thumbnailUrl: string }> => {
  try {
    console.log(PROCESSING_STEPS.SAVE_TO_DB);

    if (vector.length !== 384)
      throw new Error("Database save failed: Vector size mismatch.");

    const result = await pool.query(
      `INSERT INTO aildb (title, description, content, category, "Date", url, thumbnail_url, vector) 
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING id`,
      [
        title,
        content.substring(0, 200) + "...",
        content,
        "Uploaded Document",
        pdfUrl,
        thumbnailUrl,
        `[${vector.join(",")}]`,
      ]
    );

    return { documentId: result.rows[0].id, pdfUrl, thumbnailUrl };
  } catch (error: any) {
    console.error("Database save error:", error);
    throw new Error(`Database save failed: ${error.message}`);
  }
};

// API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log(PROCESSING_STEPS.UPLOAD);
    const files = await parseFile(req);
    const file = files.pdf[0];

    console.log(PROCESSING_STEPS.PARSE);
    const { pdfUrl, thumbnailUrl } = await uploadToCloudinary(file.filepath);

    console.log(PROCESSING_STEPS.EXTRACT_TEXT);
    const { text, pages } = await extractText(file.filepath);

    console.log(PROCESSING_STEPS.GENERATE_VECTOR);
    const vector = await generateVector(text);

    console.log(PROCESSING_STEPS.SAVE_TO_DB);
    const { documentId } = await saveDocument(
      file.originalFilename || "Untitled",
      text,
      pdfUrl,
      thumbnailUrl,
      vector
    );

    return res
      .status(200)
      .json({ success: true, documentId, pdfUrl, thumbnailUrl });
  } catch (error: any) {
    console.error("Error handling upload:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
