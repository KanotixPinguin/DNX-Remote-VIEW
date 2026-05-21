#!/usr/bin/env python3

import json
import socket
import subprocess
import sys


from pathlib import Path

REGISTRY=Path(
 "/home/ich/DNX-Remote-VIEW-CLEAN/bridges.json"
)

def load_registry():

    if not REGISTRY.exists():
        return {"bridges":[]}

    try:
        return json.loads(REGISTRY.read_text())
    except:
        return {"bridges":[]}

def save_registry(data):

    REGISTRY.write_text(
        json.dumps(data,indent=2)
    )


if len(sys.argv) != 3:
    print("Usage: create_bridge.py HOST PORT")
    sys.exit(1)

host = sys.argv[1]
port = sys.argv[2]

def find_free_port(start=6090,end=6200):

    for p in range(start,end):

        s=socket.socket()

        try:
            s.bind(("0.0.0.0",p))
            s.close()
            return p
        except:
            pass

    return None

bridge=find_free_port()

if not bridge:
    print("No free bridge ports.")
    sys.exit(1)

cmd=[
    "websockify",
    "--web=/usr/share/novnc/",
    f"0.0.0.0:{bridge}",
    f"{host}:{port}"
]

subprocess.Popen(
    cmd,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

registry=load_registry()

registry["bridges"].append({

    "host":host,
    "port":int(port),
    "bridge_port":bridge

})

save_registry(registry)

print(json.dumps({
    "bridge_port":bridge,
    "host":host,
    "port":port
}))
