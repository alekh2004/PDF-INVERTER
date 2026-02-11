"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, icon, ...props }, ref) => {
        return (
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white",
                        "placeholder:text-gray-400 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/20",
                        "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
                        icon && "pl-10",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
GlassInput.displayName = "GlassInput";
