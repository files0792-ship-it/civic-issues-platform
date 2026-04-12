import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/ml/classify-image
 * Placeholder: returns mock labels. Wire to TensorFlow / cloud vision later.
 */
router.post('/classify-image', authenticate, async (req, res) => {
  const { imageUrl } = req.body || {};
  res.json({
    placeholder: true,
    message: 'Image classification not implemented — integrate your model here',
    inputEcho: imageUrl || null,
    mockLabels: [
      { label: 'pothole', confidence: 0.42 },
      { label: 'street_damage', confidence: 0.31 },
      { label: 'other', confidence: 0.27 },
    ],
  });
});

export default router;
