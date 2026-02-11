"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/features/PdfViewer").then(mod => mod.PdfViewer), { ssr: false });
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Scissors, FileOutput, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { splitPDF } from "@/lib/merge-split";

export default function SplitPage() {
    const { file, setFile } = useFileStore();
    const [range, setRange] = useState("1-1");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSplit = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const processedBytes = await splitPDF(file, range);
            const blob = new Blob([processedBytes as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `split-${range}-${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert(err.message || "Split failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Scissors className="w-8 h-8 text-pink-400" /> Split PDF
                    </h1>
                    <p className="text-gray-400">Extract pages by range (e.g., 1-5, 8, 10-12).</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="space-y-6">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Settings</h2>

                            <div className="space-y-4">
                                <label className="text-sm text-gray-300">Page Range</label>
                                <GlassInput
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    placeholder="e.g. 1-5, 8"
                                />
                                <p className="text-xs text-gray-500">
                                    Enter page numbers separated by commas or ranges.
                                </p>

                                <GlassButton
                                    variant="primary"
                                    className="w-full justify-between bg-pink-600/20 border-pink-400/30 text-pink-100 hover:bg-pink-600/40"
                                    icon={<FileOutput className="w-5 h-5" />}
                                    onClick={handleSplit}
                                    isLoading={isProcessing}
                                >
                                    Split & Download
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassCard className="bg-red-500/5 border-red-500/10">
                            <GlassButton
                                variant="ghost"
                                className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
                                icon={<RefreshCw className="w-4 h-4" />}
                                onClick={() => setFile(null)}
                            >
                                Reset / New File
                            </GlassButton>
                        </GlassCard>
                    </div>

                    <div className="lg:col-span-2 min-h-[500px]">
                        <PdfViewer file={file} />
                    </div>
                </div>
            )}
        </div>
    );
}
