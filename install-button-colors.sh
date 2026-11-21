#!/usr/bin/env bash
set -Eeuo pipefail
HERE=$(cd "$(dirname "$0")"&&pwd);C=${CONTAINER:-owrx-8013};S=$(docker inspect "$C" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}');I="$S/receiver/init.js";D="$S/receiver/dnx_tool_button_colors";mkdir -p "$D";cp "$HERE/dnx_tool_button_colors.js" "$D/";python3 - "$I" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);t=p.read_text();a='/* DNX_TOOL_BUTTON_COLORS_START */';b='/* DNX_TOOL_BUTTON_COLORS_END */'
if a in t and b in t:x,y=t.split(a,1);_,z=y.split(b,1);t=x+z
t+='''\n/* DNX_TOOL_BUTTON_COLORS_START */\n(function(){if(window.__dnxToolColorsLoader)return;window.__dnxToolColorsLoader=true;var s=document.createElement("script");s.src="/static/plugins/receiver/dnx_tool_button_colors/dnx_tool_button_colors.js";document.head.appendChild(s)})();\n/* DNX_TOOL_BUTTON_COLORS_END */\n''';p.write_text(t)
PY
