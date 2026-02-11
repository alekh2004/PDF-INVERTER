"use client";

import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";

// Configure worker - using specific version (v4.8.69) to match react-pdf v9
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    file: File | string | null;
    className?: string;
}

function useResizeObserver(ref: HTMLElement | null, callback: (entry: ResizeObserverEntry) => void) {
    useEffect(() => {
        if (!ref) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) callback(entries[0]);
        });
        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref, callback]);
}

export function PdfViewer({ file, className }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const onResize = useCallback((entry: ResizeObserverEntry) => {
        setContainerWidth(entry.contentRect.width);
    }, []);

    useResizeObserver(containerRef, onResize);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    return (
        <div className={cn("flex flex-col items-center gap-4 w-full", className)}>
            {/* Controls */}
            <div className="flex items-center gap-4 p-2 rounded-xl glass-panel">
                <GlassButton
                    variant="ghost"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => prev - 1)}
                    className="p-2 h-10 w-10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </GlassButton>

                <span className="text-sm text-gray-300 font-medium">
                    Page {pageNumber} of {numPages || "--"}
                </span>

                <GlassButton
                    variant="ghost"
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber(prev => prev + 1)}
                    className="p-2 h-10 w-10"
                >
                    <ChevronRight className="w-5 h-5" />
                </GlassButton>

                <div className="w-px h-6 bg-white/10 mx-2" />

                <GlassButton
                    variant="ghost"
                    onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                    className="p-2 h-10 w-10"
                >
                    <ZoomOut className="w-4 h-4" />
                </GlassButton>
                <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                <GlassButton
                    variant="ghost"
                    onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                    className="p-2 h-10 w-10"
                >
                    <ZoomIn className="w-4 h-4" />
                </GlassButton>
            </div>

            {/* Document Viewer */}
            <div
                className="w-full min-h-[500px] flex justify-center p-8 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-auto"
                ref={setContainerRef}
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center gap-2 py-20 text-blue-400">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p>Loading PDF...</p>
                        </div>
                    }
                    error={
                        <div className="text-red-400 py-10">
                            Failed to load PDF. Please try again.
                        </div>
                    }
                    className="shadow-2xl"
                >
                    <Page
                        pageNumber={pageNumber}
                        width={containerWidth ? Math.min(containerWidth * 0.9, 800) * scale : 600}
                        className="shadow-[0_0_30px_rgba(0,0,0,0.5)] !bg-transparent"
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>
            </div>
        </div>
    );
}
