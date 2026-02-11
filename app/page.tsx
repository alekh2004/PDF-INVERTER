"use client";

import { AdUnit } from "@/components/features/AdUnit";
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { FileStack, Scissors, ArrowRightLeft, FileImage, Moon, Sparkles, BoxSelect, ShieldCheck, Layers, Eye, PenTool, Minimize, Hash } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDFs into one unified document.",
    icon: <FileStack className="w-8 h-8 text-blue-400" />,
    href: "/merge",
    color: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split documents into separate files.",
    icon: <Scissors className="w-8 h-8 text-pink-400" />,
    href: "/split",
    color: "from-pink-500/10 to-pink-500/5",
  },
  {
    title: "Smart Invert",
    description: "High-contrast dark mode with smart color reversal.",
    icon: <Moon className="w-8 h-8 text-purple-400" />,
    href: "/invert",
    color: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Optimize & OCR",
    description: "Vectorize text, deskew pages, and enhance quality.",
    icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
    href: "/optimize",
    color: "from-yellow-500/10 to-yellow-500/5",
  },
  {
    title: "Organize & Rotate",
    description: "Visually reorder, rotate, and manage PDF pages.",
    icon: <BoxSelect className="w-8 h-8 text-green-400" />,
    href: "/organize",
    color: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Converter",
    description: "Convert Images to PDF or Extract Images.",
    icon: <FileImage className="w-8 h-8 text-indigo-400" />,
    href: "/convert",
    color: "from-indigo-500/10 to-indigo-500/5",
  },
  {
    title: "Layout & Resize",
    description: "N-Up printing, Resizing, and Compression.",
    icon: <Layers className="w-8 h-8 text-red-400" />,
    href: "/layout-tools",
    color: "from-red-500/10 to-red-500/5",
  },
  {
    title: "Sign PDF",
    description: "Draw and add your signature digitally.",
    icon: <PenTool className="w-8 h-8 text-cyan-400" />,
    href: "/sign",
    color: "from-cyan-500/10 to-cyan-500/5",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-200 backdrop-blur-md">
          ✨ The Ultimate AI PDF Tool
        </span>
        <h1 className="text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PDFs</span>
        </h1>
        <p className="text-lg text-gray-300">
          Split, Merge, Invert, and Optimize with our professional-grade glassmorphic tools.
          100% Privacy - Processing happens on your device.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <GlassButton variant="primary" className="text-lg px-8 py-4" icon={<Eye className="w-5 h-5" />}>
            Pick a Tool
          </GlassButton>
          <GlassButton variant="secondary" className="text-lg px-8 py-4">
            Learn More
          </GlassButton>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div id="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {tools.map((tool, index) => (
          <Link key={tool.title} href={tool.href}>
            <GlassCard
              className={`h-full hover:border-blue-400/30 group transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Footer Ad */}
      <div className="w-full mt-12 mb-4">
        <div className="text-center text-xs text-gray-500 mb-2 uppercase tracking-widest">Sponsored</div>
        <AdUnit
          dataAdSlot="88888888"
          dataFullWidthResponsive={true}
          className="bg-white/5 border-white/10 min-h-[120px]"
        />
      </div>
    </div>
  );
}
