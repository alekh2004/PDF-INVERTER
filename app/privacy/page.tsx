"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12">
            <GlassCard className="p-8">
                <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
                <div className="space-y-4 text-gray-300">
                    <p>At GlassPDF, we take your privacy seriously. All PDF processing happens locally in your browser. We never see, store, or transmit your files to our servers.</p>
                    <h2 className="text-xl font-semibold text-white mt-8">Data Collection</h2>
                    <p>We do not collect any personal data. We use Google AdSense and Analytics to improve our service, which may use cookies to show relevant ads.</p>
                    <h2 className="text-xl font-semibold text-white mt-8">Cookies</h2>
                    <p>We use cookies to personalize content and ads, and to analyze our traffic.</p>
                </div>
            </GlassCard>
        </div>
    );
}
