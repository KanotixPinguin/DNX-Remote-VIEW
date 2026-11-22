#!/usr/bin/env bash
set -Eeuo pipefail
[[ $EUID -eq 0 ]]||{ echo 'Bitte als root/sudo.';exit 1;}
HERE=$(cd "$(dirname "$0")"&&pwd);ROOT=/opt/dnx-remote-view;CONTAINER=${CONTAINER:-};STAMP=$(date +%F-%H%M%S)
echo 'Private, inoffizielle Hobby-Anpassung; kein offizielles OpenWebRX-Projekt. Nutzung auf eigene Gefahr.'
command -v apt-get>/dev/null&&{ apt-get update;apt-get install -y python3 python3-flask websockify novnc; }
mkdir -p "$ROOT/server/scripts" "$ROOT/server/runtime/users" "$ROOT/ui" "$ROOT/backups/$STAMP"
[[ -d $ROOT/server ]]&&cp -a "$ROOT/server" "$ROOT/backups/$STAMP/" 2>/dev/null||true
cp -a "$HERE/scripts/restore_bridges.py" "$HERE/scripts/create_bridge.py" "$HERE/scripts/start_vnc_bridge.sh" "$HERE/scripts/dnx_runtime_api.py" "$ROOT/server/scripts/"
cp -a "$HERE/dnx_remote_view.js" "$HERE/dnx_status.js" "$HERE/sources.json" "$ROOT/ui/"
cp -a "$HERE/dnx_remote_view_row.js" "$ROOT/ui/"
cp -a "$HERE/bridges.json" "$ROOT/server/bridges.json";cp -a "$HERE/runtime_state.json" "$HERE/runtime_users.json" "$ROOT/server/"
cp -a "$HERE/runtime/." "$ROOT/server/runtime/"
SRC=${PLUGINS:-}
if [[ -z $SRC ]];then
 if [[ "${TYP:-auto}" != "normal" ]]&&command -v docker>/dev/null;then
  [[ -z $CONTAINER ]]&&CONTAINER=$(docker ps --format '{{.Names}}'|grep -Ei 'owrx|openwebrx'|head -n1||true)
  [[ -n $CONTAINER ]]&&SRC=$(docker inspect "$CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}' 2>/dev/null||true)
 fi
 if [[ -z $SRC ]];then
  for cand in /usr/lib/python3/dist-packages/htdocs/plugins /opt/openwebrx/htdocs/plugins /srv/openwebrx/htdocs/plugins;do [[ -d "$cand/receiver" ]]&&SRC="$cand"&&break;done
 fi
fi
if [[ -n ${SRC:-} ]];then
 if [[ -n $SRC ]];then
  mkdir -p "$SRC/receiver/dnx_remote_view";cp -a "$ROOT/ui/." "$SRC/receiver/dnx_remote_view/"
  INIT="$SRC/receiver/init.js";cp -a "$INIT" "$ROOT/backups/$STAMP/init.js"
  python3 - "$INIT" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);t=p.read_text();a='/* DNX_REMOTE_VIEW_RELEASE_START */';b='/* DNX_REMOTE_VIEW_RELEASE_END */'
if a in t and b in t:x,y=t.split(a,1);_,z=y.split(b,1);t=x+z
t+='''\n/* DNX_REMOTE_VIEW_RELEASE_START */\n(function(){if(window.__dnxRemoteViewRelease)return;window.__dnxRemoteViewRelease=true;var s=document.createElement("script");s.src="/static/plugins/receiver/dnx_remote_view/dnx_remote_view.js";document.head.appendChild(s);var d=document.createElement("script");d.src="/static/plugins/receiver/dnx_remote_view/dnx_status.js";document.head.appendChild(d);var r=document.createElement("script");r.src="/static/plugins/receiver/dnx_remote_view/dnx_remote_view_row.js";document.head.appendChild(r)})();\n/* DNX_REMOTE_VIEW_RELEASE_END */\n''';p.write_text(t)
PY
 fi
fi
cat >/etc/systemd/system/dnx-remote-view.service <<EOF
[Unit]
Description=DNX Remote VIEW Bridges
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
ExecStart=/usr/bin/python3 $ROOT/server/scripts/restore_bridges.py
Restart=on-failure
RestartSec=3
KillMode=control-group
[Install]
WantedBy=multi-user.target
EOF
cat >/etc/systemd/system/dnx-remote-view-api.service <<EOF
[Unit]
Description=DNX Remote VIEW Runtime API (Port 8099)
After=network.target
[Service]
Type=simple
WorkingDirectory=$ROOT/server
ExecStart=/usr/bin/python3 $ROOT/server/scripts/dnx_runtime_api.py
Restart=always
RestartSec=2
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload;systemctl enable --now dnx-remote-view.service dnx-remote-view-api.service
[[ -n $CONTAINER ]]&&docker restart "$CONTAINER"||true
echo 'Installiert. Bridges konfigurieren: /opt/dnx-remote-view/server/bridges.json'
