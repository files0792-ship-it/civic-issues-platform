/**
 * Shared JSON shape for issues in API responses (feed, detail, admin status update).
 */
export function publicImageUrl(relativePath, req = null) {
  if (!relativePath) return null;
  // Use PUBLIC_API_URL if set, otherwise use request origin, fallback to relative path
  const base = (process.env.PUBLIC_API_URL || '').replace(/\/$/, '');
  if (base) {
    return `${base}/uploads/${relativePath.replace(/^\//, '')}`;
  }
  // If request is available, use its origin for absolute URL
  if (req && req.headers && req.headers.host) {
    const protocol = req.protocol || 'http';
    const host = req.headers.host;
    return `${protocol}://${host}/uploads/${relativePath.replace(/^\//, '')}`;
  }
  // Fallback to relative path (for development with proxy)
  return `/uploads/${relativePath.replace(/^\//, '')}`;
}

export function shapeIssue(doc, userId = null, req = null) {
  const o = doc.toObject ? doc.toObject() : doc;
  const upvoteIds = (o.upvotes || []).map((id) => id.toString());
  const upvoteCount = upvoteIds.length;
  const hasUpvoted = userId ? upvoteIds.includes(userId.toString()) : false;
  return {
    id: o._id,
    title: o.title,
    description: o.description,
    imageUrl: publicImageUrl(o.image, req),
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
