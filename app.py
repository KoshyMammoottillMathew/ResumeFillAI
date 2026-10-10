import json
import streamlit as st
from src.pdf_parser import extract_text_from_pdf
from src.extractor import extract_profile
from src.exporter import profile_to_csv

st.set_page_config(page_title="ResumeFill AI", page_icon="📄", layout="wide")

st.title("📄 ResumeFill AI")
st.caption("Upload once. Review your profile. Reuse it wherever you apply.")
st.info("Privacy-first MVP: uploaded files are processed in memory and are not intentionally saved by this application.")

uploaded = st.file_uploader("Upload your résumé", type=["pdf"], help="Text-based PDF résumés are supported in this MVP.")

if uploaded:
    try:
        text = extract_text_from_pdf(uploaded.getvalue())
        if not text.strip():
            st.error("No readable text was found. Scanned/image-only PDFs are not supported yet.")
            st.stop()
        profile = extract_profile(text)
        st.session_state.setdefault("profile", profile.model_dump())
    except Exception as exc:
        st.error(f"Could not process this PDF: {exc}")
        st.stop()

if "profile" in st.session_state:
    p = st.session_state.profile
    st.subheader("Review your extracted profile")
    st.caption("Please verify every field. ResumeFill AI does not invent missing answers.")

    tab1, tab2, tab3, tab4, tab5 = st.tabs(["Contact", "Experience", "Education", "Skills", "Projects & more"])

    with tab1:
        c1, c2 = st.columns(2)
        p["full_name"] = c1.text_input("Full name", p.get("full_name", ""))
        p["email"] = c2.text_input("Email", p.get("email", ""))
        p["phone"] = c1.text_input("Phone", p.get("phone", ""))
        p["location"] = c2.text_input("Location", p.get("location", ""))
        p["linkedin"] = c1.text_input("LinkedIn", p.get("linkedin", ""))
        p["github"] = c2.text_input("GitHub", p.get("github", ""))
        p["portfolio"] = st.text_input("Portfolio / website", p.get("portfolio", ""))
        p["summary"] = st.text_area("Professional summary", p.get("summary", ""), height=140)

    def edit_records(records, label, fields):
        updated = []
        for i, record in enumerate(records or []):
            with st.expander(f"{label} {i + 1}", expanded=i == 0):
                item = {}
                for field, title in fields:
                    if field == "description":
                        item[field] = st.text_area(title, record.get(field, ""), key=f"{label}-{i}-{field}")
                    else:
                        item[field] = st.text_input(title, record.get(field, ""), key=f"{label}-{i}-{field}")
                updated.append(item)
        return updated

    with tab2:
        p["experience"] = edit_records(p.get("experience", []), "Experience", [("title","Job title"),("company","Employer"),("location","Location"),("start_date","Start date"),("end_date","End date"),("description","Description")])
        if not p["experience"]:
            st.caption("No work-history section was confidently extracted. You can add it after exporting, or improve the source résumé.")

    with tab3:
        p["education"] = edit_records(p.get("education", []), "Education", [("qualification","Qualification"),("institution","Institution"),("start_date","Start date"),("end_date","End date"),("description","Details")])

    with tab4:
        skills_text = st.text_area("Skills (one per line)", "\n".join(p.get("skills", [])), height=220)
        p["skills"] = [x.strip() for x in skills_text.splitlines() if x.strip()]

    with tab5:
        p["projects"] = edit_records(p.get("projects", []), "Project", [("name","Project name"),("description","Description"),("technologies","Technologies"),("url","Link")])
        cert_text = st.text_area("Certifications (one per line)", "\n".join(p.get("certifications", [])), height=120)
        p["certifications"] = [x.strip() for x in cert_text.splitlines() if x.strip()]

    st.session_state.profile = p
    st.divider()
    st.subheader("Export your verified profile")
    st.caption("The JSON profile is the format used by the ResumeFill AI browser extension.")
    json_data = json.dumps(p, indent=2, ensure_ascii=False)
    c1, c2 = st.columns(2)
    c1.download_button("⬇️ Download JSON profile", json_data, "resumefill-profile.json", "application/json", use_container_width=True)
    c2.download_button("⬇️ Download CSV", profile_to_csv(p), "resumefill-profile.csv", "text/csv", use_container_width=True)
    with st.expander("Preview JSON"):
        st.code(json_data, language="json")
else:
    st.markdown("### What this MVP does\n- Extracts common résumé information from text-based PDFs\n- Lets you review and correct the extracted profile\n- Exports reusable JSON and CSV\n- Works with the included Chrome extension\n\n**Coming later:** OCR for scanned résumés, stronger layout understanding, and optional smarter extraction.")
