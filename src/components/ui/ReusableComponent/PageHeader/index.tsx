import React from "react";
import { Search } from "lucide-react";

type Props = {
  heading?: string;
  mainIcon: React.ReactNode;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  children?: React.ReactNode;
  placeholder?: string;
};

const PageHeader = ({
  heading,
  mainIcon,
  leftIcon,
  rightIcon,
  children,
  placeholder,
}: Props) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Title row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Icon cluster */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -left-4 -top-3 opacity-30 scale-75 rotate-45">{leftIcon}</div>
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              {mainIcon}
            </div>
            <div className="absolute -right-4 -top-3 opacity-30 scale-75 rotate-45">{rightIcon}</div>
          </div>
          <h1 className="text-2xl font-semibold text-[#fafafa] ml-4">{heading}</h1>
        </div>
      </div>

      {/* Search + tabs row */}
      <div className="w-full flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            placeholder={placeholder || "Search..."}
            className="w-full pl-8 pr-3 h-8 text-sm bg-[#18181b] border border-[#27272a] rounded-md text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
          />
        </div>

        <div className="overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  )
};

export default PageHeader;
