"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Document, Page } from "react-pdf";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Grid, Lock, ShieldCheck, Trash2, RotateCw, ArrowLeft, Stamp } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { rotatePages, deletePages, protectPDF, watermarkPDF } from "@/lib/organize-security";
import dynamic from "next/dynamic";

const PdfThumbnailGrid = dynamic(() => import("@/components/features/PdfThumbnailGrid").then(mod => mod.PdfThumbnailGrid), { ssr: false });

export default function OrganizePage() {
    const { file, setFile } = useFileStore();
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [pageRotations, setPageRotations] = useState<{ [key: number]: number }>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [password, setPassword] = useState("");
    const [watermark, setWatermark] = useState("");

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedPages);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setSelectedPages(newSet);
    };

    // ... (keep usage of rotateSelected, handleDelete, etc.)

    const rotateSelected = (angle: number) => {
        const newRotations = { ...pageRotations };
        if (selectedPages.size === 0) {
            alert("Select pages to rotate first!");
            return;
        }
        selectedPages.forEach(idx => {
            newRotations[idx] = (newRotations[idx] || 0) + angle;
        });
        setPageRotations(newRotations);
    };

    const handleDelete = async () => {
        if (selectedPages.size === 0) return;
        if (!file) return;
        setIsProcessing(true);
        try {
            const processedBytes = await deletePages(file, Array.from(selectedPages));
            downloadFile(processedBytes, "deleted-pages.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const handleApplyRotations = async () => {
        if (Object.keys(pageRotations).length === 0) return;
        if (!file) return;
        setIsProcessing(true);
        try {
            const processedBytes = await rotatePages(file, pageRotations);
            downloadFile(processedBytes, "rotated.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const handleProtect = async () => {
        if (!password || !file) return;
        setIsProcessing(true);
        try {
            const processedBytes = await protectPDF(file, password);
            downloadFile(processedBytes, "protected.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const handleWatermark = async () => {
        if (!watermark || !file) return;
        setIsProcessing(true);
        try {
            const processedBytes = await watermarkPDF(file, watermark);
            downloadFile(processedBytes, "watermarked.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const downloadFile = (data: Uint8Array, name: string) => {
        const blob = new Blob([data as BlobPart], { type: "application/pdf" }); // Explicit cast for TS
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
                        <Grid className="w-8 h-8 text-indigo-400" /> Organize & Secure
                    </h1>
                    <p className="text-gray-400">Rotate, Delete, Encrypt, or Watermark.</p>
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
                    {/* Thumbnail Grid */}
                    <PdfThumbnailGrid
                        file={file}
                        selectedPages={selectedPages}
                        pageRotations={pageRotations}
                        onToggleSelection={toggleSelection}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    />

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Organize Card */}
                        <GlassCard>
                            <h3 className="text-white font-bold mb-4 flex gap-2"><Grid className="w-5 h-5" /> Page Tools</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <GlassButton variant="secondary" onClick={() => rotateSelected(90)} icon={<RotateCw className="w-4 h-4" />}>Rotate</GlassButton>
                                <GlassButton variant="secondary" className="text-red-300 hover:text-red-200" onClick={handleDelete} icon={<Trash2 className="w-4 h-4" />}>Delete</GlassButton>
                            </div>
                            <GlassButton variant="primary" className="w-full" onClick={handleApplyRotations} isLoading={isProcessing}>Apply Changes</GlassButton>
                        </GlassCard>

                        {/* Security Card */}
                        <GlassCard>
                            <h3 className="text-white font-bold mb-4 flex gap-2"><ShieldCheck className="w-5 h-5" /> Protect</h3>
                            <div className="space-y-2 mb-4">
                                <GlassInput
                                    type="password"
                                    placeholder="Set Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <GlassButton variant="secondary" className="w-full" onClick={handleProtect} icon={<Lock className="w-4 h-4" />} disabled={!password}>Encrypt PDF</GlassButton>
                        </GlassCard>

                        {/* Watermark Card */}
                        <GlassCard>
                            <h3 className="text-white font-bold mb-4 flex gap-2"><Stamp className="w-5 h-5" /> Watermark</h3>
                            <div className="space-y-2 mb-4">
                                <GlassInput
                                    type="text"
                                    placeholder="Watermark Text"
                                    value={watermark}
                                    onChange={(e) => setWatermark(e.target.value)}
                                />
                            </div>
                            <GlassButton variant="secondary" className="w-full" onClick={handleWatermark} icon={<Stamp className="w-4 h-4" />} disabled={!watermark}>Add Watermark</GlassButton>
                        </GlassCard>

                        <GlassButton
                            variant="ghost"
                            className="w-full text-red-300 hover:text-red-200 mt-4"
                            onClick={() => { setFile(null); setPageRotations({}); setSelectedPages(new Set()); }}
                        >
                            Close File
                        </GlassButton>
                    </div>
                </div>
            )}
        </div>
    );
}
