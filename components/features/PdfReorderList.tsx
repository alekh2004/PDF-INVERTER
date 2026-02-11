"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, X, FileText } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useEffect, useState } from "react";

interface PdfFileItem {
    id: string;
    file: File;
}

interface PdfReorderListProps {
    files: PdfFileItem[];
    onReorder: (files: PdfFileItem[]) => void;
    onRemove: (id: string) => void;
}

function DraggableItem({ item, onRemove }: { item: PdfFileItem; onRemove: (id: string) => void }) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            id={item.id}
            dragListener={false}
            dragControls={controls}
            className="relative mb-2"
        >
            <GlassCard className="p-3 flex items-center gap-3 !bg-white/5 hover:!bg-white/10 transition-colors">
                <div
                    className="cursor-move p-2 text-gray-500 hover:text-white"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <FileText className="w-8 h-8 text-blue-400" />

                <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <GlassButton variant="ghost" className="p-2 text-red-400 hover:text-red-300" onClick={() => onRemove(item.id)}>
                    <X className="w-4 h-4" />
                </GlassButton>
            </GlassCard>
        </Reorder.Item>
    );
}

export function PdfReorderList({ files, onReorder, onRemove }: PdfReorderListProps) {
    return (
        <Reorder.Group axis="y" values={files} onReorder={onReorder} className="w-full">
            {files.map((item) => (
                <DraggableItem key={item.id} item={item} onRemove={onRemove} />
            ))}
        </Reorder.Group>
    );
}
