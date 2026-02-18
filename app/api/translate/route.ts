import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, reconstructPDF, TextItem } from '@/lib/pdf-processing';
import { translateTextBatch } from '@/lib/translation-service';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const targetLang = (formData.get('targetLang') as string) || 'Hindi';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // 1. Extract Text
        console.log(`Extracting text from PDF: ${file.name}`);
        const pagesText = await extractTextFromPDF(arrayBuffer);

        // 2. Translate Text
        // Flatten for batch translation to save API calls, but keep page/item association
        console.log('Translating text blocks...');

        // We process page by page to manage context better
        const translatedPages = [];

        for (const pageItems of pagesText) {
            // Filter out empty strings
            const textsToTranslate = pageItems.map(item => item.str).filter(s => s.trim().length > 0);

            let translatedTexts: string[] = [];

            if (textsToTranslate.length > 0) {
                translatedTexts = await translateTextBatch(textsToTranslate, targetLang);
            }

            // Re-map translated text back to items
            // Note: We used filter, so we need to be careful with indices.
            // Actually, let's just translate everything including whitespace to keep indices 1:1 if possible
            // or map properly.

            // Better strategy: Only translate non-empty, put back into same slots.
            const fullTranslatedList = [];
            let tIndex = 0;

            for (const item of pageItems) {
                if (item.str.trim().length > 0) {
                    fullTranslatedList.push(translatedTexts[tIndex] || item.str);
                    tIndex++;
                } else {
                    fullTranslatedList.push(item.str);
                }
            }

            translatedPages.push({
                items: pageItems,
                translated: fullTranslatedList
            });
        }

        // 3. Reconstruct PDF
        console.log('Reconstructing PDF...');
        const newPdfBytes = await reconstructPDF(arrayBuffer, translatedPages);

        // Return PDF
        return new NextResponse(newPdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="translated_${file.name}"`,
            },
        });

    } catch (error: any) {
        console.error('Translation API Error:', error);
        return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
    }
}
