from src.exporter import profile_to_csv

def test_csv_export():
    csv_text=profile_to_csv({"full_name":"Jane Example","skills":["Python","SQL"]})
    assert "full_name,Jane Example" in csv_text
    assert "skills.1,Python" in csv_text
