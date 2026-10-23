import { SpeechService } from '../services/speech.service.js';

export function getTTSTiming(req, res) {
  try {
    const { text, speechRate = 0.9 } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const timing = SpeechService.generateTimingMap(text, Number(speechRate));
    return res.json({
      success: true,
      ...timing
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function evaluateSpeech(req, res) {
  try {
    const { targetText, spokenText } = req.body;
    const result = SpeechService.evaluatePronunciation(targetText, spokenText);
    return res.json({
      success: true,
      result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
