import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 25;

export async function extractTextFromPdf(file) {
  if (!file || file.type !== 'application/pdf') throw new Error('Please choose a PDF file.');
  if (file.size > MAX_BYTES) throw new Error('PDF is larger than the 10 MB limit.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  if (pdf.numPages > MAX_PAGES) throw new Error(`PDF has ${pdf.numPages} pages. The current limit is ${MAX_PAGES}.`);

  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = [];
    let currentY = null;
    let line = [];
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = item.transform?.[5] ?? 0;
      if (currentY !== null && Math.abs(y - currentY) > 3) {
        if (line.length) lines.push(line.join(' ').replace(/\s+/g, ' ').trim());
        line = [];
      }
      line.push(item.str);
      currentY = y;
    }
    if (line.length) lines.push(line.join(' ').replace(/\s+/g, ' ').trim());
    pages.push(lines.filter(Boolean).join('\n'));
  }
  return pages.join('\n\n').trim();
}
