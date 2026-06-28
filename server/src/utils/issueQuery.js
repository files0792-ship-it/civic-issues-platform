function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function caseInsensitiveExact(value) {
  return new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');
}

function buildLocationAndConditions({ state, city, location } = {}) {
  const conditions = [];

  if (state && String(state).trim()) {
    const trimmed = String(state).trim();
    const exact = caseInsensitiveExact(trimmed);
    conditions.push({
      $or: [
        { state: exact },
        { location: new RegExp(`(,\\s*)?${escapeRegex(trimmed)}\\s*$`, 'i') },
        { location: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
      ],
    });
  }

  if (city && String(city).trim()) {
    const trimmed = String(city).trim();
    const exact = caseInsensitiveExact(trimmed);
    conditions.push({
      $or: [
        { city: exact },
        { location: new RegExp(`^${escapeRegex(trimmed)}\\s*,`, 'i') },
        { location: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
      ],
    });
  }

  if (location && String(location).trim()) {
    const trimmed = String(location).trim();
    const exact = caseInsensitiveExact(trimmed);
    conditions.push({
      $or: [{ city: exact }, { location: exact }],
    });
  }

  return conditions;
}

/**
 * Build a MongoDB filter for issue list endpoints.
 * Uses $and when combining $text with location filters (required by MongoDB).
 */
export function buildIssueFilter({ status, q, state, city, location } = {}) {
  const filter = {};
  const andConditions = [];

  if (status) filter.status = status;

  if (q && String(q).trim()) {
    andConditions.push({ $text: { $search: String(q).trim() } });
  }

  andConditions.push(...buildLocationAndConditions({ state, city, location }));

  if (andConditions.length === 0) return filter;

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
    return filter;
  }

  filter.$and = andConditions;
  return filter;
}
