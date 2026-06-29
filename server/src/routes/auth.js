import { Router } from 'express';
import { User } from '../models/User.js';
import { GovernmentAuthId } from '../models/GovernmentAuthId.js';
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
    authProvider: user.authProvider || 'local',
    profilePicture: user.profilePicture || null,
  };
}

async function validateGovernmentAuthId(governmentAuthId) {
  const trimmed = String(governmentAuthId || '').trim();
  if (!trimmed) return { ok: false, id: null };

  const record = await GovernmentAuthId.findOne({ governmentAuthId: trimmed });
  if (!record) return { ok: false, id: null };

  return { ok: true, id: trimmed };
}

/** POST /api/auth/register — create user (default role: user) */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, governmentAuthId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const selectedRole = role || 'user';
    if (selectedRole === 'admin' && !String(governmentAuthId || '').trim()) {
      return res.status(400).json({ message: 'Government Auth ID is required for admin registration.' });
    }

    let storedGovId = null;
    if (selectedRole === 'admin') {
      const validation = await validateGovernmentAuthId(governmentAuthId);
      if (!validation.ok) {
        return res.status(400).json({ message: 'Invalid Government Authentication ID.' });
      }

      const alreadyAssigned = await User.findOne({ governmentAuthId: validation.id });
      if (alreadyAssigned) {
        return res.status(409).json({
          message: 'This Government Authentication ID is already assigned to an account.',
        });
      }

      storedGovId = validation.id;
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: selectedRole,
      authProvider: 'local',
      governmentAuthId: storedGovId,
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
    const { email, password, role: loginRole, governmentAuthId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    if (loginRole === 'admin' && !String(governmentAuthId || '').trim()) {
      return res.status(400).json({ message: 'Government Auth ID is required for admin login.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (loginRole === 'admin') {
      if (user.role !== 'admin') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const submittedGovId = String(governmentAuthId).trim();
      if (!user.governmentAuthId || user.governmentAuthId !== submittedGovId) {
        return res.status(401).json({ message: 'Invalid Government Auth ID.' });
      }
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
      authProvider: user.authProvider || 'local',
      profilePicture: user.profilePicture || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load profile' });
  }
});

/** PUT /api/users/change-password — change password for local/linked accounts */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Google accounts cannot set a password here. Link your account first.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'No password set on this account.' });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update password' });
  }
});

/** POST /api/auth/google/link — link a Google account to an existing local account */
router.post('/google/link', authenticate, async (req, res) => {
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
    const googleEmail = decoded.email?.toLowerCase()?.trim();
    const profilePicture = decoded.picture || null;

    // Check if this googleId is already linked to a DIFFERENT account
    const existingWithGoogle = await User.findOne({ googleId });
    if (existingWithGoogle && existingWithGoogle._id.toString() !== req.user.id) {
      return res.status(409).json({ message: 'This Google account is already linked to a different user.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.googleId) {
      return res.status(409).json({ message: 'A Google account is already linked to this profile.' });
    }

    user.googleId = googleId;
    user.authProvider = 'linked';
    if (profilePicture && !user.profilePicture) user.profilePicture = profilePicture;
    await user.save();

    return res.json({
      message: 'Google account linked successfully',
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This Google account is already linked to another user.' });
    }
    return res.status(500).json({ message: 'Failed to link Google account' });
  }
});

export default router;
