// scripts/add-test-documents.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addTestDocuments() {
  try {
    // First, ensure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        embedding vector(384)
      );
    `);

    // Add some test documents
    const testDocs = [
      {
        title: 'Test Document 1',
        content: 'This is a test document about software development.',
        category: 'Technical'
      },
      {
        title: 'Test Document 2',
        content: 'Another test document about database management.',
        category: 'Technical'
      },
      {
        title: 'Test Document 3',
        content: 'A document about project management and planning.',
        category: 'Management'
      }
    ];

    for (const doc of testDocs) {
      await pool.query(`
        INSERT INTO documents (title, content, category)
        VALUES ($1, $2, $3)
      `, [doc.title, doc.content, doc.category]);
    }

    console.log('Test documents added successfully');
  } catch (error) {
    console.error('Error adding test documents:', error);
  } finally {
    await pool.end();
  }
}

addTestDocuments();
