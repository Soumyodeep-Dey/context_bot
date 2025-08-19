// lib/vector-utils.ts

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vector size mismatch");

  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find top N most relevant vectors using cosine similarity
 */
export function findMostRelevant<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  docs: T[],
  topN: number = 3
): (T & { score: number })[] {
  const scored = docs.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
