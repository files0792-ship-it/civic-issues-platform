import { Router } from 'express';

const router = Router();

/**
 * GET /api/cities
 * Now returns empty or generic suggestions (no restriction)
 */
router.get('/', (req, res) => {
  const q = req.query.q;

  if (q && String(q).trim()) {
    // simple echo suggestion (optional)
    return res.json({
      cities: [String(q).trim()]
    });
  }

  // no fixed cities anymore
  res.json({ cities: [] });
});

export default router;