"use client";

import React from "react";
import { useWebinarStore } from "@/store/useWebinarStore";
import { cn } from "@/lib/utils";
import { Label } from "../../label";
import { Input } from "../../input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../select";

const ProductInfoStep = () => {
    const { formData, updateProductInfoField, getStepValidationErrors } =
        useWebinarStore();
    const { productTitle, price, currency, originalPrice } =
        formData.productInfo;
    const errors = getStepValidationErrors("productInfo");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = e.target;
        if (name === "price" || name === "originalPrice") {
            updateProductInfoField(name as "price" | "originalPrice", parseFloat(value) || 0);
        } else {
            updateProductInfoField(name as "productTitle" | "currency", value);
        }
    };

    return (
        <div className="space-y-8 w-full mt-6">
            <div className="flex flex-col space-y-3 w-full">
                <Label
                    htmlFor="productTitle"
                    className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.2em]",
                        errors.productTitle ? "text-red-400" : "text-zinc-500",
                    )}
                >
                    Product / Offer Title <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                    <Input
                        id="productTitle"
                        name="productTitle"
                        value={productTitle || ""}
                        onChange={handleChange}
                        placeholder="Premium Mastery Course"
                        className={cn(
                            "flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-base ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                            errors.productTitle && "border-red-400 focus-visible:border-red-400",
                        )}
                    />
                </div>
                {errors.productTitle && (
                    <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.productTitle}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col space-y-3 w-full">
                    <Label
                        htmlFor="price"
                        className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.2em]",
                            errors.price ? "text-red-400" : "text-zinc-500"
                        )}
                    >
                        Selling Price <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex gap-4 items-end">
                        <div className="relative flex-1 group">
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={price || ""}
                                onChange={handleChange}
                                className={cn(
                                    "flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-2xl font-semibold tracking-tight ring-offset-background placeholder:text-zinc-800 focus-visible:outline-none focus-visible:border-white transition-colors",
                                    errors.price && "border-red-400 focus-visible:border-red-400",
                                )}
                            />
                        </div>
                        <Select
                            value={(currency as string) || "INR"}
                            onValueChange={(val) => updateProductInfoField("currency", val as "INR" | "USD")}
                        >
                            <SelectTrigger className="w-24 h-12 rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent text-zinc-400 font-mono text-xs focus:ring-0 focus:border-white transition-colors">
                                <SelectValue placeholder="INR" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#141313] border-zinc-800 text-zinc-100 rounded-none shadow-2xl">
                                <SelectItem value="INR" className="focus:bg-white focus:text-black">INR (₹)</SelectItem>
                                <SelectItem value="USD" className="focus:bg-white focus:text-black">USD ($)</SelectItem>
                                <SelectItem value="EUR" className="focus:bg-white focus:text-black">EUR (€)</SelectItem>
                                <SelectItem value="GBP" className="focus:bg-white focus:text-black">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.price && (
                        <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-wider">{errors.price}</p>
                    )}
                </div>

                <div className="flex flex-col space-y-3 w-full opacity-60 hover:opacity-100 transition-opacity">
                    <Label
                        htmlFor="originalPrice"
                        className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em]"
                    >
                        Original Price (MSRP)
                    </Label>
                    <Input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        value={originalPrice || ""}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="flex h-12 w-full rounded-none border-x-0 border-t-0 border-b border-zinc-800 bg-transparent px-0 py-2 text-xl text-zinc-500 line-through ring-offset-background placeholder:text-zinc-800 focus-visible:outline-none focus-visible:border-zinc-500 transition-colors"
                    />
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-900">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Pricing Strategy Tip</p>
                        <p className="text-xs text-emerald-200/60 leading-relaxed">
                            Setting an Original Price creates a &quot;Discounted&quot; badge in the AI breakout room. Higher perceived value leads to 14% higher conversion rates on average.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfoStep;
