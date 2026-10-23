async function request(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export function submitTextDocument(text, simplificationLevel) {
  return request('/api/documents/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, simplificationLevel })
  });
}

export function uploadDocument(file, simplificationLevel) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('simplificationLevel', simplificationLevel);

  return request('/api/documents/upload', {
    method: 'POST',
    body: formData
  });
}

export function changeSimplificationLevel(rawText, simplificationLevel) {
  return request('/api/documents/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, simplificationLevel })
  });
}
