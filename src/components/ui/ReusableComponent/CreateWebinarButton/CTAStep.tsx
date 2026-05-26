"use client";

import { useWebinarStore } from "@/store/useWebinarStore";
import React, { useEffect, useState } from "react";
import { Label } from "../../label";
import { Input } from "../../input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../tabs";
import { CtaTypeEnum } from "@/generated/prisma/enums";
import { getVapiAssistants } from "@/actions/vapi";
import type { VapiAssistantSummary } from "@/lib/vapi-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";
import Link from "next/link";

const CTAStep = () => {
  const {
    formData,
    updateCTAField,
    addTag,
    removeTag,
    getStepValidationErrors,
  } = useWebinarStore();

  const { ctaLabel, tags, aiAgent, ctaType } = formData.cta;
  const errors = getStepValidationErrors("cta");

  const [assistants, setAssistants] = useState<VapiAssistantSummary[]>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingAssistants(true);
      const res = await getVapiAssistants();
      if (!cancelled && res.success && res.assistants) {
        setAssistants(res.assistants);
      }
      if (!cancelled) setLoadingAssistants(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCTAField(name as keyof typeof formData.cta, value);
  };

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleSelectCTAType = (value: string) => {
    const next = value as CtaTypeEnum;
    updateCTAField("ctaType", next);
    if (next === CtaTypeEnum.BUY_NOW) {
      updateCTAField("aiAgent", "");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="ctaLabel"
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.ctaLabel ? "text-red-400" : "text-zinc-500"
          )}
        >
          CTA Label <span className="text-red-400">*</span>
        </Label>

        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ""}
          onChange={handleChange}
          placeholder="Let's Get Started"
          className={cn(
            "flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            errors.ctaLabel && "border-red-400 focus-visible:border-red-400",
          )}
        />

        {errors.ctaLabel && (
          <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.ctaLabel}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="tags" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Tags</Label>

        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags and press Enter"
          className="flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors"
        />

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/5 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-none font-mono text-[10px] uppercase tracking-wider"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-zinc-600 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 w-full">
        <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">CTA Type</Label>

        <Tabs
          value={ctaType}
          onValueChange={handleSelectCTAType}
          className="w-full"
        >
          <TabsList className="w-full bg-transparent border-b border-zinc-800 p-0 rounded-none h-12">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 h-full text-zinc-500 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              Book a Call
            </TabsTrigger>

            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2 h-full text-zinc-500 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {ctaType === CtaTypeEnum.BOOK_A_CALL && (
        <div className="space-y-3">
          <Label className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.aiAgent ? "text-red-400" : "text-zinc-500"
          )}>
            AI agent <span className="text-red-400">*</span>
          </Label>
          <Select
            value={aiAgent || ""}
            disabled={loadingAssistants}
            onValueChange={(v) => {
              updateCTAField("aiAgent", v);
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full h-12 rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent text-white px-0 focus:ring-0 focus:border-white transition-colors",
                errors.aiAgent && "border-red-400",
              )}
            >
              <SelectValue
                placeholder={
                  loadingAssistants ? "Loading assistants…" : "Select an assistant"
                }
              >
                {aiAgent && assistants.find(a => a.id === aiAgent)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#141313] border-zinc-800 text-zinc-100 rounded-none shadow-2xl">
              {assistants.map((a) => (
                <SelectItem key={a.id} value={a.id} className="focus:bg-white focus:text-black">
                  {a.name || "Unnamed Agent"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.aiAgent && (
            <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.aiAgent}</p>
          )}
          {!loadingAssistants && assistants.length === 0 && (
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-2">
              No assistants yet.{" "}
              <Link href="/ai-agents" className="text-white underline">
                Create one
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CTAStep;
