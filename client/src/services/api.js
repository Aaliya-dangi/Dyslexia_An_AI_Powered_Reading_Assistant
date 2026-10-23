const API_BASE = '/api';

/**
 * Submit plain typed/pasted text to simplification pipeline
 */
export async function submitTextDocument({ text, title, simplificationLevel = 'moderate' }) {
  const response = await fetch(`${API_BASE}/documents/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, title, simplificationLevel })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to simplify text');
  }
  return data.document;
}

/**
 * Upload Image or PDF for OCR text extraction and simplification
 */
export async function uploadDocumentFile({ file, title, simplificationLevel = 'moderate' }) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  formData.append('simplificationLevel', simplificationLevel);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload and process document');
  }
  return data.document;
}

/**
 * Fetch document by ID
 */
export async function getDocumentById(id) {
  const response = await fetch(`${API_BASE}/documents/${id}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to load document');
  }
  return data.document;
}

/**
 * Re-run simplification with another level (light, moderate, high)
 */
export async function changeSimplificationLevel(id, simplificationLevel) {
  const response = await fetch(`${API_BASE}/documents/${id}/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simplificationLevel })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to re-simplify document');
  }
  return data.document;
}

/**
 * Fetch AI visual learning diagram / outline
 */
export async function getDocumentVisualization(id) {
  const response = await fetch(`${API_BASE}/documents/${id}/visualize`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate visual breakdown');
  }
  return data.visualization;
}

/**
 * Log adaptive reading event
 */
export async function logReadingEvent(documentId, { type, position, durationMs, wpm, currentLevel }) {
  try {
    const response = await fetch(`${API_BASE}/sessions/${documentId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: { type, position, durationMs, timestamp: new Date() },
        wpm,
        currentLevel
      })
    });
    return await response.json();
  } catch (e) {
    // Non-blocking telemetry
    console.warn('Telemetry log event notice:', e.message);
  }
}
