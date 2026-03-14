import { query } from '../db/index.js';
import { runOcr } from '../services/ocr.service.js';
import { checkForMatches } from '../services/matching.service.js';

const insertItemAndMatches = async ({ mode, userId, name, idNumber, imageUrl, location, extractedText }) => {
  const clientModeIsLost = mode === 'lost';

  // Insert into lost_items or found_items with minimal required fields
  let insertedItem;
  if (clientModeIsLost) {
    const insertRes = await query(
      `INSERT INTO lost_items
       (user_id, item_type, category, description, location_lost, district, date_lost, reward_amount, status, image_url, additional_info, id_number, holder_name, text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        userId,
        'National ID',
        'Documents',
        name ? `Reported via OCR for ${name}` : 'Reported via OCR',
        location || 'Unknown',
        'Unknown',
        null,
        0,
        'active',
        imageUrl,
        null,
        idNumber || null,
        name || null,
        extractedText || null
      ]
    );
    insertedItem = insertRes.rows[0];
  } else {
    const insertRes = await query(
      `INSERT INTO found_items
       (user_id, item_type, category, description, location_found, district, date_found, status, is_police_upload, image_url, additional_info, id_number, holder_name, text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        userId,
        'National ID',
        'Documents',
        name ? `Reported via OCR for ${name}` : 'Reported via OCR',
        location || 'Unknown',
        'Unknown',
        null,
        'active',
        false,
        imageUrl,
        null,
        idNumber || null,
        name || null,
        extractedText || null
      ]
    );
    insertedItem = insertRes.rows[0];
  }

  // Find potential matches using the centralized matching engine
  const matches = await checkForMatches(insertedItem.id, mode);
  return { item: insertedItem, matches };
};


export const reportLostId = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = req.body.location || null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const { rawText, name, idNumber } = await runOcr(req.file.path);

    const result = await insertItemAndMatches({
      mode: 'lost',
      userId,
      name,
      idNumber,
      imageUrl,
      location,
      extractedText: rawText
    });

    res.status(201).json({
      success: true,
      data: {
        type: 'lost',
        extractedText: rawText,
        name,
        idNumber,
        item: result.item,
        matches: result.matches,
      },
    });
  } catch (error) {
    console.error('OCR Lost ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing lost ID image',
      error: error.message,
    });
  }
};

export const reportFoundId = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = req.body.location || null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const { rawText, name, idNumber } = await runOcr(req.file.path);

    const result = await insertItemAndMatches({
      mode: 'found',
      userId,
      name,
      idNumber,
      imageUrl,
      location,
      extractedText: rawText
    });

    res.status(201).json({
      success: true,
      data: {
        type: 'found',
        extractedText: rawText,
        name,
        idNumber,
        item,
        matches,
      },
    });
  } catch (error) {
    console.error('OCR Found ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing found ID image',
      error: error.message,
    });
  }
};


