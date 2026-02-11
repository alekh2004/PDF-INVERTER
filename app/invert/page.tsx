"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Moon, Sparkles, Check, ArrowLeft, Zap, FileText, Type, Layers, Droplet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const PdfThumbnailGrid = dynamic(() => import("@/components/features/PdfThumbnailGrid").then(mod => mod.PdfThumbnailGrid), { ssr: false });

export default function SmartInvertPage() {
    const { file, setFile, downloadModal } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);

    // Optimization Options
    const [options, setOptions] = useState({
        deskew: false,
        cleanBackground: 0, // 0-4
        invert: false,
        enhanceText: 0, // 0-4
        enhanceWeight: 0, // 0-4
        vectorize: false
    });

    const updateOption = (key: keyof typeof options, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = async (overrideOptions?: any) => {
        if (!file) return;
        setIsProcessing(true);
        const processingOptions = overrideOptions || options;
        try {
            const { processPDF } = await import("@/lib/ocr-processing");
            const bytes = await processPDF(file, processingOptions);

            // Determine filename based on options
            let labels = [];
            if (processingOptions.invert) labels.push("inverted");
            if (processingOptions.cleanBackground > 0) labels.push("cleaned");
            if (processingOptions.vectorize) labels.push("vectorized");
            if (labels.length === 0) labels.push("optimized");

            downloadModal.open(bytes, `${labels.join("-")}.pdf`);
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const handleQuickInvert = () => {
        handleApply({
            deskew: false,
            cleanBackground: 0,
            invert: true,
            enhanceText: 0,
            enhanceWeight: 0,
            vectorize: false
        });
    };

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-purple-400" /> Advanced Optimization
                    </h1>
                    <p className="text-gray-400">Enhance, Invert, Deskew, and Vectorize your PDFs.</p>
                </div>
            </div>

            {!file ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-grow flex items-center justify-center p-10"
                >
                    <FileUpload onFilesSelected={(files) => setFile(files[0])} />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <PdfThumbnailGrid file={file} />

                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <GlassCard className="bg-gradient-to-br from-green-500/10 to-blue-500/5 border-green-500/30">
                            <h3 className="text-white font-bold mb-4 flex gap-2"><Zap className="w-5 h-5 text-green-400" /> Quick Actions</h3>
                            <div className="space-y-3">
                                <GlassButton
                                    variant="secondary"
                                    className="w-full justify-between"
                                    onClick={handleQuickInvert}
                                    isLoading={isProcessing}
                                >
                                    <span>Instant Dark Mode</span>
                                    <Moon className="w-4 h-4" />
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-white font-bold mb-4 flex gap-2"><Layers className="w-5 h-5 text-yellow-400" /> Fine Tuning</h3>
                            <div className="space-y-6">
                                {/* Toggles */}
                                <div className="space-y-3">
                                    <Toggle
                                        label="Auto-Deskew"
                                        checked={options.deskew}
                                        onChange={() => updateOption("deskew", !options.deskew)}
                                    />
                                    <Toggle
                                        label="Smart Invert"
                                        checked={options.invert}
                                        onChange={() => updateOption("invert", !options.invert)}
                                    />
                                    <Toggle
                                        label="Vectorize"
                                        checked={options.vectorize}
                                        onChange={() => updateOption("vectorize", !options.vectorize)}
                                    />
                                </div>

                                {/* Sliders */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <LevelSlider
                                        label="Clean Background"
                                        value={options.cleanBackground}
                                        onChange={(v) => updateOption("cleanBackground", v)}
                                        icon={<Droplet className="w-4 h-4" />}
                                    />
                                    <LevelSlider
                                        label="Enhance Text"
                                        value={options.enhanceText}
                                        onChange={(v) => updateOption("enhanceText", v)}
                                        icon={<FileText className="w-4 h-4" />}
                                    />
                                    <LevelSlider
                                        label="Bold Text"
                                        value={options.enhanceWeight}
                                        onChange={(v) => updateOption("enhanceWeight", v)}
                                        icon={<Type className="w-4 h-4" />}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <GlassButton
                                    variant="primary"
                                    className="w-full py-4 text-lg"
                                    onClick={() => handleApply()}
                                    isLoading={isProcessing}
                                    icon={<Sparkles className="w-5 h-5" />}
                                >
                                    Apply Enhancements
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassButton
                            variant="ghost"
                            className="w-full text-red-300 hover:text-red-200"
                            onClick={() => {
                                setFile(null); setOptions({
                                    deskew: false, cleanBackground: 0, invert: false,
                                    enhanceText: 0, enhanceWeight: 0, vectorize: false
                                });
                            }}
                        >
                            Close File
                        </GlassButton>
                    </div>
                </div>
            )}
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${checked ? "bg-blue-500/20 border-blue-400" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            onClick={onChange}
        >
            <span className="text-white font-medium text-sm">{label}</span>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? "bg-blue-500 border-blue-500" : "border-gray-500 bg-black/20"}`}>
                {checked && <Check className="w-3 h-3 text-white" />}
            </div>
        </div>
    );
}

function LevelSlider({ label, value, onChange, icon }: { label: string, value: number, onChange: (v: number) => void, icon: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-300">
                <div className="flex items-center gap-2">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className="text-blue-400 font-mono">{value === 0 ? "Off" : `Lvl ${value}`}</span>
            </div>
            <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 px-1">
                <span>Off</span>
                <span>Max</span>
            </div>
        </div>
    );
}
