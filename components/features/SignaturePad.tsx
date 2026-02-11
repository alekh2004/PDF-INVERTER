"use client";

import { useRef, useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle resizing
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = 300; // Fixed height
            }
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        setHasDrawn(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000"; // Black signature
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        e.preventDefault(); // Prevent scrolling on touch

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            // ctx.closePath();
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        onSave(canvas.toDataURL("image/png"));
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="border-2 border-dashed border-gray-500 rounded-lg overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full h-[300px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-between gap-4">
                <GlassButton variant="secondary" onClick={clear} icon={<Eraser className="w-4 h-4" />}>Clear</GlassButton>
                <div className="flex gap-2">
                    <GlassButton variant="ghost" onClick={onCancel}>Cancel</GlassButton>
                    <GlassButton variant="primary" onClick={save} disabled={!hasDrawn} icon={<Check className="w-4 h-4" />}>Apply Signature</GlassButton>
                </div>
            </div>
        </div>
    );
}
