#!/usr/bin/env python3

import json
import subprocess
from pathlib import Path

REGISTRY=Path(
 "/home/ich/DNX-Remote-VIEW-CLEAN/bridges.json"
)

if not REGISTRY.exists():
    print("No bridges.json found.")
    raise SystemExit

data=json.loads(REGISTRY.read_text())

for b in data.get("bridges",[]):

    host=b["host"]
    port=b["port"]
    bridge=b["bridge_port"]

    print(
      f"Restoring bridge "
      f"{bridge} -> {host}:{port}"
    )

    subprocess.Popen(
      [
        "websockify",
        "--web=/usr/share/novnc/",
        f"0.0.0.0:{bridge}",
        f"{host}:{port}"
      ],
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL
    )

print("DNX bridge restore complete.")
