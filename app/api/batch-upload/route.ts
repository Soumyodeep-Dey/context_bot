import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { VTTLoader } from "@/lib/vtt-loader";

interface ProcessingResult {
    success: boolean;
    filename: string;
    chunks: number;
    error?: string;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        
        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const results: ProcessingResult[] = [];
        const batchSize = 10; // Process 10 files at a time
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        // Process files in batches to avoid memory issues
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const batchResults = await processBatch(batch, uploadDir);
            results.push(...batchResults);
            
            // Add small delay between batches to prevent overwhelming the system
            if (i + batchSize < files.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const totalChunks = results.reduce((sum, r) => sum + r.chunks, 0);

        return NextResponse.json({
            success: true,
            message: `Processed ${files.length} files: ${successful} successful, ${failed} failed`,
            results: {
                total: files.length,
                successful,
                failed,
                totalChunks,
                details: results
            }
        });

    } catch (error) {
        console.error("Error in batch upload:", error);
        return NextResponse.json(
            { error: "Failed to process batch upload" },
            { status: 500 }
        );
    }
}

async function processBatch(files: File[], uploadDir: string): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    // Process files in parallel within the batch
    const promises = files.map(async (file) => {
        try {
            return await processFile(file, uploadDir);
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            return {
                success: false,
                filename: file.name,
                chunks: 0,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    return results;
}

async function processFile(file: File, uploadDir: string): Promise<ProcessingResult> {
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, buffer);

    // Choose loader based on file type
    let loader;
    const fileName = file.name.toLowerCase();
    
    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
        loader = new PDFLoader(filePath, { splitPages: true });
    } else if (file.type === "text/csv" || fileName.endsWith(".csv")) {
        loader = new CSVLoader(filePath);
    } else if (file.type === "text/plain" || fileName.endsWith(".txt")) {
        loader = new TextLoader(filePath);
    } else if (fileName.endsWith(".vtt")) {
        loader = new VTTLoader(filePath);
    } else {
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
    }

    // Load and process documents
    const rawDocs = await loader.load();
    
    // Split into chunks with optimized settings for VTT files
    const chunkSize = fileName.endsWith(".vtt") ? 500 : 1000; // Smaller chunks for VTT
    const chunkOverlap = fileName.endsWith(".vtt") ? 50 : 200;
    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });
    
    const docs = await splitter.splitDocuments(rawDocs);

    // Add metadata
    docs.forEach((doc) => {
        doc.metadata.source = file.name;
        doc.metadata.type = fileName.endsWith(".vtt") ? "vtt" : "file";
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
        filename: file.name,
        chunks: docs.length
    };
}
