#!/usr/bin/env python3
import json, subprocess, signal, time
from pathlib import Path
REGISTRY=Path('/opt/dnx-remote-view/server/bridges.json')
children=[]
def stop(*_):
 for p in children:
  try:p.terminate()
  except:pass
 raise SystemExit
signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
if not REGISTRY.exists(): raise SystemExit('No bridges.json found: '+str(REGISTRY))
data=json.loads(REGISTRY.read_text())
for b in data.get('bridges',[]):
 host=str(b['host']);port=int(b['port']);bridge=int(b['bridge_port'])
 print(f'Restoring bridge {bridge} -> {host}:{port}',flush=True)
 children.append(subprocess.Popen(['websockify','--web=/usr/share/novnc/',f'0.0.0.0:{bridge}',f'{host}:{port}']))
while children:
 for p in children:
  if p.poll() is not None: raise SystemExit('Bridge exited: '+str(p.returncode))
 time.sleep(2)
