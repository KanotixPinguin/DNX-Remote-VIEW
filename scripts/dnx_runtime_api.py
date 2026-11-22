#!/usr/bin/env python3
from pathlib import Path
from flask import Flask, request, jsonify
import subprocess
import json
import os
import tempfile
import threading
import sys as _dnx_sys

app = Flask(__name__)

SERVER_DIR = Path(os.environ.get("DNX_RV_SERVER_DIR", "/opt/dnx-remote-view/server"))
RUNTIME_DIR = SERVER_DIR / "runtime"
USERS_DIR = RUNTIME_DIR / "users"
STATE_FILE = SERVER_DIR / "runtime_state.json"
USERS_FILE = SERVER_DIR / "runtime_users.json"

_IO_LOCK = threading.Lock()


def _read_json(path: Path, default):
    with _IO_LOCK:
        if not path.exists():
            return default
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return default


def _write_json_atomic(path: Path, data):
    payload = json.dumps(data, indent=2, ensure_ascii=False)
    with _IO_LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent))
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                fh.write(payload)
                fh.flush()
                os.fsync(fh.fileno())
            os.chmod(tmp_name, 0o644)
            os.replace(tmp_name, path)
        except Exception:
            try:
                os.unlink(tmp_name)
            except OSError:
                pass
            raise


@app.route("/load_global", methods=["GET"])
def load_global():
    return jsonify(_read_json(RUNTIME_DIR / "global.json", {}))


@app.route("/save_global", methods=["POST"])
def save_global():
    _write_json_atomic(RUNTIME_DIR / "global.json", request.json)
    return jsonify({"status": "ok"})


@app.route("/load_user/<user>", methods=["GET"])
def load_user(user):
    return jsonify(_read_json(USERS_DIR / f"{user}.json", {"sources": [], "windows": []}))


@app.route("/save_user/<user>", methods=["POST"])
def save_user(user):
    if user.startswith("dnxfunk-x"):
        return jsonify({"status": "ignoriert", "grund": "ohne Sitzungsnummer"}), 200
    _write_json_atomic(USERS_DIR / f"{user}.json", request.json)
    return jsonify({"status": "ok"})


@app.route("/load_state", methods=["GET"])
def load_state():
    return jsonify(_read_json(STATE_FILE, {}))


@app.route("/save_state", methods=["POST"])
def save_state():
    _write_json_atomic(STATE_FILE, request.json)
    return jsonify({"status": "ok"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username", "")
    password = data.get("password", "")
    if not USERS_FILE.exists():
        return jsonify({"ok": False, "error": "no users file"})
    users = _read_json(USERS_FILE, {}).get("users", [])
    for u in users:
        if u.get("username") == username and u.get("password") == password:
            return jsonify({
                "ok": True,
                "username": username,
                "role": u.get("role", "user"),
            })
    return jsonify({"ok": False, "error": "invalid login"})


@app.route("/create_bridge", methods=["POST"])
def create_bridge():
    data = request.json
    host = data.get("host")
    port = str(data.get("port"))
    out = subprocess.check_output([
        str(SERVER_DIR / "scripts" / "create_bridge.py"),
        host,
        port,
    ])
    return jsonify(json.loads(out))


_DNX_ROOT = Path(os.environ.get("DNX_AC_ROOT", "/opt/owrx-docker/var/dnx-access-control"))
_dnx_rights = None
if (_DNX_ROOT / "dnx_receiver_rights.py").exists():
    _dnx_sys.path.insert(0, str(_DNX_ROOT))
    try:
        import dnx_receiver_rights as _dnx_rights  # type: ignore
    except Exception:
        _dnx_rights = None


@app.before_request
def receiver_role_gate():
    from urllib.parse import urlsplit
    origin = request.headers.get("Origin")
    if origin and urlsplit(origin).hostname != request.host.split(":")[0]:
        return jsonify({"error": "origin"}), 403
    if request.method == "OPTIONS":
        return "", 204
    if request.method == "GET" and request.path == "/load_user/dnxupdate":
        return None
    if request.path == "/save_user/dnxupdate":
        if _dnx_rights is None:
            return jsonify({"error": "Nur für Admins erlaubt (Account-Control nicht aktiv)."}), 403
        role = _dnx_rights.role_for_session(request.cookies.get("dnxac_session"), root=_DNX_ROOT)
        if role != "admin":
            return jsonify({"error": "Nur für Admins erlaubt."}), 403
        return None
    if _dnx_rights is not None:
        rights = _dnx_rights.permissions_for_session(request.cookies.get("dnxac_session"), root=_DNX_ROOT)
        if not rights.get("remote", False):
            return jsonify({"error": "Remote VIEW ist für diese Rolle gesperrt."}), 403


@app.after_request
def receiver_role_headers(resp):
    from urllib.parse import urlsplit
    origin = request.headers.get("Origin")
    if origin and urlsplit(origin).hostname == request.host.split(":")[0]:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        resp.headers["Vary"] = "Origin"
    resp.headers["Cache-Control"] = "private, no-store"
    return resp


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("DNX_RV_API_PORT", "8099")), threaded=True)
