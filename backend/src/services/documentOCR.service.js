import Tesseract from 'tesseract.js';
import fs from 'fs';

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

  // Default: treat as image and run Tesseract OCR
  const result = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {},
  });
  return result.data.text || '';
};
