import mongoose from 'mongoose';

const ReadingEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pause', 'backtrack', 'wordFlag', 'wordPronounce', 'sttMismatch', 'speedChange', 'themeChange'],
    required: true
  },
  position: {
    paragraphIndex: { type: Number, default: 0 },
    wordIndex: { type: Number, default: 0 },
    word: { type: String }
  },
  durationMs: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ReadingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  events: [ReadingEventSchema],
  wpm: {
    type: Number,
    default: 0
  },
  completionPercent: {
    type: Number,
    default: 0
  },
  struggledWords: [{
    type: String
  }],
  adaptedSimplificationLevel: {
    type: String,
    enum: ['light', 'moderate', 'high']
  }
}, {
  timestamps: true
});

export const ReadingSession = mongoose.models.ReadingSession || mongoose.model('ReadingSession', ReadingSessionSchema);
