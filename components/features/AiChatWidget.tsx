"use client";

import { useState, useRef, useEffect } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { MessageSquare, X, Send, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

const INITIAL_MESSAGE: Message = {
    id: "1",
    role: "ai",
    content: "Hi! I'm GlassBot. 👋\nI can help you with PDF tools like Merging, Splitting, or Optimizing.\nWhat do you need to do?"
};

// Advanced Mock Logic
const KNOWLEDGE_BASE = [
    {
        keywords: ["hi", "hello", "hey", "greetings"],
        answers: [
            "Hello! Ready to master your PDFs?",
            "Hi there! How can I assist you today?",
            "Hey! I'm here to help you manipulate some documents."
        ]
    },
    {
        keywords: ["merge", "combine", "join", "stich"],
        answers: [
            "To merge files, use the **Merge PDF** tool. You can upload multiple files and rearrange them before combining.",
            "Merging is simple! Just go to the Merge section, drop your files, and click 'Merge'.",
            "I can help with that. The **Merge PDF** tool combines multiple documents into one."
        ]
    },
    {
        keywords: ["split", "separate", "extract", "cut"],
        answers: [
            "Need to extract pages? The **Split PDF** tool is perfect for that.",
            "You can split a PDF into individual pages or extract specific ranges using the Split tool.",
            "Go to **Split PDF** to break your document into smaller parts."
        ]
    },
    {
        keywords: ["compress", "size", "shrink", "reduce", "large"],
        answers: [
            "File too big? Use the **Compress PDF** tool to reduce its size while keeping good quality.",
            "Our compression tool is smart! You can adjust the quality slider to get the perfect balance.",
            "I recommend the **Compress PDF** tool. It can significantly shrink your file size."
        ]
    },
    {
        keywords: ["invert", "dark", "night", "black"],
        answers: [
            "Ah, the **Smart Invert** tool! It creates a high-contrast dark mode for your PDF.",
            "Want to read at night? Try **Smart Invert** to turn your PDF background black and text white.",
            "Smart Invert isn't just a negative filter; it preserves images while darkening the text."
        ]
    },
    {
        keywords: ["image", "convert", "jpg", "png"],
        answers: [
            "You can convert images to PDF or extract images from a PDF using the **Converter** tool.",
            "We support JPG, PNG, and WebP conversion to PDF."
        ]
    },
    {
        keywords: ["thank", "thanks", "good", "great"],
        answers: [
            "You're welcome! Happy to help.",
            "Anytime! Let me know if you need anything else.",
            "Glad I could help! 🚀"
        ]
    },
    {
        keywords: ["who", "are", "you", "bot", "real"],
        answers: [
            "I'm GlassBot, your virtual PDF assistant. I run entirely in your browser!",
            "I'm a smart agent designed to help you navigate these tools.",
            "I'm your friendly neighborhood PDF helper. 🤖"
        ]
    }
];

export const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    // Reset Chat on Close
    useEffect(() => {
        if (!isOpen) {
            // Optional delay to not reset immediately if accidental click, but user asked for "close kare to chats delete ho jaye"
            const timer = setTimeout(() => {
                setMessages([INITIAL_MESSAGE]);
            }, 300); // Small delay for animation to finish
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const originalInput = input;
        setInput("");

        // Add user message
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: originalInput };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate varying natural delay (1s - 2s)
        const delay = 1000 + Math.random() * 1000;

        setTimeout(() => {
            const response = getSmartResponse(originalInput);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: response };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, delay);
    };

    const getSmartResponse = (query: string): string => {
        const q = query.toLowerCase();

        // Find matching intent
        for (const entry of KNOWLEDGE_BASE) {
            if (entry.keywords.some(k => q.includes(k))) {
                // Return random answer from the list for variety
                const randomIndex = Math.floor(Math.random() * entry.answers.length);
                return entry.answers[randomIndex];
            }
        }

        // Default fallback with personality
        const fallbacks = [
            "I'm not sure specifically about that, but I can help with Merging, Splitting, and Optimization.",
            "Could you rephrase that? I'm an expert on PDF tools!",
            "I'm still learning, but if it involves PDFs, I probably have a tool for it. Try checking the 'All Tools' grid."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <button
                        onClick={() => setIsOpen(true)}
                        aria-label="Chat"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] text-white transition-all hover:scale-110"
                    >
                        <Bot className="w-8 h-8" />
                    </button>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        Ask AI Help
                    </div>
                </motion.div>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-sm mr-4 mb-4 md:mb-0 md:mr-0"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-4 border-b border-white/10 flex justify-between items-center cursor-move">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                                        <Bot className="w-6 h-6 text-white" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">GlassBot AI</h3>
                                        <p className="text-[10px] text-blue-200">Virtual Assistant</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setMessages([INITIAL_MESSAGE])}
                                        title="Clear Chat"
                                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-xs text-red-200 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <span>Close</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === "user"
                                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                                                    : "bg-white/10 backdrop-blur-md text-gray-100 rounded-bl-none border border-white/5"
                                                }`}
                                        >
                                            {msg.content.split('\n').map((line, i) => (
                                                <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 p-4 rounded-2xl rounded-bl-none border border-white/5 flex gap-1 items-center">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="ask me about pdf tools..."
                                        className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm placeholder:text-gray-500 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isTyping}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-95"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
