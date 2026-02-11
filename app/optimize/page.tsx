"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/features/PdfViewer").then(mod => mod.PdfViewer), { ssr: false });
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Sparkles, Crop, FileType, Wand2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OptimizePage() {
    const { file, setFile } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action: string) => {
        if (!file) return;
        setIsProcessing(true);

        try {
            let processedBytes: Uint8Array | null = null;

            if (action === "deskew") {
                const { autoDeskewPDF } = await import("@/lib/ocr-processing");
                processedBytes = await autoDeskewPDF(file);
            } else if (action === "vectorize") {
                const { vectorizePDF } = await import("@/lib/ocr-processing");
                processedBytes = await vectorizePDF(file);
            } else if (action === "clean") {
                const { cleanPDF } = await import("@/lib/ocr-processing");
                processedBytes = await cleanPDF(file);
            } else {
                alert("Feature coming soon!");
                setIsProcessing(false);
                return;
            }

            if (processedBytes) {
                const blob = new Blob([processedBytes as BlobPart], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${action}-${file.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error(err);
            alert("Optimization failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-yellow-400" /> Optimize & OCR
                    </h1>
                    <p className="text-gray-400">Vectorize, deskew, and enhance your PDFs.</p>
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
                    {/* Sidebar Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="space-y-6">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Enhancements</h2>

                            <div className="space-y-4">
                                <GlassButton
                                    variant="primary"
                                    className="w-full justify-between bg-yellow-600/20 border-yellow-400/30 text-yellow-100 hover:bg-yellow-600/40"
                                    icon={<FileType className="w-5 h-5" />}
                                    onClick={() => handleAction("vectorize")}
                                    isLoading={isProcessing}
                                >
                                    Vectorize (OCR)
                                </GlassButton>
                                <p className="text-xs text-gray-500 px-2">
                                    Converts scanned text to searchable vector data.
                                </p>

                                <GlassButton
                                    variant="secondary"
                                    className="w-full justify-between"
                                    icon={<Crop className="w-5 h-5" />}
                                    onClick={() => handleAction("deskew")}
                                    disabled={isProcessing}
                                >
                                    Auto-Deskew
                                </GlassButton>

                                <GlassButton
                                    variant="secondary"
                                    className="w-full justify-between"
                                    icon={<Wand2 className="w-5 h-5" />}
                                    onClick={() => handleAction("clean")}
                                    disabled={isProcessing}
                                >
                                    Clean Background
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassCard className="bg-red-500/5 border-red-500/10">
                            <GlassButton
                                variant="ghost"
                                className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
                                icon={<ArrowLeft className="w-4 h-4" />}
                                onClick={() => setFile(null)}
                            >
                                Reset / New File
                            </GlassButton>
                        </GlassCard>
                    </div>

                    {/* Main Preview */}
                    <div className="lg:col-span-2 min-h-[500px]">
                        <PdfViewer file={file} />
                    </div>
                </div>
            )}
        </div>
    );
}
