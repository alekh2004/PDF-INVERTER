export function Footer() {
    return (
        <footer className="w-full py-8 mt-20 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
                <p>© {new Date().getFullYear()} GlassPDF. Built with Next.js & Tailwind.</p>
            </div>
        </footer>
    );
}
