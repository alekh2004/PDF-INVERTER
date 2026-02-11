import { getPageImage } from "./converter-logic";

import { cleanPageImage } from "./image-processing";

export async function cleanPDF(file: File, vectorize: boolean = false): Promise<Uint8Array> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

    const { PDFDocument } = await import("pdf-lib");

    const arrayBuffer = await file.arrayBuffer();
    const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer.slice(0)).promise;
    const numPages = pdfJsDoc.numPages;

    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        // High quality render
        const imgDataUrl = await getPageImage(pdfJsDoc, i, 2.0);

        // Process
        const processedUrl = await cleanPageImage(imgDataUrl, {
            threshold: vectorize ? 160 : undefined, // Thresholding makes it binary (black/white) like a vector scan
            contrast: vectorize ? 1.5 : 1.2 // Increase contrast for cleaner look
        });

        // Embed
        const img = await newPdf.embedJpg(processedUrl);
        // Add page matching image dimensions (preserves high res)
        const page = newPdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    return await newPdf.save();
}

export async function vectorizePDF(file: File): Promise<Uint8Array> {
    return cleanPDF(file, true);
}

export async function autoDeskewPDF(file: File): Promise<Uint8Array> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

    // ... rest of autoDeskewPDF implementation
    const { PDFDocument, degrees } = await import("pdf-lib");
    const { createWorker } = await import("tesseract.js");

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer.slice(0)).promise;
    const numPages = pdfDoc.getPageCount();
    const worker = await createWorker("eng");

    for (let i = 0; i < numPages; i++) {
        try {
            const imgDataUrl = await getPageImage(pdfJsDoc, i + 1, 0.5);
            const { data } = await worker.recognize(imgDataUrl);
            const pageData = data as any;

            if (pageData.orientation_degrees) {
                console.log(`Page ${i + 1} skew: ${pageData.orientation_degrees} deg`);
                if (pageData.orientation_confidence > 80 && pageData.orientation_degrees !== 0) {
                    const page = pdfDoc.getPage(i);
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + pageData.orientation_degrees));
                }
            }
        } catch (e) {
            console.warn("Deskew failed for page " + (i + 1), e);
        }
    }

    await worker.terminate();
    return await pdfDoc.save();
}

import { ImageProcessingOptions } from "./image-processing";
export interface OptimizationOptions extends ImageProcessingOptions {
    deskew?: boolean;
}

export async function processPDF(file: File, options: OptimizationOptions): Promise<Uint8Array> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

    const { PDFDocument, degrees } = await import("pdf-lib");

    // 1. Deskew First (if requested)
    let processedFile = file;
    if (options.deskew) {
        const deskewedBytes = await autoDeskewPDF(file);
        processedFile = new File([deskewedBytes as BlobPart], file.name, { type: "application/pdf" });
    }

    // 2. Apply Image Filters (Render -> Filter -> PDF)
    // If no image filters requested, and only deskew was requested, we are done.
    const hasImageFilters = options.invert || options.vectorize || options.cleanBackground || options.enhanceText || options.enhanceWeight;

    if (!hasImageFilters) {
        return await processedFile.arrayBuffer().then(b => new Uint8Array(b));
    }

    // Apply filters frame by frame
    const arrayBuffer = await processedFile.arrayBuffer();
    const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer.slice(0)).promise;
    const numPages = pdfJsDoc.numPages;
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        const imgDataUrl = await getPageImage(pdfJsDoc, i, 2.0); // High Res
        const processedUrl = await cleanPageImage(imgDataUrl, options);
        const img = await newPdf.embedJpg(processedUrl);
        const page = newPdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    return await newPdf.save();
}
