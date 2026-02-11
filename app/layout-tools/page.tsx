"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { useFileStore } from "@/components/features/FileContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { LayoutGrid, Minimize, ArrowLeft, Move, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createNUpLayout, resizePDF } from "@/lib/layout-logic";

export default function LayoutPage() {
    const { file, setFile, downloadModal } = useFileStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action: () => Promise<Uint8Array>, name: string) => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const bytes = await action();
            downloadModal.open(bytes, name);
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    };

    const handleNUp = async (n: number) => {
        if (!file) return;
        setIsProcessing(true);
        try {
            // dynamic import
            const { createNUpLayout } = await import("@/lib/layout-logic");
            const bytes = await createNUpLayout(file, n);
            downloadModal.open(bytes, `layout-${n}up.pdf`);
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    }

    const handleResize = async (size: "A4" | "Letter") => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const { resizePDF } = await import("@/lib/layout-logic");
            const bytes = await resizePDF(file, size);
            downloadModal.open(bytes, `resized-${size}.pdf`);
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    }

    const handleBooklet = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const { createBookletLayout } = await import("@/lib/layout-logic");
            const bytes = await createBookletLayout(file);
            downloadModal.open(bytes, "booklet.pdf");
        } catch (e: any) { alert(e.message); } finally { setIsProcessing(false); }
    }

    return (
        <div className="flex flex-col gap-8 min-h-[80vh]">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <GlassButton variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></GlassButton>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8 text-orange-400" /> Layout & Resize
                    </h1>
                    <p className="text-gray-400">Change page size or print multiple pages per sheet.</p>
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
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white mb-4 flex gap-2"><LayoutGrid /> N-Up Printing</h2>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Combine multiple pages onto a single sheet. Great for handouts.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <GlassButton variant="secondary" onClick={() => handleNUp(2)} isLoading={isProcessing}>2 Pages / Sheet</GlassButton>
                                <GlassButton variant="secondary" onClick={() => handleNUp(4)} isLoading={isProcessing}>4 Pages / Sheet</GlassButton>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-white font-bold mb-4 flex gap-2"><Move className="w-5 h-5 text-purple-400" /> Set Orientation</h3>
                        <div className="flex gap-4">
                            <GlassButton
                                variant="secondary"
                                className="flex-1"
                                onClick={() => handleAction(async () => {
                                    const { setOrientation } = await import("@/lib/layout-logic");
                                    return setOrientation(file, "portrait");
                                }, "portrait.pdf")}
                                isLoading={isProcessing}
                            >
                                Portrait
                            </GlassButton>
                            <GlassButton
                                variant="secondary"
                                className="flex-1"
                                onClick={() => handleAction(async () => {
                                    const { setOrientation } = await import("@/lib/layout-logic");
                                    return setOrientation(file, "landscape");
                                }, "landscape.pdf")}
                                isLoading={isProcessing}
                            >
                                Landscape
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-white font-bold mb-4 flex gap-2"><Maximize className="w-5 h-5 text-green-400" /> Resize Page</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Scale content to fit standard paper sizes.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <GlassButton variant="secondary" onClick={() => handleResize("A4")} isLoading={isProcessing}>Fit to A4</GlassButton>
                                <GlassButton variant="secondary" onClick={() => handleResize("Letter")} isLoading={isProcessing}>Fit to Letter</GlassButton>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="md:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-4 flex gap-2"><LayoutGrid /> Booklet Mode</h2>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Create a print-ready folded booklet (pages ordered for saddle-stitch binding).</p>
                            <GlassButton variant="primary" className="w-full" onClick={handleBooklet} isLoading={isProcessing}>Create Booklet (A4)</GlassButton>
                        </div>
                    </GlassCard>

                    <div className="md:col-span-2">
                        <GlassButton
                            variant="ghost"
                            className="w-full text-red-300 hover:text-red-200"
                            onClick={() => setFile(null)}
                        >
                            Close File
                        </GlassButton>
                    </div>
                </div >
            )
            }
        </div >
    );
}
