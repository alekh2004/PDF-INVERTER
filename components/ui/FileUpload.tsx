"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileType, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number; // in bytes
    className?: string;
    allowMultiple?: boolean;
}

export function FileUpload({
    onFilesSelected,
    accept = { "application/pdf": [".pdf"] },
    maxFiles = 1,
    maxSize = 50 * 1024 * 1024, // 50MB
    className,
    allowMultiple = false,
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            setDragActive(false);
            setError(null);

            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0].code === "file-too-large") {
                    setError(`File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`);
                } else if (rejection.errors[0].code === "too-many-files") {
                    setError(`Only ${maxFiles} file(s) allowed`);
                } else {
                    setError(rejection.errors[0].message);
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onFilesSelected(acceptedFiles);
            }
        },
        [onFilesSelected, maxSize, maxFiles]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: allowMultiple ? 0 : maxFiles, // 0 means unlimited in dropzone logic usually, or we control it manually
        maxSize,
        multiple: allowMultiple,
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
    });

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative cursor-pointer rounded-3xl border-2 border-dashed border-white/20 p-10 transition-all duration-300",
                    "hover:border-blue-400/30 hover:bg-white/5",
                    isDragActive ? "border-cyan-400/50 bg-cyan-400/5" : "",
                    "flex flex-col items-center justify-center text-center gap-4 group"
                )}
            >
                <input {...getInputProps()} />

                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    animate={{
                        borderColor: isDragActive ? "rgba(0, 240, 255, 0.5)" : "rgba(255, 255, 255, 0.1)",
                        backgroundColor: isDragActive ? "rgba(0, 240, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    }}
                    className="w-full h-full flex flex-col items-center justify-center text-center gap-4"
                >
                    {/* Floating Icons Animation */}
                    <div className="relative w-20 h-20 mb-4">
                        {/* Glow behind */}
                        <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full group-hover:bg-blue-400/40 transition-all duration-500" />

                        <motion.div
                            animate={{ y: isDragActive ? -10 : 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-blue-300"
                        >
                            <UploadCloud className="w-10 h-10" />
                        </motion.div>

                        {/* Satellite icons */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-4">
                                <FileType className="w-6 h-6 text-purple-300 opacity-60" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {isDragActive ? "Drop files here!" : "Click or Drag to Upload"}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Supported files: PDF, Images (JPG, PNG) • Max size: {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 left-0 right-0 mx-auto w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
                                onClick={(e) => { e.stopPropagation(); setError(null); }}
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                                <X className="w-3 h-3 ml-2 cursor-pointer hover:bg-red-500/30 rounded-full" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
