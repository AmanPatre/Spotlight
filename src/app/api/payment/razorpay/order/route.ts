import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const { webinarId } = await req.json();

        if (!webinarId) {
            return NextResponse.json({ error: "Webinar ID is required" }, { status: 400 });
        }

        // Fetch the webinar to verify the price
        const { prismaClient } = await import("@/lib/prismaClient");
        const webinar = await prismaClient.webinar.findUnique({
            where: { id: webinarId },
            select: { price: true, currency: true }
        });

        if (!webinar) {
            return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
        }

        // Amount in order request is in sub-units (paise/cents)
        // Ensure we use the price from the database for security
        const finalAmount = webinar.price * 100;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { error: "Razorpay credentials not found in env" },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(finalAmount).toString(), // amount in smallest currency unit (paise)
            currency: webinar.currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error: unknown) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json(
            { error: "Error creating order" },
            { status: 500 }
        );
    }
}
