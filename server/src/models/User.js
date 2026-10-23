import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  preferences: {
    font: { type: String, default: 'OpenDyslexic' },
    fontSize: { type: Number, default: 18 },
    lineSpacing: { type: Number, default: 1.8 },
    letterSpacing: { type: Number, default: 0.08 },
    wordSpacing: { type: Number, default: 0.16 },
    theme: { type: String, default: 'cream' },
    ttsRate: { type: Number, default: 0.9 },
    readingRuler: { type: Boolean, default: false },
    bionicMode: { type: Boolean, default: false },
    simplificationLevel: { type: String, enum: ['light', 'moderate', 'high'], default: 'moderate' }
  },
  readingProfile: {
    simplificationLevel: { type: String, enum: ['light', 'moderate', 'high'], default: 'moderate' },
    avgWpm: { type: Number, default: 140 },
    difficultWords: [{ type: String }],
    totalSessions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
