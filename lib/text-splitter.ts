// lib/text-splitter.ts

/**
 * Naive character-based splitter with overlap to approximate token limits.
 * Defaults aim for ~1k tokens per chunk assuming ~4 chars/token.
 */
export function splitTextIntoChunks(text: string, chunkSize: number = 4000, overlap: number = 200): string[] {
    if (!text) return [];

    const normalized = text.replace(/\r\n?/g, "\n");

    const chunks: string[] = [];
    let start = 0;
    while (start < normalized.length) {
        const end = Math.min(start + chunkSize, normalized.length);
        const piece = normalized.slice(start, end).trim();
        if (piece.length > 0) {
            chunks.push(piece);
        }
        if (end === normalized.length) break;
        start = end - overlap;
        if (start < 0) start = 0;
    }

    return chunks;
}


