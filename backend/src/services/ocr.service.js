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

export const runOcr = async (imagePath) => {
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {},
  });
  const rawText = result.data.text || '';
  const { name, idNumber } = extractNameAndId(rawText);
  return { rawText, name, idNumber };
};



