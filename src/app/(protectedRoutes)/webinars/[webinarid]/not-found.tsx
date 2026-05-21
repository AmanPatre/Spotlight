import Link from "next/link";
import { Zap, LayoutDashboard } from "lucide-react";

export default function HostWebinarNotFound() {
    return (
        <div className="min-h-[400px] bg-transparent text-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-8">
                <Zap className="w-8 h-8 text-violet-400" />
            </div>

            <h1 className="text-3xl font-semibold mb-3 text-white">Dashboard Page Not Found</h1>
            <p className="text-[#a1a1aa] text-sm max-w-sm mb-8 leading-relaxed">
                This webinar management page doesn't exist. You may have deleted this webinar or the ID is incorrect.
            </p>

            <Link
                href="/home"
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-sm"
            >
                <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
            </Link>
        </div>
    );
}
