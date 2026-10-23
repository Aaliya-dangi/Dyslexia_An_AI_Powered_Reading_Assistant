import crypto from 'crypto';

/**
 * In-Memory Fallback Store
 * Ensures the entire app functions without any dependency on external MongoDB running.
 */
class MemoryStore {
  constructor() {
    this.documents = new Map();
    this.sessions = new Map();
    this.users = new Map();
  }

  createDocument(docData) {
    const _id = docData._id || crypto.randomUUID();
    const doc = {
      ...docData,
      _id: _id.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(doc._id, doc);
    return doc;
  }

  getDocument(id) {
    return this.documents.get(id.toString()) || null;
  }

  updateDocument(id, updates) {
    const doc = this.documents.get(id.toString());
    if (!doc) return null;
    const updated = {
      ...doc,
      ...updates,
      updatedAt: new Date()
    };
    this.documents.set(id.toString(), updated);
    return updated;
  }

  listDocuments(userId = null) {
    const list = Array.from(this.documents.values());
    if (userId) {
      return list.filter(d => d.userId === userId);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createSession(sessionData) {
    const _id = sessionData._id || crypto.randomUUID();
    const session = {
      ...sessionData,
      _id: _id.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sessions.set(session._id, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id.toString()) || null;
  }

  updateSession(id, updates) {
    const session = this.sessions.get(id.toString());
    if (!session) return null;
    const updated = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };
    this.sessions.set(id.toString(), updated);
    return updated;
  }
}

export const memoryStore = new MemoryStore();
