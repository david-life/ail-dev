// pages/api/test-embeddings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pipeline } from "@xenova/transformers";

interface ApiResponse {
  success: boolean;
  data?: number[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Get text from query parameter or body
    const text =
      (req.method === "POST" ? req.body.text : req.query.text) ||
      "Test sentence";

    const extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    const result = await extractor(text);

    res.status(200).json({
      success: true,
      data: Array.from(result.data),
    });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
