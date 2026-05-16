import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchedEmail {
  email: string;
  userId: string;
  active: boolean;
  lastBreachCount: number;
  lastChecked: Date | null;
  lastBreachSources: string[];
  lastBreached: Date | null;
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
      default: null,
    },
    lastBreachSources: {
      type: [String],
      default: [],
    },
    lastBreached: {
      type: Date,
      default: null,
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

WatchedEmailSchema.index({ email: 1, active: 1 });
WatchedEmailSchema.index({ userId: 1, active: 1 });
WatchedEmailSchema.index({ active: 1, lastChecked: 1 }); // для cron скана

WatchedEmailSchema.statics.findActive = async function () {
  return this.find({ active: true }).exec();
};

// Найти все записи которые не проверялись больше 23 часов (для cron)
WatchedEmailSchema.statics.findStale = async function () {
  const cutoff = new Date(Date.now() - 23 * 60 * 60 * 1000);
  return this.find({
    active: true,
    $or: [
      { lastChecked: null },
      { lastChecked: { $lt: cutoff } },
    ],
  }).exec();
};

WatchedEmailSchema.methods.deactivate = async function () {
  this.active = false;
  return this.save();
};

WatchedEmailSchema.methods.updateBreachCount = async function (
  count: number,
  sources: string[] = []
) {
  const wasClean = this.lastBreachCount === 0;
  this.lastBreachCount = count;
  this.lastChecked = new Date();
  this.lastBreachSources = sources;
  if (count > 0 && wasClean) {
    this.lastBreached = new Date();
  }
  return this.save();
};

WatchedEmailSchema.virtual('daysSinceLastCheck').get(function () {
  if (!this.lastChecked) return null;
  const diffTime = Math.abs(Date.now() - new Date(this.lastChecked).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

WatchedEmailSchema.virtual('needsScan').get(function () {
  if (!this.lastChecked) return true;
  const diff = Date.now() - new Date(this.lastChecked).getTime();
  return diff > 23 * 60 * 60 * 1000;
});

const WatchedEmail =
  mongoose.models.WatchedEmail ||
  mongoose.model<IWatchedEmailDoc>('WatchedEmail', WatchedEmailSchema);

export default WatchedEmail;