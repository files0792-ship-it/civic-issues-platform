import { Router } from 'express';
import path from 'path';
import { Issue, ISSUE_STATUSES } from '../models/Issue.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { jaccardSimilarity, combinedIssueText } from '../utils/textSimilarity.js';
import { calculateDynamicPriority } from '../utils/priorityStub.js';
import { shapeIssue } from '../utils/issueShape.js';

const router = Router();

/** GET /api/issues — public feed with optional filters */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, sort = 'newest', location: locationQuery, q, page = '1', limit = '20' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (q && String(q).trim()) {
      filter.$text = { $search: String(q).trim() };
    }
if (locationQuery && String(locationQuery).trim()) {
  filter.location = locationQuery;
}

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let sortSpec = { createdAt: -1 };
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    if (sort === 'upvotes') sortSpec = { upvotes: -1, createdAt: -1 };
    if (sort === 'priority') sortSpec = { predictedPriority: -1 };

    const [items, total] = await Promise.all([
      Issue.find(filter).populate('createdBy', 'name email').sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Issue.countDocuments(filter),
    ]);

    const uid = req.user?.id;
    res.json({
      issues: items.map((d) => shapeIssue(d, uid, req)),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

/** PATCH /api/issues/:id/status — authenticated users may set Pending | In Progress | Resolved */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!ISSUE_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${ISSUE_STATUSES.join(', ')}` });
    }
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ issue: shapeIssue(issue, req.user.id, req) });
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
});

/** GET /api/issues/:id */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const doc = await Issue.findById(req.params.id).populate('createdBy', 'name email');
    if (!doc) return res.status(404).json({ message: 'Issue not found' });
    res.json(shapeIssue(doc, req.user?.id, req));
  } catch {
    res.status(400).json({ message: 'Invalid issue id' });
  }
});

/** POST /api/issues — multipart: title, description, location (city), optional image */
router.post('/', authenticate, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
const location = req.body.location?.trim().toLowerCase();

if (!title || !description || !location) {
  return res.status(400).json({ 
    message: 'title, description and location are required' 
  });
}
    

    const imageRelative = req.file ? path.join('issues', req.file.filename).replace(/\\/g, '/') : null;
    // New issues start with 0 priority (0 upvotes * 10)
    const predictedPriority = 0;

    const newText = combinedIssueText(title, description);
    const candidates = await Issue.find({
      status: { $in: ['Pending', 'In Progress'] },
    })
      .limit(80)
      .select('title description _id')
      .lean();

    let best = { id: null, score: 0 };
    for (const c of candidates) {
      const sim = jaccardSimilarity(newText, combinedIssueText(c.title, c.description));
      if (sim > best.score) best = { id: c._id, score: sim };
    }
    const DUPLICATE_THRESHOLD = 0.45;
    const possibleDuplicateOf =
      best.score >= DUPLICATE_THRESHOLD && best.id ? best.id : null;

    const issue = await Issue.create({
      title,
      description,
      image: imageRelative,
      location,
      createdBy: req.user.id,
      predictedPriority,
      possibleDuplicateOf,
    });

    const populated = await Issue.findById(issue._id).populate('createdBy', 'name email');
    res.status(201).json({
      ...shapeIssue(populated, req.user.id, req),
      duplicateWarning:
        possibleDuplicateOf != null
          ? { message: 'Similar open issue may already exist', similarIssueId: possibleDuplicateOf }
          : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to create issue' });
  }
});

/** POST /api/issues/:id/upvote — toggle upvote for current user */
router.post('/:id/upvote', authenticate, async (req, res) => {
  try {
    const uid = req.user.id;
    
    // Use atomic operations to prevent race conditions
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const upvoteIndex = issue.upvotes.findIndex((id) => id.toString() === uid);
    const isUpvoting = upvoteIndex === -1;
    
    if (isUpvoting) {
      // Add upvote
      issue.upvotes.push(uid);
    } else {
      // Remove upvote
      issue.upvotes.splice(upvoteIndex, 1);
    }

    // Recalculate priority based on new upvote count
    issue.predictedPriority = calculateDynamicPriority(issue.upvotes.length);
    console.log("UPVOTES:", issue.upvotes.length);
console.log("PRIORITY:", issue.predictedPriority);

    await issue.save();
    
    // Populate and return updated issue
    const populated = await Issue.findById(issue._id).populate('createdBy', 'name email');
    const response = shapeIssue(populated, uid, req);
    
    res.json({
      ...response,
      message: isUpvoting ? 'Upvote added successfully' : 'Upvote removed successfully'
    });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ message: 'Failed to process upvote. Please try again.' });
  }
});

export default router;
