import mongoose from 'mongoose';

const DifficultWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  originalWord: { type: String },
  simplifiedWord: { type: String },
  phonetic: { type: String },
  syllables: [{ type: String }],
  definition: { type: String },
  synonyms: [{ type: String }],
  frequency: { type: Number, default: 1 }
}, { _id: false });

const ParagraphSchema = new mongoose.Schema({
  paragraphIndex: { type: Number, required: true },
  text: { type: String, required: true },
  simplifiedText: { type: String, required: true },
  difficultWords: [DifficultWordSchema],
  stats: {
    originalWordCount: { type: Number, default: 0 },
    simplifiedWordCount: { type: Number, default: 0 },
    originalSentenceCount: { type: Number, default: 0 },
    simplifiedSentenceCount: { type: Number, default: 0 },
    fleschKincaidOriginal: { type: Number, default: 0 },
    fleschKincaidSimplified: { type: Number, default: 0 },
    readingEaseOriginal: { type: Number, default: 0 },
    readingEaseSimplified: { type: Number, default: 0 }
  }
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    default: 'Untitled Reading Document'
  },
  sourceType: {
    type: String,
    enum: ['typed', 'pasted', 'image', 'pdf', 'scan'],
    default: 'typed'
  },
  originalFilename: {
    type: String
  },
  rawText: {
    type: String,
    required: true
  },
  simplifiedText: {
    type: String,
    required: true
  },
  simplificationLevel: {
    type: String,
    enum: ['light', 'moderate', 'high'],
    default: 'moderate'
  },
  paragraphs: [ParagraphSchema],
  difficultWords: [DifficultWordSchema],
  readabilityScore: {
    fleschReadingEase: { type: Number, default: 0 },
    fleschKincaidGrade: { type: Number, default: 0 },
    originalGrade: { type: Number, default: 0 },
    improvementPercent: { type: Number, default: 0 },
    estimatedReadingTimeMinutes: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
