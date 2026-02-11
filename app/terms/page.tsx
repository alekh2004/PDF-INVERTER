"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12">
            <GlassCard className="p-8">
                <h1 className="text-3xl font-bold mb-6 text-white">Terms of Service</h1>
                <div className="space-y-4 text-gray-300">
                    <p>By using GlassPDF, you agree to these terms.</p>
                    <h2 className="text-xl font-semibold text-white mt-8">Use of Service</h2>
                    <p>The tools provided are free to use. We are not responsible for any data loss occurring from the use of these tools.</p>
                    <h2 className="text-xl font-semibold text-white mt-8">No Warranty</h2>
                    <p>This service is provided "as is" without any warranty of any kind.</p>
                </div>
            </GlassCard>
        </div>
    );
}
