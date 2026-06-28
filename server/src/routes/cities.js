import { Router } from 'express';
import { Issue } from '../models/Issue.js';

const router = Router();

/**
 * GET /api/cities
 * Returns a sorted list of unique cities currently present in issues.
 */
router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim().toLowerCase() : '';

    const citiesFromDb = await Issue.distinct('city');
    const locationsFromDb = await Issue.distinct('location');

    const uniqueCities = new Set();

    citiesFromDb.forEach((c) => {
      if (c && c.trim()) {
        uniqueCities.add(c.trim());
      }
    });

    locationsFromDb.forEach((loc) => {
      if (loc && loc.trim()) {
        const cityPart = loc.split(',')[0].trim();
        if (cityPart) {
          const capitalized = cityPart.charAt(0).toUpperCase() + cityPart.slice(1);
          uniqueCities.add(capitalized);
        }
      }
    });

    let cities = Array.from(uniqueCities);

    if (q) {
      cities = cities.filter((c) => c.toLowerCase().includes(q));
    }

    cities.sort((a, b) => a.localeCompare(b));

    res.json({ cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
});

export default router;