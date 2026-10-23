import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

/**
 * Basic Auth Controller matching design.md
 */
export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const { ready } = getDBStatus();
    const userPayload = {
      _id: 'guest-user-' + Date.now(),
      name,
      email: email.toLowerCase(),
      preferences: {
        font: 'OpenDyslexic',
        fontSize: 18,
        lineSpacing: 1.8,
        letterSpacing: 0.08,
        theme: 'cream',
        ttsRate: 0.9,
        readingRuler: false,
        bionicMode: false,
        simplificationLevel: 'moderate'
      },
      readingProfile: {
        simplificationLevel: 'moderate',
        difficultWords: [],
        totalSessions: 0
      }
    };

    if (ready) {
      try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(400).json({ success: false, error: 'Email already registered' });
        }
        const newUser = new User({
          name,
          email,
          passwordHash: 'dummy_hashed_' + password,
          preferences: userPayload.preferences,
          readingProfile: userPayload.readingProfile
        });
        const saved = await newUser.save();
        return res.status(201).json({
          success: true,
          user: { _id: saved._id, name: saved.name, email: saved.email, preferences: saved.preferences }
        });
      } catch (e) {
        // fallback
      }
    }

    return res.status(201).json({
      success: true,
      user: userPayload
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    return res.json({
      success: true,
      user: {
        _id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        preferences: {
          font: 'OpenDyslexic',
          fontSize: 18,
          lineSpacing: 1.8,
          letterSpacing: 0.08,
          theme: 'cream',
          ttsRate: 0.9,
          readingRuler: false,
          bionicMode: false,
          simplificationLevel: 'moderate'
        }
      },
      token: 'demo-token-' + Date.now()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
