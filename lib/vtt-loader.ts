// lib/vtt-loader.ts
import { Document } from "@langchain/core/documents";

export class VTTLoader {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async load(): Promise<Document[]> {
        const fs = await import("fs/promises");
        const content = await fs.readFile(this.filePath, "utf-8");
        
        // Parse VTT content
        const vttContent = this.parseVTT(content);
        
        // Create a single document for the entire VTT file
        return [new Document({
            pageContent: vttContent,
            metadata: {
                source: this.filePath.split('/').pop() || this.filePath.split('\\').pop(),
                type: "vtt",
                format: "webvtt"
            }
        })];
    }

    private parseVTT(content: string): string {
        // Remove VTT header and metadata
        let cleanContent = content
            .replace(/^WEBVTT.*$/m, '') // Remove WEBVTT header
            .replace(/^NOTE.*$/gm, '') // Remove NOTE lines
            .replace(/^STYLE.*$/gm, '') // Remove STYLE lines
            .replace(/^REGION.*$/gm, '') // Remove REGION lines
            .trim();

        // Extract text content from cue blocks
        const cueRegex = /(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}(?:\s+[^\n]+)?)\n([^\n]+(?:\n[^\n]+)*)/g;
        const matches = [...cleanContent.matchAll(cueRegex)];
        
        const textBlocks: string[] = [];
        
        for (const match of matches) {
            const timestamp = match[1];
            const text = match[2]
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();
            
            if (text) {
                textBlocks.push(`[${timestamp}] ${text}`);
            }
        }
        
        return textBlocks.join('\n');
    }
}
