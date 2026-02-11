import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full py-8 mt-20 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm md:flex md:justify-between md:items-center">
                <p>© {new Date().getFullYear()} GlassPDF. Built with Next.js & Tailwind.</p>
                <div className="flex flex-wrap gap-6 text-sm text-gray-500 justify-center md:justify-end">
                    <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                    <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
                </div>
            </div>
        </footer>
    );
}
