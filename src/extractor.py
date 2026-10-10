import re
from src.schemas import ResumeProfile, Experience, Education, Project

EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)")
URL_RE = re.compile(r"(?:https?://)?(?:www\.)?[\w.-]+\.[a-z]{2,}(?:/[^\s]*)?", re.I)
SECTION_NAMES = {"experience","work experience","employment","professional experience","education","skills","technical skills","projects","certifications","certificates","summary","profile","professional summary"}

def _lines(text):
    return [re.sub(r"\s+", " ", x).strip(" •\t") for x in text.splitlines() if x.strip()]

def _section_map(lines):
    sections, current = {}, None
    for line in lines:
        key = line.lower().rstrip(":")
        if key in SECTION_NAMES:
            current = key
            sections.setdefault(current, [])
        elif current:
            sections[current].append(line)
    return sections

def _find_url(lines, domain):
    for line in lines:
        if domain in line.lower():
            match = URL_RE.search(line)
            if match:
                value = match.group(0).rstrip(".,;)")
                return value if value.startswith("http") else "https://" + value
    return ""

def _name(lines):
    for line in lines[:8]:
        low = line.lower()
        if "@" not in line and not any(x in low for x in ["linkedin","github","http","www."]) and not any(ch.isdigit() for ch in line) and 1 < len(line.split()) <= 6 and len(line) < 80:
            return line
    return ""

def _skills(sections):
    raw = sections.get("skills", []) + sections.get("technical skills", [])
    values = []
    for line in raw:
        line = re.sub(r"^[A-Za-z ]{2,25}:\s*", "", line)
        values.extend(re.split(r"[,|•;]", line))
    return list(dict.fromkeys(v.strip() for v in values if 1 < len(v.strip()) < 60))[:80]

def _blocks(section_lines):
    if not section_lines:
        return []
    blocks, current = [], []
    for line in section_lines:
        if re.search(r"\b(?:19|20)\d{2}\b", line) and current:
            blocks.append(current); current = [line]
        else:
            current.append(line)
    if current: blocks.append(current)
    return blocks

def _experience(sections):
    raw = sections.get("experience", []) + sections.get("work experience", []) + sections.get("employment", []) + sections.get("professional experience", [])
    out=[]
    for b in _blocks(raw)[:10]:
        if not b: continue
        title=b[0] if len(b)>0 else ""
        company=b[1] if len(b)>1 and not re.search(r"\d{4}",b[1]) else ""
        out.append(Experience(title=title,company=company,description="\n".join(b[2:] if company else b[1:])))
    return out

def _education(sections):
    raw=sections.get("education",[])
    out=[]
    for b in _blocks(raw)[:10]:
        if not b: continue
        out.append(Education(qualification=b[0],institution=b[1] if len(b)>1 else "",description="\n".join(b[2:])))
    return out

def _projects(sections):
    raw=sections.get("projects",[])
    return [Project(name=b[0],description="\n".join(b[1:])) for b in _blocks(raw)[:10] if b]

def extract_profile(text: str) -> ResumeProfile:
    lines=_lines(text); sections=_section_map(lines)
    email=EMAIL_RE.search(text); phone=PHONE_RE.search(text)
    summary_lines=sections.get("summary",[]) or sections.get("profile",[]) or sections.get("professional summary",[])
    certs=sections.get("certifications",[]) + sections.get("certificates",[])
    return ResumeProfile(full_name=_name(lines),email=email.group(0) if email else "",phone=phone.group(0).strip() if phone else "",linkedin=_find_url(lines,"linkedin"),github=_find_url(lines,"github"),summary=" ".join(summary_lines[:8]),experience=_experience(sections),education=_education(sections),skills=_skills(sections),projects=_projects(sections),certifications=certs[:30])
