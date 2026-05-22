"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, CreditCard, Lock, CheckCircle2 } from "lucide-react";

type Props = {
    params: Promise<{ webinarid: string }>;
};

export default function CheckoutPage({ params }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [webinarId, setWebinarId] = useState<string>("");
    const [attendeeId, setAttendeeId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Script Loading state
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Dynamically load Razorpay checkout script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => setError("Failed to load payment gateway");
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        params.then(({ webinarid }) => {
            setWebinarId(webinarid);

            // Try to get attendeeId from query param or localStorage
            const qpAttendeeId = searchParams.get("attendeeId");
            if (qpAttendeeId) {
                setAttendeeId(qpAttendeeId);
            } else {
                const stored = localStorage.getItem(`spotlight_attendee_${webinarid}`);
                if (stored) setAttendeeId(stored);
            }
        });
    }, [params, searchParams]);

    const handleCheckout = async () => {
        if (!attendeeId || !webinarId) {
            setError("Missing attendee or webinar information. Please go back and try again.");
            return;
        }

        setLoading(true);
        setError(null);

        if (!scriptLoaded) {
            setError("Payment gateway is still loading...");
            return;
        }

        try {
            // 1. Create order on backend
            const orderRes = await fetch("/api/payment/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 9700, currency: "INR" }), // 9700 paise = 97 INR
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.error || "Failed to create order");
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Checkout Window
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", // Replace with env in production
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Webinar Platform",
                description: "Webinar Full Access",
                order_id: orderData.id,
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#059669", // emerald-600
                },
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch("/api/payment/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                webinarId: webinarId,
                                attendeeId: attendeeId,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            router.push(`/webinar/${webinarId}/thank-you?orderId=${orderData.id}`);
                        } else {
                            setError("Payment verification failed");
                            setLoading(false);
                        }
                    } catch (e) {
                        setError("Error verifying payment");
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                setError(`Payment Failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (e) {
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background flex items-center justify-center px-4 py-16">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-background to-teal-900/10 pointer-events-none" />

            <div className="relative w-full max-w-md z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Lock className="w-3 h-3" />
                        Secure Checkout
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">
                        Complete Your Purchase
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        You&apos;re one step away from getting full access.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/40">
                    {/* Order Summary */}
                    <div className="mb-6 p-4 rounded-2xl bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">
                            Order Summary
                        </p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground font-medium">Webinar Full Access</span>
                            <span className="text-foreground font-bold">$97.00</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                            <span>Lifetime access + Bonus materials</span>
                            <span className="line-through text-red-400/70">$197.00</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-emerald-400 font-bold">You save 51%</span>
                            <span className="text-lg font-black text-foreground">$97.00</span>
                        </div>
                    </div>

                    {/* Razorpay Information Box */}
                    <div className="space-y-4 mb-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm text-emerald-400">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            <p>
                                Payments are securely processed by <strong>Razorpay</strong>. Clicking the button below will open a secure checkout window.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Complete Purchase — $97.00
                            </>
                        )}
                    </button>

                    {/* Trust Badges */}
                    <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                        <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
                            <span>256-bit SSL</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                            <span>30-day guarantee</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-emerald-500/60" />
                            <span>Secure payment</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground/40 mt-6">
                    This checkout is integrated with Razorpay test mode.
                </p>
            </div>
        </div>
    );
}
