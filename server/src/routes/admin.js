import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Issue } from '../models/Issue.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { buildIssueFilter } from '../utils/issueQuery.js';
import { shapeIssue } from '../utils/issueShape.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../uploads');

router.use(authenticate, requireAdmin);

/** GET /api/admin/issues — list all with sort/filter (admin) */
router.get('/issues', async (req, res) => {
  try {
    const {
      status,
      sort = 'newest',
      priorityMin,
      priorityMax,
      location: locationQuery,
      state: stateQuery,
      city: cityQuery,
      q,
      page = '1',
      limit = '50',
    } = req.query;

    const filter = buildIssueFilter({
      status,
      q,
      state: stateQuery,
      city: cityQuery,
      location: locationQuery,
    });

    if (priorityMin != null || priorityMax != null) {
      filter.predictedPriority = {};
      if (priorityMin != null) filter.predictedPriority.$gte = Number(priorityMin);
      if (priorityMax != null) filter.predictedPriority.$lte = Number(priorityMax);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    let sortSpec = { createdAt: -1 };
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    if (sort === 'upvotes') sortSpec = { upvotes: -1, createdAt: -1 };
    if (sort === 'priority') sortSpec = { predictedPriority: -1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Issue.find(filter).populate('createdBy', 'name email').sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Issue.countDocuments(filter),
    ]);

    const shaped = items.map((doc) => shapeIssue(doc, null, req));

    res.json({ issues: shaped, page: pageNum, limit: limitNum, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load admin issues' });
  }
});

/** Status updates: use PATCH /api/issues/:id/status (any authenticated user). */

/** DELETE /api/admin/issues/:id */
router.delete('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.image) {
      const full = path.join(uploadsRoot, issue.image);
      fs.unlink(full, () => {});
    }
    await issue.deleteOne();
    res.json({ message: 'Issue deleted' });
  } catch {
    res.status(400).json({ message: 'Invalid issue id' });
  }
});

export default router;
