import { getMatches, updateMatchStatus } from '../services/matching.service.js';
import { query } from '../db/index.js';

// Get all matches for the authenticated user
export const getMyMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    const matches = await getMatches({
      userId,
      userRole,
      status
    });

    res.status(200).json({
      success: true,
      data: { matches }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving matches',
      error: error.message 
    });
  }
};

// Get single match by ID
export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT m.*, 
              l.*, l.id as lost_item_id,
              f.*, f.id as found_item_id,
              loser.id as loser_id, loser.full_name as loser_name, loser.phone_number as loser_phone, loser.email as loser_email,
              finder.id as finder_id, finder.full_name as finder_name, finder.phone_number as finder_phone, finder.email as finder_email
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users loser ON l.user_id = loser.id
       JOIN users finder ON f.user_id = finder.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Match not found' 
      });
    }

    const match = result.rows[0];

    // Check authorization
    if (match.loser_id !== userId && match.finder_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to view this match' 
      });
    }

    res.status(200).json({
      success: true,
      data: { match }
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving match',
      error: error.message 
    });
  }
};

// Confirm match (loser or finder confirms)
export const confirmMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedMatch = await updateMatchStatus(id, 'confirmed', userId, userRole, notes);

    res.status(200).json({
      success: true,
      message: 'Match confirmed successfully',
      data: { match: updatedMatch }
    });
  } catch (error) {
    console.error('Confirm match error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Reject match
export const rejectMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedMatch = await updateMatchStatus(id, 'rejected', userId, userRole, notes);

    // Reactivate items
    await query('UPDATE lost_items SET status = $1 WHERE id = $2', ['active', updatedMatch.lost_item_id]);
    await query('UPDATE found_items SET status = $1 WHERE id = $2', ['active', updatedMatch.found_item_id]);

    res.status(200).json({
      success: true,
      message: 'Match rejected',
      data: { match: updatedMatch }
    });
  } catch (error) {
    console.error('Reject match error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Complete match (mark as returned/completed)
export const completeMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, reward_paid } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updatedMatch = await updateMatchStatus(id, 'completed', userId, userRole, notes);

    // Update reward paid status if provided
    if (reward_paid !== undefined) {
      await query(
        'UPDATE matches SET reward_paid = $1 WHERE id = $2',
        [reward_paid, id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Match completed successfully',
      data: { match: updatedMatch }
    });
  } catch (error) {
    console.error('Complete match error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
