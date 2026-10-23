import ast
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
from flask import Flask, jsonify
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src'))
import job_index
class ExternalApplicationTests(unittest.TestCase):
    def test_only_known_numeric_listing_can_link_out(self):
        with patch.object(job_index,'load_index',return_value={'by_id':{123:0}}):
            self.assertEqual(job_index.external_application_url('JS-123'),'https://my.jobstreet.com/job/123')
            for value in ['JS-999','../../123','https://evil.test','JS-123?x=1',None]:
                self.assertIsNone(job_index.external_application_url(value))
    def test_route_reports_handoff_without_materializing_or_saving(self):
        source=(Path(__file__).resolve().parents[1]/'src/main.py').read_text(encoding='utf-8')
        fn=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef) and n.name=='api_jobs_apply_jobstreet')
        fn.decorator_list=[]
        namespace={'job_index':job_index,'jsonify':jsonify}
        exec(compile(ast.Module(body=[fn],type_ignores=[]),'route-under-test','exec'),namespace)
        with Flask(__name__).app_context(), patch.object(job_index,'load_index',return_value={'by_id':{123:0}}), patch.object(job_index,'materialize_vacancy',side_effect=AssertionError('must not create local delivery')):
            response,status=namespace[fn.name]('JS-123')
            self.assertEqual(status,409)
            self.assertFalse(response.get_json()['ok'])
            self.assertEqual(response.get_json()['application_channel'],'external')
            self.assertEqual(namespace[fn.name]('JS-999')[1],404)
if __name__=='__main__':unittest.main()
