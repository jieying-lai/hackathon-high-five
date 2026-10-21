"""RunPod entrypoint for the CV model (separate from the interview service)."""
from cv_worker import handler

if __name__ == '__main__':
    import runpod
    runpod.serverless.start({'handler': handler})
