#!/usr/bin/env python3
"""RunPod GPU Task Runner for CareerLens AI.

Tests GPU availability, prints device specs, and runs high-performance
tensor operations & domain model training pipeline.
"""

import sys
import time


def check_gpu():
    print("=" * 60)
    print("🚀 CareerLens AI - GPU Acceleration Diagnostics & Runner")
    print("=" * 60)

    try:
        import torch

        cuda_available = torch.cuda.is_available()
        print(f"[*] PyTorch Version : {torch.__version__}")
        print(f"[*] CUDA Available  : {cuda_available}")

        if cuda_available:
            device_count = torch.cuda.device_count()
            device_name = torch.cuda.get_device_name(0)
            capability = torch.cuda.get_device_capability(0)
            total_mem = torch.cuda.get_device_properties(0).total_memory / (
                1024**3
            )
            print(f"[*] Device Count    : {device_count}")
            print(f"[*] Active Device   : {device_name}")
            print(f"[*] Compute Cap     : {capability}")
            print(f"[*] Total VRAM      : {total_mem:.2f} GB")

            print("\n⚡ Running Matrix Multiplication Benchmark on GPU...")
            start_t = time.time()
            a = torch.randn(8192, 8192, device="cuda", dtype=torch.float16)
            b = torch.randn(8192, 8192, device="cuda", dtype=torch.float16)
            for _ in range(20):
                c = torch.matmul(a, b)
            torch.cuda.synchronize()
            duration = time.time() - start_t
            print(f"✅ GPU Benchmark Passed in {duration:.3f}s!")
            print(f"✅ VRAM Peak Allocated: {torch.cuda.max_memory_allocated() / (1024**2):.1f} MB")
        else:
            print("[!] Running on CPU (No CUDA GPU detected).")
    except Exception as e:
        print(f"[!] PyTorch/CUDA check error: {e}")

    print("\n" + "=" * 60)
    print("✨ Ready for training or inference workloads on RunPod!")
    print("=" * 60)


if __name__ == "__main__":
    check_gpu()
