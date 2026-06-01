"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
    placeholder?: string;
};

export default function PipelineSearch({ placeholder }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const initialQuery = searchParams.get("q") || "";
    const [text, setText] = useState(initialQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (text) {
                params.set("q", text);
            } else {
                params.delete("q");
            }
            router.push(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [text, pathname, router, searchParams]);

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525b]" />
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder || "Search Name, Tag or Email"}
                className="w-full pl-8 pr-3 h-8 text-[13px] bg-[#18181b] border border-[#27272a] rounded-md text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
            />
        </div>
    );
}
