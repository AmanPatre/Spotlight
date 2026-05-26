import { StreamClient } from "@stream-io/node-sdk";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/attendee-stream-token
 * Public endpoint — no Clerk auth required.
 * Body: { attendeeId: string; name?: string }
 * Returns a signed Stream token for the given attendeeId.
 */
export async function POST(req: NextRequest) {
  try {
    const { attendeeId } = await req.json();

    if (!attendeeId || typeof attendeeId !== "string") {
      return NextResponse.json(
        { error: "attendeeId is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const secretKey = process.env.STREAM_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Stream credentials not configured" },
        { status: 500 }
      );
    }

    const client = new StreamClient(apiKey, secretKey);
    const token = client.generateUserToken({ user_id: attendeeId });

    return NextResponse.json({ token });
  } catch (error: unknown) {
    console.error("Error generating attendee stream token:", error);
    const message = error instanceof Error ? error.message : "Failed to generate token";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
