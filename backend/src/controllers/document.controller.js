import path from 'path';
import { query } from '../db/index.js';
import { extractTextFromDocument } from '../services/documentOCR.service.js';

/**
 * POST /api/documents/upload-document
 * Upload any document (image or PDF), extract text, store in DB,
 * and return any matching documents found via full-text search.
 */
export const uploadDocument = async (req, res) => {
  try {
    // user_id comes from auth middleware if logged in, or from body
    const userId = req.user?.id || req.body.user_id || null;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A document file (image or PDF) is required.',
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // 1. Extract text from the uploaded document
    const extractedText = await extractTextFromDocument(filePath, mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract any text from the uploaded document.',
      });
    }

    // 2. Store the document in the database
    const insertResult = await query(
      `INSERT INTO documents (user_id, file_name, text, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        userId,
        fileName,
        extractedText.trim(),
        req.file.path.startsWith('http') ? req.file.path : `/uploads/${path.basename(req.file.path)}`,
      ]
    );

    const newDocument = insertResult.rows[0];

    // 3. Find matches using PostgreSQL full-text search across multiple tables
    //    We search for matches in documents, lost_items, and found_items.
    const matchResult = await query(
      `WITH all_searchable AS (
        SELECT id, user_id, file_name, text, file_url, created_at, 'document' AS source,
               NULL AS category, NULL AS location, NULL AS district, 0 AS reward_amount, 
               NULL AS id_number, NULL AS holder_name
        FROM documents
        UNION ALL
        SELECT id, user_id, item_type AS file_name, text, image_url AS file_url, created_at, 'lost' AS source,
               category, location_lost AS location, district, reward_amount, 
               id_number, holder_name
        FROM lost_items
        UNION ALL
        SELECT id, user_id, item_type AS file_name, text, image_url AS file_url, created_at, 'found' AS source,
               category, location_found AS location, district, 0 AS reward_amount, 
               id_number, holder_name
        FROM found_items
      )
      SELECT a.*,
             ts_rank(to_tsvector('english', COALESCE(a.text, '')),
                     plainto_tsquery('english', $1)) AS rank,
             u.full_name AS uploader_name,
             u.phone_number AS uploader_phone,
             u.email AS uploader_email
      FROM all_searchable a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE (a.source != 'document' OR a.id != $2)
        AND a.text IS NOT NULL 
        AND a.text != ''
        AND to_tsvector('english', a.text) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 12`,
      [extractedText.trim(), newDocument.id]
    );

    const matches = matchResult.rows;

    // 4. Store match records in document_matches table (only for pure document-to-document matches)
    for (const match of matches) {
      if (match.source === 'document') {
        const similarityScore = Math.round(match.rank * 100);
        await query(
          `INSERT INTO document_matches (document_id_1, document_id_2, similarity_score)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [newDocument.id, match.id, similarityScore > 100 ? 100 : similarityScore]
        );
      }
    }

    res.status(201).json({
      success: true,
      data: {
        document: newDocument,
        extractedText: extractedText.trim(),
        matches: matches.map((m) => ({
          id: m.id,
          user_id: m.user_id,
          file_name: m.file_name,
          text: m.text,
          file_url: m.file_url,
          created_at: m.created_at,
          similarity_rank: m.rank,
          source: m.source,
          category: m.category,
          location: m.location,
          district: m.district,
          reward_amount: m.reward_amount,
          id_number: m.id_number,
          holder_name: m.holder_name,
          uploader_name: m.uploader_name || 'Anonymous User',
          uploader_phone: m.uploader_phone || 'N/A',
          uploader_email: m.uploader_email || 'N/A',
        })),
      },
    });
  } catch (error) {
    console.error('Document Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing document upload.',
      error: error.message,
    });
  }
};

/**
 * GET /api/documents
 * List all documents, optionally filtered by user_id query parameter.
 */
export const listDocuments = async (req, res) => {
  try {
    const userId = req.query.user_id;
    let result;

    if (userId) {
      result = await query(
        'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
    } else {
      result = await query('SELECT * FROM documents ORDER BY created_at DESC');
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('List Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents.',
      error: error.message,
    });
  }
};

/**
 * GET /api/documents/search?q=sometext
 * Search documents using full-text search.
 */
export const searchDocuments = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required.',
      });
    }

    const result = await query(
      `SELECT id, user_id, file_name, text, file_url, created_at,
              ts_rank(to_tsvector('english', text),
                      plainto_tsquery('english', $1)) AS rank
       FROM documents
       WHERE to_tsvector('english', text) @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 20`,
      [searchQuery]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Search Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching documents.',
      error: error.message,
    });
  }
};

/**
 * GET /api/documents/:id/matches
 * Get all matches for a specific document.
 */
export const getDocumentMatches = async (req, res) => {
  try {
    const documentId = req.params.id;

    const result = await query(
      `SELECT dm.*, 
              d.file_name, d.text, d.file_url, d.created_at AS document_created_at
       FROM document_matches dm
       JOIN documents d ON (d.id = dm.document_id_2)
       WHERE dm.document_id_1 = $1
       ORDER BY dm.similarity_score DESC`,
      [documentId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get Document Matches Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches.',
      error: error.message,
    });
  }
};
