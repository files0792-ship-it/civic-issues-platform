import mongoose from 'mongoose';

const governmentAuthIdSchema = new mongoose.Schema(
  {
    governmentAuthId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const GovernmentAuthId = mongoose.model(
  'GovernmentAuthId',
  governmentAuthIdSchema,
  'governmentauthids'
);
