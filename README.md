<div align="center">

# 📄 ResumeFill AI

### Upload once. Review once. Reuse your résumé data wherever you apply.

A privacy-first, open-source résumé information extractor and job-application autofill assistant built with **Python, Streamlit and a Chrome extension**.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-App-FF4B4B?logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](extension/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Why ResumeFill AI?

Job applications repeatedly ask for information already present in your résumé. ResumeFill AI turns a résumé into a **reviewable, reusable profile** and lets the user decide where that information is reused.

The project deliberately separates extraction from autofill:

```text
PDF résumé
    ↓
Text extraction
    ↓
Structured profile
    ↓
User review & correction
    ↓
JSON / CSV export
    ↓
Chrome extension
    ↓
Supported job-form fields
```

**The user remains in control.** ResumeFill AI does not automatically submit applications and does not invent sensitive answers.

## ✨ MVP Features

- Upload a text-based PDF résumé
- Extract common contact information, links, skills and résumé sections
- Review and edit extracted information before export
- Export a documented JSON profile for reuse
- Export a flattened CSV profile
- Import the JSON profile into the included Chrome extension
- Fill common empty job-form fields such as name, email, phone, location and professional links
- Highlight fields filled by the extension so they are easy to review
- Keep the extension profile in Chrome's local extension storage
- No paid AI API required

> **MVP limitation:** résumé layouts vary enormously. The current extractor uses deterministic parsing and is intentionally conservative. OCR, stronger layout understanding and smarter extraction are planned improvements.

## 🔐 Privacy by Design

Résumé data is personal information, so privacy is a product requirement rather than an afterthought.

- The local Streamlit app processes uploaded PDFs in memory.
- The application does not intentionally persist uploaded résumé files.
- The Chrome extension stores the imported profile in `chrome.storage.local`.
- There is no ResumeFill AI account or cloud profile database in this MVP.
- Real résumés, exported profiles, secrets and environment files are excluded from Git.
- The extension fills fields only when the user clicks **Fill this page**.
- It never clicks a job application's submit button.

If this app is deployed to a public Streamlit host, the PDF is necessarily processed by that hosting environment during the session. Users should use the local version when they require device-only résumé processing.

## 🧱 Repository Structure

```text
ResumeFillAI/
├── app.py
├── src/
│   ├── __init__.py
│   ├── pdf_parser.py
│   ├── extractor.py
│   ├── schemas.py
│   └── exporter.py
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── styles.css
├── tests/
│   ├── test_extractor.py
│   └── test_exporter.py
├── .streamlit/
│   └── config.toml
├── requirements.txt
├── requirements-dev.txt
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Run the Web App Locally

```bash
git clone https://github.com/KoshyMammoottillMathew/ResumeFillAI.git
cd ResumeFillAI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

On Windows, activate the virtual environment with `.venv\\Scripts\\activate`.

## 🧩 Load the Chrome Extension

1. Run ResumeFill AI and export your verified **JSON profile**.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose this repository's `extension` folder.
6. Open the ResumeFill AI extension and import the JSON profile.
7. Visit a job-application form and click **Fill this page**.
8. Review every populated field before submitting the form yourself.

The extension is intentionally generic. Complex custom controls and some job portals will require site-specific adapters in later versions.

## 🧾 Profile Schema

The web app and extension communicate through a versioned JSON profile. Core fields include:

```json
{
  "schema_version": "1.0",
  "full_name": "Jane Example",
  "email": "jane@example.com",
  "phone": "+1 555 123 4567",
  "location": "",
  "linkedin": "https://linkedin.com/in/jane-example",
  "github": "",
  "portfolio": "",
  "summary": "",
  "experience": [],
  "education": [],
  "skills": ["Python", "SQL"],
  "projects": [],
  "certifications": []
}
```

Fields not found in the résumé remain blank rather than being guessed.

## 🧪 Tests

```bash
pip install -r requirements-dev.txt
pytest -q
```

Tests use synthetic data only.

## 🗺️ Roadmap

- [x] PDF upload and text extraction
- [x] Structured profile schema
- [x] Editable Streamlit profile
- [x] JSON and CSV export
- [x] Chrome extension profile import
- [x] Common contact-field autofill
- [ ] Better work-history and education parsing
- [ ] Add/remove repeatable records directly in the UI
- [ ] Dropdown, radio and checkbox matching
- [ ] OCR for scanned/image-only PDFs
- [ ] Site adapters for common applicant-tracking systems
- [ ] Optional secure sync architecture
- [ ] Public hosted demo after privacy/deployment review

## ⚠️ Responsible Use

ResumeFill AI is an assistive autofill tool. Users are responsible for reviewing the information entered into application forms and for complying with the terms and requirements of websites they use. The project intentionally avoids automatic application submission.

## 🤝 Contributing

Contributions, bug reports and suggestions are welcome. Please avoid attaching real résumés or personal information to public issues. Synthetic examples are preferred for bug reports.

## 📜 License

Released under the [MIT License](LICENSE).

---

<div align="center">

Built by **Koshy Mammoottill Mathew**  
[Portfolio](https://koshymammoottillmathew.github.io/) · [LinkedIn](https://www.linkedin.com/in/koshymammoottillmathew/) · [GitHub](https://github.com/KoshyMammoottillMathew)

</div>
