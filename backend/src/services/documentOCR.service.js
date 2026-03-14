import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Extract text from an uploaded document.
 * - Images (jpg, png, bmp, tiff, webp) → Tesseract.js OCR
 * - PDFs → pdf-parse
 */
export const extractTextFromDocument = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    // Dynamic import so the module loads only when needed
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text || '';
  }

  let preprocessedImagePath = null;
  try {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, ext);
    preprocessedImagePath = path.join(dir, `${base}_preprocessed${ext}`);

    // Preprocess image to enhance text visibility
    await sharp(filePath)
      .greyscale()
      .normalize()
      .sharpen()
      .toFile(preprocessedImagePath);

    const result = await Tesseract.recognize(preprocessedImagePath, 'eng', {
      logger: () => {},
    });

    if (fs.existsSync(preprocessedImagePath)) fs.unlinkSync(preprocessedImagePath);

    return result.data.text || '';
  } catch (error) {
    if (preprocessedImagePath && fs.existsSync(preprocessedImagePath)) {
      fs.unlinkSync(preprocessedImagePath);
    }
    
    // Fallback un-preprocessed
    console.warn("Preprocessed OCR failed, falling back to original image", error);
    try {
      const fallbackResult = await Tesseract.recognize(filePath, 'eng', {
        logger: () => {},
      });
      return fallbackResult.data.text || '';
    } catch(err) {
      return '';
    }
  }
};
