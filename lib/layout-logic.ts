import { PDFDocument, PageSizes, degrees } from "pdf-lib";

export async function createNUpLayout(file: File, n: number = 2): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const pages = pdfDoc.getPages();
    // We use A4 as standard output for N-up, or use the first page size?
    // Let's use A4 landscape/portrait depending on N
    // 2-up: Side by side (Landscape output usually)
    // 4-up: 2x2 grid (Portrait output)

    const outputSize = PageSizes.A4; // [595.28, 841.89]
    const [width, height] = outputSize;
    const isLandscape = n === 2; // For 2-up, we often want landscape A4 to fit 2 portrait A5s? Or 2 A4s scaled down? 
    // Let's stick to standard logic: Scale pages to fit the grid on an A4 sheet.

    const finalWidth = isLandscape ? height : width;
    const finalHeight = isLandscape ? width : height;

    const copiedPages = await newPdf.embedPages(pages);

    for (let i = 0; i < copiedPages.length; i += n) {
        const page = newPdf.addPage([finalWidth, finalHeight]);

        // Calculate grid
        const cols = n === 2 ? 2 : 2;
        const rows = n === 2 ? 1 : 2;

        const cellWidth = finalWidth / cols;
        const cellHeight = finalHeight / rows;

        for (let j = 0; j < n; j++) {
            if (i + j >= copiedPages.length) break;
            const srcPage = copiedPages[i + j];
            const { width: srcW, height: srcH } = srcPage;

            // Scale to fit cell while maintaining aspect ratio
            const scale = Math.min(cellWidth / srcW, cellHeight / srcH) * 0.9; // 10% margin

            const drawnW = srcW * scale;
            const drawnH = srcH * scale;

            // Position
            const col = j % cols;
            const row = Math.floor(j / cols);

            // Calculate X,Y to center in cell
            const cellX = col * cellWidth;
            // Row 0 is Top, so in PDF coords (bottom-up), it's (rows - 1 - row) * cellHeight
            const cellY = (rows - 1 - row) * cellHeight;

            const x = cellX + (cellWidth - drawnW) / 2;
            const y = cellY + (cellHeight - drawnH) / 2;

            page.drawPage(srcPage, { x, y, width: drawnW, height: drawnH });
        }
    }

    return await newPdf.save();
}

export async function resizePDF(file: File, sizeName: "A4" | "Letter" | "A3"): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Target Sizes
    const sizes = {
        "A4": PageSizes.A4,
        "Letter": PageSizes.Letter,
        "A3": PageSizes.A3
    };
    const [targetW, targetH] = sizes[sizeName];

    const newPdf = await PDFDocument.create();
    const embeddedPages = await newPdf.embedPages(pages);

    for (const srcPage of embeddedPages) {
        const page = newPdf.addPage([targetW, targetH]);
        const { width: srcW, height: srcH } = srcPage;

        // Scale to fit
        const scale = Math.min(targetW / srcW, targetH / srcH);
        const drawnW = srcW * scale;
        const drawnH = srcH * scale;

        page.drawPage(srcPage, {
            x: (targetW - drawnW) / 2,
            y: (targetH - drawnH) / 2,
            width: drawnW,
            height: drawnH
        });
    }

    return await newPdf.save();
}

export async function createBookletLayout(file: File): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const pages = pdfDoc.getPages();
    const count = pages.length;

    // Check if page count is multiple of 4, if not add blank pages
    const remainder = count % 4;
    const padding = remainder === 0 ? 0 : 4 - remainder;

    for (let i = 0; i < padding; i++) {
        pdfDoc.addPage();
    }

    const totalPages = count + padding;
    const embeddedPages = await newPdf.embedPages(pdfDoc.getPages());

    const [width, height] = PageSizes.A4; // Portrait
    const finalWidth = height; // Landscape width
    const finalHeight = width; // Landscape height
    const halfWidth = finalWidth / 2;

    for (let i = 0; i < totalPages / 2; i += 2) {
        // Front side of sheet
        const leftIdx = totalPages - 1 - i;
        const rightIdx = i;

        const sheetFront = newPdf.addPage([finalWidth, finalHeight]);

        const rightPage = embeddedPages[rightIdx];
        if (rightPage) {
            const rightScale = Math.min(halfWidth / rightPage.width, finalHeight / rightPage.height) * 0.9;
            sheetFront.drawPage(rightPage, {
                x: halfWidth + (halfWidth - rightPage.width * rightScale) / 2,
                y: (finalHeight - rightPage.height * rightScale) / 2,
                width: rightPage.width * rightScale,
                height: rightPage.height * rightScale
            });
        }

        const leftPage = embeddedPages[leftIdx];
        if (leftPage) {
            const leftScale = Math.min(halfWidth / leftPage.width, finalHeight / leftPage.height) * 0.9;
            sheetFront.drawPage(leftPage, {
                x: (halfWidth - leftPage.width * leftScale) / 2,
                y: (finalHeight - leftPage.height * leftScale) / 2,
                width: leftPage.width * leftScale,
                height: leftPage.height * leftScale
            });
        }

        if (i + 1 < totalPages / 2) {
            const nextRightIdx = totalPages - 1 - (i + 1);
            const nextLeftIdx = i + 1;

            const sheetBack = newPdf.addPage([finalWidth, finalHeight]);

            const rightPage2 = embeddedPages[nextRightIdx];
            if (rightPage2) {
                const rightScale2 = Math.min(halfWidth / rightPage2.width, finalHeight / rightPage2.height) * 0.9;
                sheetBack.drawPage(rightPage2, {
                    x: halfWidth + (halfWidth - rightPage2.width * rightScale2) / 2,
                    y: (finalHeight - rightPage2.height * rightScale2) / 2,
                    width: rightPage2.width * rightScale2,
                    height: rightPage2.height * rightScale2
                });
            }

            const leftPage2 = embeddedPages[nextLeftIdx];
            if (leftPage2) {
                const leftScale2 = Math.min(halfWidth / leftPage2.width, finalHeight / leftPage2.height) * 0.9;
                sheetBack.drawPage(leftPage2, {
                    x: (halfWidth - leftPage2.width * leftScale2) / 2,
                    y: (finalHeight - leftPage2.height * leftScale2) / 2,
                    width: leftPage2.width * leftScale2,
                    height: leftPage2.height * leftScale2
                });
            }
        }
    }

    return await newPdf.save();
}

export async function setOrientation(file: File, orientation: "portrait" | "landscape"): Promise<Uint8Array> {
    const { PDFDocument, degrees } = await import("pdf-lib");
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach(page => {
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle;

        let effectiveWidth = width;
        let effectiveHeight = height;
        if (rotation % 180 !== 0) {
            effectiveWidth = height;
            effectiveHeight = width;
        }

        const isPortrait = effectiveHeight >= effectiveWidth;
        const isLandscape = effectiveWidth > effectiveHeight;

        if (orientation === "portrait" && isLandscape) {
            page.setRotation(degrees(rotation + 90));
        } else if (orientation === "landscape" && isPortrait) {
            page.setRotation(degrees(rotation + 90));
        }
    });

    return await pdfDoc.save();
}
