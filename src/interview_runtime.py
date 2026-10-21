"""Start the installed local interview model only when the user requests it."""
import os
import json
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
    root=Path(__file__).resolve().parents[1]
    def ready(endpoint):
        try:
            response=requests.get(endpoint.rsplit('/',1)[0]+'/health',timeout=2)
            return response.ok and response.json().get('adapter_loaded') is True
        except (requests.RequestException,ValueError):
            return False
    if ready(url):return url
    # The portable launcher owns readiness and lifecycle, including dynamic ports.
    if os.environ.get('CAREERLENS_MANAGED_MODEL') == '1':
        raise QuestionnaireError('The local AI service has stopped. Restart the project with Start.cmd, then use the page it opens.',503)
    if url!='http://127.0.0.1:8766/generate':
        return url
    # A separately started development website may use the default port while
    # the complete launcher has a healthy model on a dynamically chosen port.
    try:
        from urllib.parse import urlsplit
        info=json.loads((root/'state/local/running.json').read_text(encoding='utf-8'))
        managed_url=info.get('model_url','')
        parsed=urlsplit(managed_url)
        if parsed.scheme=='http' and parsed.hostname=='127.0.0.1' and parsed.port and parsed.path=='/generate' and ready(managed_url):
            health=requests.get(managed_url.rsplit('/',1)[0]+'/health',timeout=2).json()
            if Path(str(health.get('model',''))).resolve()==(root/'state/interview-model/base-model').resolve():
                return managed_url
    except (OSError,ValueError,TypeError,AttributeError,requests.RequestException):
        pass
    state=root/'state/interview-model'
    python=root/'.runtime/venv'/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
    if not python.exists():
        python=root/'work/interview-inference-env/Scripts/python.exe'
    adapter=root/'models/interview-adapter'
    base=state/'base-model'
    if not python.exists():
        raise QuestionnaireError('The local AI runtime is missing. Run Start.cmd to install and start it.',503)
    if not (adapter/'adapter_model.safetensors').exists():
        raise QuestionnaireError('The trained interview adapter is missing. Restore models/interview-adapter and restart Start.cmd.',503)
    if not (base/'model.safetensors').exists():
        raise QuestionnaireError('The base model is missing. Run Start.cmd to finish the model setup.',503)
    with _lock:
        if ready(url):return url
        if _process is None or _process.poll() is not None:
            try:
                import psutil
                if psutil.virtual_memory().available < 4*1024**3:
                    raise QuestionnaireError('Not enough free memory to start local AI. Close unused apps to free at least 4 GB of RAM, then retry.',503)
            except ImportError:
                pass
            state.mkdir(parents=True,exist_ok=True)
            temp=root/'work/model-temp';temp.mkdir(parents=True,exist_ok=True)
            env={**os.environ,'HF_HOME':str(state/'hf-cache'),'HF_HUB_ENABLE_HF_TRANSFER':'0',
                 'HF_HUB_DISABLE_SYMLINKS_WARNING':'1','HF_HUB_OFFLINE':'1','PYTHONUNBUFFERED':'1','TEMP':str(temp),'TMP':str(temp)}
            with (state/'server.log').open('a',encoding='utf-8') as output, (state/'server-error.log').open('a',encoding='utf-8') as error:
                _process=subprocess.Popen([str(python),'-u',str(root/'scripts/serve_interview_model.py'),
                    '--adapter',str(adapter),'--model',str(base)],cwd=root,env=env,
                    stdout=output,stderr=error,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
            (state/'server.pid').write_text(str(_process.pid),encoding='utf-8')
        deadline=time.monotonic()+300
        while time.monotonic()<deadline:
            if ready(url):return url
            if _process.poll() is not None:
                raise QuestionnaireError('The local AI service failed during startup. See state/interview-model/server-error.log, then restart with Start.cmd.',503)
            time.sleep(1)
        raise QuestionnaireError('The local AI model is still loading. Keep its startup window open and retry shortly.',503)
