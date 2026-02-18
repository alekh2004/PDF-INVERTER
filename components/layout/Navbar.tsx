"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Menu, X, Github } from "lucide-react";
import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Merge", href: "/merge" },
        { name: "Split", href: "/split" },
        { name: "Compress", href: "/compress" },
        { name: "Optimize", href: "/optimize" },
        { name: "Organize", href: "/organize" },
        { name: "Page No.", href: "/page-numbers" },
        { name: "Translate", href: "/translate" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto glass-panel rounded-full px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-400/30 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                        <FileText className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                        GlassPDF
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <GlassButton
                        variant="primary"
                        className="hidden md:flex"
                        onClick={() => {
                            const btn = document.querySelector("button[aria-label='Chat']") as HTMLElement;
                            if (btn) btn.click();
                            else alert("Click the round bot icon in the corner!");
                        }}
                    >
                        Get Help
                    </GlassButton>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-300 hover:text-white"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-20 left-4 right-4 glass-panel rounded-2xl p-4 flex flex-col gap-2"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl block"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </motion.div>
            )}
        </nav>
    );
}
