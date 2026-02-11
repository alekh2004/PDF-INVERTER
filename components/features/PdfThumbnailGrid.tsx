"use client";

import { Document, pdfjs } from "react-pdf";
import { useState } from "react";
import { LazyPage } from "@/components/ui/LazyPage";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

interface PdfThumbnailGridProps {
    file: File | null;
    selectedPages?: Set<number>;
    pageRotations?: { [key: number]: number };
    onToggleSelection?: (index: number) => void;
    onLoadSuccess?: (data: { numPages: number }) => void;
}

export const PdfThumbnailGrid = ({
    file,
    selectedPages = new Set(), // Default to empty set
    pageRotations = {}, // Default
    onToggleSelection = () => { }, // Default no-op
    onLoadSuccess
}: PdfThumbnailGridProps) => {
    const [numPages, setNumPages] = useState<number>(0);

    const handleLoadSuccess = (data: { numPages: number }) => {
        setNumPages(data.numPages);
        if (onLoadSuccess) onLoadSuccess(data);
    };

    if (!file) return null;

    return (
        <div className="lg:col-span-2 bg-white/5 rounded-3xl p-6 border border-white/10 min-h-[500px]">
            <h3 className="text-white mb-4">Select Pages to Organize</h3>
            <Document
                file={file}
                onLoadSuccess={handleLoadSuccess}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                loading={<p className="text-white">Loading document...</p>}
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <div
                        key={`page_${index + 1}`}
                        className={`relative cursor-pointer transition-all ${selectedPages.has(index) ? "ring-2 ring-blue-500 scale-105" : "hover:scale-102"}`}
                        onClick={() => onToggleSelection?.(index)}
                    >
                        <LazyPage
                            pageNumber={index + 1}
                            width={150}
                            rotation={pageRotations?.[index] || 0}
                        />
                        <div className="text-center text-xs text-gray-400 mt-1">Page {index + 1}</div>

                        {selectedPages.has(index) && (
                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">
                                ✓
                            </div>
                        )}
                    </div>
                ))}
            </Document>
            {numPages === 0 && <p className="text-white text-center">Loading Preview...</p>}
        </div>
    );
};
