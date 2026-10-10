const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?/ig;
const YEAR_RE = /\b(?:19|20)\d{2}\b/;
const DATE_RANGE_RE = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}[/-])?\s*(?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:Present|Current|Now)|(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}[/-])?\s*(?:19|20)\d{2}))/i;

const HEADINGS = {
  experience: ['experience','work experience','employment','professional experience','work history'],
  education: ['education','academic background','qualifications'],
  skills: ['skills','technical skills','core skills','competencies','technologies'],
  projects: ['projects','selected projects','personal projects','academic projects'],
  certifications: ['certifications','certificates','licenses & certifications','licenses and certifications'],
  summary: ['summary','profile','professional summary','career summary','objective']
};
const HEADING_LOOKUP = new Map(Object.entries(HEADINGS).flatMap(([key, values]) => values.map(v => [v, key])));

const clean = value => (value || '').replace(/\s+/g, ' ').trim();
const cleanUrl = value => value && !/^https?:\/\//i.test(value) ? `https://${value}` : value || '';

function linesOf(text) { return text.split(/\r?\n/).map(clean).filter(Boolean); }
function headingKey(line) { return HEADING_LOOKUP.get(line.toLowerCase().replace(/[:|]$/,'')); }

function sections(lines) {
  const result = { header: [] };
  let current = 'header';
  for (const line of lines) {
    const key = headingKey(line);
    if (key) { current = key; result[current] ||= []; continue; }
    result[current] ||= [];
    result[current].push(line);
  }
  return result;
}

function guessName(header) {
  const bad = /@|https?:|www\.|linkedin|github|portfolio|resume|curriculum|\d{3,}|data science|developer|engineer|analyst|manager|specialist/i;
  return header.slice(0, 8).find(line => !bad.test(line) && line.length >= 3 && line.length <= 55 && /^[A-Za-zÀ-ÿ.' -]+$/.test(line)) || '';
}

function guessLocation(header) {
  return header.slice(0, 12).find(line => /,/.test(line) && !/@|http|linkedin|github/i.test(line) && !YEAR_RE.test(line) && line.length < 70) || '';
}

function findUrls(text) {
  return (text.match(URL_RE) || []).map(v => v.replace(/[),.;]+$/,''));
}

function parseSkills(lines) {
  const values = lines.flatMap(line => line.split(/[,•|;·]/)).map(v => clean(v.replace(/^[-–—]+/,''))).filter(v => v && v.length <= 70);
  return [...new Set(values)];
}

function blocks(lines) {
  if (!lines?.length) return [];
  const result = [];
  let current = [];
  for (const line of lines) {
    const looksLikeStart = DATE_RANGE_RE.test(line) && current.length >= 2;
    if (looksLikeStart) { result.push(current); current = []; }
    current.push(line);
  }
  if (current.length) result.push(current);
  return result.filter(b => b.some(line => YEAR_RE.test(line)) || b.length >= 2);
}

function dates(block) {
  const joined = block.join(' ');
  const match = joined.match(DATE_RANGE_RE);
  return match ? [clean(match[1]), clean(match[2])] : ['', ''];
}

function parseExperience(lines) {
  return blocks(lines).map(block => {
    const [start_date,end_date] = dates(block);
    const core = block.filter(line => !DATE_RANGE_RE.test(line));
    return { title: core[0] || '', company: core[1] || '', location: '', start_date, end_date, description: core.slice(2).join(' ') };
  });
}

function parseEducation(lines) {
  return blocks(lines).map(block => {
    const [start_date,end_date] = dates(block);
    const core = block.filter(line => !DATE_RANGE_RE.test(line));
    return { qualification: core[0] || '', institution: core[1] || '', start_date, end_date, description: core.slice(2).join(' ') };
  });
}

function parseProjects(lines) {
  if (!lines?.length) return [];
  const raw = [];
  let current = [];
  for (const line of lines) {
    if (current.length && (/^[A-Z][A-Za-z0-9 +&/.-]{2,60}$/.test(line)) && current.join(' ').length > 80) { raw.push(current); current = []; }
    current.push(line);
  }
  if (current.length) raw.push(current);
  return raw.map(block => ({ name:block[0] || '', description:block.slice(1).join(' '), technologies:'', url:cleanUrl(findUrls(block.join(' '))[0] || '') }));
}

export function emptyProfile() {
  return { schema_version:'1.0', full_name:'', email:'', phone:'', location:'', linkedin:'', github:'', portfolio:'', summary:'', experience:[], education:[], skills:[], projects:[], certifications:[] };
}

export function extractProfile(text) {
  const lines = linesOf(text);
  const sec = sections(lines);
  const all = lines.join(' ');
  const urls = findUrls(all);
  const linkedin = urls.find(u => /linkedin\.com/i.test(u)) || '';
  const github = urls.find(u => /github\.com/i.test(u)) || '';
  const portfolio = urls.find(u => !/linkedin\.com|github\.com/i.test(u)) || '';
  const phone = (all.match(PHONE_RE) || [''])[0];
  return {
    ...emptyProfile(),
    full_name: guessName(sec.header || lines),
    email: (all.match(EMAIL_RE) || [''])[0],
    phone: clean(phone),
    location: guessLocation(sec.header || []),
    linkedin: cleanUrl(linkedin), github: cleanUrl(github), portfolio: cleanUrl(portfolio),
    summary: (sec.summary || []).join(' '),
    experience: parseExperience(sec.experience || []),
    education: parseEducation(sec.education || []),
    skills: parseSkills(sec.skills || []),
    projects: parseProjects(sec.projects || []),
    certifications: (sec.certifications || []).map(line => clean(line.replace(/^[-•–—]+/,''))).filter(Boolean)
  };
}
