"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Minimize2, ArrowLeft, Download, Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CompressPage() {
    const { file, setFile, downloadModal } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [quality, setQuality] = useState(0.6);

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const { compressPDF } = await import("@/lib/compression");
            const bytes = await compressPDF(file, quality);
            downloadModal.open(bytes, `compressed_${file.name}`);
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Minimize2 className="w-8 h-8 text-orange-400" /> Compress PDF
                    </h1>
                    <p className="text-gray-400">Reduce file size while maintaining quality.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                    <GlassCard className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-white">Compression Settings</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-white">
                                <span>Compression Level</span>
                                <span className="text-orange-400 font-mono">{Math.round((1 - quality) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="0.9"
                                step="0.1"
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 px-1">
                                <span>Max Compression (Low Quality)</span>
                                <span>Min Compression (High Quality)</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <GlassButton
                                variant="ghost"
                                className="flex-1 text-red-300 hover:text-red-200"
                                onClick={() => { setFile(null); }}
                            >
                                Cancel
                            </GlassButton>
                            <GlassButton
                                variant="primary"
                                className="flex-1"
                                onClick={handleCompress}
                                isLoading={isProcessing}
                                icon={<Minimize2 className="w-4 h-4" />}
                            >
                                Compress PDF
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
