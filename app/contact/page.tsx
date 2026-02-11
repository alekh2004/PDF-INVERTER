"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 text-center">
            <GlassCard className="p-8">
                <h1 className="text-3xl font-bold mb-6 text-white">Contact Us</h1>
                <p className="text-gray-300 mb-8">Have questions or feedback? Reach out to us!</p>
                <div className="text-blue-400 font-semibold text-xl">
                    support@glasspdf.example.com
                </div>
                <p className="text-sm text-gray-500 mt-4">We usually respond within 24 hours.</p>
            </GlassCard>
        </div>
    );
}
