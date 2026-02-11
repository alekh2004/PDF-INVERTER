"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/features/PdfViewer").then(mod => mod.PdfViewer), { ssr: false });
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowLeft, Images, FileOutput, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ConvertPage() {
    const { file, setFile } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<"pdf-to-img" | "img-to-pdf">("pdf-to-img");
    const [images, setImages] = useState<File[]>([]);

    const handleModeSwitch = () => {
        setMode(prev => prev === "pdf-to-img" ? "img-to-pdf" : "pdf-to-img");
        setFile(null);
        setImages([]);
    }

    const handleConvert = async () => {
        setIsProcessing(true);
        try {
            if (mode === "pdf-to-img") {
                if (!file) return;
                // Dynamic import
                const { pdfToImages } = await import("@/lib/converter-logic");
                const zipBlob = await pdfToImages(file);

                // Download
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${file.name.replace(".pdf", "")}-images.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

            } else {
                if (images.length === 0) return;
                const { imagesToPDF } = await import("@/lib/converter-logic");
                const pdfBytes = await imagesToPDF(images);

                const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `converted-images.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err: any) {
            console.error(err);
            alert("Conversion failed: " + err.message);
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
                        <ArrowRightLeft className="w-8 h-8 text-green-400" /> Converter
                    </h1>
                    <p className="text-gray-400">
                        {mode === "pdf-to-img" ? "Extract images from PDF pages." : "Combine images into a PDF."}
                    </p>
                </div>

                <GlassButton
                    className="ml-auto"
                    variant="secondary"
                    onClick={handleModeSwitch}
                    icon={<ArrowRightLeft className="w-4 h-4" />}
                >
                    Switch to {mode === "pdf-to-img" ? "Images to PDF" : "PDF to Images"}
                </GlassButton>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-grow">
                    {mode === "pdf-to-img" ? (
                        !file ? (
                            <FileUpload onFilesSelected={(files) => setFile(files[0])} className="h-96" />
                        ) : (
                            <div className="h-[600px]">
                                <PdfViewer file={file} />
                            </div>
                        )
                    ) : (
                        <div className="space-y-4">
                            <FileUpload
                                onFilesSelected={(files) => setImages(prev => [...prev, ...files])}
                                allowMultiple={true}
                                className="h-64"
                            />

                            {/* Image Preview Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-red-400 font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <GlassCard>
                        <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                        <GlassButton
                            variant="primary"
                            className="w-full"
                            onClick={handleConvert}
                            isLoading={isProcessing}
                            disabled={mode === "pdf-to-img" ? !file : images.length === 0}
                            icon={mode === "pdf-to-img" ? <Images className="w-5 h-5" /> : <FileOutput className="w-5 h-5" />}
                        >
                            {mode === "pdf-to-img" ? "Convert to Images (ZIP)" : "Create PDF"}
                        </GlassButton>

                        {((mode === "pdf-to-img" && file) || (mode === "img-to-pdf" && images.length > 0)) && (
                            <GlassButton
                                variant="ghost"
                                className="w-full mt-4 text-red-300"
                                onClick={() => { setFile(null); setImages([]); }}
                            >
                                Reset
                            </GlassButton>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
