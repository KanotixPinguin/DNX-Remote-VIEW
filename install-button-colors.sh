#!/usr/bin/env bash
set -Eeuo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=${PLUGINS:-}
C=${CONTAINER:-owrx-8013}
if [[ -z "$SRC" ]] && [[ "${TYP:-auto}" != "normal" ]] && command -v docker >/dev/null 2>&1; then
  SRC=$(docker inspect "$C" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true)
fi
if [[ -z "$SRC" ]]; then
  for cand in /usr/lib/python3/dist-packages/htdocs/plugins /opt/openwebrx/htdocs/plugins /srv/openwebrx/htdocs/plugins; do
    [[ -d "$cand/receiver" ]] && SRC="$cand" && break
  done
fi
[[ -n "${SRC:-}" && -d "$SRC/receiver" ]] || { echo "Plugin-Pfad nicht gefunden ($SRC)."; exit 1; }
I="$SRC/receiver/init.js"
D="$SRC/receiver/dnx_tool_button_colors"
mkdir -p "$D"
cp "$HERE/dnx_tool_button_colors.js" "$D/"
python3 - "$I" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
t = p.read_text(encoding='utf-8')
a = '/* DNX_TOOL_BUTTON_COLORS_START */'
b = '/* DNX_TOOL_BUTTON_COLORS_END */'
if a in t and b in t:
    x, y = t.split(a, 1)
    _, z = y.split(b, 1)
    t = x.rstrip() + '\n' + z.lstrip()
t += '''
/* DNX_TOOL_BUTTON_COLORS_START */
(function(){if(window.__dnxToolColorsLoader)return;window.__dnxToolColorsLoader=true;var s=document.createElement("script");s.src="/static/plugins/receiver/dnx_tool_button_colors/dnx_tool_button_colors.js";document.head.appendChild(s)})();
/* DNX_TOOL_BUTTON_COLORS_END */
'''
p.write_text(t, encoding='utf-8')
PY
