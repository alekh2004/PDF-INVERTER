import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using modern fonts
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileProvider } from "@/components/features/FileContext";
import { GlobalModal } from "@/components/features/GlobalModal";
import { AiChatWidget } from "@/components/features/AiChatWidget";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "GlassPDF - Advanced PDF Tools",
  description: "Merge, Split, Invert, and Edit PDFs with a beautiful Glassmorphic interface.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* Background Elements */}
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        </div>

        <FileProvider>
          <Navbar />

          <main className="flex-grow pt-24 px-4 max-w-7xl mx-auto w-full">
            {children}
          </main>

          <Footer />
          <GlobalModal />
          <AiChatWidget />
        </FileProvider>

        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" // Placeholder
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
