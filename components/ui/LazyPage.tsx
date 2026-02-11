"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";

interface LazyPageProps {
    pageNumber: number;
    width: number;
    rotation?: number;
    onRenderSuccess?: () => void;
}

export const LazyPage = ({ pageNumber, width, rotation, onRenderSuccess }: LazyPageProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" } // Preload when close
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative bg-white/5 rounded-lg overflow-hidden"
            style={{
                width: width,
                aspectRatio: "1/1.414", // A4 approx, prevents layout shift
            }}
        >
            {isVisible ? (
                <div style={{ transform: `rotate(${rotation || 0}deg)` }} className="origin-center w-full h-full">
                    <Page
                        pageNumber={pageNumber}
                        width={width}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onRenderSuccess={onRenderSuccess}
                        loading={<div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Loading...</div>}
                    />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Page {pageNumber}
                </div>
            )}
        </div>
    );
};
