# ResumeFill AI

**Privacy-first résumé extraction and job application autofill — entirely in the browser.**

ResumeFill AI converts a text-based PDF résumé into a structured, editable profile. The web app runs as static HTML/CSS/JavaScript: the résumé is read locally in the browser and is not uploaded to a ResumeFill AI backend. After review, users can export JSON for the companion Chrome extension or CSV for their own records.

## Live app

**Canonical app:** https://koshymammoottillmathew.github.io/products/resumefill-ai/

The application is published as part of Koshy's GitHub Pages site under the **Products** category. This repository remains the source repository for ResumeFill AI.

## Why ResumeFill AI?

Repeatedly entering the same contact details, skills, education and work history into job forms is slow and error-prone. ResumeFill AI creates one verified profile that can be reused while keeping the applicant in control.

## Privacy by design

- PDF parsing happens in the browser.
- There is no ResumeFill AI application server or résumé database.
- The app does not intentionally upload or persist the selected PDF.
- Exported files are created locally in the browser.
- The Chrome extension stores an imported profile in `chrome.storage.local`.
- The extension never auto-submits a job application.
- The app loads the pinned PDF.js library from a public CDN; the résumé itself is provided directly to PDF.js in the browser.

## Browser app flow

```text
PDF résumé
    ↓
Browser-side PDF.js text extraction
    ↓
Deterministic JavaScript résumé parser
    ↓
User review and correction
    ↓
JSON / CSV export
    ↓
Chrome extension
    ↓
Supported job-form fields
```

## Repository structure

```text
ResumeFillAI/
├── index.html
├── styles.css
├── js/
│   ├── app.js
│   ├── pdf-parser.js
│   ├── extractor.js
│   └── exporter.js
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── styles.css
├── LICENSE
└── README.md
```

## Current MVP

- Drag-and-drop or choose a PDF résumé
- Browser-side PDF text extraction
- 10 MB / 25-page guardrails
- Structured profile schema v1.0
- Editable contact details and summary
- Editable work experience and education
- Add/remove repeatable experience, education and project records
- Editable skills and certifications
- JSON and CSV export
- Chrome extension JSON import
- Common job-form contact field autofill
- No auto-submit

## Profile schema

```json
{
  "schema_version": "1.0",
  "full_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "",
  "experience": [],
  "education": [],
  "skills": [],
  "projects": [],
  "certifications": []
}
```

## Chrome extension testing

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the `extension` directory.
5. Export a verified JSON profile from the web app.
6. Import that JSON in the extension.
7. Open a job application page and choose **Fill this page**.
8. Review every filled field before submitting anything yourself.

## Limitations

- The current PDF extractor targets text-based PDFs; scanned/image-only PDFs need OCR and are not yet supported.
- Résumé layouts vary widely, so extracted fields must always be reviewed.
- The extension currently focuses on common text inputs and textareas; complex ATS widgets, selects, radios and checkboxes need dedicated support.
- ResumeFill AI is an assistive autofill tool, not an autonomous application bot.

## Roadmap

- [x] Browser-native PDF extraction
- [x] Structured profile schema
- [x] Editable profile review
- [x] Add/remove repeatable records
- [x] JSON and CSV export
- [x] Chrome extension profile import
- [x] Common contact-field autofill
- [ ] Stronger multi-layout résumé parsing
- [ ] OCR for scanned/image-only PDFs
- [ ] Dropdown, radio and checkbox matching
- [ ] Preview/confidence layer before autofill
- [ ] ATS-specific adapters
- [ ] Automated browser tests

## Responsible use

ResumeFill AI is designed to reduce repetitive typing. Users remain responsible for verifying extracted information, reviewing autofilled fields, answering employer-specific questions themselves, and manually submitting each application.

## License

MIT License. See [LICENSE](LICENSE).

## Author

**Koshy Mammoottill Mathew**

- Portfolio: https://koshymammoottillmathew.github.io/
- LinkedIn: https://www.linkedin.com/in/koshymammoottillmathew/
- GitHub: https://github.com/KoshyMammoottillMathew
