import { PDFDocument } from "pdf-lib";
import { getPageImage } from "./converter-logic"; // Reuse existing renderer

export async function compressPDF(file: File, quality: number = 0.5): Promise<Uint8Array> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer.slice(0)).promise;
    const numPages = pdfJsDoc.numPages;

    // Create new PDF
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        // Render at reasonable scale (e.g. 1.5 for readable but compressed)
        // If quality is low, we can reduce scale too?
        // Let's keep scale 1.5 but JPEG quality `quality`.
        const scale = 1.5;
        const imgDataUrl = await getPageImage(pdfJsDoc, i, scale);

        // The getPageImage returns PNG usually (from canvas.toDataURL()).
        // We need to convert it to JPEG with specific quality.
        // cleanPageImage helper could be used, or just manual.

        const compressedImage = await compressImage(imgDataUrl, quality);
        const img = await newPdf.embedJpg(compressedImage);

        // Add page
        const page = newPdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    return await newPdf.save();
}

async function compressImage(dataUrl: string, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas error");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}
