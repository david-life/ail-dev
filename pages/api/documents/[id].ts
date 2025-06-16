// pages/api/documents/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool, DatabaseError } from 'pg';
import { z } from 'zod'; // Add zod for validation

// Types
interface DocumentResponse {
  success: boolean;
  data?: DocumentData;
  error?: ErrorResponse;
}

interface DocumentData {
  id: string;
  title: string;
  content: string;
  pdf_url: string;
  metadata: Record<string, any>;
  category: string;
  date_created: string;
  last_modified: string;
  views: number;
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Validation schema
const DocumentIdSchema = z.string().uuid();

// Database connection with error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  query_timeout: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocumentResponse>
) {
  const startTime = Date.now();

  try {
    // Method validation
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} is not allowed`
        }
      });
    }

    // Input validation
    const { id } = req.query;
    
    try {
      DocumentIdSchema.parse(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid document ID format',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }

    // Database query with comprehensive error handling
    const result = await pool.query(`
      SELECT 
        d.id,
        d.title,
        d.content,
        d.pdf_url,
        d.metadata,
        d.category,
        d.created_at as date_created,
        d.updated_at as last_modified,
        d.views,
        array_agg(t.name) as tags
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN tags t ON dt.tag_id = t.id
      WHERE d.id = $1
      GROUP BY d.id
    `, [id]);

    // Handle not found case
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: `Document with ID ${id} not found`
        }
      });
    }

    // Update view count
    await pool.query(`
      UPDATE documents 
      SET views = views + 1, 
          last_viewed_at = NOW() 
      WHERE id = $1
    `, [id]);

    // Success response
    const document = result.rows[0];
    const responseTime = Date.now() - startTime;

    res.setHeader('X-Response-Time', responseTime);
    return res.status(200).json({
      success: true,
      data: {
        ...document,
        date_created: new Date(document.date_created).toISOString(),
        last_modified: new Date(document.last_modified).toISOString()
      }
    });

  } catch (error) {
    // Comprehensive error handling
    console.error('Document fetch error:', error);

    if (error instanceof DatabaseError) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}
