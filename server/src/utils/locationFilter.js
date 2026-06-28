function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply state / city / legacy location filters to a MongoDB query.
 * Matches dedicated fields first, then falls back to the location string.
 */
export function applyLocationFilters(filter, { state, city, location } = {}) {
  const andConditions = [];

  if (state && String(state).trim()) {
    const pattern = escapeRegex(String(state).trim());
    andConditions.push({
      $or: [
        { state: new RegExp(`^${pattern}$`, 'i') },
        { location: new RegExp(`(,\\s*)?${pattern}\\s*$`, 'i') },
        { location: new RegExp(`^${pattern}$`, 'i') },
      ],
    });
  }

  if (city && String(city).trim()) {
    const pattern = escapeRegex(String(city).trim());
    andConditions.push({
      $or: [
        { city: new RegExp(`^${pattern}$`, 'i') },
        { location: new RegExp(`^${pattern}\\s*,`, 'i') },
        { location: new RegExp(`^${pattern}$`, 'i') },
      ],
    });
  }

  if (location && String(location).trim()) {
    const pattern = escapeRegex(String(location).trim());
    andConditions.push({
      $or: [
        { city: new RegExp(`^${pattern}$`, 'i') },
        { location: new RegExp(`^${pattern}$`, 'i') },
      ],
    });
  }

  if (andConditions.length === 0) return filter;

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
    return filter;
  }

  filter.$and = [...(filter.$and || []), ...andConditions];
  return filter;
}
