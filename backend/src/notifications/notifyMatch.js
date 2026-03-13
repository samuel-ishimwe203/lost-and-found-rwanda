export async function notifyMatch(match, lostItem, foundItem) {
  console.log('NOTIFY MATCH:', {
    matchId: match.id,
    lostItemId: lostItem.id,
    foundItemId: foundItem.id,
    message: `Match found for ${lostItem.item_type} between ${lostItem.id} and ${foundItem.id}`
  });
}