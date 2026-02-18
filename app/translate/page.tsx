'use client';

import { useState } from 'react';
import { Upload, FileText, ArrowRight, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming these exist or we use standard
import { Card } from '@/components/ui/card'; // Placeholder ui usage
import ClientProviders from '@/components/layout/ClientProviders';

export default function TranslatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setDownloadUrl(null);
        }
    };

    const handleTranslate = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('targetLang', 'Hindi'); // Default to Hindi as requested

            const res = await fetch('/api/translate', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Translation failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please check if your PDF is readable.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex flex-col items-center">
            <div className="max-w-3xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    AI PDF Translator
                </h1>
                <p className="text-lg text-gray-600">
                    Translate PDFs to Hindi while keeping the original layout.
                    <br />
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-2 inline-block">
                        Powered by Gemini AI • Exact Layout Match
                    </span>
                </p>
            </div>

            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-white/50 backdrop-blur-sm">

                {/* Upload Area */}
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50 group">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            {file ? <FileText size={32} /> : <Upload size={32} />}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                {file ? file.name : "Click to upload PDF"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports standard PDFs"}
                            </p>
                        </div>
                    </label>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-4">
                    {!downloadUrl ? (
                        <button
                            onClick={handleTranslate}
                            disabled={!file || isUploading}
                            className={`
                w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold text-white shadow-lg transition-all
                ${!file || isUploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-95'}
              `}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Translating... (This may take time)
                                </>
                            ) : (
                                <>
                                    Translate to Hindi <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    ) : (
                        <a
                            href={downloadUrl}
                            download={`translated_${file?.name || 'doc'}`}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all"
                        >
                            <Download size={20} /> Download Translated PDF
                        </a>
                    )}

                    {downloadUrl && (
                        <button
                            onClick={() => { setFile(null); setDownloadUrl(null); }}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                            Translate Another File
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
                <FeatureCard
                    icon="🎯"
                    title="Precise Layout"
                    desc="Keeps images, tables, and positions exactly where they are."
                />
                <FeatureCard
                    icon="🧠"
                    title="Context Aware"
                    desc="Uses Gemini AI to understand the meaning, not just word-for-word."
                />
                <FeatureCard
                    icon="⚡"
                    title="Fast Processing"
                    desc="Optimized for speed. Handles standard documents in seconds."
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="bg-white/60 p-6 rounded-xl border border-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}
