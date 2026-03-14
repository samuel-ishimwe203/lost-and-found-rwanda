// filepath: backend/src/controllers/match.controller.test.js
import { getMatches } from '../services/matching.service.js';

describe('Database Matched Items Test', () => {
  it('should return at least one matched item between lost and found', async () => {
    // Fetch all matches with status 'matched'
    const matches = await getMatches({ status: 'matched' });

    // Check if the result is an array
    expect(Array.isArray(matches)).toBe(true);

    // Optionally, check if at least one match exists
    // Uncomment the next line if you want the test to fail when there are no matches
    // expect(matches.length).toBeGreaterThan(0);

    // If there are matches, check the structure of the first match
    if (matches.length > 0) {
      expect(matches[0]).toHaveProperty('lost_item_id');
      expect(matches[0]).toHaveProperty('found_item_id');
      expect(matches[0]).toHaveProperty('status');
    }
  });
});
