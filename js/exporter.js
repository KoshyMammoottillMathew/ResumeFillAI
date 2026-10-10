function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function flatten(value, path = '', rows = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${path}${path ? '.' : ''}${index + 1}`, rows));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => flatten(item, `${path}${path ? '.' : ''}${key}`, rows));
  } else {
    rows.push([path, value ?? '']);
  }
  return rows;
}

export function profileToCsv(profile) {
  return ['field,value', ...flatten(profile).map(([field,value]) => `${escapeCsv(field)},${escapeCsv(value)}`)].join('\n');
}

export function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
