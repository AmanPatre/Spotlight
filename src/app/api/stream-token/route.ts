import { StreamClient } from "@stream-io/node-sdk";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = new StreamClient(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_SECRET_KEY!
    );

    console.log("Generating token for user:", user.id);
    const token = client.generateUserToken({ user_id: user.id });
    return NextResponse.json({ token });
  } catch (error: unknown) {
    console.error("Error generating stream token:", error);
    const message = error instanceof Error ? error.message : "Failed to generate token";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
