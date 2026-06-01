"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeaveButton({ webinarId }: { webinarId: string }) {
    const router = useRouter();
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeave = () => {
        setIsLeaving(true);
        router.push(`/webinar/${webinarId}`);
    };

    return (
        <button
            onClick={handleLeave}
            disabled={isLeaving}
            className="flex items-center gap-2 px-4 py-1.5 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all text-[11px] font-mono uppercase tracking-widest disabled:opacity-50"
        >
            <LogOut className="w-3.5 h-3.5" />
            {isLeaving ? "Leaving..." : "Leave"}
        </button>
    );
}
