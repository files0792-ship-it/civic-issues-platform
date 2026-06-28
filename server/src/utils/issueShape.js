/**
 * Normalize stored image paths for consistent URL generation.
 * Handles legacy formats: bare filenames, uploads/ prefix, issues/ subfolder.
 */
export function normalizeImagePath(relativePath) {
  if (!relativePath) return null;

  let p = String(relativePath).replace(/\\/g, '/').trim();
  p = p.replace(/^\/+/, '');

  while (p.startsWith('uploads/')) {
    p = p.slice('uploads/'.length);
  }

  // Multer saves under uploads/issues/; older records may store only the filename.
  if (p && !p.includes('/')) {
    p = `issues/${p}`;
  }

  return p;
}

export function publicImageUrl(relativePath, req = null) {
  const normalized = normalizeImagePath(relativePath);
  if (!normalized) return null;

  const base = (process.env.PUBLIC_API_URL || '').replace(/\/$/, '');
  if (base) {
    return `${base}/uploads/${normalized}`;
  }

  if (req?.headers?.host) {
    const protocol = req.protocol || 'http';
    return `${protocol}://${req.headers.host}/uploads/${normalized}`;
  }

  return `/uploads/${normalized}`;
}

export function shapeIssue(doc, userId = null, req = null) {
  const o = doc.toObject ? doc.toObject() : doc;
  const upvoteIds = (o.upvotes || []).map((id) => id.toString());
  const upvoteCount = upvoteIds.length;
  const hasUpvoted = userId ? upvoteIds.includes(userId.toString()) : false;

  let displayLocation = o.location ?? null;
  if (o.city && o.state) {
    displayLocation = `${o.city}, ${o.state}`;
  }

  return {
    id: o._id,
    title: o.title,
    description: o.description,
    imageUrl: publicImageUrl(o.image, req),
    location: displayLocation,
    state: o.state ?? null,
    city: o.city ?? null,
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
