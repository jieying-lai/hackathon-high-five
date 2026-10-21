"""Start website + real adapter inference on an already provisioned server."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.request


def main(args):
    root=Path(__file__).resolve().parents[1]
    logs=root/'state/judges';logs.mkdir(parents=True,exist_ok=True)
    env={**os.environ,'HR_INTERVIEW_PROVIDER':'local',
         'HR_INTERVIEW_MODEL_URL':f'http://127.0.0.1:{args.model_port}/generate',
         'HF_HUB_ENABLE_HF_TRANSFER':'0','HF_HUB_DISABLE_SYMLINKS_WARNING':'1',
         'COOKIE_SECURE':'1' if args.https else '0'}
    children=[]
    def launch(name,command,extra=None):
        with (logs/(name+'.log')).open('a',encoding='utf-8') as stream:
            child=subprocess.Popen(command,cwd=root,env={**env,**(extra or {})},stdout=stream,stderr=stream)
        children.append(child)
        return child
    def ready(url):
        try:
            with urllib.request.urlopen(url,timeout=3) as response:return response.status==200
        except Exception:return False
    try:
        if not ready(f'http://127.0.0.1:{args.model_port}/health'):
            model=launch('model',[args.model_python,'-u','scripts/serve_interview_model.py',
                '--adapter',str(root/'models/interview-adapter'),'--model',args.base_model,'--port',str(args.model_port)])
            deadline=time.monotonic()+300
            while time.monotonic()<deadline:
                if ready(f'http://127.0.0.1:{args.model_port}/health'):break
                if model.poll() is not None:raise RuntimeError('Model failed to load; inspect state/judges/model.log')
                time.sleep(2)
            else:raise RuntimeError('Model is still not ready after five minutes')
        web=launch('website',[args.web_python,'-m','gunicorn','--pythonpath','src',
            '--workers','1','--threads','4','--timeout','420','--bind',f'127.0.0.1:{args.port}','main:app'])
        deadline=time.monotonic()+60
        while time.monotonic()<deadline:
            if ready(f'http://127.0.0.1:{args.port}/'):break
            if web.poll() is not None:raise RuntimeError('Website failed to start; inspect state/judges/website.log')
            time.sleep(1)
        else:raise RuntimeError('Website homepage is not ready; inspect state/judges/website.log')
        print(json.dumps({'ready':True,'website':f'http://127.0.0.1:{args.port}',
                          'model_port':args.model_port,'adapter':'models/interview-adapter'}),flush=True)
        while all(p.poll() is None for p in children):time.sleep(2)
    finally:
        for child in children:
            if child.poll() is None:child.terminate()


if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--model-python',default=sys.executable)
    p.add_argument('--web-python',default=sys.executable)
    p.add_argument('--base-model',default='Qwen/Qwen2.5-1.5B-Instruct')
    p.add_argument('--port',type=int,default=5050)
    p.add_argument('--model-port',type=int,default=8766)
    p.add_argument('--https',action='store_true',help='Set secure cookies behind HTTPS')
    main(p.parse_args())
