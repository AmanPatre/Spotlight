"use client";
import React from "react";
import { useWebinarStore } from "@/store/useWebinarStore";
import { Label } from "../../label";
import { Switch } from "../../switch";
import { cn } from "@/lib/utils";
import { Input } from "../../input";
import { Info } from "lucide-react";

type Props = {};

const AdditionalInfoStep = (props: Props) => {
  const { formData, updateAdditionalInfoField, getStepValidationErrors } =
    useWebinarStore();
  const { lockChat, couponCode, couponEnabled } = formData.additionalInfo;

  const handleToggleLockChat = (checked: boolean) => {
    updateAdditionalInfoField("lockChat", checked);
  };

  const handleToggleCoupon = (checked: boolean) => {
    updateAdditionalInfoField("couponEnabled", checked);
  };

  const errors = getStepValidationErrors("additionalInfo");

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAdditionalInfoField("couponCode", e.target.value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="lock-chat" className="text-base font-medium text-[#e5e2e1]">
            Lock Chat
          </Label>

          <p className="text-sm text-[#c4c7c8]">
            Turn it on to make chat visible to your users at all time
          </p>
        </div>

        <Switch
          id="lock-chat"
          checked={lockChat || false}
          onCheckedChange={handleToggleLockChat}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="coupon-enabled" className="text-base font-medium text-[#e5e2e1]">
              Coupon Code
            </Label>

            <p className="text-sm text-[#c4c7c8]">
              Turn it on to offer discounts to your viewers
            </p>
          </div>

          <Switch
            id="coupon-enabled"
            checked={couponEnabled || false}
            onCheckedChange={handleToggleCoupon}
          />
        </div>

        {couponEnabled && (
          <div className="space-y-2">
            <Input
              id="coupon-code"
              value={couponCode || ""}
              onChange={handleCouponCodeChange}
              placeholder="Paste the code here"
              className={cn(
                "bg-[#1c1b1b] border-[#444748] text-white placeholder:text-[#c4c7c8]",
                errors.couponCode &&
                "border-red-400 focus-visible:ring-red-400",
              )}
            />

            {errors.couponCode && (
              <p className="text-sm text-red-400">{errors.couponCode}</p>
            )}

            <div className="flex items-start gap-2 text-sm text-[#c4c7c8] mt-2">
              <Info className="h-4 w-4 mt-0.5" />

              <p>
                This coupon code can be used to promote a sale. Users can use it
                for the buy now CTA
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
