import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const client = new OpenAI();

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: "http://localhost:6333",
                collectionName: "myrag-collection", // ✅ same name
            }
        );

        const retriever = vectorStore.asRetriever({ k: 10 }); // more chunks
        const relevantChunk = await retriever.invoke(query);

        const SYSTEM_PROMPT = `
      You are an AI assistant. 
      Answer ONLY based on the context below (from uploaded PDFs). 
      If the answer is not in the context, say "I don’t know from the PDF".
      
      Context:
      ${JSON.stringify(relevantChunk)}
    `;

        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: query },
            ],
        });

        return NextResponse.json({ answer: response.choices[0].message.content });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to process query" },
            { status: 500 }
        );
    }
}
