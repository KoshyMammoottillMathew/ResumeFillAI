from io import BytesIO
import fitz

MAX_PDF_BYTES = 10 * 1024 * 1024
MAX_PAGES = 25

def extract_text_from_pdf(data: bytes) -> str:
    if not data:
        raise ValueError("The uploaded PDF is empty.")
    if len(data) > MAX_PDF_BYTES:
        raise ValueError("PDF is larger than the 10 MB MVP limit.")
    if not data.startswith(b"%PDF"):
        raise ValueError("The uploaded file does not appear to be a PDF.")
    with fitz.open(stream=BytesIO(data), filetype="pdf") as doc:
        if doc.page_count > MAX_PAGES:
            raise ValueError(f"PDF has more than {MAX_PAGES} pages.")
        return "\n".join(page.get_text("text") for page in doc)
