// transformers.d.ts
declare module "@xenova/transformers" {
  export class Pipeline {
    static fromPreset(modelId: string): Promise<Pipeline>;
    constructor();
    call(
      text: string,
      options?: {
        pooling?: "mean" | "cls" | "max";
        normalize?: boolean;
      }
    ): Promise<{
      data: Float32Array;
    }>;
  }
}
