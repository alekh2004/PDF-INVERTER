import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Fix for Next.js / Server environment
if (typeof window === 'undefined') {
    // Setup worker for server-side if needed (though usually we use legacy build)
}

// We need to configure the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface TextItem {
    str: string;
    x: number;
    y: number; // PDF coordinates start from bottom-left
    width: number;
    height: number;
    fontName: string;
}

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<TextItem[][]> {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pagesText: TextItem[][] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items: TextItem[] = [];

        for (const item of content.items) {
            if ('str' in item) { // Check if it's a TextItem
                // Transform matrix [scaleX, skewY, skewX, scaleY, x, y]
                const tx = item.transform;

                items.push({
                    str: item.str,
                    x: tx[4],
                    y: tx[5],
                    width: item.width,
                    height: item.height,
                    fontName: item.fontName
                });
            }
        }
        pagesText.push(items);
    }
    return pagesText;
}

export async function reconstructPDF(
    originalPdfBytes: ArrayBuffer,
    translatedPages: { items: TextItem[], translated: string[] }[]
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Load Hindi Font (Ensure this file exists in your project public/ or localized path)
    // We will assume it's read from the filesystem for this server-side operation
    const fontPath = path.join(process.cwd(), 'public', 'NotoSansDevanagari-Regular.ttf');
    let customFont;

    try {
        const fontBytes = fs.readFileSync(fontPath);
        customFont = await pdfDoc.embedFont(fontBytes);
    } catch (e) {
        console.error("Could not load Hindi font, falling back to standard.");
        // Fallback (will not render Hindi correctly)
    }

    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { items, translated } = translatedPages[i];

        // Safety check
        if (!items || !translated) continue;

        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            const newText = translated[j];

            if (!newText || newText.trim() === '') continue;
            // Skip strict number replacements if we want to preserve formatting
            if (/^\d+$/.test(newText.trim())) continue;

            // 1. "Erase" original text
            // White rectangle with small padding
            page.drawRectangle({
                x: item.x,
                y: item.y, // Adjust if needed
                width: item.width,
                height: Math.abs(item.height || 12),
                color: rgb(1, 1, 1),
            });

            // 2. Draw new text
            if (customFont) {
                page.drawText(newText, {
                    x: item.x,
                    y: item.y,
                    size: Math.abs(item.height || 12),
                    font: customFont,
                    color: rgb(0, 0, 0),
                });
            }
        }
    }

    return await pdfDoc.save();
}
