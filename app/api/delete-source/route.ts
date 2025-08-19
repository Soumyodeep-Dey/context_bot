import { NextResponse } from "next/server";
import { deleteSource } from "@/lib/store";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        deleteSource(id);

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Error in /delete-source:", err);
        return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
    }
}
