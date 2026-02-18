"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const GlobalModal = dynamic(() => import("@/components/features/GlobalModal").then(mod => mod.GlobalModal), { ssr: false });
const AiChatWidget = dynamic(() => import("@/components/features/AiChatWidget").then(mod => mod.AiChatWidget), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            {children}
            <GlobalModal />
            <AiChatWidget />
        </ErrorBoundary>
    );
}
