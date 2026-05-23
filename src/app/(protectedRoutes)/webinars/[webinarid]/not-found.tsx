import Link from "next/link";
import { Zap, LayoutDashboard } from "lucide-react";

export default function HostWebinarNotFound() {
    return (
        <div className="min-h-[400px] bg-transparent text-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded border border-[#27272a] bg-[#141313] flex items-center justify-center mb-8">
                <Zap className="w-6 h-6 text-[#ffffff]" />
            </div>

            <h1 className="text-[20px] font-bold mb-3 text-white uppercase tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Dashboard Node Offline</h1>
            <p className="text-[#c4c7c8] text-[11px] font-mono max-w-xs mb-8 uppercase tracking-widest leading-relaxed">
                This webinar management resource has been decommissioned or the ID is incorrect.
            </p>

            <Link
                href="/home"
                className="flex items-center gap-2.5 px-6 py-3 rounded-none bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] text-[12px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm"
            >
                <LayoutDashboard className="w-4 h-4" /> RE-ENTER LOGISTICS
            </Link>
        </div>
    );
}
