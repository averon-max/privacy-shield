import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchedEmail {
  email: string;
  userId: string;
  active: boolean;
  lastBreachCount: number;
  lastChecked: Date;
  alertEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IWatchedEmailDoc extends IWatchedEmail, Document {}

const WatchedEmailSchema = new Schema<IWatchedEmailDoc>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastBreachCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    alertEmail: {
      type: String,
      required: [true, 'Alert email is required'],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
WatchedEmailSchema.index({ email: 1, active: 1 });
WatchedEmailSchema.index({ userId: 1, active: 1 });

// Static method - find all active watched emails
WatchedEmailSchema.statics.findActive = async function () {
  return this.find({ active: true }).exec();
};

// Instance method - deactivate watched email
WatchedEmailSchema.methods.deactivate = async function () {
  this.active = false;
  return this.save();
};

// Instance method - update breach count
WatchedEmailSchema.methods.updateBreachCount = async function (count: number) {
  this.lastBreachCount = count;
  this.lastChecked = new Date();
  return this.save();
};

// Virtual for days since last check
WatchedEmailSchema.virtual('daysSinceLastCheck').get(function () {
  const now = new Date();
  const lastCheck = this.lastChecked || now;
  const diffTime = Math.abs(now.getTime() - lastCheck.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Create and export model
const WatchedEmail = mongoose.models.WatchedEmail || mongoose.model<IWatchedEmailDoc>('WatchedEmail', WatchedEmailSchema);

export default WatchedEmail;
