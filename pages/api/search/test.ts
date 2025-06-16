// pages/api/search/test.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool, PoolClient } from 'pg';

interface TestResponse {
  status: 'success' | 'error';
  tests?: {
    database: {
      connected: boolean;
      timestamp: Date;
    };
    pgvector: {
      installed: boolean;
    };
    documents: {
      exists: boolean;
    };
  };
  message?: string;
  details?: string;
}

interface DbTestResult {
  now: Date;
}

interface ExistsResult {
  exists: boolean;
}

// Initialize the pool
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  console.log('Test endpoint hit');
  
  let client: PoolClient;
  try {
    client = await pool.connect();
    
    // Basic connection test
    const dbTest = await client.query<DbTestResult>('SELECT NOW();');
    console.log('Database connection successful');

    // Test pgvector extension
    const vectorTest = await client.query<ExistsResult>(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'vector'
      );
    `);
    console.log('Vector extension test:', vectorTest.rows[0]);

    // Test documents table
    const documentsTest = await client.query<ExistsResult>(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'documents'
      );
    `);
    console.log('Documents table test:', documentsTest.rows[0]);

    res.status(200).json({
      status: 'success',
      tests: {
        database: {
          connected: true,
          timestamp: dbTest.rows[0].now
        },
        pgvector: {
          installed: vectorTest.rows[0].exists
        },
        documents: {
          exists: documentsTest.rows[0].exists
        }
      }
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      details: process.env.NODE_ENV === 'development' && error instanceof Error 
        ? error.stack 
        : undefined
    });
  } finally {
    if (client!) {
      client.release();
    }
  }
}
