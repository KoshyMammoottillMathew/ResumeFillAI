import { extractTextFromPdf } from './pdf-parser.js';
import { extractProfile, emptyProfile } from './extractor.js';
import { profileToCsv, downloadText } from './exporter.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const uploadView = $('#uploadView');
const ocrView = $('#ocrView');
const workspace = $('#workspace');
const fileInput = $('#resumeFile');
const dropzone = $('#dropzone');
const status = $('#uploadStatus');
const form = $('#profileForm');
const privacyPill = $('#privacyPill');
const privacyText = $('#privacyText');
const ocrFile = $('#ocrFile');
const ocrFileInfo = $('#ocrFileInfo');
const ocrStatus = $('#ocrStatus');
let profile = emptyProfile();

const configs = {
  experience: [['title','Job title'],['company','Employer'],['location','Location'],['start_date','Start date'],['end_date','End date'],['description','Description']],
  education: [['qualification','Qualification'],['institution','Institution'],['start_date','Start date'],['end_date','End date'],['description','Details']],
  projects: [['name','Project name'],['description','Description'],['technologies','Technologies'],['url','Link']]
};

function setStatus(message, kind='') { status.textContent = message; status.className = `status ${kind}`; }
function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function humanSize(bytes) { return bytes < 1024*1024 ? `${Math.max(1,Math.round(bytes/1024))} KB` : `${(bytes/(1024*1024)).toFixed(1)} MB`; }

function setMode(mode) {
  $$('.mode-button').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  if (mode === 'ocr') {
    uploadView.classList.add('hidden'); workspace.classList.add('hidden'); ocrView.classList.remove('hidden');
    privacyPill.classList.add('experimental'); privacyText.textContent = 'Advanced OCR prototype · backend not connected';
  } else {
    ocrView.classList.add('hidden');
    if (profile.full_name || profile.email || profile.experience?.length || profile.education?.length) workspace.classList.remove('hidden'); else uploadView.classList.remove('hidden');
    privacyPill.classList.remove('experimental'); privacyText.textContent = 'Your résumé stays in this browser';
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

$$('.mode-button').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));

ocrFile.addEventListener('change', () => {
  const file = ocrFile.files[0];
  if (!file) { ocrFileInfo.classList.add('hidden'); return; }
  const allowed = file.type === 'application/pdf' || ['image/png','image/jpeg'].includes(file.type) || /\.(pdf|png|jpe?g)$/i.test(file.name);
  if (!allowed) {
    ocrFile.value = ''; ocrFileInfo.classList.add('hidden'); ocrStatus.textContent = 'Choose a PDF, PNG or JPG document.'; ocrStatus.className = 'status compact error'; return;
  }
  if (file.size > 20*1024*1024) {
    ocrFile.value = ''; ocrFileInfo.classList.add('hidden'); ocrStatus.textContent = 'This prototype limits prepared documents to 20 MB.'; ocrStatus.className = 'status compact error'; return;
  }
  ocrFileInfo.innerHTML = `<strong>${escapeHtml(file.name)}</strong><span>${humanSize(file.size)} · ${escapeHtml(file.type || 'document')}</span>`;
  ocrFileInfo.classList.remove('hidden');
  ocrStatus.textContent = 'Document prepared locally. It has not been uploaded. GPU inference will be enabled only after a backend and explicit consent flow are connected.';
  ocrStatus.className = 'status compact success';
});

async function processFile(file) {
  if (!file) return;
  setStatus('Reading your PDF locally…');
  try {
    const text = await extractTextFromPdf(file);
    if (!text.trim()) throw new Error('No readable text was found. Try the Advanced OCR prototype for scanned/image-only documents.');
    setStatus('Structuring your résumé…');
    profile = extractProfile(text);
    renderProfile();
    uploadView.classList.add('hidden'); workspace.classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'});
  } catch (error) { setStatus(error.message || 'Could not process this PDF.', 'error'); }
}

['dragenter','dragover'].forEach(event => dropzone.addEventListener(event, e => { e.preventDefault(); dropzone.classList.add('drag'); }));
['dragleave','drop'].forEach(event => dropzone.addEventListener(event, e => { e.preventDefault(); dropzone.classList.remove('drag'); }));
dropzone.addEventListener('drop', e => processFile(e.dataTransfer.files[0]));
fileInput.addEventListener('change', () => processFile(fileInput.files[0]));

$$('.tab').forEach(button => button.addEventListener('click', () => {
  $$('.tab').forEach(b => b.classList.toggle('active', b === button));
  $$('.tab-panel').forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== button.dataset.tab));
}));

function renderRecords(type) {
  const list = $(`#${type}List`);
  const records = profile[type] || [];
  list.innerHTML = records.length ? records.map((record,index) => `<article class="record" data-record="${type}" data-index="${index}"><div class="record-head"><h3>${type === 'projects' ? 'Project' : type[0].toUpperCase()+type.slice(1)} ${index+1}</h3><button class="remove" type="button" data-remove="${type}" data-index="${index}">Remove</button></div><div class="record-grid">${configs[type].map(([field,label]) => `<label class="${field === 'description' ? 'wide' : ''}">${label}${field === 'description' ? `<textarea rows="4" data-field="${field}">${escapeHtml(record[field] || '')}</textarea>` : `<input type="text" data-field="${field}" value="${escapeHtml(record[field] || '')}">`}</label>`).join('')}</div></article>`).join('') : `<p class="hint">No ${type} was confidently extracted. Add it manually if needed.</p>`;
}

function renderProfile() {
  ['full_name','email','phone','location','linkedin','github','portfolio','summary'].forEach(key => { const field = form.elements.namedItem(key); if (field) field.value = profile[key] || ''; });
  $('#skillsInput').value = (profile.skills || []).join('\n');
  $('#certificationsInput').value = (profile.certifications || []).join('\n');
  Object.keys(configs).forEach(renderRecords);
}

function syncProfile() {
  ['full_name','email','phone','location','linkedin','github','portfolio','summary'].forEach(key => { profile[key] = form.elements.namedItem(key)?.value.trim() || ''; });
  profile.skills = $('#skillsInput').value.split('\n').map(v => v.trim()).filter(Boolean);
  profile.certifications = $('#certificationsInput').value.split('\n').map(v => v.trim()).filter(Boolean);
  Object.keys(configs).forEach(type => {
    profile[type] = $$(`[data-record="${type}"]`).map(card => {
      const item = {};
      configs[type].forEach(([field]) => { item[field] = card.querySelector(`[data-field="${field}"]`)?.value.trim() || ''; });
      return item;
    });
  });
  profile.schema_version = '1.0';
  return profile;
}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) { syncProfile(); const type = add.dataset.add; const blank = Object.fromEntries(configs[type].map(([field]) => [field,''])); profile[type].push(blank); renderRecords(type); return; }
  const remove = event.target.closest('[data-remove]');
  if (remove) { syncProfile(); const type = remove.dataset.remove; profile[type].splice(Number(remove.dataset.index),1); renderRecords(type); }
});

$('#downloadJson').addEventListener('click', () => downloadText('resumefill-profile.json', JSON.stringify(syncProfile(),null,2), 'application/json'));
$('#downloadCsv').addEventListener('click', () => downloadText('resumefill-profile.csv', profileToCsv(syncProfile()), 'text/csv;charset=utf-8'));
$('#newResumeBtn').addEventListener('click', () => { profile = emptyProfile(); fileInput.value=''; workspace.classList.add('hidden'); uploadView.classList.remove('hidden'); setStatus(''); window.scrollTo({top:0,behavior:'smooth'}); });
