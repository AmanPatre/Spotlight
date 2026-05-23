"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LowTierToggle({
    count,
    children
}: {
    count: number;
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (count === 0) return null;

    return (
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/50">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-xs text-foreground/50 hover:text-foreground/80 flex justify-between"
            >
                <span>{isOpen ? "Hide" : "Show"} {count} low-priority leads</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {isOpen && (
                <div className="space-y-3 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
