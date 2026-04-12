/**
 * Dynamic priority calculation based on upvotes.
 * Priority = number of upvotes * 10 (max 100)
 */
export function calculateDynamicPriority(upvoteCount = 0) {
  const priority = upvoteCount * 10;
  return Math.min(100, Math.max(0, priority));
}

/**
 * Legacy function for backward compatibility - now uses dynamic calculation
 * @deprecated Use calculateDynamicPriority instead
 */
export function predictPriorityStub(title, description) {
  // For new issues, start with 0 upvotes = 0 priority
  return calculateDynamicPriority(0);
}
