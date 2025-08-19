import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { randomUUID } from "crypto";
import { addSource } from "@/lib/store";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { content } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        // Generate embedding
        const result = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: content,
        });

        const embedding = result.data[0].embedding;

        // Create source object
        const newSource = {
            id: randomUUID(),
            type: "text" as const,
            content,
            embedding,
        };

        // Save to in-memory store
        addSource(newSource);

        return NextResponse.json({ success: true, source: newSource });
    } catch (err: unknown) {
        console.error("Error in /store-text:", err);
        return NextResponse.json({ error: "Failed to store text" }, { status: 500 });
    }
}
