"use server";

import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";
import { onAuthenticateUser } from "@/actions/auth";

/**
 * POST /api/payment/razorpay/onboard
 * Creates a linked Razorpay Route sub-merchant account for the current user.
 * This allows the host to receive direct payouts from attendee purchases.
 */
export async function POST() {
    try {
        const auth = await onAuthenticateUser();
        if (!auth.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user already has a linked account
        if (auth.user.razorpayAccountId) {
            return NextResponse.json({
                success: true,
                accountId: auth.user.razorpayAccountId,
                message: "Account already linked",
            });
        }

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return NextResponse.json(
                { error: "Razorpay credentials not configured" },
                { status: 500 }
            );
        }

        // Create a linked account via Razorpay Route API
        const response = await fetch("https://api.razorpay.com/v2/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
            },
            body: JSON.stringify({
                email: auth.user.email,
                phone: "9999999999", // Default placeholder phone
                type: "route",
                legal_business_name: auth.user.name || "Webinar Host",
                business_type: "individual",
                legal_info: {
                    pan: "AAAPA1234A", // Placeholder for test mode
                },
                profile: {
                    category: "healthcare",
                    subcategory: "clinic",
                    addresses: {
                        registered: {
                            street1: "1st Street",
                            street2: "2nd Street",
                            city: "Mumbai",
                            state: "Maharashtra",
                            postal_code: 400001,
                            country: "IN",
                        },
                    },
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Razorpay onboard error:", data);

            // SPECIAL CASE: If Route is not enabled for this test merchant,
            // we provide a "Mock Account ID" so the user can continue testing the flow.
            if (data.error?.description === "Route feature not enabled for the merchant") {
                const mockId = `acc_mock_${Math.random().toString(36).substring(7)}`;
                await prismaClient.user.update({
                    where: { id: auth.user.id },
                    data: { razorpayAccountId: mockId },
                });

                return NextResponse.json({
                    success: true,
                    accountId: mockId,
                    message: "Developer Mock Account Activated (Route feature missing on merchant dashboard)",
                });
            }

            return NextResponse.json(
                {
                    error: data.error?.description || "Failed to create linked account",
                    details: data,
                },
                { status: response.status }
            );
        }

        // Save the Razorpay account ID to the user
        await prismaClient.user.update({
            where: { id: auth.user.id },
            data: { razorpayAccountId: data.id },
        });

        return NextResponse.json({
            success: true,
            accountId: data.id,
        });
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
