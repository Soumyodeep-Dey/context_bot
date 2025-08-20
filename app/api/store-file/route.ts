import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

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
        if (file.type === "application/pdf") {
            loader = new PDFLoader(filePath, { splitPages: true });
        } else if (file.type === "text/csv") {
            loader = new CSVLoader(filePath);
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            loader = new TextLoader(filePath);
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        // Load documents
        const rawDocs = await loader.load();

        // Split into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const docs = await splitter.splitDocuments(rawDocs);

        // Add metadata (source = filename)
        docs.forEach((doc) => {
            doc.metadata.source = file.name;
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
