import { prismaClient } from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "No ID provided" });

    try {
        const webinar = await prismaClient.webinar.findUnique({
            where: { id },
        });
        const allWebinars = await prismaClient.webinar.findMany({
            select: { id: true, title: true }
        });
        return NextResponse.json({
            requestedId: id,
            found: !!webinar,
            webinar,
            allWebinars
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Internal Server Error";
        return NextResponse.json({ error: message });
    }
}
