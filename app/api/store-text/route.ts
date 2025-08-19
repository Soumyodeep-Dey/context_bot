import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { randomUUID } from "crypto";
import { addSource } from "@/lib/store";
import { splitTextIntoChunks } from "@/lib/text-splitter";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const text: string = body?.content ?? body?.text ?? "";

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        const chunks = splitTextIntoChunks(text);

        const result = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: chunks,
        });

        const created: Array<{ id: string; type: "text"; content: string; embedding: number[] }> = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = result.data[i].embedding as number[];
            const newSource = {
                id: randomUUID(),
                type: "text" as const,
                content: chunks[i],
                embedding,
            };
            addSource(newSource);
            created.push(newSource);
        }

        return NextResponse.json({ success: true, sources: created });
    } catch (err: unknown) {
        console.error("Error in /store-text:", err);
        return NextResponse.json({ error: "Failed to store text" }, { status: 500 });
    }
}
