"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { GlassButton } from "./GlassButton";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <GlassCard className="max-w-md w-full border-red-500/30 bg-red-500/5 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Oops! Something went wrong.</h2>
                            <p className="text-gray-400 text-sm">
                                The application encountered an unexpected error. This might be due to a hydration mismatch or a temporary loading issue.
                            </p>
                            {this.state.error && (
                                <div className="bg-black/40 p-3 rounded-lg text-xs font-mono text-red-300 break-all overflow-hidden text-left mt-4 max-h-32 overflow-y-auto">
                                    {this.state.error.message}
                                </div>
                            )}
                        </div>
                        <GlassButton
                            variant="primary"
                            className="w-full"
                            onClick={() => window.location.reload()}
                            icon={<RefreshCcw className="w-4 h-4" />}
                        >
                            Reload Page
                        </GlassButton>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}
