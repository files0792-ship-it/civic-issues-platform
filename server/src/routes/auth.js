import { Router } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { authenticate } from '../middleware/auth.js';
import { isFirebaseAdminConfigured, verifyFirebaseIdToken } from '../config/firebaseAdmin.js';

const router = Router();

function formatUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/** POST /api/auth/register — create user (default role: user) */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      authProvider: 'local',
    });
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    return res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

/** POST /api/auth/google — verify Firebase ID token, login or register */
router.post('/google', async (req, res) => {
  try {
    if (!isFirebaseAdminConfigured()) {
      return res.status(503).json({ message: 'Google Sign-In is not configured on the server.' });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(idToken);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired Google token.' });
    }

    const googleId = decoded.uid;
    const email = decoded.email?.toLowerCase()?.trim();
    const name = decoded.name?.trim() || email?.split('@')[0] || 'User';
    const profilePicture = decoded.picture || null;

    if (!email) {
      return res.status(400).json({ message: 'Google account must have a verified email address.' });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          message: 'This email is linked to a different Google account.',
        });
      }

      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider === 'local' ? 'linked' : user.authProvider;
        if (profilePicture && !user.profilePicture) user.profilePicture = profilePicture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        profilePicture,
      });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return res.status(500).json({ message: 'Google Sign-In failed' });
  }
});

/** GET /api/auth/me — current user from JWT */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load profile' });
  }
});

export default router;
