import { pipeline } from '@xenova/transformers';

const USE_HUGGINGFACE_API = process.env.USE_HUGGINGFACE_API === 'true';
const VECTOR_DIMENSIONS = 1024;

// Helper functions
async function createHuggingFaceEmbedding(text: string) {
  // ... (previous implementation)
}

async function createLocalEmbedding(text: string) {
  try {
    console.log('Using local pipeline for embedding generation');
    console.log('Input text length:', text.length);

    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/bge-large-en-v1.5',
      {
        revision: 'main',
        pooling: 'mean',
        normalize: true
      }
    );

    console.log('Pipeline created, processing text...');

    const result = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    let vector;
    if (result && result.data) {
      if (ArrayBuffer.isView(result.data)) {
        vector = Array.from(result.data);
      } else if (Array.isArray(result.data)) {
        vector = Array.isArray(result.data[0]) ? result.data[0] : result.data;
      } else if (typeof result.data === 'object') {
        vector = Array.from(Object.values(result.data));
      }
    }

    if (!vector || !Array.isArray(vector)) {
      throw new Error(`Could not extract vector from result. Data type: ${typeof result.data}`);
    }

    if (vector.length !== VECTOR_DIMENSIONS) {
      throw new Error(`Invalid vector dimension: ${vector.length}. Expected ${VECTOR_DIMENSIONS}`);
    }

    return vector;
  } catch (error) {
    console.error('Local embedding error:', error);
    throw error;
  }
}

// Make sure to export as default AND named export
const createEmbedding = async (text: string) => {
  if (!text || typeof text !== 'string') {
    throw new Error(`Invalid input: expected string, got ${typeof text}`);
  }

  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (cleanText.length === 0) {
    throw new Error('Empty text after cleaning');
  }

  try {
    return USE_HUGGINGFACE_API 
      ? await createHuggingFaceEmbedding(cleanText)
      : await createLocalEmbedding(cleanText);
  } catch (error) {
    console.error('Embedding creation failed:', error);
    throw error;
  }
};

export { createEmbedding };
export default createEmbedding;
