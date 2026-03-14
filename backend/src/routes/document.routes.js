import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  uploadDocument,
  listDocuments,
  searchDocuments,
  getDocumentMatches,
} from '../controllers/document.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer config that accepts images AND PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/tiff',
    'image/webp',
    'application/pdf',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, GIF, BMP, TIFF, WebP) and PDFs are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

const router = express.Router();

// Upload a document (authentication optional — tries auth, continues if no token)
router.post(
  '/upload-document',
  (req, res, next) => {
    // Optional authentication: attach user if token present, otherwise continue
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  },
  upload.single('document'),
  uploadDocument
);

// List all documents
router.get('/', listDocuments);

// Search documents via full-text search
router.get('/search', searchDocuments);

// Get matches for a specific document
router.get('/:id/matches', getDocumentMatches);

export default router;
