// lib/embeddings.ts
export async function createEmbedding(text: string) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );

    const result = await response.json();
    return result[0]; // This will be your embedding vector
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}
