#!/usr/bin/env bash
set -Eeuo pipefail
[[ $EUID -eq 0 ]]||exit 1
systemctl disable --now dnx-remote-view.service dnx-remote-view-api.service 2>/dev/null||true
rm -f /etc/systemd/system/dnx-remote-view.service /etc/systemd/system/dnx-remote-view-api.service;systemctl daemon-reload
CONTAINER=${CONTAINER:-};if [[ -z $CONTAINER ]]&&command -v docker>/dev/null;then CONTAINER=$(docker ps --format '{{.Names}}'|grep -Ei 'owrx|openwebrx'|head -n1||true);fi
if [[ -n $CONTAINER ]];then SRC=$(docker inspect "$CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}');if [[ -n $SRC ]];then rm -rf "$SRC/receiver/dnx_remote_view";python3 - "$SRC/receiver/init.js" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);t=p.read_text();a='/* DNX_REMOTE_VIEW_RELEASE_START */';b='/* DNX_REMOTE_VIEW_RELEASE_END */'
if a in t and b in t:x,y=t.split(a,1);_,z=y.split(b,1);p.write_text(x+z)
PY
docker restart "$CONTAINER";fi;fi
echo 'Programm entfernt. /opt/dnx-remote-view bleibt als Sicherung erhalten.'
