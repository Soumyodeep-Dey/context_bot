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

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save file to /uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, buffer);

        // Choose loader depending on file type
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
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        // Load documents
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

        // Embed & store
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "myrag-collection",
        });

        return NextResponse.json({
            success: true,
            message: `File (${file.name}) indexed successfully!`,
        });
    } catch (error) {
        console.error("Error storing file:", error);
        return NextResponse.json(
            { error: "Failed to store file" },
            { status: 500 }
        );
    }
}
