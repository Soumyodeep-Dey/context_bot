// lib/file-processor.ts
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { VTTLoader } from "./vtt-loader";
import path from "path";

export interface ProcessingResult {
    success: boolean;
    filename: string;
    chunks: number;
    error?: string;
}

export async function processFile(filePath: string): Promise<ProcessingResult> {
    const fileName = path.basename(filePath);
    const fileExt = fileName.toLowerCase().split('.').pop();

    try {
        // Choose loader based on file type
        let loader;
        
        if (fileExt === 'pdf') {
            loader = new PDFLoader(filePath, { splitPages: true });
        } else if (fileExt === 'csv') {
            loader = new CSVLoader(filePath);
        } else if (fileExt === 'txt') {
            loader = new TextLoader(filePath);
        } else if (fileExt === 'vtt') {
            loader = new VTTLoader(filePath);
        } else {
            throw new Error(`Unsupported file type: ${fileExt}`);
        }

        // Load and process documents
        const rawDocs = await loader.load();
        
        // Split into chunks with optimized settings for VTT files
        const chunkSize = fileExt === 'vtt' ? 500 : 1000; // Smaller chunks for VTT
        const chunkOverlap = fileExt === 'vtt' ? 50 : 200;
        
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize,
            chunkOverlap,
        });
        
        const docs = await splitter.splitDocuments(rawDocs);

        // Add metadata
        docs.forEach((doc) => {
            doc.metadata.source = fileName;
            doc.metadata.type = fileExt === 'vtt' ? 'vtt' : 'file';
        });

        // Create embeddings and store in Qdrant
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "myrag-collection",
        });

        return {
            success: true,
            filename: fileName,
            chunks: docs.length
        };

    } catch (error) {
        return {
            success: false,
            filename: fileName,
            chunks: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

// Batch processing with memory optimization
export async function processBatch(files: string[], batchSize: number = 5): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(filePath => processFile(filePath));
        const batchResults = await Promise.all(batchPromises);
        
        results.push(...batchResults);
        
        // Add delay between batches to prevent overwhelming the system
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}
