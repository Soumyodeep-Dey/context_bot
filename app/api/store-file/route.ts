import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        // Save file locally
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, buffer);

        // Load PDF into LangChain
        const loader = new PDFLoader(filePath);
        const rawDocs = await loader.load();

        // ✅ Split into smaller chunks for better retrieval
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const docs = await splitter.splitDocuments(rawDocs);

        // Embed & store in Qdrant
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "myrag-collection", // ✅ must match chat/route.ts
        });

        return NextResponse.json({
            success: true,
            message: "PDF indexed successfully!",
        });
    } catch (error) {
        console.error("Error indexing PDF:", error);
        return NextResponse.json(
            { error: "Failed to index PDF" },
            { status: 500 }
        );
    }
}
