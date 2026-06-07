"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, CreditCard, Lock } from "lucide-react";
import { getWebinarById } from "@/actions/webinar";
import { useUser } from "@clerk/nextjs";

type WebinarData = {
    title?: string;
    productTitle?: string | null;
    productName?: string | null;
    description?: string | null;
    price?: number;
    originalPrice?: number | null;
    currency?: string;
};

type Props = {
    params: Promise<{ webinarid: string }>;
};

export default function CheckoutPage({ params }: Props) {
    const router = useRouter();
    const { user: clerkUser } = useUser();
    const searchParams = useSearchParams();

    const [webinarId, setWebinarId] = useState<string>("");
    const [attendeeId, setAttendeeId] = useState<string>("");
    const [webinarData, setWebinarData] = useState<WebinarData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

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
        const fetchWebinar = async () => {
            const { webinarid } = await params;
            setWebinarId(webinarid);

            // Fetch webinar data
            const data = await getWebinarById(webinarid);
            if (data) {
                setWebinarData(data);
            } else {
                setError("Webinar not found");
            }

            // Try to get attendeeId from query param or localStorage
            const qpAttendeeId = searchParams.get("attendeeId");
            if (qpAttendeeId) {
                setAttendeeId(qpAttendeeId);
            } else {
                const stored = localStorage.getItem(`spotlight_attendee_${webinarid}`);
                if (stored) setAttendeeId(stored);
            }
            setPageLoading(false);
        };
        fetchWebinar();
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
            setLoading(false);
            return;
        }

        try {
            // 1. Create order on backend
            const orderRes = await fetch("/api/payment/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    webinarId: webinarId,
                }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.error || "Failed to create order");
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Checkout Window
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Spotlight",
                description: webinarData?.productName || webinarData?.productTitle || "Webinar Full Access",
                order_id: orderData.id,
                prefill: {
                    name: clerkUser?.fullName || "User",
                    email: clerkUser?.primaryEmailAddress?.emailAddress || "",
                    contact: "",
                },
                theme: {
                    color: "#ffffff",
                },
                handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
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
                    } catch {
                        setError("Error verifying payment");
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                },
            };

            const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, cb: (res: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay(options);
            rzp.on("payment.failed", function (response: { error: { description: string } }) {
                setError(`Payment Failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err: unknown) {
            console.error("Razorpay Error:", err);
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 py-16 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-xl z-10">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 bg-white/5 rounded-none font-mono text-[10px] uppercase tracking-[0.3em] text-white">
                        <Lock className="w-3 h-3" />
                        Secure Checkout
                    </div>
                    <h1 className="text-5xl font-semibold tracking-tight text-white" style={{ fontFamily: "Geist, sans-serif" }}>
                        Complete Purchase
                    </h1>
                    <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                        Secure Checkout for {webinarData?.title || "Webinar Enrollment"}
                    </p>
                </div>

                {/* Main Checkout Card */}
                <div className="bg-[#141313] border border-zinc-800 rounded-none p-10 shadow-2xl space-y-10">
                    {/* Order Details */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-medium text-white">{webinarData?.productName || webinarData?.productTitle || (webinarData?.title ? `${webinarData.title} Access` : "Full Webinar Access")}</h3>
                                <p className="text-xs text-zinc-500">{webinarData?.description || "Includes lifetime recording & exclusive materials"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-semibold text-white tracking-tight">
                                    {webinarData?.currency === 'INR' ? '₹' : '$'}{(webinarData?.price || 0).toLocaleString()}
                                </p>
                                {webinarData?.originalPrice && (
                                    <p className="text-sm text-zinc-600 line-through font-mono">
                                        {webinarData?.currency === 'INR' ? '₹' : '$'}{(webinarData?.originalPrice || 0).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-white uppercase tracking-widest">Savings Applied</span>
                            <span className="text-sm font-bold text-white">
                                {webinarData?.originalPrice && (webinarData.price || 0) < (webinarData.originalPrice || 0)
                                    ? `-${Math.round((1 - (webinarData.price || 0) / (webinarData.originalPrice || 0)) * 100)}% DISCOUNT`
                                    : "OFFER PRICE"}
                            </span>
                        </div>
                    </div>

                    {/* Razorpay Trust Box */}
                    <div className="pt-6 border-t border-zinc-900">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Payment Security</p>
                                <p className="text-xs text-zinc-600 leading-relaxed">
                                    Your information is encrypted and securely processed by Razorpay. We do not store your card details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-4 pt-4">
                        {error && (
                            <div className="px-4 py-3 bg-red-500/5 border border-red-500/10 text-red-400 font-mono text-[10px] uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full h-16 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            )}
                            Pay {webinarData?.currency === 'INR' ? '₹' : '$'}{(webinarData?.price || 0).toLocaleString()} Securely
                        </button>
                    </div>

                    {/* Post-pay trust badges */}
                    <div className="flex justify-between pt-4 border-t border-zinc-900/50">
                        <div className="text-center space-y-1 px-4 border-r border-zinc-900/50 flex-1">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Encryption</p>
                            <p className="text-[10px] text-zinc-400 font-bold">256-BIT SSL</p>
                        </div>
                        <div className="text-center space-y-1 px-4 border-r border-zinc-900/50 flex-1">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Delivery</p>
                            <p className="text-[10px] text-zinc-400 font-bold">INSTANT ACCESS</p>
                        </div>
                        <div className="text-center space-y-1 px-4 flex-1">
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Support</p>
                            <p className="text-[10px] text-zinc-400 font-bold">24/7 PRIORITY</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em] mt-10">
                    Powered by Razorpay Secure Payments
                </p>
            </div>
        </div>
    );
}
