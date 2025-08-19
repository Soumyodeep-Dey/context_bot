import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { randomUUID } from "crypto";
import { addSource } from "@/lib/store";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const text = await file.text();

        const result = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });

        const embedding = result.data[0].embedding;

        const newSource = {
            id: randomUUID(),
            type: "file" as const,
            content: text,
            embedding,
        };

        addSource(newSource);

        return NextResponse.json({ success: true, source: newSource });
    } catch (err: unknown) {
        console.error("Error in /store-file:", err);
        return NextResponse.json({ error: "Failed to store file" }, { status: 500 });
    }
}
