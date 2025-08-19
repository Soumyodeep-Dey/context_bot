import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { randomUUID } from "crypto";
import { addSource } from "@/lib/store";
import pdfParse from "pdf-parse";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        let text = "";
        let sourceType: "file" | "website" = "website";

        // Try to parse as JSON first (for URL uploads)
        let url = "";
        try {
            const body = await req.json();
            url = body.url;
        } catch {
            // Not JSON, try as formData (for file uploads)
        }

        if (url) {
            // URL-based processing
            const response = await fetch(url);
            if (!response.ok) {
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("text/html")) {
                    const html = await response.text();
                    return NextResponse.json({ error: `Failed to fetch URL: Received HTML error page.`, details: html }, { status: 400 });
                }
                return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 400 });
            }
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/pdf") || url.endsWith(".pdf")) {
                // PDF from URL
                const arrayBuffer = await response.arrayBuffer();
                let pdfData;
                try {
                    pdfData = await pdfParse(Buffer.from(arrayBuffer));
                } catch (pdfErr) {
                    console.error("PDF parsing error:", pdfErr);
                    return NextResponse.json({ error: "Failed to parse PDF." }, { status: 400 });
                }
                if (!pdfData.text || pdfData.text.trim().length === 0) {
                    return NextResponse.json({ error: "PDF contains no extractable text." }, { status: 400 });
                }
                text = pdfData.text;
                sourceType = "file";
            } else if (contentType.includes("application/json")) {
                // JSON from URL
                try {
                    const json = await response.json();
                    text = JSON.stringify(json);
                } catch {
                    return NextResponse.json({ error: "Failed to parse JSON from URL." }, { status: 400 });
                }
                sourceType = "website";
            } else {
                // HTML or other text from URL
                const html = await response.text();
                text = html.replace(/<[^>]*>?/gm, "");
                if (!text || text.trim().length === 0) {
                    return NextResponse.json({ error: "Website contains no extractable text." }, { status: 400 });
                }
                sourceType = "website";
            }
        } else {
            // Try to parse as formData (for file uploads)
            const formData = await req.formData();
            const file = formData.get("file");
            if (!file || typeof file === "string") {
                return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
            }
            if (file.type !== "application/pdf") {
                return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
            }
            const arrayBuffer = await file.arrayBuffer();
            let pdfData;
            try {
                pdfData = await pdfParse(Buffer.from(arrayBuffer));
            } catch (pdfErr) {
                console.error("PDF parsing error:", pdfErr);
                return NextResponse.json({ error: "Failed to parse PDF." }, { status: 400 });
            }
            if (!pdfData.text || pdfData.text.trim().length === 0) {
                return NextResponse.json({ error: "PDF contains no extractable text." }, { status: 400 });
            }
            text = pdfData.text;
            sourceType = "file";
        }

        // Chunk text if too large
        const maxChunkLength = 16000; // ~8k tokens
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            chunks.push(text.slice(start, start + maxChunkLength));
            start += maxChunkLength;
        }

        // Get embeddings for each chunk and combine (average)
        const embeddings = [];
        for (const chunk of chunks) {
            const result = await client.embeddings.create({
                model: "text-embedding-3-large",
                input: chunk,
            });
            embeddings.push(result.data[0].embedding);
        }

        // Average embeddings if multiple chunks
        function averageEmbeddings(arrays: number[][]) {
            if (arrays.length === 1) return arrays[0];
            const length = arrays[0].length;
            const avg = Array(length).fill(0);
            for (const arr of arrays) {
                for (let i = 0; i < length; i++) {
                    avg[i] += arr[i];
                }
            }
            for (let i = 0; i < length; i++) {
                avg[i] /= arrays.length;
            }
            return avg;
        }
        const embedding = averageEmbeddings(embeddings);

        const newSource = {
            id: randomUUID(),
            type: sourceType,
            content: text,
            embedding,
        };

        addSource(newSource);

        return NextResponse.json({ success: true, source: newSource });
    } catch (err: unknown) {
        console.error("Error in /store-website:", err);
        return NextResponse.json({ error: "Failed to fetch website or PDF" }, { status: 500 });
    }
}
