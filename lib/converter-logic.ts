import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

// Re-use logic for worker setup if needed, but usually handled in the implementation file imports

export async function getPageImage(pdf: any, pageNum: number, scale: number = 2.0): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not available");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.8);
}

export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
        const buffer = await file.arrayBuffer();
        let image;

        // Check file type
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
            image = await pdfDoc.embedJpg(buffer);
        } else if (file.type === "image/png") {
            image = await pdfDoc.embedPng(buffer);
        } else {
            continue; // Skip unsupported
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return await pdfDoc.save();
}

export async function pdfToImages(file: File): Promise<Blob> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = pdf.numPages;
    const zip = new JSZip();

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Good quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas context not available");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext as any).promise;

        // Convert to blob
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));

        if (blob) {
            zip.file(`page-${i}.jpg`, blob);
        }
    }

    return await zip.generateAsync({ type: "blob" });
}
