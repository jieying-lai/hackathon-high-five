"""Start the installed local interview model only when the user requests it."""
import os
from pathlib import Path
import subprocess
import threading
import time

import requests
from questionnaire_engine import QuestionnaireError

_lock=threading.Lock()
_process=None


def ensure_local_runtime(url):
    global _process
    # The portable launcher owns readiness and lifecycle, including dynamic ports.
    if os.environ.get('CAREERLENS_MANAGED_MODEL') == '1':
        return
    if url!='http://127.0.0.1:8766/generate':
        return
    root=Path(__file__).resolve().parents[1]
    state=root/'state/interview-model'
    python=root/'.runtime/venv'/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
    if not python.exists():
        python=root/'work/interview-inference-env/Scripts/python.exe'
    adapter=root/'models/interview-adapter'
    base=state/'base-model'
    if not (python.exists() and (adapter/'adapter_model.safetensors').exists() and (base/'model.safetensors').exists()):
        return
    def ready():
        try:
            response=requests.get('http://127.0.0.1:8766/health',timeout=2)
            return response.ok and response.json().get('adapter_loaded') is True
        except (requests.RequestException,ValueError):
            return False
    if ready():return
    with _lock:
        if ready():return
        if _process is None or _process.poll() is not None:
            temp=root/'work/model-temp';temp.mkdir(parents=True,exist_ok=True)
            env={**os.environ,'HF_HOME':str(state/'hf-cache'),'HF_HUB_ENABLE_HF_TRANSFER':'0',
                 'HF_HUB_DISABLE_SYMLINKS_WARNING':'1','TEMP':str(temp),'TMP':str(temp)}
            with (state/'server.log').open('a',encoding='utf-8') as output, (state/'server-error.log').open('a',encoding='utf-8') as error:
                _process=subprocess.Popen([str(python),'-u',str(root/'scripts/serve_interview_model.py'),
                    '--adapter',str(adapter),'--model',str(base)],cwd=root,env=env,
                    stdout=output,stderr=error,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
            (state/'server.pid').write_text(str(_process.pid),encoding='utf-8')
        deadline=time.monotonic()+120
        while time.monotonic()<deadline:
            if ready():return
            if _process.poll() is not None:break
            time.sleep(1)
        raise QuestionnaireError('AI question generation is not connected yet. Please try again later.',503)
