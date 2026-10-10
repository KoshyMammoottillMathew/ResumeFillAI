from src.extractor import extract_profile

def test_extract_basic_contact_and_skills():
    text='''Jane Example\njane@example.com\n+1 555 123 4567\nhttps://linkedin.com/in/jane-example\n\nSkills\nPython, SQL, Excel\n'''
    p=extract_profile(text)
    assert p.full_name == "Jane Example"
    assert p.email == "jane@example.com"
    assert "Python" in p.skills
    assert "linkedin.com" in p.linkedin
