import mongoose from 'mongoose';

const PhoneCheckSchema = new mongoose.Schema({
  phoneHash: { type: String, required: true, index: true },
  phoneLast4: { type: String, required: true },
  countryCode: { type: String, required: true },
  breachCount: { type: Number, default: 0 },
  breachSources: [{ type: String }],
  dataTypes: [{ type: String }],
  riskLevel: { type: String, enum: ['safe', 'low', 'medium', 'high', 'critical'], default: 'safe' },
  userId: { type: String, required: true },
  scannedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.PhoneCheck || mongoose.model('PhoneCheck', PhoneCheckSchema);
