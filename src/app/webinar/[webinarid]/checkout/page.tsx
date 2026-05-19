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

    // Fake card fields state
    const [cardName, setCardName] = useState("Test User");
    const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
    const [expiry, setExpiry] = useState("12/28");
    const [cvv, setCvv] = useState("123");

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

        try {
            const res = await fetch("/api/payment/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attendeeId, webinarId }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error ?? "Payment failed. Please try again.");
                return;
            }

            // Success → navigate to thank you page
            router.push(`/webinar/${webinarId}/thank-you?orderId=${data.orderId}`);
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
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

                    {/* Card Fields (all fake / pre-filled) */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs text-muted-foreground font-medium mb-1.5">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-muted-foreground font-medium mb-1.5">
                                Card Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all pr-10"
                                    maxLength={19}
                                />
                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground/50 mt-1">
                                Test card — use any values above
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-muted-foreground font-medium mb-1.5">
                                    Expiry
                                </label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground font-medium mb-1.5">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                                    maxLength={3}
                                />
                            </div>
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
                    This is a simulated checkout for demonstration purposes.
                </p>
            </div>
        </div>
    );
}
