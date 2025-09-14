import { NextResponse } from "next/server";
import { listSources } from "@/lib/store";

export async function GET() {
    try {
        const sources = await listSources();
        return NextResponse.json({ sources });
    } catch (err: unknown) {
        console.error("Error in /list-sources:", err);
        return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
    }
}
