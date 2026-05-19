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
      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLabel ? "text-red-400" : ""}
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
            "!bg-background/50 border border-input",
            errors.ctaLabel && "border-red-400 focus-visible:ring-red-400",
          )}
        />

        {errors.ctaLabel && (
          <p className="text-sm text-red-400">{errors.ctaLabel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>

        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags and press Enter"
          className="!bg-background/50 border border-input"
        />

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 w-full">
        <Label>CTA Type</Label>

        <Tabs
          value={ctaType}
          onValueChange={handleSelectCTAType}
          className="w-full"
        >
          <TabsList className="w-full bg-transparent">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 data-[state=active]:!bg-background/50"
            >
              Book a Call
            </TabsTrigger>

            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2"
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {ctaType === CtaTypeEnum.BOOK_A_CALL && (
        <div className="space-y-2">
          <Label className={errors.aiAgent ? "text-red-400" : ""}>
            AI agent <span className="text-red-400">*</span>
          </Label>
          <Select
            value={!loadingAssistants && aiAgent ? aiAgent : undefined}
            onValueChange={(v) => {
              if (v) updateCTAField("aiAgent", v);
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full !bg-background/50 border border-input",
                errors.aiAgent && "border-red-400",
              )}
            >
              <SelectValue
                placeholder={
                  loadingAssistants ? "Loading assistants…" : "Select an assistant"
                }
              />
            </SelectTrigger>
            <SelectContent className="!bg-background border border-input max-h-64">
              {assistants.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name || a.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.aiAgent && (
            <p className="text-sm text-red-400">{errors.aiAgent}</p>
          )}
          {!loadingAssistants && assistants.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No assistants yet.{" "}
              <Link href="/ai-agents" className="text-purple-400 underline">
                Create one in AI Agents
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
