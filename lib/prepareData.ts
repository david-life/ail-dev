// lib/prepareData.ts
import { generateLocalEmbedding } from "./embeddings";
import { queryWithRetry } from "./db";
export async function indexDocument(title: string, content: string) {
  const embedding = await generateLocalEmbedding(content);

  try {
    await queryWithRetry(
      `INSERT INTO documents (title, content, embedding) 
       VALUES ($1, $2, $3)`,
      [title, content, embedding]
    );
  } catch (error) {
    console.error("Error indexing document:", error);
    throw error;
  }
}
