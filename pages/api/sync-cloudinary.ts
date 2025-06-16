// pages/api/sync-cloudinary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from "cloudinary";
import { Pool } from 'pg';
import { pipeline } from '@xenova/transformers';
import fetch from 'node-fetch';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateEmbedding(text: string) {
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );
  
  const result = await extractor(text, {
    pooling: 'mean',
    normalize: true
  });
  
  return Array.from(result.data);
}

async function processDocument(resource: any) {
  try {
    // Download PDF from Cloudinary
    const response = await fetch(resource.secure_url);
    const pdfBuffer = await response.buffer();
    
    // Extract text and metadata
    const pdfData = await pdf(pdfBuffer);
    const text = pdfData.text;
    
    if (!text?.trim()) {
      console.warn(`No text found in document: ${resource.public_id}`);
      return null;
    }

    // Generate embedding
    const embedding = await generateEmbedding(text);

    // Prepare metadata
    const metadata = {
      fileName: resource.public_id.split('/').pop(),
      uploadDate: new Date(resource.created_at).toISOString(),
      fileSize: resource.bytes,
      pages: pdfData.numpages,
      format: resource.format,
      category: resource.folder || 'Uncategorized'
    };

    // Store in database
    const vectorString = `[${embedding.join(',')}]`;
    
    const result = await pool.query(
      `INSERT INTO documents 
        (title, content, pdf_url, embedding, metadata)
       VALUES ($1, $2, $3, $4::vector, $5)
       ON CONFLICT (pdf_url) DO UPDATE SET
        embedding = $4::vector,
        metadata = $5,
        updated_at = NOW()
       RETURNING id`,
      [
        metadata.fileName,
        text,
        resource.secure_url,
        vectorString,
        metadata
      ]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error(`Error processing document ${resource.public_id}:`, error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all PDFs from Cloudinary
    const { resources } = await cloudinary.search
      .expression('resource_type:raw AND format:pdf')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    console.log(`Found ${resources.length} PDFs in Cloudinary`);

    // Process each document
    const results = await Promise.all(
      resources.map(processDocument)
    );

    const successCount = results.filter(Boolean).length;
    
    res.status(200).json({
      message: `Processed ${successCount} out of ${resources.length} documents`,
      processed: successCount,
      total: resources.length,
      failed: resources.length - successCount
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Sync failed'
    });
  }
}

// This endpoint will:
// 1. Get all PDFs from Cloudinary
// 2. Generate embeddings
// 3. Store in Neon with proper metadata
