import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const text: string = body?.content ?? body?.text ?? "";

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        // 1. Split text into chunks (consistent with PDFs & websites)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = await splitter.createDocuments([text]);

        // Add metadata so we know it's "raw text"
        docs.forEach((doc, idx) => {
            doc.metadata = {
                source: `text-${Date.now()}-${idx}`,
                type: "text",
            };
        });

        // 2. Create embeddings
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        // 3. Store in Qdrant (same collection as PDFs & websites)
        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "myrag-collection",
        });

        return NextResponse.json({
            success: true,
            message: "Text stored successfully",
            sources: docs.map((doc) => doc.metadata.source),
        });
    } catch (err) {
        console.error("Error in /store-text:", err);
        return NextResponse.json(
            { error: "Failed to store text" },
            { status: 500 }
        );
    }
}
