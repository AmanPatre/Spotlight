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
            "text-sm font-medium",
            errors.webinarName ? "text-red-400" : "text-[#e5e2e1]",
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
            "flex h-10 w-full rounded-md border border-[#444748] bg-[#1c1b1b] px-3 py-2 text-sm ring-offset-background placeholder:text-[#c4c7c8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400",
          )}
        />

        {errors.webinarName && (
          <p className="text-sm text-red-400 mt-1">{errors.webinarName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={cn(errors.description ? "text-red-400" : "text-[#e5e2e1]")}
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
            "min-h-[100px] !bg-[#1c1b1b] border-[#444748] text-white placeholder:text-[#c4c7c8]",
            errors.description && "border-red-400 focus-visible:ring-red-400",
          )}
        />

        {errors.description && (
          <p className="text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={cn(errors.date ? "text-red-400" : "text-[#e5e2e1]")}>
            Webinar Date <span className="text-red-400">*</span>
          </Label>

          <Popover>
            <PopoverTrigger
              nativeButton={true}
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal !bg-[#1c1b1b] border-[#444748] text-white",
                    !date && "text-[#c4c7c8]",
                    errors.date && "border-red-400 focus-visible:ring-red-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 !bg-[#1c1b1b] border-[#444748] text-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="bg-background"
                disabled={(date) => {
                  const today = new Date();

                  today.setHours(0, 0, 0, 0); // Reset time to start of day

                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>

          {errors.date && <p className="text-sm text-red-400">{errors.date}</p>}
        </div>
        <div className="space-y-2">
          <Label className={cn(errors.time ? "text-red-400" : "text-[#e5e2e1]")}>
            Webinar Time <span className="text-red-400">*</span>
          </Label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-[#c4c7c8]" />

              <Input
                name="time"
                value={time || ""}
                onChange={handleChange}
                placeholder="12:00"
                className={cn(
                  "pl-9 !bg-[#1c1b1b] border-[#444748] text-white placeholder:text-[#c4c7c8]",
                  errors.time && "border-red-400 focus-visible:ring-red-400",
                )}
              />
            </div>

            <Select
              value={timeFormat || "AM"}
              onValueChange={handleTimeFormatChange}
            >
              <SelectTrigger className="w-20 !bg-[#1c1b1b] border-[#444748] text-white">
                <SelectValue placeholder="AM" />
              </SelectTrigger>

              <SelectContent className="!bg-[#1c1b1b] border-[#444748] text-white">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.time && <p className="text-sm text-red-400">{errors.time}</p>}
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
    </div>
  );
};

export default BasicInfoStep;
