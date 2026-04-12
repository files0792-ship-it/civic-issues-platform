/** Canonical Indian cities allowed for issue location (stored as display string). */

/**
 * Returns canonical city name from user input, or null if not in the list (case-insensitive).
 */
export function normalizeCityName(input) {
  return String(input ?? '').trim().toLowerCase();
}

/** Cities matching typed prefix (for autocomplete suggestions). */

