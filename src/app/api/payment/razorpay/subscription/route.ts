import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { onAuthenticateUser } from "@/actions/auth";

/**
 * POST /api/payment/razorpay/subscription
 * Creates a Razorpay order for the 30-day SaaS Pro Pass.
 * This is platform revenue, not split with any host.
 */
export async function POST() {
    try {
        const auth = await onAuthenticateUser();
        if (!auth.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { error: "Razorpay credentials not configured" },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // SaaS Pro Pass Price: ₹1,499 (149900 paise)
        const amount = 1499 * 100;

        const options: any = {
            amount: amount,
            currency: "INR",
            receipt: `saas_${auth.user.id.slice(-10)}_${Date.now().toString().slice(-8)}`,
            notes: {
                userId: auth.user.id,
                email: auth.user.email,
                type: "saas_pro_pass",
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error: unknown) {
        console.error("SaaS Order error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
