// Shared slug generation for admin forms with a required-unique `slug` field
// (Player, News) — keeps the same rule everywhere instead of each form
// hand-rolling its own regex.
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
