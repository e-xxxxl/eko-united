// Distinguishes a real MongoDB document (24-char hex ObjectId) from one of
// the short demo ids in lib/demoData.ts (e.g. "p1", "tt2"). Used to disable
// "Add to cart" on demo shop/ticket items instead of letting a visitor add
// one and only discover it's not real at checkout — see PROGRESS.md for the
// checkout 500 this was found from.
export function isRealId(id: string): boolean {
  return /^[0-9a-f]{24}$/i.test(id);
}
