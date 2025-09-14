import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Simple in-memory queue (in production, use Redis or a proper queue system)
interface QueueJob {
    id: string;
    files: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    results?: any;
    error?: string;
    createdAt: Date;
}

const jobQueue: Map<string, QueueJob> = new Map();

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        
        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        // Create job
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        // Save files and create job
        const filePaths: string[] = [];
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filePath = path.join(uploadDir, file.name);
            await fs.writeFile(filePath, buffer);
            filePaths.push(filePath);
        }

        const job: QueueJob = {
            id: jobId,
            files: filePaths,
            status: 'pending',
            progress: 0,
            createdAt: new Date()
        };

        jobQueue.set(jobId, job);

        // Start processing in background (non-blocking)
        processJob(jobId).catch(console.error);

        return NextResponse.json({
            success: true,
            jobId,
            message: `Job queued with ${files.length} files`,
            status: 'pending'
        });

    } catch (error) {
        console.error("Error queuing upload:", error);
        return NextResponse.json(
            { error: "Failed to queue upload" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
        const job = jobQueue.get(jobId);
        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }
        return NextResponse.json(job);
    }

    // Return all jobs
    return NextResponse.json(Array.from(jobQueue.values()));
}

async function processJob(jobId: string) {
    const job = jobQueue.get(jobId);
    if (!job) return;

    try {
        job.status = 'processing';
        job.progress = 0;

        const results = [];
        const totalFiles = job.files.length;

        for (let i = 0; i < job.files.length; i++) {
            const filePath = job.files[i];
            const fileName = path.basename(filePath);

            try {
                // Import processing function dynamically to avoid circular imports
                const { processFile } = await import('@/lib/file-processor');
                const result = await processFile(filePath);
                results.push({
                    success: true,
                    filename: fileName,
                    chunks: result.chunks
                });
            } catch (error) {
                results.push({
                    success: false,
                    filename: fileName,
                    chunks: 0,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }

            job.progress = Math.round(((i + 1) / totalFiles) * 100);
        }

        job.status = 'completed';
        job.results = {
            total: totalFiles,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            totalChunks: results.reduce((sum, r) => sum + r.chunks, 0),
            details: results
        };

    } catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : "Unknown error";
    }
}
