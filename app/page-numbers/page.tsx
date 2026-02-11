"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Hash, ArrowLeft, Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PageNumbersPage() {
    const { file, setFile } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [position, setPosition] = useState<"bottom-right" | "bottom-center" | "top-right">("bottom-center");

    const handleAddNumbers = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const pages = pdfDoc.getPages();
            pages.forEach((page, idx) => {
                const { width, height } = page.getSize();
                const text = `Page ${idx + 1}`;
                const textSize = 12;
                const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);

                let x = 0, y = 30; // Default bottom margin

                if (position === "bottom-center") {
                    x = width / 2 - textWidth / 2;
                } else if (position === "bottom-right") {
                    x = width - textWidth - 30;
                } else if (position === "top-right") {
                    x = width - textWidth - 30;
                    y = height - 30;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: textSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            });

            const bytes = await pdfDoc.save();
            downloadFile(bytes, "numbered.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const downloadFile = (data: Uint8Array, name: string) => {
        const blob = new Blob([data as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Hash className="w-8 h-8 text-teal-400" /> Page Numbers
                    </h1>
                    <p className="text-gray-400">Add page numbers to your document.</p>
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
                        <h2 className="text-xl font-bold text-white">Options</h2>

                        <div className="space-y-4">
                            <label className="text-white block">Position</label>
                            <div className="flex gap-4">
                                <SelectionCard
                                    label="Bottom Center"
                                    selected={position === "bottom-center"}
                                    onClick={() => setPosition("bottom-center")}
                                />
                                <SelectionCard
                                    label="Bottom Right"
                                    selected={position === "bottom-right"}
                                    onClick={() => setPosition("bottom-right")}
                                />
                                <SelectionCard
                                    label="Top Right"
                                    selected={position === "top-right"}
                                    onClick={() => setPosition("top-right")}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
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
                                onClick={handleAddNumbers}
                                isLoading={isProcessing}
                                icon={<Hash className="w-4 h-4" />}
                            >
                                Add Numbers
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

function SelectionCard({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex-1 p-4 rounded-xl border text-center cursor-pointer transition-all ${selected ? "bg-teal-500/20 border-teal-400 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
        >
            {label}
        </div>
    );
}
