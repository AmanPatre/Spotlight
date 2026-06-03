"use client";

import React, { useState } from "react";
import { useWebinarStore } from "@/store/useWebinarStore";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "@/icons/PlusIcon";
import MultiStepForm from "./MultiStepForm";
import BasicInfoStep from "./BasicInfoStep";
import CTAStep from "./CTAStep";
import AdditionalInfoStep from "./AdditionalInfoStep";
import ProductInfoStep from "./ProductInfoStep";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const CreateWebinarButton = ({ children, className }: Props) => {
  const router = useRouter();
  const { isModalOpen, setModalOpen, isComplete, setComplete } =
    useWebinarStore();
  const [webinarLink, setWebinarLink] = useState<string>("");

  const handleComplete = (webinarId: string) => {
    setComplete(true);

    setWebinarLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/webinar/${webinarId}`,
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
      id: "productInfo",
      title: "Product Info",
      description: "Define the product you are selling during the webinar",
      component: <ProductInfoStep />,
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
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setModalOpen(open);
      if (!open) setComplete(false);
    }}>
      <DialogTrigger
        className={cn(className, "rounded-full flex gap-2 items-center hover:cursor-pointer px-5 py-2.5 border border-[#27272a] bg-[#1c1b1b] text-sm font-medium text-white hover:bg-[#27272a] transition-all duration-200")}
      >
        {children || (
          <>
            <PlusIcon className="w-3.5 h-3.5" />
            Create Webinar
          </>
        )}
      </DialogTrigger>
      <DialogContent className={cn("p-0 border-none bg-transparent shadow-none", isComplete ? "sm:max-w-[500px]" : "sm:max-w-[900px]")}>
        {isComplete ? (
          <div className="bg-[#141313] border border-[#444748] rounded-2xl overflow-hidden max-w-lg mx-auto shadow-2xl p-8 text-center space-y-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Webinar Scheduled!</h2>
              <p className="text-zinc-400 text-sm">
                Your webinar has been successfully created. You can now share the link with your audience.
              </p>
            </div>

            <div className="bg-[#1c1b1b] border border-[#2e2e2e] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-left mb-1">Webinar Link</p>
                  <p className="text-sm text-white truncate font-mono text-left">{webinarLink}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:bg-[#2e2e2e] text-zinc-400 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(webinarLink);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                className="border-[#2e2e2e] text-white hover:bg-[#1c1b1b]"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
              <Button
                className="bg-white text-black hover:bg-white/90"
                onClick={() => {
                  setModalOpen(false);
                  router.push("/webinars");
                }}
              >
                Go to Dashboard
              </Button>
            </div>
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
