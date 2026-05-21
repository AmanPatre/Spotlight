import Link from "next/link";
import { Zap, Home } from "lucide-react";

export default function WebinarNotFound() {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-8">
                <Zap className="w-8 h-8 text-violet-400" />
            </div>

            <h1 className="text-4xl font-semibold mb-4 text-white">Webinar Not Found</h1>
            <p className="text-[#a1a1aa] text-lg max-w-md mb-10 leading-relaxed">
                The webinar you are looking for might have ended, the link could be invalid, or it hasn't been created yet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
                >
                    <Home className="w-4 h-4" /> Go Home
                </Link>
                <Link
                    href="/sign-in"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] font-medium transition-colors"
                >
                    Sign In
                </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-[#27272a] w-full max-w-md">
                <p className="text-xs text-[#52525b]">
                    If you are the host, please verify that you are logged in and the ID is correct in your dashboard.
                </p>
            </div>
        </div>
    );
}
