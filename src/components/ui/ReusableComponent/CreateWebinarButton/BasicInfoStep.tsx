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
import { toast } from "sonner";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

type Props = {};

const BasicInfoStep = (props: Props) => {
  const { formData, updateBasicInfoField, getStepValidationErrors } =
    useWebinarStore();
  const { webinarName, description, date, time, timeFormat } =
    formData.basicInfo;
  const errors = getStepValidationErrors("basicInfo");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    updateBasicInfoField(name as keyof typeof formData.basicInfo, value);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    updateBasicInfoField("date", newDate);

    if (newDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        console.log("Error: Cannot select a date in the past");
        toast.error("Webinar date cannot be in the past");
      }
    }
  };

  const handleTimeFormatChange = (value: "AM" | "PM" | null) => {
    if (value === "AM" || value === "PM") {
      updateBasicInfoField("timeFormat", value);
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
                placeholder="12:00"
                className={cn(
                  "pl-8 flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors",
                  errors.time && "border-red-400 focus-visible:border-red-400",
                )}
              />
            </div>

            <Select
              value={timeFormat || "AM"}
              onValueChange={handleTimeFormatChange}
            >
              <SelectTrigger className="w-24 h-12 rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent text-zinc-400 font-mono text-xs focus:ring-0 focus:border-white transition-colors">
                <SelectValue placeholder="AM" />
              </SelectTrigger>

              <SelectContent className="bg-[#141313] border-zinc-800 text-zinc-100 rounded-none">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.time && <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.time}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#c4c7c8] mt-4">
        <div className="flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Uploading a video makes this webinar pre-recorded.
        </div>

        <div
          className={cn(
            buttonVariants({ variant: "outline" }),
            "ml-auto relative border border-[#444748] !bg-[#1c1b1b] text-white hover:opacity-90 transition-opacity h-8 cursor-pointer"
          )}
        >
          Upload File
          <Input
            className="absolute inset-0 opacity-0 cursor-pointer"
            type="file"
          />
        </div>
      </div>
    </div >
  );
};

export default BasicInfoStep;
