#!/usr/bin/env bash
set -Eeuo pipefail
[[ $EUID -eq 0 ]] || { echo "Bitte als root/sudo ausführen."; exit 1; }
systemctl disable --now dnx-remote-view.service dnx-remote-view-api.service 2>/dev/null || true
rm -f /etc/systemd/system/dnx-remote-view.service /etc/systemd/system/dnx-remote-view-api.service
systemctl daemon-reload
SRC=${PLUGINS:-}
CONTAINER=${CONTAINER:-}
if [[ -z "$SRC" ]] && [[ "${TYP:-auto}" != "normal" ]] && command -v docker >/dev/null 2>&1; then
  [[ -z "$CONTAINER" ]] && CONTAINER=$(docker ps --format '{{.Names}}' | grep -Ei 'owrx|openwebrx' | head -n1 || true)
  [[ -n "$CONTAINER" ]] && SRC=$(docker inspect "$CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)
fi
if [[ -z "$SRC" ]]; then
  for cand in /usr/lib/python3/dist-packages/htdocs/plugins /opt/openwebrx/htdocs/plugins /srv/openwebrx/htdocs/plugins; do
    [[ -d "$cand/receiver" ]] && SRC="$cand" && break
  done
fi
if [[ -n "$SRC" && -d "$SRC/receiver" ]]; then
  rm -rf "$SRC/receiver/dnx_remote_view"
  python3 - "$SRC/receiver/init.js" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
t = p.read_text(encoding='utf-8')
a = '/* DNX_REMOTE_VIEW_RELEASE_START */'
b = '/* DNX_REMOTE_VIEW_RELEASE_END */'
if a in t and b in t:
    x, y = t.split(a, 1)
    _, z = y.split(b, 1)
    p.write_text(x.rstrip() + '\n' + z.lstrip(), encoding='utf-8')
PY
  [[ -n "$CONTAINER" ]] && docker restart "$CONTAINER" || true
fi
echo 'Programm entfernt. /opt/dnx-remote-view bleibt als Sicherung erhalten.'
