#!/bin/bash

echo
echo "=== DNX Remote VIEW INSTALL ==="
echo

mapfile -t CONTAINERS < <(docker ps --format "{{.Names}}" | grep -Ei "owrx|openwebrx")

if [ ${#CONTAINERS[@]} -eq 0 ]; then
 echo "No OpenWebRX containers found."
 exit 1
fi

echo "Found OpenWebRX containers:"
echo

for i in "${!CONTAINERS[@]}"; do
 echo "$((i+1))) ${CONTAINERS[$i]}"
done

echo
read -p "Select container number: " NUM

INDEX=$((NUM-1))
CONTAINER="${CONTAINERS[$INDEX]}"

if [ -z "$CONTAINER" ]; then
 echo "Invalid selection."
 exit 1
fi

echo
echo "Using container: $CONTAINER"
echo

docker exec "$CONTAINER" mkdir -p /usr/lib/python3/dist-packages/htdocs/static

docker cp dnx_remote_view.js "$CONTAINER":/usr/lib/python3/dist-packages/htdocs/static/dnx_remote_view.js

docker cp sources.json "$CONTAINER":/usr/lib/python3/dist-packages/htdocs/static/sources.json

docker exec "$CONTAINER" sh -c '
grep -q dnx_remote_view.js /usr/lib/python3/dist-packages/htdocs/index.html || \
sed -i "s#</body>#<script src=\"/static/static/dnx_remote_view.js\"></script>\n</body>#" \
/usr/lib/python3/dist-packages/htdocs/index.html
'

docker restart "$CONTAINER"

echo
echo "DNX Remote VIEW installed successfully."
echo
