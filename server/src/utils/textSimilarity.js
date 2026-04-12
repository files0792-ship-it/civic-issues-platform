/**
 * Simple token-overlap similarity in [0, 1] for duplicate detection scaffolding.
 * Production would use embeddings or a dedicated service.
 */
function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function jaccardSimilarity(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Combine title + description for comparison against other issues.
 */
export function combinedIssueText(title, description) {
  return `${title}\n${description}`;
}
