import Tesseract from 'tesseract.js';

export const extractNameAndId = (text) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let name = null;
  let idNumber = null;

  for (const line of lines) {
    const idMatch = line.match(/(\d{6,})/);
    if (idMatch && !idNumber) {
      idNumber = idMatch[1];
    }

    if (!name && /name/i.test(line)) {
      const parts = line.split(/:|-/i);
      if (parts.length > 1) {
        name = parts[1].trim();
      }
    }
  }

  if (!name && lines.length > 0) {
    name = lines[0];
  }

  return { name, idNumber };
};

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const runOcr = async (imagePath) => {
  let preprocessedImagePath = null;

  try {
    // Generate a temporary file path for the preprocessed image
    const ext = path.extname(imagePath);
    const dir = path.dirname(imagePath);
    const base = path.basename(imagePath, ext);
    preprocessedImagePath = path.join(dir, `${base}_preprocessed${ext}`);

    // Preprocess image with sharp for better OCR results
    await sharp(imagePath)
      .greyscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen()   // Sharpen edges for text clarity
      .toFile(preprocessedImagePath);

    // Run Tesseract on the preprocessed image
    const result = await Tesseract.recognize(preprocessedImagePath, 'eng', {
      logger: () => {},
    });

    const rawText = result.data.text || '';
    const { name, idNumber } = extractNameAndId(rawText);
    
    // Clean up temporary image
    if (fs.existsSync(preprocessedImagePath)) {
      fs.unlinkSync(preprocessedImagePath);
    }

    return { rawText, name, idNumber };
  } catch (error) {
    console.error('OCR Error:', error);
    
    // Clean up on error
    if (preprocessedImagePath && fs.existsSync(preprocessedImagePath)) {
      fs.unlinkSync(preprocessedImagePath);
    }

    // Fallback: Try with original image if processing failed
    try {
      const fallbackResult = await Tesseract.recognize(imagePath, 'eng', {
        logger: () => {},
      });
      const rawText = fallbackResult.data.text || '';
      const { name, idNumber } = extractNameAndId(rawText);
      return { rawText, name, idNumber };
    } catch (fallbackError) {
      console.error('Fallback OCR Error:', fallbackError);
      return { rawText: '', name: null, idNumber: null };
    }
  }
};
