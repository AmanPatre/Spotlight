"use client";

import React from "react";
import { format } from "date-fns";
import { useWebinarStore } from "@/store/useWebinarStore";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../../button";
import { CalendarIcon, Clock, Upload } from "lucide-react";
import { Textarea } from "../../textarea";
import { Label } from "../../label";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { Input } from "../../input";
import { Calendar } from "../../calendar";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

const BasicInfoStep = () => {
  const { formData, updateBasicInfoField, getStepValidationErrors } =
    useWebinarStore();
  const { webinarName, description, date, time } =
    formData.basicInfo;
  const errors = getStepValidationErrors("basicInfo");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    updateBasicInfoField(name as keyof typeof formData.basicInfo, value);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      // Normalize to midnight UTC of that local day to avoid timezone flip in server actions
      const normalizedDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()));
      updateBasicInfoField("date", normalizedDate);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        toast.error("Webinar date cannot be in the past");
      }
    } else {
      updateBasicInfoField("date", undefined);
    }
  };

  return (
    <div className="space-y-6 w-full mt-4">
      <div className="flex flex-col space-y-2 w-full">
        <label
          htmlFor="webinarName"
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.webinarName ? "text-red-400" : "text-zinc-500",
          )}
        >
          Webinar name <span className="text-red-400">*</span>
        </label>

        <Input
          id="webinarName"
          name="webinarName"
          value={webinarName || ""}
          onChange={handleChange}
          placeholder="Introduction to Mochi"
          className={cn(
            "flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            errors.webinarName && "border-red-400 focus-visible:border-red-400",
          )}
        />

        {errors.webinarName && (
          <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.webinarName}</p>
        )}
      </div>
      <div className="space-y-3">
        <Label
          htmlFor="description"
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.description ? "text-red-400" : "text-zinc-500"
          )}
        >
          Description <span className="text-red-400">*</span>
        </Label>

        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Tell customers what your webinar is about"
          className={cn(
            "min-h-[100px] rounded-none border border-zinc-800 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors",
            errors.description && "border-red-400 focus-visible:border-red-400",
          )}
        />

        {errors.description && (
          <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col space-y-3 w-full">
          <Label className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.date ? "text-red-400" : "text-zinc-500"
          )}>
            Webinar Date <span className="text-red-400">*</span>
          </Label>

          <Popover>
            <PopoverTrigger
              nativeButton={true}
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base focus-visible:ring-0 focus-visible:border-white transition-colors",
                    !date && "text-zinc-700",
                    errors.date && "border-red-400"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-zinc-500" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 bg-[#141313] border-zinc-800 text-white rounded-none">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="bg-transparent"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time to start of day
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>

          {errors.date && <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.date}</p>}
        </div>

        <div className="flex flex-col space-y-3 w-full">
          <Label className={cn(
            "font-mono text-[10px] uppercase tracking-[0.2em]",
            errors.time ? "text-red-400" : "text-zinc-500"
          )}>
            Webinar Time <span className="text-red-400">*</span>
          </Label>

          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Clock className="absolute left-0 top-3.5 h-4 w-4 text-zinc-500" />

              <Input
                name="time"
                value={time || ""}
                onChange={handleChange}
                placeholder="20:00 (24h IST)"
                className={cn(
                  "pl-8 flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors",
                  errors.time && "border-red-400 focus-visible:border-red-400",
                )}
              />
            </div>
          </div>
          {errors.time && <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.time}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#c4c7c8] mt-4">
        <div className="flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          {formData.basicInfo.isPreRecorded ? (
            <span className="text-green-400">Video successfully uploaded for pre-recorded session.</span>
          ) : (
            "Uploading a video makes this webinar pre-recorded."
          )}
        </div>

        <div className="ml-auto">
          {!formData.basicInfo.isPreRecorded ? (
            <UploadButton
              endpoint="videoUploader"
              appearance={{
                button: "h-8 px-4 border border-[#444748] bg-[#1c1b1b] text-white hover:opacity-90 transition-opacity text-sm rounded-md",
                allowedContent: "hidden"
              }}
              onClientUploadComplete={(res) => {
                console.log("UploadThing response:", res);
                if (res?.[0]) {
                  console.log("Setting videoUrl:", res[0].url);
                  updateBasicInfoField("videoUrl", res[0].url);
                  updateBasicInfoField("isPreRecorded", true);
                  toast.success("Video uploaded successfully!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
          ) : (
            <Button
              variant="outline"
              className="h-8 border-[#444748] !bg-[#1c1b1b] text-white hover:opacity-90 transition-opacity"
              onClick={() => {
                updateBasicInfoField("videoUrl", null);
                updateBasicInfoField("isPreRecorded", false);
              }}
            >
              Remove Video
            </Button>
          )}
        </div>
      </div>
    </div >

  );
};

export default BasicInfoStep;
