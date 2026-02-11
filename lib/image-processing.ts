export interface ImageProcessingOptions {
    threshold?: number;
    contrast?: number;
    invert?: boolean;
    enhanceWeight?: number; // 0 (Off) to 4 (Max)
    cleanBackground?: number; // 0 (Off) to 4 (Max)
    vectorize?: boolean; // Binary threshold
    enhanceText?: number; // 0 (Off) to 4 (Max)
    deskew?: boolean;
}

export async function cleanPageImage(imageUrl: string, options: ImageProcessingOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // 1. Draw original
            ctx.drawImage(img, 0, 0);

            // 2. Enhance Weight (Thicken text) - Level based
            const weightLevel = options.enhanceWeight || 0;
            if (weightLevel > 0) {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);

                    ctx.globalCompositeOperation = "multiply";
                    // Level 1: 0.5px (simulated by 1px at 50% opacity? No, just 1px cardinal checks)
                    // Level 2: 1px cardinal
                    // Level 3: 1px diagonals
                    // Level 4: 2px cardinal

                    // Optimization: Draw fewer times for lower levels
                    // We use offsets. 
                    const offsets: { x: number, y: number }[] = [];

                    if (weightLevel >= 1) {
                        // Minimal thickening
                        offsets.push({ x: 1, y: 0 }, { x: 0, y: 1 });
                    }
                    if (weightLevel >= 2) {
                        // Full cardinal
                        offsets.push({ x: -1, y: 0 }, { x: 0, y: -1 });
                    }
                    if (weightLevel >= 3) {
                        // Diagonals
                        offsets.push({ x: 1, y: 1 }, { x: -1, y: -1 });
                    }
                    if (weightLevel >= 4) {
                        // Thicker
                        offsets.push({ x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: -2 });
                    }

                    for (const off of offsets) {
                        ctx.drawImage(tempCanvas, off.x, off.y);
                    }

                    ctx.globalCompositeOperation = "source-over";
                }
            }

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Use Uint32Array for faster access (if we process pixel by pixel fully, but we need per-channel for grayscale)
            // Actually, for grayscale logic, just iterating is fine.
            const data = imageData.data;

            // Options Logic
            let thresholdVal = options.threshold ?? (options.vectorize ? 160 : undefined);
            const shouldInvert = options.invert ?? false;

            // Contrast Level Logic
            // Level 1: 1.1, Level 2: 1.25, Level 3: 1.5, Level 4: 2.0
            const textLevel = options.enhanceText || 0;
            const contrastBase = options.contrast || 1.0;
            let contrastVal = contrastBase;
            if (textLevel > 0) {
                const levels = [1.0, 1.1, 1.25, 1.5, 2.0];
                contrastVal = levels[textLevel] || 1.0;
            }

            // Clean Background Level Logic
            // Level 1: White > 230, Level 2: White > 200, Level 3: White > 180, Level 4: White > 150
            const bgLevel = options.cleanBackground || 0;
            let bgThreshold = 255;
            if (bgLevel > 0) {
                const levels = [255, 230, 200, 180, 150];
                bgThreshold = levels[bgLevel] || 255;
            }

            // Processing Loop
            // optimization: Precompute lookup table for contrast?
            // Contrast formula: (c - 128) * contrast + 128.
            // A LUT (Look Up Table) of 256 entries would be much faster than calc per pixel?
            // JS JIT is fast, but LUT is safer.
            const contrastLUT = new Uint8ClampedArray(256);
            if (contrastVal !== 1.0) {
                for (let i = 0; i < 256; i++) {
                    contrastLUT[i] = (i - 128) * contrastVal + 128;
                }
            }

            // Invert LUT
            const invertLUT = new Uint8ClampedArray(256);
            for (let i = 0; i < 256; i++) {
                invertLUT[i] = 255 - i;
            }

            for (let i = 0; i < data.length; i += 4) {
                // Read RGB
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Grayscale (Fast approx: (r+g+b)/3 or weighted?)
                // Weighted is better.
                // Integer math optimization: (r*77 + g*150 + b*29) >> 8  (approx)
                // 0.299 * r + 0.587 * g + 0.114 * b
                let gray = (r * 77 + g * 150 + b * 29) >> 8;

                // Contrast LUT
                if (contrastVal !== 1.0) {
                    gray = contrastLUT[gray];
                }

                // Clean Background
                if (bgLevel > 0) {
                    if (gray > bgThreshold) gray = 255;
                }

                // Threshold (Vectorize)
                if (thresholdVal !== undefined) {
                    gray = (gray > thresholdVal) ? 255 : 0;
                }

                // Enhance Text (Darken)
                // If textLevel is high, force dark grays to black
                if (textLevel >= 3 && thresholdVal === undefined) {
                    if (gray < 80) gray = 0;
                }

                // Clamp (implicit by Uint8ClampedArray if we write back, but 'gray' is number)
                if (gray < 0) gray = 0;
                if (gray > 255) gray = 255;

                // Invert
                if (shouldInvert) {
                    gray = invertLUT[gray];
                }

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}
