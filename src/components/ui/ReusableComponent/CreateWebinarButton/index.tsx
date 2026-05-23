"use client";

import React, { useState } from "react";
import { useWebinarStore } from "@/store/useWebinarStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "@/icons/PlusIcon";
import MultiStepForm from "./MultiStepForm";
import BasicInfoStep from "./BasicInfoStep";
import CTAStep from "./CTAStep";
import AdditionalInfoStep from "./AdditionalInfoStep";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const CreateWebinarButton = ({ children, className }: Props) => {
  const { isModalOpen, setModalOpen, isComplete, setComplete } =
    useWebinarStore();
  const [webinarLink, setWebinarLink] = useState<string>("");

  const handleComplete = (webinarId: string) => {
    setComplete(true);

    setWebinarLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`,
    );
  };

  const steps = [
    {
      id: "basicInfo",
      title: "Basic Information",
      description: "Please fill out the standard info needed for your webinar",
      component: <BasicInfoStep />,
    },
    {
      id: "cta",
      title: "CTA",
      description:
        "Please provide the end-point for your customers through your webinar",
      component: <CTAStep />,
    },

    {
      id: "additionalInfo",
      title: "Additional information",
      description:
        "Please fill out information about additional options if necessary",
      component: <AdditionalInfoStep />,
    },
  ];
  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger
        className={className || "rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"}
      >
        {children || (
          <>
            <PlusIcon />
            Create Webinar
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 border-none bg-transparent">
        {isComplete ? (
          <div className="bg-muted text-primary rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">Webinar Created</DialogTitle>

            {/* SuccessStep */}
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Create Webinar</DialogTitle>

            <MultiStepForm steps={steps} onComplete={handleComplete} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebinarButton;
