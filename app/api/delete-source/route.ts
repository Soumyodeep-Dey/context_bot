import { NextResponse } from "next/server";
import { deleteSource } from "@/lib/store";

export async function POST(req: Request) {
    try {
        const { id, source } = await req.json();

        if (!id && !source) {
            return NextResponse.json({ error: "No ID or source provided" }, { status: 400 });
        }

        // Use source name for deletion (more reliable than ID)
        const sourceName = source || id;
        const success = await deleteSource(sourceName);

        if (!success) {
            return NextResponse.json({ error: "Failed to delete source from database" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Error in /delete-source:", err);
        return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
    }
}
