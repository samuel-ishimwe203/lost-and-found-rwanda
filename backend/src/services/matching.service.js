import { query } from '../db/index.js';
import { createNotification } from './notification.service.js';
import { logAudit } from './audit.service.js';
import axios from 'axios';

// ===== AI IMAGE ANALYSIS SERVICE =====
// This function analyzes and compares two images using AI
// It checks image content, metadata, visual features, and embedded information
const analyzeImageSimilarity = async (lostImageUrl, foundImageUrl) => {
  try {
    // If either image is missing, return 0 similarity
    if (!lostImageUrl || !foundImageUrl) {
      return 0;
    }

    console.log('🤖 AI Image Analysis: Deep comparison of images...');
    console.log('   Lost Item Image:', lostImageUrl);
    console.log('   Found Item Image:', foundImageUrl);

    // Fast path: identical image URLs → treat as perfect match
    // This ensures immediate auto-match even if districts differ
    if (lostImageUrl === foundImageUrl) {
      console.log('   🧪 Exact image URL match detected → 100% similarity');
      return 100;
    }

    // TODO: Integrate with AI service for deep image content analysis:
    // - Visual similarity (colors, shapes, patterns)
    // - Object detection (what's in the image)
    // - Text extraction (OCR for documents, IDs, etc.)
    // - Metadata comparison (EXIF data, timestamps)
    // - Feature matching (keypoints, descriptors)
    
    // Option 1: AWS Rekognition (Recommended for production)
    // const similarity = await compareWithAWSRekognition(lostImageUrl, foundImageUrl);
    
    // Option 2: Google Vision API (Good for OCR and labels)
    // const similarity = await compareWithGoogleVision(lostImageUrl, foundImageUrl);
    
    // Option 3: Custom TensorFlow model (Full control)
    // const similarity = await compareWithTensorFlow(lostImageUrl, foundImageUrl);

    // TEMPORARY: Enhanced basic analysis
    // In production, this will use actual AI to analyze:
    // - Image content (objects, colors, patterns)
    // - Text within images (IDs, documents)
    // - Visual features and embeddings
    const similarity = 50; // Placeholder: 50% similarity when both images exist
    
    console.log(`   🎯 AI Similarity Score: ${similarity}%`);
    return similarity;

  } catch (error) {
    console.error('❌ AI Image Analysis Error:', error);
    return 0; // Return 0 similarity on error
  }
};

// Helper function for AWS Rekognition (commented out - requires AWS SDK)
/*
import AWS from 'aws-sdk';
const compareWithAWSRekognition = async (sourceImage, targetImage) => {
  const rekognition = new AWS.Rekognition({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const params = {
    SourceImage: { S3Object: { Bucket: 'your-bucket', Name: sourceImage } },
    TargetImage: { S3Object: { Bucket: 'your-bucket', Name: targetImage } },
    SimilarityThreshold: 70
  };

  const result = await rekognition.compareFaces(params).promise();
  return result.FaceMatches.length > 0 ? result.FaceMatches[0].Similarity : 0;
};
*/

// Helper function for Google Vision API (commented out - requires Google SDK)
/*
import vision from '@google-cloud/vision';
const compareWithGoogleVision = async (image1Url, image2Url) => {
  const client = new vision.ImageAnnotatorClient();
  
  const [result1] = await client.labelDetection(image1Url);
  const [result2] = await client.labelDetection(image2Url);
  
  const labels1 = result1.labelAnnotations.map(label => label.description.toLowerCase());
  const labels2 = result2.labelAnnotations.map(label => label.description.toLowerCase());
  
  // Calculate label overlap
  const commonLabels = labels1.filter(label => labels2.includes(label));
  const similarity = (commonLabels.length / Math.max(labels1.length, labels2.length)) * 100;
  
  return similarity;
};
*/

// ===== DUPLICATE DETECTION WITHIN SAME SECTION =====
// Check if an identical item already exists in the same section (lost-to-lost or found-to-found)
export const checkForDuplicatesInSection = async (itemData, itemType) => {
  try {
    console.log(`🔍 Checking for duplicates in ${itemType} section...`);
    
    const { category, image_url, item_type, district } = itemData;
    
    // If no image, can't do visual comparison
    if (!image_url || image_url.trim() === '') {
      console.log('   ⚠️ No image provided, skipping duplicate check');
      return null;
    }

    let existingItems;
    
    if (itemType === 'lost') {
      // Check for duplicates in lost_items
      const result = await query(
        `SELECT l.*, u.full_name, u.phone_number
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.category = $1 
         AND l.image_url = $2 
         AND l.status IN ('active', 'pending')
         LIMIT 5`,
        [category, image_url]
      );
      existingItems = result.rows;
    } else if (itemType === 'found') {
      // Check for duplicates in found_items
      const result = await query(
        `SELECT f.*, u.full_name, u.phone_number
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         WHERE f.category = $1 
         AND f.image_url = $2 
         AND f.status IN ('active', 'pending')
         LIMIT 5`,
        [category, image_url]
      );
      existingItems = result.rows;
    }

    if (existingItems && existingItems.length > 0) {
      console.log(`   ⚠️ Found ${existingItems.length} duplicate(s) in ${itemType} section`);
      // Return the first duplicate found
      return {
        isDuplicate: true,
        existingItem: existingItems[0],
        message: `This item already exists in the system. A similar ${itemType} item with the same category and image was posted by ${existingItems[0].full_name}. Contact: ${existingItems[0].phone_number}`
      };
    }

    console.log(`   ✅ No duplicates found in ${itemType} section`);
    return null;
  } catch (error) {
    console.error('❌ Check for duplicates error:', error);
    return null; // Don't block posting if check fails
  }
};

// Check for potential matches when a new item is posted
export const checkForMatches = async (itemId, itemType) => {
  try {
    console.log(`🔍 Checking for matches - Item ID: ${itemId}, Type: ${itemType}`);
    let matches = [];

    if (itemType === 'lost') {
      // Find potential found items that match this lost item
      const lostItemResult = await query(
        'SELECT * FROM lost_items WHERE id = $1',
        [itemId]
      );
      
      if (lostItemResult.rows.length === 0) {
        console.log('❌ Lost item not found');
        return;
      }
      
      const lostItem = lostItemResult.rows[0];
      console.log(`📋 Lost Item: ${lostItem.item_type} in ${lostItem.district}, Category: ${lostItem.category}`);

      // Find matching found items based on category (ignore district for same image+category)
      const foundItemsResult = await query(
        `SELECT f.*, u.id as finder_id, u.full_name as finder_name
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         WHERE f.category = $1 
         AND f.status = 'active'`,
        [lostItem.category]
      );

      console.log(`🔎 Found ${foundItemsResult.rows.length} potential matches in database`);

      for (const foundItem of foundItemsResult.rows) {
        const matchScore = await calculateMatchScore(lostItem, foundItem);
        console.log(`📊 Match score with Found Item #${foundItem.id}: ${matchScore}%`);
        
        if (matchScore >= 60) { // Minimum 60% match
          // Check if match already exists
          const existingMatch = await query(
            'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
            [lostItem.id, foundItem.id]
          );

          if (existingMatch.rows.length === 0) {
            // Create new match
            const matchResult = await query(
              `INSERT INTO matches (lost_item_id, found_item_id, match_score)
               VALUES ($1, $2, $3)
               RETURNING *`,
              [lostItem.id, foundItem.id, matchScore]
            );

            const match = matchResult.rows[0];
            console.log(`✅ Created match #${match.id} with score ${matchScore}%`);

            // Update item statuses to hide from landing page
            const lostUpdate = await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', lostItem.id]);
            const foundUpdate = await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', foundItem.id]);
            console.log(`   📌 Lost item #${lostItem.id} status updated to: ${lostUpdate.rows[0]?.status}`);
            console.log(`   📌 Found item #${foundItem.id} status updated to: ${foundUpdate.rows[0]?.status}`);

            // Notify both users
            await notifyMatch(match, lostItem, foundItem);
            matches.push(match);
          } else {
            console.log(`ℹ️ Match already exists for Lost #${lostItem.id} and Found #${foundItem.id}`);
          }
        }
      }

      console.log(`✅ Matching complete. Total matches created: ${matches.length}`);
    } else if (itemType === 'found') {
      // Find potential lost items that match this found item
      const foundItemResult = await query(
        'SELECT * FROM found_items WHERE id = $1',
        [itemId]
      );
      
      if (foundItemResult.rows.length === 0) {
        console.log('❌ Found item not found');
        return;
      }
      
      const foundItem = foundItemResult.rows[0];
      console.log(`📋 Found Item: ${foundItem.item_type} in ${foundItem.district}, Category: ${foundItem.category}`);

      // Find matching lost items based on category (ignore district for same image+category)
      const lostItemsResult = await query(
        `SELECT l.*, u.id as loser_id, u.full_name as loser_name
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.category = $1 
         AND l.status = 'active'`,
        [foundItem.category]
      );

      console.log(`🔎 Found ${lostItemsResult.rows.length} potential matches in database`);

      for (const lostItem of lostItemsResult.rows) {
        const matchScore = await calculateMatchScore(lostItem, foundItem);
        console.log(`📊 Match score with Lost Item #${lostItem.id}: ${matchScore}%`);
        
        if (matchScore >= 60) { // Minimum 60% match
          // Check if match already exists
          const existingMatch = await query(
            'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
            [lostItem.id, foundItem.id]
          );

          if (existingMatch.rows.length === 0) {
            // Create new match
            const matchResult = await query(
              `INSERT INTO matches (lost_item_id, found_item_id, match_score)
               VALUES ($1, $2, $3)
               RETURNING *`,
              [lostItem.id, foundItem.id, matchScore]
            );

            const match = matchResult.rows[0];
            console.log(`✅ Created match #${match.id} with score ${matchScore}%`);

            // Update item statuses to hide from landing page
            const lostUpdate = await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', lostItem.id]);
            const foundUpdate = await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', foundItem.id]);
            console.log(`   📌 Lost item #${lostItem.id} status updated to: ${lostUpdate.rows[0]?.status}`);
            console.log(`   📌 Found item #${foundItem.id} status updated to: ${foundUpdate.rows[0]?.status}`);

            // Notify both users
            await notifyMatch(match, lostItem, foundItem);
            matches.push(match);
          } else {
            console.log(`ℹ️ Match already exists for Lost #${lostItem.id} and Found #${foundItem.id}`);
          }
        }
      }

      console.log(`✅ Matching complete. Total matches created: ${matches.length}`);
    }
  } catch (error) {
    console.error('❌ Check for matches error:', error);
  }
};

// Quick scan for exact duplicates (same category + same image_url) to auto-match
export const scanExactDuplicates = async () => {
  try {
    console.log('🧹 Scanning for exact duplicate posts (category + image_url)');

    // Step 1: Find all active lost items with images
    const lostItemsResult = await query(
      `SELECT id, user_id, item_type, category, district, image_url, date_lost, reward_amount
       FROM lost_items 
       WHERE status = 'active' AND image_url IS NOT NULL AND image_url <> ''`
    );

    console.log(`📋 Found ${lostItemsResult.rows.length} active lost items with images`);

    let totalMatches = 0;

    // Step 2: For each lost item, find matching found items
    for (const lostItem of lostItemsResult.rows) {
      console.log(`\n🔍 Checking Lost Item #${lostItem.id} (${lostItem.item_type}, Category: ${lostItem.category})`);

      // Find found items with same category and same image_url
      const foundItemsResult = await query(
        `SELECT f.id, f.user_id, f.item_type, f.category, f.district, f.image_url, f.date_found, f.is_police_upload
         FROM found_items f
         WHERE f.category = $1 
         AND f.image_url = $2 
         AND f.status = 'active'`,
        [lostItem.category, lostItem.image_url]
      );

      console.log(`   Found ${foundItemsResult.rows.length} matching found items`);

      for (const foundItem of foundItemsResult.rows) {
        // Check if match already exists
        const existingMatch = await query(
          'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
          [lostItem.id, foundItem.id]
        );

        if (existingMatch.rows.length) {
          console.log(`   ℹ️ Match already exists for Lost #${lostItem.id} and Found #${foundItem.id}`);
          continue;
        }

        // Create the match with a perfect score (since image+category are identical)
        const matchResult = await query(
          `INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [lostItem.id, foundItem.id, 100, 'pending']
        );

        const match = matchResult.rows[0];
        console.log(`   ✅ Match #${match.id} created (Lost #${lostItem.id} ↔ Found #${foundItem.id})`);

        // Get both items with user info for notification
        const lostUserResult = await query('SELECT * FROM users WHERE id = $1', [lostItem.user_id]);
        const foundUserResult = await query('SELECT * FROM users WHERE id = $1', [foundItem.user_id]);

        if (lostUserResult.rows.length && foundUserResult.rows.length) {
          const lostUser = lostUserResult.rows[0];
          const foundUser = foundUserResult.rows[0];

          // Create automatic messages
          const messageToLoser = `🎉 Great news! I found your ${lostItem.item_type}. I'm ${foundUser.full_name}. Contact: ${foundUser.phone_number}. Let's arrange pickup!`;
          const messageToFinder = `🙏 Thank you for finding my ${lostItem.item_type}! I'm ${lostUser.full_name}. Contact: ${lostUser.phone_number}. When can we meet?`;

          await query(
            `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [foundUser.id, lostUser.id, `Found: Your ${lostItem.item_type}`, messageToLoser, match.id]
          );

          await query(
            `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [lostUser.id, foundUser.id, `Re: Found my ${lostItem.item_type}`, messageToFinder, match.id]
          );

          console.log(`   📨 Messages created for both users`);
        }

        totalMatches++;
      }
    }

    // Step 3: Update all matched items' statuses to hide from landing page
    console.log(`\n🔄 Updating status for matched items...`);
    
    const matchedItemsResult = await query(
      `SELECT DISTINCT m.lost_item_id, m.found_item_id
       FROM matches m
       WHERE m.status IN ('pending', 'active') AND m.match_score = 100`
    );

    for (const item of matchedItemsResult.rows) {
      await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', item.lost_item_id]);
      await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', item.found_item_id]);
    }

    console.log(`\n✅ Exact duplicate scan completed: ${totalMatches} matches created, ${matchedItemsResult.rows.length * 2} items hidden`);
  } catch (error) {
    console.error('❌ scanExactDuplicates error:', error);
  }
};

// Calculate match score between lost and found items
// Uses AI to analyze image similarity + category matching
const calculateMatchScore = async (lostItem, foundItem) => {
  let score = 0;

  console.log('🔍 Calculating match score...');

  // 1. CATEGORY MATCH (40 points) - MUST MATCH
  if (lostItem.category === foundItem.category) {
    score += 40;
    console.log('   ✅ Category Match: +40 points');
  } else {
    console.log('   ❌ Category Mismatch: Skipping match (score too low)');
    return 10; // Very low score for mismatched categories
  }

  // 2. AI IMAGE SIMILARITY (40 points) - HIGHEST PRIORITY
  // Use AI to analyze and compare the actual image content
  const lostHasImage = lostItem.image_url && lostItem.image_url.trim() !== '';
  const foundHasImage = foundItem.image_url && foundItem.image_url.trim() !== '';
  
  if (lostHasImage && foundHasImage) {
    console.log('   🤖 Running AI image analysis...');
    const imageSimilarity = await analyzeImageSimilarity(lostItem.image_url, foundItem.image_url);
    
    // Convert similarity percentage to points (0-40 points)
    // 100% similarity = 40 points, 50% similarity = 20 points, etc.
    const imagePoints = (imageSimilarity / 100) * 40;
    score += imagePoints;
    console.log(`   🖼️ AI Image Similarity: ${imageSimilarity}% = +${imagePoints.toFixed(1)} points`);
    
  } else if (lostHasImage || foundHasImage) {
    console.log('   ⚠️ Only one item has image: +10 points (reduced confidence)');
    score += 10; // Reduced points when only one image available
  } else {
    console.log('   ℹ️ No images available for AI analysis: 0 points');
  }

  // 3. DISTRICT MATCH (10 points) - Supporting information
  if (lostItem.district === foundItem.district) {
    score += 10;
    console.log('   ✅ District Match: +10 points');
  }

  // 4. ITEM TYPE SIMILARITY (5 points) - Supporting information
  if (lostItem.item_type && foundItem.item_type) {
    const lostType = lostItem.item_type.toLowerCase();
    const foundType = foundItem.item_type.toLowerCase();
    
    if (lostType === foundType) {
      score += 5;
      console.log('   ✅ Item Type Exact Match: +5 points');
    } else if (lostType.includes(foundType) || foundType.includes(lostType)) {
      score += 2;
      console.log('   ✅ Item Type Partial Match: +2 points');
    }
  }

  // 5. DATE PROXIMITY (5 points) - Supporting information
  if (lostItem.date_lost && foundItem.date_found) {
    const lostDate = new Date(lostItem.date_lost);
    const foundDate = new Date(foundItem.date_found);
    const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      score += 5;
      console.log('   ✅ Date Proximity (≤7 days): +5 points');
    } else if (daysDiff <= 30) {
      score += 2;
      console.log('   ✅ Date Proximity (≤30 days): +2 points');
    }
  }

  console.log(`   🎯 TOTAL MATCH SCORE: ${score.toFixed(1)}%`);
  return Math.round(score);
};

// Notify users about a match
const notifyMatch = async (match, lostItem, foundItem) => {
  try {
    // Get loser and finder details
    const loserResult = await query('SELECT * FROM users WHERE id = $1', [lostItem.user_id]);
    const finderResult = await query('SELECT * FROM users WHERE id = $1', [foundItem.user_id]);

    const loser = loserResult.rows[0];
    const finder = finderResult.rows[0];

    const isPoliceUpload = foundItem.is_police_upload;
    const rewardInfo = lostItem.reward_amount > 0 ? ` A reward of ${lostItem.reward_amount} RWF is offered.` : '';

    // Notify loser
    await createNotification({
      userId: loser.id,
      type: 'MATCH_FOUND',
      title: isPoliceUpload ? 'Match Found - Police Verified!' : 'Potential Match Found!',
      message: `Good news! ${isPoliceUpload ? 'Police have found' : 'Someone has found'} an item matching your lost ${lostItem.item_type} in ${foundItem.district}.${rewardInfo} Please check your matches.`,
      relatedMatchId: match.id,
      relatedLostItemId: lostItem.id,
      relatedFoundItemId: foundItem.id
    });

    // Notify finder
    await createNotification({
      userId: finder.id,
      type: 'MATCH_FOUND',
      title: 'Match Found!',
      message: `Your found ${foundItem.item_type} matches a lost item report from ${loser.full_name}.${rewardInfo} Please check your matches.`,
      relatedMatchId: match.id,
      relatedLostItemId: lostItem.id,
      relatedFoundItemId: foundItem.id
    });

    // Check if conversation already exists for this match to prevent duplicates
    const existingConversation = await query(
      `SELECT id FROM messages WHERE match_id = $1 LIMIT 1`,
      [match.id]
    );

    if (existingConversation.rows.length === 0) {
      // Create automatic message to loser (from finder) - SHORT VERSION
      const messageToLoser = `🎉 Great news! I found your ${lostItem.item_type}. I'm ${finder.full_name}.${rewardInfo ? ' You offered a reward - very kind!' : ''} Contact: ${finder.phone_number}. Location: ${foundItem.district}. Let's arrange pickup!`;

      await query(
        `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          finder.id,
          loser.id,
          `Match Found: Your ${lostItem.item_type}`,
          messageToLoser,
          match.id
        ]
      );

      // Create automatic message to finder (from loser) - SHORT VERSION
      const messageToFinder = `🙏 Thank you for finding my ${lostItem.item_type}! I'm ${loser.full_name}.${rewardInfo} Contact: ${loser.phone_number}. Lost in ${lostItem.district}. When can we meet?`;

      await query(
        `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          loser.id,
          finder.id,
          `Re: Found my ${lostItem.item_type} - Thank you!`,
          messageToFinder,
          match.id
        ]
      );

      console.log(`✅ Initial conversation messages created for match ID: ${match.id}`);
    } else {
      console.log(`ℹ️ Conversation already exists for match ID: ${match.id}, skipping message creation`);
    }

    console.log(`✅ Match notifications and messages sent for match ID: ${match.id}`);
  } catch (error) {
    console.error('Notify match error:', error);
  }
};

// Get all matches with optional filters
export const getMatches = async (filters = {}) => {
  try {
    const { userId, userRole, status, limit = 50, offset = 0 } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`m.status = $${paramCount++}`);
      params.push(status);
    }

    if (userId && userRole) {
      if (userRole === 'loser') {
        whereConditions.push(`l.user_id = $${paramCount++}`);
      } else if (userRole === 'finder' || userRole === 'police') {
        whereConditions.push(`f.user_id = $${paramCount++}`);
      }
      params.push(userId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT m.*, 
              l.item_type as lost_item_type, l.category as lost_category, l.district as lost_district, 
              l.reward_amount, l.user_id as loser_id,
              f.item_type as found_item_type, f.category as found_category, f.district as found_district,
              f.is_police_upload, f.user_id as finder_id,
              loser.full_name as loser_name, loser.phone_number as loser_phone, loser.email as loser_email,
              finder.full_name as finder_name, finder.phone_number as finder_phone, finder.email as finder_email
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users loser ON l.user_id = loser.id
       JOIN users finder ON f.user_id = finder.id
       ${whereClause}
       ORDER BY m.matched_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Get matches error:', error);
    throw error;
  }
};

// Update match status
export const updateMatchStatus = async (matchId, status, userId, userRole, notes = null) => {
  try {
    // Get match details
    const matchResult = await query(
      `SELECT m.*, l.user_id as loser_id, f.user_id as finder_id
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      throw new Error('Match not found');
    }

    const match = matchResult.rows[0];

    // Check authorization
    const isLoser = match.loser_id === userId;
    const isFinder = match.finder_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isLoser && !isFinder && !isAdmin) {
      throw new Error('Unauthorized to update this match');
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    // Update confirmation flags
    if (isLoser && status === 'confirmed') {
      updates.push(`loser_confirmed = true`);
    }
    if (isFinder && status === 'confirmed') {
      updates.push(`finder_confirmed = true`);
    }

    // Update status
    updates.push(`status = $${paramCount++}`);
    values.push(status);

    if (notes) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (status === 'completed') {
      updates.push(`resolved_at = CURRENT_TIMESTAMP`);
      
      // Update related items
      await query('UPDATE lost_items SET status = $1 WHERE id = $2', ['resolved', match.lost_item_id]);
      await query('UPDATE found_items SET status = $1 WHERE id = $2', ['returned', match.found_item_id]);
    }

    values.push(matchId);

    const result = await query(
      `UPDATE matches SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    // Log audit
    await logAudit({
      userId,
      action: 'MATCH_UPDATED',
      entityType: 'match',
      entityId: matchId,
      details: { status, notes },
      ipAddress: null,
      userAgent: null
    });

    return result.rows[0];
  } catch (error) {
    console.error('Update match status error:', error);
    throw error;
  }
};
