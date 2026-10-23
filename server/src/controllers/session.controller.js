import { ReadingSession } from '../models/ReadingSession.js';
import { memoryStore } from '../store/memoryStore.js';
import { getDBStatus } from '../config/db.js';
import { AdaptiveService } from '../services/adaptive.service.js';

export async function logSessionEvent(req, res) {
  try {
    const { documentId } = req.params;
    const { event, wpm, completionPercent, currentLevel } = req.body;

    const { ready } = getDBStatus();
    let session;

    if (ready) {
      try {
        session = await ReadingSession.findOne({ documentId }).sort({ createdAt: -1 });
        if (!session) {
          session = new ReadingSession({
            documentId,
            events: event ? [event] : [],
            wpm: wpm || 0,
            completionPercent: completionPercent || 0
          });
        } else {
          if (event) session.events.push(event);
          if (wpm) session.wpm = wpm;
          if (completionPercent) session.completionPercent = completionPercent;
        }
        await session.save();
      } catch (e) {
        session = memoryStore.createSession({ documentId, events: [event], wpm });
      }
    } else {
      session = memoryStore.createSession({ documentId, events: [event], wpm });
    }

    // Run adaptive analysis
    const analysis = AdaptiveService.analyzeReadingSession({
      events: session.events || [event],
      wpm: session.wpm || wpm,
      currentLevel: currentLevel || 'moderate'
    });

    return res.json({
      success: true,
      sessionId: session._id,
      analysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
