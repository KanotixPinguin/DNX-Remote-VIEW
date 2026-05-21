#!/usr/bin/env bash

set -e

echo
echo "=== DNX REMOTE VIEW INSTALLER ==="
echo

echo "=== INSTALL PACKAGES ==="

apt update

apt install -y \
python3 \
python3-flask \
websockify \
novnc \
git

echo
echo "=== CREATE RUNTIME DIRS ==="

mkdir -p /home/ich/DNX-Remote-VIEW/runtime

echo
echo "=== CREATE DEFAULT bridges.json ==="

cat > /home/ich/DNX-Remote-VIEW/bridges.json <<'JSON'
{
  "bridges": []
}
JSON

echo
echo "=== INSTALL SYSTEMD SERVICE ==="

cat > /etc/systemd/system/dnx-remote-view.service <<'SERVICE'
[Unit]
Description=DNX Remote VIEW Bridge Restore
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 /home/ich/DNX-Remote-VIEW/scripts/restore_bridges.py
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload

systemctl enable dnx-remote-view.service

systemctl start dnx-remote-view.service

echo
echo "=== INSTALL FINISHED ==="
echo
echo "DNX Remote VIEW installed successfully."
echo
