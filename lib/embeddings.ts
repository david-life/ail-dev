// @ts-ignore
import { pipeline } from "@xenova/transformers";

// Global variable to store the embedding extractor pipeline
let extractor: any | null = null;

// Load the model only once
const loadModel = async () => {
  if (!extractor) {
    try {
      console.log("Loading embedding model...");
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );

      if (!extractor) {
        throw new Error("Embedding model failed to load.");
      }

      console.log("Model loaded successfully.");
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }
};

// Function to generate local embeddings
export const generateLocalEmbedding = async (
  query: string
): Promise<number[] | null> => {
  await loadModel(); // Ensure the model is loaded before generating embeddings

  try {
    console.log("Generating embedding...");
    const embedding: number[] = await extractor(query, {
      pooling: "mean",
      normalize: true,
    });

    if (!embedding || embedding.length === 0) {
      throw new Error("Embedding generation failed.");
    }

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};

// Initialize the model at startup
export const initializeEmbeddingModel = loadModel;
