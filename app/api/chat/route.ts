import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { getPersona } from "@/lib/personas";

const client = new OpenAI();

export async function POST(req: NextRequest) {
    try {
        const { query, persona = "hitesh" } = await req.json();

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ error: "No query provided" }, { status: 400 });
        }

        // Load embeddings + retriever
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: "http://localhost:6333",
                collectionName: "myrag-collection", // ✅ all formats share this
            }
        );

        const retriever = vectorStore.asRetriever({ k: 10 }); // retrieve top 10
        const relevantChunk = await retriever.invoke(query);

        // Get persona and create system prompt
        const selectedPersona = getPersona(persona);
        const SYSTEM_PROMPT = selectedPersona ? `
${selectedPersona.systemPrompt}

Answer ONLY based on the retrieved context below (from uploaded PDFs, websites, or pasted text).
If the answer is not in the context, reply exactly: "I don't know from the provided sources."

Context:
${JSON.stringify(relevantChunk)}
        ` : `
You are an AI assistant.
Answer ONLY based on the retrieved context below (from uploaded PDFs, websites, or pasted text).
If the answer is not in the context, reply exactly: "I don't know from the provided sources."

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
