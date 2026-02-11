import { PDFDocument } from "pdf-lib";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
}

// Range parser: "1-5, 8, 11-13" -> [0, 1, 2, 3, 4, 7, 10, 11, 12] (0-indexed)
function parseRange(rangeRaw: string, maxPages: number): number[] {
    const pages = new Set<number>();
    const parts = rangeRaw.split(",");

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
            const [start, end] = trimmed.split("-").map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= maxPages) pages.add(i - 1);
                }
            }
        } else {
            const page = Number(trimmed);
            if (!isNaN(page) && page >= 1 && page <= maxPages) {
                pages.add(page - 1);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPDF(file: File, range: string): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    const indicesToKeep = parseRange(range, totalPages);

    if (indicesToKeep.length === 0) {
        throw new Error("Invalid page range or no pages selected.");
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, indicesToKeep);
    copiedPages.forEach(page => newPdf.addPage(page));

    return await newPdf.save();
}
