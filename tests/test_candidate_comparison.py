import json
import sys
import tempfile
import unittest
from pathlib import Path
from contextlib import closing
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"src"))
import auth_db
import hr_engine
import cv_engine
from candidate_comparison import education_category, structured_dimensions, comparison

class ComparisonTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.previous=auth_db.DB_PATH
        auth_db.DB_PATH=str(Path(self.tmp.name)/"compare.db")
        auth_db.init_db();hr_engine.init_hr_tables();cv_engine.init_cv_tables()
    def tearDown(self):
        auth_db.DB_PATH=self.previous;self.tmp.cleanup()
    def test_categories_and_doctor_parser(self):
        for value,expected in [("SPM","SPM / UEC"),("UEC","SPM / UEC"),("Bachelor's Degree","Undergraduate"),("Master's / Postgraduate","Master"),("Ph.D.","Doctor"),("Intern","Intern / Trainee"),("Diploma / TVET","Other / To confirm")]:
            self.assertEqual(education_category(value),expected)
        from test_cv_parser import synthetic_pdf
        ok, msg, result = cv_engine.parse_and_summarize_pdf_cv(synthetic_pdf([["Fictional Person", "Education", "PhD in Accounting"]]), "synthetic.pdf")
        self.assertTrue(ok, msg)
        self.assertEqual(result["structured_cv"]["education_level"], "Doctor")
        ok, msg, result = cv_engine.parse_and_summarize_pdf_cv(synthetic_pdf([["Fictional Person", "Summary", "No stated qualifications; professional career exploration"]]), "synthetic.pdf")
        self.assertTrue(ok, msg)
        self.assertEqual(result["structured_cv"]["education_level"], "")
    def test_dimensions(self):
        d=structured_dimensions({"skills":["Python","Teamwork"],"education_history":["University of Malaya", "Bachelor of Accounting"],"work_experience":["Auditor 2020-2024"]},"Strong leadership and communication")
        self.assertIn("Teamwork",d["soft_skills"]);self.assertIn("Leadership",d["soft_skills"])
        self.assertIn("Python",d["hard_skills"]);self.assertEqual(d["institution"],["University of Malaya"])
        self.assertEqual(d["past_positions"],["Auditor 2020-2024"])
    def test_company_scope_demo_and_consent(self):
        self.assertEqual(comparison("other-company",True)["candidates"],[])
        rows=comparison("CL-HR-2026-8801",True)
        self.assertTrue(rows["candidates"])
        self.assertEqual({c["department"] for c in rows["candidates"]}-{v["department"] for v in rows["vacancies"]},set())
        self.assertIn("Demo",{c["source"] for c in rows["candidates"]})
        before=comparison("CL-HR-2026-8801",False)
        self.assertTrue(all(c["source"]=="Application" for c in before["candidates"]))
        with closing(auth_db.get_db_connection()) as conn, conn:
            conn.execute("UPDATE job_applications SET share_organised_cv=0")
        self.assertEqual(comparison("CL-HR-2026-8801",False)["candidates"],[])
    def test_api_role_and_tenant(self):
        import main
        client=main.app.test_client()
        self.assertEqual(client.get('/api/hr/candidate-comparison').status_code,401)
        with client.session_transaction() as session:session['user']={'role':'job_seeker','unique_uid':'x'}
        self.assertEqual(client.get('/api/hr/candidate-comparison').status_code,403)
        with client.session_transaction() as session:session['user']={'role':'hr_company','unique_uid':'other-company'}
        self.assertEqual(client.get('/api/hr/candidate-comparison?demo=1').json['candidates'],[])

if __name__=='__main__': unittest.main()
