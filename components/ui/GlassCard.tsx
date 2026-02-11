"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "style"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({
    children,
    className,
    hoverEffect = true,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hoverEffect ? {
                y: -5,
                boxShadow: "0 0 25px rgba(76, 29, 149, 0.4)", // Nebula glow
                borderColor: "rgba(255, 255, 255, 0.3)"
            } : {}}
            className={cn(
                "glass-panel rounded-2xl p-6 relative overflow-hidden",
                "bg-gradient-to-br from-white/5 to-white/0",
                "backdrop-blur-xl border border-white/10",
                "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
                className
            )}
            {...props}
        >
            {/* Decorative Gradient Blob (Nebula Effect) */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
