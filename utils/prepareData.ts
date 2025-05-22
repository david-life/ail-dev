// lib/prepareData.ts
import { createEmbedding } from '../lib/embeddings';
import { queryWithRetry } from '../lib/db';
export async function indexDocument(title: string, content: string) {
  const embedding = await createEmbedding(content);
  
  try {
    await queryWithRetry(
      `INSERT INTO documents (title, content, embedding) 
       VALUES ($1, $2, $3)`,
      [title, content, embedding]
    );
  } catch (error) {
    console.error('Error indexing document:', error);
    throw error;
  }
}
