import { NextResponse } from "next/server";
import Razorpay from "razorpay";

/**
 * POST /api/payment/razorpay/order
 * Creates a Razorpay order for attendee checkout.
 * If the presenter has a linked Razorpay Route account,
 * 100% of the payment is routed to them via transfers.
 */
export async function POST(req: Request) {
    try {
        const { webinarId } = await req.json();

        if (!webinarId) {
            return NextResponse.json({ error: "Webinar ID is required" }, { status: 400 });
        }

        const { prismaClient } = await import("@/lib/prismaClient");
        const webinar = await prismaClient.webinar.findUnique({
            where: { id: webinarId },
            select: {
                price: true,
                currency: true,
                presenter: {
                    select: {
                        razorpayAccountId: true,
                    },
                },
            },
        });

        if (!webinar) {
            return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { error: "Razorpay credentials not found in env" },
                { status: 500 }
            );
        }

        // Amount in paise (smallest currency unit)
        const amountInPaise = Math.round((webinar.price || 0) * 100);

        if (amountInPaise <= 0) {
            return NextResponse.json({ error: "Invalid price" }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Build order options
        const options: any = {
            amount: amountInPaise,
            currency: webinar.currency || "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                webinarId,
            },
        };

        // Marketplace Transfer: Route 100% to the presenter's linked account
        // Only attempt transfer if it's a real account (not a mock ID from Dev Mode)
        if (webinar.presenter?.razorpayAccountId && !webinar.presenter.razorpayAccountId.startsWith("acc_mock_")) {
            options.transfers = [
                {
                    account: webinar.presenter.razorpayAccountId,
                    amount: amountInPaise,
                    currency: webinar.currency || "INR",
                    on_hold: 0,
                },
            ];
        }

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
