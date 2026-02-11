"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";
import { Loader2 } from "lucide-react";

interface GlassButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "ref"> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function GlassButton({
    className,
    variant = "primary",
    isLoading,
    icon,
    children,
    ...props
}: GlassButtonProps) {
    const variants = {
        primary: "bg-blue-600/20 border-blue-400/30 text-blue-100 hover:bg-blue-600/40 hover:border-blue-400/60 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
        secondary: "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20",
        danger: "bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        ghost: "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 font-medium overflow-hidden group",
                variants[variant],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

            <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    icon && <span className="text-lg">{icon}</span>
                )}
                {children}
            </span>
        </motion.button>
    );
}
