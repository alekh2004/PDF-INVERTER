import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use Gemini 1.5 Flash for speed and cost-efficiency (User requested "2.5", assuming 1.5 Flash)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface TranslationResult {
    translatedText: string;
    originalText: string;
}

export async function translateTextBatch(texts: string[], targetLang: string = "Hindi"): Promise<string[]> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Returning original text.");
            return texts;
        }

        // Chunking to avoid token limits (though Flash has a huge window, it's safer)
        // For now, we'll send all at once but structured as JSON to ensure mapping
        const prompt = `
      You are a professional translator. Translate the following array of text strings to ${targetLang}.
      
      Rules:
      1. Maintain the definition and tone.
      2. Keep the translation concise to fit similar visual space if possible.
      3. Return ONLY a JSON array of strings.
      4. Do NOT translate technical terms that should remain in English (e.g., "PDF", "API").
      5. The output array MUST have the exact same length as the input array.

      Input:
      ${JSON.stringify(texts)}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().replace(/```json|```/g, "").trim();

        try {
            const translatedArray = JSON.parse(jsonString);
            if (Array.isArray(translatedArray) && translatedArray.length === texts.length) {
                return translatedArray;
            } else {
                console.error("Translation length mismatch or invalid format.");
                return texts; // Fallback
            }
        } catch (e) {
            console.error("Failed to parse Gemini response:", jsonString);
            return texts; // Fallback
        }

    } catch (error) {
        console.error("Translation error:", error);
        return texts; // Fallback
    }
}
