// pages/api/search/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query: searchQuery } = req.body;
    console.log('Received search query:', searchQuery);

    // First, let's check if we have any documents at all
    const countCheck = await pool.query('SELECT COUNT(*) FROM documents');
    console.log('Total documents in database:', countCheck.rows[0].count);

    // If no documents, return early with helpful message
    if (countCheck.rows[0].count === '0') {
      return res.status(200).json({ 
        message: 'No documents in database',
        results: []
      });
    }

    // Generate embedding
    const embeddingResponse = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: searchQuery,
          options: { wait_for_model: true }
        }),
      }
    );

    const embedding = await embeddingResponse.json();
    console.log('Generated embedding');

    // Lower the similarity threshold and get more results for debugging
    const searchResults = await pool.query(`
      SELECT 
        title,
        content,
        category,
        1 - (embedding <=> $1) as similarity
      FROM documents
      WHERE 1 - (embedding <=> $1) > 0.5  -- Lowered threshold from 0.7 to 0.5
      ORDER BY similarity DESC
      LIMIT 10;  -- Increased limit from 5 to 10
    `, [embedding[0]]);

    console.log('Found results:', searchResults.rows.length);

    // Return more detailed response
    return res.status(200).json({
      message: 'Search completed',
      query: searchQuery,
      resultCount: searchResults.rows.length,
      results: searchResults.rows
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      message: 'Search failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
