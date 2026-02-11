"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/features/PdfViewer").then(mod => mod.PdfViewer), { ssr: false });
import { useFileStore } from "@/components/features/FileContext";
import { PdfReorderList } from "@/components/features/PdfReorderList";
import { FileStack, Merge, ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { mergePDFs } from "@/lib/merge-split";

export default function MergePage() {
    const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFiles = (newFiles: File[]) => {
        const items = newFiles.map(f => ({ id: Math.random().toString(36).substr(2, 9), file: f }));
        setFiles(prev => [...prev, ...items]);
    };

    const handleMerge = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        try {
            const fileList = files.map(f => f.file);
            const processedBytes = await mergePDFs(fileList);
            const blob = new Blob([processedBytes as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `merged-${files.length}-files.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert(err.message || "Merge failed");
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
                        <FileStack className="w-8 h-8 text-blue-400" /> Merge PDFs
                    </h1>
                    <p className="text-gray-400">Combine multiple documents into one.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Area */}
                    <GlassCard className="border-dashed border-2 border-white/20 !bg-transparent">
                        <FileUpload
                            onFilesSelected={handleFiles}
                            allowMultiple={true}
                            className="max-w-full"
                        />
                    </GlassCard>

                    {/* List */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-white px-2">Files ({files.length})</h2>
                            <PdfReorderList
                                files={files}
                                onReorder={setFiles}
                                onRemove={(id) => setFiles(prev => prev.filter(f => f.id !== id))}
                            />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="sticky top-24 space-y-6">
                        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Actions</h2>

                        <div className="space-y-4">
                            <GlassButton
                                variant="primary"
                                className="w-full justify-between"
                                icon={<Merge className="w-5 h-5" />}
                                onClick={handleMerge}
                                isLoading={isProcessing}
                                disabled={files.length < 2}
                            >
                                Merge PDFs
                            </GlassButton>
                            <p className="text-xs text-center text-gray-500">
                                Drag items in the list to reorder.
                            </p>
                        </div>

                        {files.length > 0 && (
                            <GlassButton
                                variant="ghost"
                                className="w-full text-red-300 hover:text-red-200"
                                onClick={() => setFiles([])}
                            >
                                Clear All
                            </GlassButton>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
