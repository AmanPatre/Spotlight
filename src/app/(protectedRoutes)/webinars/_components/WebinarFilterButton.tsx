"use client";

import { SlidersHorizontal, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function WebinarFilterButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'newest';

    const setSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        router.push(`?${params.toString()}`);
    }

    return (
        <Popover>
            <PopoverTrigger className="w-8 h-8 rounded-md border border-[#2e2e2e] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-[#1c1b1b] transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-[#141414] border-[#2e2e2e] text-white p-2 shadow-2xl" align="end" alignOffset={-10}>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a] mb-2 px-2 pt-1 font-mono">Sort By</h4>
                <div className="flex flex-col gap-1">
                    {[
                        { value: 'newest', label: 'Date: Newest First' },
                        { value: 'oldest', label: 'Date: Oldest First' },
                        { value: 'title', label: 'Title: A-Z' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSort(option.value)}
                            className={cn(
                                "flex items-center justify-between text-left px-2 py-2 text-[13px] rounded-md transition-colors",
                                currentSort === option.value
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                            )}
                        >
                            {option.label}
                            {currentSort === option.value && <Check className="w-3 h-3 text-white" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
