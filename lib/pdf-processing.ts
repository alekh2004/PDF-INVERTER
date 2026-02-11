import { PDFDocument } from "pdf-lib";

export async function invertPDF(file: File, options: { grayscale?: boolean } = {}): Promise<Uint8Array> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality render

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context not available");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext as any).promise;

        // Process pixels
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let j = 0; j < data.length; j += 4) {
            const r = data[j];
            const g = data[j + 1];
            const b = data[j + 2];

            // Grayscale?
            if (options.grayscale) {
                const avg = (r + g + b) / 3;
                data[j] = 255 - avg;
                data[j + 1] = 255 - avg;
                data[j + 2] = 255 - avg;
            } else {
                // Simple Invert
                data[j] = 255 - r;
                data[j + 1] = 255 - g;
                data[j + 2] = 255 - b;
            }
            // Alpha (data[j+3]) stays same
        }

        context.putImageData(imageData, 0, 0);

        // Convert to Image for pdf-lib
        const imgDataUrl = canvas.toDataURL("image/jpeg", 0.85); // JPEG for compression
        const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());

        // Embed in new PDF
        const jpgImage = await newPdfDoc.embedJpg(imgBytes);
        const newPage = newPdfDoc.addPage([viewport.width / 2, viewport.height / 2]); // Scale back down
        newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: viewport.width / 2,
            height: viewport.height / 2,
        });
    }

    return await newPdfDoc.save();
}
