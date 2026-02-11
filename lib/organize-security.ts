import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export async function rotatePages(file: File, rotations: { [pageIndex: number]: number }): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    Object.entries(rotations).forEach(([indexStr, angle]) => {
        const index = parseInt(indexStr);
        if (pages[index]) {
            const currentRotation = pages[index].getRotation().angle;
            pages[index].setRotation(degrees(currentRotation + angle));
        }
    });

    return await pdfDoc.save();
}

export async function deletePages(file: File, pageIndicesToDelete: number[]): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Sort indices in descending order to avoid shifting issues when deleting
    const sortedIndices = [...pageIndicesToDelete].sort((a, b) => b - a);

    for (const index of sortedIndices) {
        if (index >= 0 && index < pdfDoc.getPageCount()) {
            pdfDoc.removePage(index);
        }
    }

    return await pdfDoc.save();
}

export async function protectPDF(file: File, password: string): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Cast to any to avoid type issues with specific pdf-lib versions, using standard permissions
    await (pdfDoc as any).encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
            printing: "highResolution",
            modifying: true,
            copying: true,
            annotating: true,
            fillingForms: true,
            contentAccessibility: true,
            documentAssembly: true,
        },
    });

    return await pdfDoc.save();
}

export async function watermarkPDF(file: File, text: string): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = 50;
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.75, 0.75, 0.75), // Light gray
            opacity: 0.5,
            rotate: degrees(45),
        });
    }

    return await pdfDoc.save();
}

export async function signPDF(file: File, signatureImage: string, pageIndex: number = -1): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Embed signature image
    const signatureImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
    // Assume PNG for now (canvas toDataURL is usually PNG)
    const embeddedImage = await pdfDoc.embedPng(signatureImageBytes);

    const pages = pdfDoc.getPages();
    const targetPageIdx = pageIndex === -1 ? pages.length - 1 : pageIndex;
    const page = pages[targetPageIdx];

    if (page) {
        const { width, height } = page.getSize();
        const sigDims = embeddedImage.scale(0.5); // Scale down

        // Place at bottom right
        page.drawImage(embeddedImage, {
            x: width - sigDims.width - 50,
            y: 50,
            width: sigDims.width,
            height: sigDims.height,
        });
    }

    return await pdfDoc.save();
}
