import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getAllSources } from "@/lib/store";
import { findMostRelevant } from "@/lib/vector-utils";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "No query provided" }, { status: 400 });
        }

        // Embed query
        const result = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: query,
        });

        const queryEmbedding = result.data[0].embedding;

        // Retrieve top 3 relevant docs
        const docs = getAllSources();
        const topDocs = findMostRelevant(queryEmbedding, docs, 3);

        const context = topDocs.map((d) => d.content).join("\n\n");

        // Ask GPT
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant. Use the context to answer." },
                { role: "system", content: `Context:\n${context}` },
                { role: "user", content: query },
            ],
        });

        const answer = response.choices[0].message?.content || "No answer found.";

        return NextResponse.json({ answer, sources: topDocs });
    } catch (err: unknown) {
        console.error("Error in /chat:", err);
        return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
    }
}
