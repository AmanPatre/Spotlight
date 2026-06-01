import React from "react";
import { Search } from "lucide-react";

type Props = {
  heading?: string;
  mainIcon: React.ReactNode;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  children?: React.ReactNode;
  placeholder?: string;
  showSearch?: boolean;
};

const PageHeader = ({
  heading,
  mainIcon,
  leftIcon,
  rightIcon,
  children,
  placeholder,
  showSearch = true,
}: Props) => {
  return (
    <div className="w-full flex items-center justify-between gap-6 py-2">
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon cluster */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="absolute -left-2.5 -top-2 opacity-30 scale-50 rotate-45">{leftIcon}</div>
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
            {mainIcon}
          </div>
          <div className="absolute -right-2.5 -top-2 opacity-30 scale-50 rotate-45">{rightIcon}</div>
        </div>
        <h1 className="text-xl font-bold text-[#fafafa] ml-2 tracking-tight truncate">{heading}</h1>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525b]" />
            <input
              type="text"
              placeholder={placeholder || "Search..."}
              className="w-full pl-8 pr-3 h-8 text-[13px] bg-[#18181b] border border-[#27272a] rounded-md text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50"
            />
          </div>
        )}

        {children && (
          <div className="shrink-0 flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  )
};

export default PageHeader;
