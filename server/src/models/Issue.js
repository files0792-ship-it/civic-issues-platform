import mongoose from 'mongoose';


/** Workflow states shown in the public feed and admin dashboard */
export const ISSUE_STATUSES = ['Pending', 'In Progress', 'Resolved'];

/**
 * Issue.location is a plain string (canonical city name), e.g. "Delhi".
 * There is no GeoJSON, no coordinates array, and no geospatial (2dsphere) index.
 */
const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    /** Relative path under /uploads, e.g. "issues/abc.jpg" */
    image: { type: String, default: null },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'Pending',
    },
    /** Users who upvoted (ObjectId refs) — length = upvote count */
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** Stub: optional ML / heuristic priority hint (0–100) */
    predictedPriority: { type: Number, min: 0, max: 100, default: null },
    /** Flag when duplicate detection finds a similar open issue */
    possibleDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  },
  { timestamps: true }
);

/** Standard B-tree index for equality filters (not 2dsphere / not geospatial). */
issueSchema.index({ location: 1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' });

export const Issue = mongoose.model('Issue', issueSchema);
