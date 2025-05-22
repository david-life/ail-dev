import { pipeline } from '@xenova/transformers';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import { Pool } from 'pg';
import pdf from 'pdf-parse';
import fs from 'fs';

// API config for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Parse uploaded file
const parseFile = async (req) => {
  const form = formidable({
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('File parsing error:', err);
        reject(new Error(`Upload error: ${err.message}`));
        return;
      }
      
      if (!files || !files.pdf) {
        reject(new Error('No PDF file uploaded'));
        return;
      }

      resolve(files);
    });
  });
};

// Upload PDF & Generate Thumbnail
const uploadToCloudinary = async (filepath) => {
  try {
    // Upload PDF as a raw file
    const pdfUpload = await cloudinary.uploader.upload(filepath, {
      resource_type: "raw",
      folder: "pdfs",
      access_mode: "authenticated"
    });

    // Generate thumbnail from first page of PDF
    const thumbnailUpload = await cloudinary.uploader.upload(filepath, {
      resource_type: "image",
      format: "jpg",
      folder: "pdf_thumbnails",
      pages: "1",
      transformation: [{ width: 300, height: 200, crop: "fill" }]
    });

    return { pdfUrl: pdfUpload.secure_url, thumbnailUrl: thumbnailUpload.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Extract text from PDF
const extractText = async (filepath) => {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer);
    
    const cleanText = data.text
      .replace(/\s+/g, ' ')
      .trim();

    return { 
      text: cleanText,
      pages: data.numpages,
      info: data.info || {}
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

// Generate vector embedding
const generateVector = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error(`Invalid input: expected string, got ${typeof text}`);
    }

    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/bge-large-en-v1.5',
      { revision: 'main', pooling: 'mean', normalize: true }
    );

    const output = await extractor(text, { pooling: 'mean', normalize: true });

    let vector = Array.from(output.data || []);

    if (vector.length !== 1024) {
      throw new Error(`Invalid vector dimension: ${vector.length}. Expected 1024.`);
    }

    return vector;
  } catch (error) {
    console.error('Vector generation error:', error);
    throw new Error(`Vector generation failed: ${error.message}`);
  }
};

// Save document & thumbnail URL to database
const saveDocument = async (title, content, pdfUrl, thumbnailUrl, vector) => {
  try {
    const result = await pool.query(
      `INSERT INTO aildb (title, description, content, category, "Date", url, thumbnail_url, vector) 
      VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7::vector) RETURNING id`,
      [title, content.substring(0, 200) + "...", content, "Uploaded Document", pdfUrl, thumbnailUrl, `[${vector.join(",")}]`]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Database save error:', error);
    throw new Error(`Database save failed: ${error.message}`);
  }
};

// Main handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const files = await parseFile(req);
    const file = files.pdf[0];

    // Upload to Cloudinary & Get Thumbnail
    const { pdfUrl, thumbnailUrl } = await uploadToCloudinary(file.filepath);

    // Extract text
    const { text, pages } = await extractText(file.filepath);

    // Generate vector embedding
    const vector = await generateVector(text);

    // Save to database
    const documentId = await saveDocument(file.originalFilename || "Untitled", text, pdfUrl, thumbnailUrl, vector);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      documentId,
      thumbnailUrl,
      message: "Document processed and vectorized successfully"
    });

  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ success: false, error: error.message || "Processing failed" });
  }
}
