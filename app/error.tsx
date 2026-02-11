"use client";

import { useEffect } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="bg-red-500/10 p-4 rounded-full mb-6 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Something went wrong!</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                We encountered an unexpected error. Don't worry, your files are safe (not uploaded).
            </p>
            <div className="flex gap-4">
                <GlassButton variant="secondary" onClick={() => window.location.href = "/"}>
                    Go Home
                </GlassButton>
                <GlassButton variant="primary" onClick={() => reset()}>
                    Try Again
                </GlassButton>
            </div>
        </div>
    );
}
