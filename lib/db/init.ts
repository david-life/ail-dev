// lib/db/init.ts
import pool from './config';

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create vector extension
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
    `);

    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default initializeDatabase;
