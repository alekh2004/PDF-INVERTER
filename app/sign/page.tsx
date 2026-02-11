"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SignaturePad } from "@/components/features/SignaturePad";
import { PenTool, ArrowLeft, Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignPage() {
    const { file, setFile } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

    const handleSign = async (sigUrl: string) => {
        setSignatureUrl(sigUrl);
        if (!file) return;
        setIsProcessing(true);
        try {
            const { signPDF } = await import("@/lib/organize-security");
            const bytes = await signPDF(file, sigUrl);
            downloadFile(bytes, "signed.pdf");
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
                        <PenTool className="w-8 h-8 text-pink-400" /> Sign PDF
                    </h1>
                    <p className="text-gray-400">Draw your signature and add it to the last page.</p>
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
                    <GlassCard className="md:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-4">Draw Signature</h2>
                        <div className="bg-white rounded-lg p-1">
                            <SignaturePad
                                onSave={handleSign}
                                onCancel={() => setSignatureUrl(null)}
                            />
                        </div>
                    </GlassCard>

                    <div className="md:col-span-2">
                        <GlassButton
                            variant="ghost"
                            className="w-full text-red-300 hover:text-red-200"
                            onClick={() => { setFile(null); setSignatureUrl(null); }}
                        >
                            Close File
                        </GlassButton>
                    </div>
                </div>
            )}
        </div>
    );
}
