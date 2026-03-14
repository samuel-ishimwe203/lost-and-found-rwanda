
import { query, connectDB } from './src/db/index.js';
import { runOcr } from './src/services/ocr.service.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config();

async function populateExisting() {
  await connectDB();
  try {
    console.log('🔄 Populating text for existing lost_items...');
    const lostItems = await query("SELECT id, image_url FROM lost_items WHERE text IS NULL AND image_url IS NOT NULL AND image_url != ''");
    for (const item of lostItems.rows) {
      try {
        // Adjust path: image_url is like /uploads/filename.jpg
        const fullPath = path.join(__dirname, item.image_url);
        if (fs.existsSync(fullPath)) {
          console.log(`Processing lost item ${item.id}: ${item.image_url}`);
          const { rawText } = await runOcr(fullPath);
          await query("UPDATE lost_items SET text = $1 WHERE id = $2", [rawText, item.id]);
        }
      } catch (e) {
        console.error(`Failed lost item ${item.id}:`, e.message);
      }
    }

    console.log('🔄 Populating text for existing found_items...');
    const foundItems = await query("SELECT id, image_url FROM found_items WHERE text IS NULL AND image_url IS NOT NULL AND image_url != ''");
    for (const item of foundItems.rows) {
      try {
        const fullPath = path.join(__dirname, item.image_url);
        if (fs.existsSync(fullPath)) {
          console.log(`Processing found item ${item.id}: ${item.image_url}`);
          const { rawText } = await runOcr(fullPath);
          await query("UPDATE found_items SET text = $1 WHERE id = $2", [rawText, item.id]);
        }
      } catch (e) {
        console.error(`Failed found item ${item.id}:`, e.message);
      }
    }

    console.log('✅ Done populating existing records');
    process.exit(0);
  } catch (err) {
    console.error('Population failed:', err);
    process.exit(1);
  }
}

populateExisting();
