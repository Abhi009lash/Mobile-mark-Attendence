#!/usr/bin/env python3
"""
GeoPunch SaaS - Application Launcher & Runner
Runs the FastAPI backend and orchestrates the environment.
Usage:
    python start_mobile.py [--port 8000] [--host 0.0.0.0] [--reload]
"""

import argparse
import os
import sys
import subprocess
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"


def print_banner():
    banner = """
===================================================================
      GeoPunch — Multi-Tenant Workforce Attendance Platform
   Backend: FastAPI (Port 8000) | JWT: 15m | Refresh: 90d
===================================================================
    """
    print(banner)


def check_environment():
    print(f"[*] Python Version: {sys.version.split()[0]}")
    if not BACKEND_DIR.exists():
        print(f"[!] Error: Backend directory not found at {BACKEND_DIR}")
        sys.exit(1)


def run_backend(host: str = "0.0.0.0", port: int = 8000, reload: bool = True):
    print(f"[*] Starting GeoPunch API backend on http://{host}:{port} ...")
    print(f"[*] Interactive API Docs: http://localhost:{port}/api/v1/docs")
    print(f"[*] OpenAPI JSON Schema: http://localhost:{port}/api/v1/openapi.json")
    print(f"[*] Press Ctrl+C to stop the server.\n")

    # Add backend directory to sys.path so app module is discoverable
    sys.path.insert(0, str(BACKEND_DIR))
    os.chdir(BACKEND_DIR)

    # Set default environment variables if not already present
    os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
    os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "90")
    os.environ.setdefault("ENVIRONMENT", "development")

    try:
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except ImportError:
        print("[!] uvicorn is not installed in the current environment.")
        print("[*] Launching uvicorn via subprocess / python -m uvicorn ...")
        cmd = [
            sys.executable, "-m", "uvicorn", "app.main:app",
            "--host", host,
            "--port", str(port),
        ]
        if reload:
            cmd.append("--reload")
        try:
            subprocess.run(cmd, cwd=str(BACKEND_DIR))
        except KeyboardInterrupt:
            print("\n[*] GeoPunch backend server stopped.")


def main():
    parser = argparse.ArgumentParser(description="GeoPunch SaaS Platform Runner")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    parser.add_argument("--no-reload", action="store_true", help="Disable auto-reload")

    args = parser.parse_args()

    print_banner()
    check_environment()
    run_backend(host=args.host, port=args.port, reload=not args.no_reload)


if __name__ == "__main__":
    main()
