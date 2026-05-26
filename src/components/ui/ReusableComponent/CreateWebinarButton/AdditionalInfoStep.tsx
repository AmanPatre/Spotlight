"use client";
import React from "react";
import { useWebinarStore } from "@/store/useWebinarStore";
import { Label } from "../../label";
import { Switch } from "../../switch";
import { cn } from "@/lib/utils";
import { Input } from "../../input";
import { Info } from "lucide-react";

const AdditionalInfoStep = () => {
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
    <div className="space-y-10">
      <div className="flex items-center justify-between group">
        <div className="space-y-1">
          <Label htmlFor="lock-chat" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">
            Lock Chat
          </Label>

          <p className="text-xs text-zinc-600">
            Make chat visible to your users at all times
          </p>
        </div>

        <Switch
          id="lock-chat"
          checked={lockChat || false}
          onCheckedChange={handleToggleLockChat}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between group">
          <div className="space-y-1">
            <Label htmlFor="coupon-enabled" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">
              Coupon System
            </Label>

            <p className="text-xs text-zinc-600">
              Enable promotional discounts for your attendees
            </p>
          </div>

          <Switch
            id="coupon-enabled"
            checked={couponEnabled || false}
            onCheckedChange={handleToggleCoupon}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {couponEnabled && (
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex flex-col space-y-3">
              <Label htmlFor="coupon-code" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Discount Code
              </Label>
              <Input
                id="coupon-code"
                value={couponCode || ""}
                onChange={handleCouponCodeChange}
                placeholder="PROMO2026"
                className={cn(
                  "flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors",
                  errors.couponCode && "border-red-400 focus-visible:border-red-400",
                )}
              />
            </div>

            {errors.couponCode && (
              <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.couponCode}</p>
            )}

            <div className="bg-white/5 border border-white/10 p-4 flex gap-4 items-start">
              <Info className="h-4 w-4 mt-0.5 text-zinc-400" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                This code can be redeemed at checkout. Ensure your payment gateway supports manual coupons if using complex logic.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
