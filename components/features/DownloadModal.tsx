"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { Download, X } from "lucide-react";
import { AdUnit } from "./AdUnit";
import { motion, AnimatePresence } from "framer-motion";

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    fileData: Uint8Array | null;
}

export const DownloadModal = ({ isOpen, onClose, fileName, fileData }: DownloadModalProps) => {
    const handleDownload = () => {
        if (!fileData) return;
        const blob = new Blob([fileData as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-gray-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <Download className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Your File is Ready!</h2>
                            <p className="text-gray-400 text-sm truncate px-4">{fileName}</p>
                        </div>

                        {/* Ad Slot */}
                        <div className="mb-6 min-h-[250px] bg-white/5 rounded-xl flex items-center justify-center">
                            <AdUnit dataAdSlot="1234567890" dataAdFormat="rectangle" />
                        </div>

                        <GlassButton
                            variant="primary"
                            className="w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border-green-500/50"
                            onClick={handleDownload}
                        >
                            Download Now
                        </GlassButton>

                        <p className="text-center text-xs text-gray-600 mt-4">
                            Your download supports this free tool. Thank you!
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
