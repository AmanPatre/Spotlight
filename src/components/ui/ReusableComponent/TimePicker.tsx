"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../button";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export const TimePicker = ({
    value,
    onChange,
    error,
    placeholder = "Select time"
}: {
    value: string | null | undefined;
    onChange: (val: string) => void;
    error?: string;
    placeholder?: string;
}) => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const [selectedHour, selectedMinute] = (value || "12:00").split(":");

    const hourRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const minuteRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTimeout(() => {
                const hIndex = parseInt(selectedHour);
                const mIndex = parseInt(selectedMinute);
                hourRefs.current[hIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                minuteRefs.current[mIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <Popover onOpenChange={handleOpenChange}>
            <PopoverTrigger
                nativeButton={true}
                render={
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base focus-visible:ring-0 focus-visible:border-white transition-colors",
                            !value && "text-zinc-700",
                            error && "border-red-400"
                        )}
                    >
                        <Clock className="mr-3 h-4 w-4 text-zinc-500" />
                        {value || placeholder}
                    </Button>
                }
            />
            <PopoverContent className="w-56 p-0 bg-[#0c0c0c] border-zinc-800 text-white rounded-none shadow-2xl relative overflow-hidden z-[100]">
                <div className="flex h-64 border-t border-zinc-900">
                    {/* Hours Column */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-zinc-900 overscroll-contain">
                        <div className="px-2 py-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest text-center sticky top-0 bg-[#0c0c0c] z-10">Hour</div>
                        {hours.map((h, i) => (
                            <button
                                key={h}
                                type="button"
                                ref={el => { hourRefs.current[i] = el }}
                                onClick={() => onChange(`${h}:${selectedMinute}`)}
                                className={cn(
                                    "w-full py-2.5 text-sm font-mono transition-all hover:bg-zinc-900/50",
                                    selectedHour === h ? "bg-white text-black font-bold" : "text-zinc-400"
                                )}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    {/* Minutes Column */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain">
                        <div className="px-2 py-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest text-center sticky top-0 bg-[#0c0c0c] z-10">Min</div>
                        {minutes.map((m, i) => (
                            <button
                                key={m}
                                type="button"
                                ref={el => { minuteRefs.current[i] = el }}
                                onClick={() => onChange(`${selectedHour}:${m}`)}
                                className={cn(
                                    "w-full py-2.5 text-sm font-mono transition-all hover:bg-zinc-900/50",
                                    selectedMinute === m ? "bg-white text-black font-bold" : "text-zinc-400"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 border-t border-zinc-900 flex items-center justify-between bg-[#141313]">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                        {value ? "Selected" : "Pick a time"}
                    </span>
                    <div className="text-xs font-bold font-mono text-white">
                        {value || "--:--"}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
