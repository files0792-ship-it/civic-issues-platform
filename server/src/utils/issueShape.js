/**
 * Shared JSON shape for issues in API responses (feed, detail, admin status update).
 */
export function publicImageUrl(relativePath) {
  if (!relativePath) return null;
  const base = (process.env.PUBLIC_API_URL || '').replace(/\/$/, '');
  return `${base}/uploads/${relativePath.replace(/^\//, '')}`;
}

export function shapeIssue(doc, userId = null) {
  const o = doc.toObject ? doc.toObject() : doc;
  const upvoteIds = (o.upvotes || []).map((id) => id.toString());
  const upvoteCount = upvoteIds.length;
  const hasUpvoted = userId ? upvoteIds.includes(userId.toString()) : false;
  return {
    id: o._id,
    title: o.title,
    description: o.description,
    imageUrl: publicImageUrl(o.image),
    location: o.location ?? null,
    status: o.status,
    upvoteCount,
    hasUpvoted,
    createdBy: o.createdBy,
    predictedPriority: o.predictedPriority,
    possibleDuplicateOf: o.possibleDuplicateOf,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
