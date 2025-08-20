import { NextRequest, NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        let url: string | undefined;
        let docs = [];

        try {
            // JSON body (URL upload)
            const body = await req.json();
            url = body?.url;
        } catch {
            // ignore → might be file upload
        }

        if (url) {
            // === Website or remote PDF ===
            if (url.endsWith(".pdf")) {
                // Download PDF to temp file
                const res = await fetch(url);
                if (!res.ok) {
                    return NextResponse.json(
                        { error: `Failed to fetch PDF from URL: ${res.statusText}` },
                        { status: 400 }
                    );
                }
                const buffer = Buffer.from(await res.arrayBuffer());
                const uploadDir = path.join(process.cwd(), "uploads");
                await fs.mkdir(uploadDir, { recursive: true });
                const filePath = path.join(uploadDir, `remote-${Date.now()}.pdf`);
                await fs.writeFile(filePath, buffer);

                const loader = new PDFLoader(filePath, { splitPages: true });
                docs = await loader.load();
            } else {
                // Try Cheerio first (fast), then Puppeteer
                try {
                    const cheerioLoader = new CheerioWebBaseLoader(url);
                    docs = await cheerioLoader.load();
                } catch {
                    console.warn("Cheerio failed, falling back to Puppeteer...");
                    const puppeteerLoader = new PuppeteerWebBaseLoader(url, {
                        launchOptions: { headless: "new" },
                        gotoOptions: { waitUntil: "domcontentloaded" },
                    });
                    docs = await puppeteerLoader.load();
                }
            }

            // Add metadata
            docs.forEach((doc) => {
                doc.metadata.source = url;
            });
        } else {
            // === File upload ===
            const formData = await req.formData();
            const file = formData.get("file") as File;

            if (!file) {
                return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
            }

            const bytes = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), "uploads");
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, file.name);
            await fs.writeFile(filePath, bytes);

            if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                const loader = new PDFLoader(filePath, { splitPages: true });
                docs = await loader.load();
            } else {
                return NextResponse.json(
                    { error: "Only PDF uploads supported here." },
                    { status: 400 }
                );
            }

            docs.forEach((doc) => {
                doc.metadata.source = file.name;
            });
        }

        // === Split text into chunks ===
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(docs);

        // === Embed & store in Qdrant ===
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "myrag-collection",
        });

        return NextResponse.json({
            success: true,
            message: url
                ? `Website (${url}) indexed successfully!`
                : `File indexed successfully!`,
        });
    } catch (err) {
        console.error("Error in /store-website:", err);
        return NextResponse.json(
            { error: "Failed to fetch or parse website/PDF" },
            { status: 500 }
        );
    }
}
