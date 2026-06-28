import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Omitted for Google-only accounts; required for email/password registration */
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true, trim: true },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'linked'],
      default: 'local',
    },
    profilePicture: { type: String, default: null },
    /** Permanent Government Auth ID assigned to admin accounts */
    governmentAuthId: { type: String, default: null, trim: true },
    /** 'user' | 'admin' — admins can manage all issues */
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
