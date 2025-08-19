import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { randomUUID } from "crypto";
import { addSource } from "@/lib/store";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        const response = await fetch(url);
        const html = await response.text();

        // Basic text cleanup
        const text = html.replace(/<[^>]*>?/gm, "").slice(0, 2000); // limit to 2000 chars

        const result = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });

        const embedding = result.data[0].embedding;

        const newSource = {
            id: randomUUID(),
            type: "website" as const,
            content: text,
            embedding,
        };

        addSource(newSource);

        return NextResponse.json({ success: true, source: newSource });
    } catch (err: unknown) {
        console.error("Error in /store-website:", err);
        return NextResponse.json({ error: "Failed to fetch website" }, { status: 500 });
    }
}
