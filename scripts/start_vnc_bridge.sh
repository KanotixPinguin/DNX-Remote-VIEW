#!/bin/bash

TARGET_IP="$1"
TARGET_PORT="$2"
LOCAL_PORT="$3"

if [ -z "$TARGET_IP" ] || [ -z "$TARGET_PORT" ] || [ -z "$LOCAL_PORT" ]; then
  echo "Usage:"
  echo "./start_vnc_bridge.sh TARGET_IP TARGET_PORT LOCAL_PORT"
  exit 1
fi

echo
echo "=== DNX VNC BRIDGE ==="
echo
echo "TARGET : $TARGET_IP:$TARGET_PORT"
echo "LOCAL  : $LOCAL_PORT"
echo

pkill -f "websockify.*:$LOCAL_PORT" 2>/dev/null || true

websockify \
  --web=/usr/share/novnc/ \
  0.0.0.0:$LOCAL_PORT \
  $TARGET_IP:$TARGET_PORT
