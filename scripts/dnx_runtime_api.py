#!/usr/bin/env python3
from pathlib import Path
#!/usr/bin/env python3

from flask import Flask,request,jsonify
import subprocess
import json

app=Flask(__name__)


RUNTIME_DIR=Path(
 "/home/ich/DNX-Remote-VIEW-CLEAN/runtime"
)

USERS_DIR=RUNTIME_DIR / "users"

@app.route("/load_global",methods=["GET"])
def load_global():

    f=RUNTIME_DIR / "global.json"

    if not f.exists():
        return jsonify({})

    return jsonify(
      json.loads(f.read_text())
    )

@app.route("/save_global",methods=["POST"])
def save_global():

    f=RUNTIME_DIR / "global.json"

    data=request.json

    f.write_text(
      json.dumps(data,indent=2)
    )

    return jsonify({"status":"ok"})

@app.route("/load_user/<user>",methods=["GET"])
def load_user(user):

    f=USERS_DIR / f"{user}.json"

    if not f.exists():

        return jsonify({
          "sources":[],
          "windows":[]
        })

    return jsonify(
      json.loads(f.read_text())
    )

@app.route("/save_user/<user>",methods=["POST"])
def save_user(user):

    f=USERS_DIR / f"{user}.json"

    data=request.json

    f.write_text(
      json.dumps(data,indent=2)
    )

    return jsonify({"status":"ok"})



from pathlib import Path

STATE_FILE=Path(
 "/home/ich/DNX-Remote-VIEW-CLEAN/runtime_state.json"
)

@app.route("/load_state",methods=["GET"])
def load_state():

    if not STATE_FILE.exists():
        return jsonify({})

    try:
        return jsonify(
            json.loads(
                STATE_FILE.read_text()
            )
        )
    except:
        return jsonify({})

@app.route("/save_state",methods=["POST"])
def save_state():

    data=request.json

    STATE_FILE.write_text(
        json.dumps(data,indent=2)
    )

    return jsonify({
        "status":"ok"
    })




USERS_FILE=Path("/home/ich/DNX-Remote-VIEW-CLEAN/runtime_users.json")

@app.route("/login",methods=["POST"])
def login():

    data=request.json or {}

    username=data.get("username","")
    password=data.get("password","")

    if not USERS_FILE.exists():
        return jsonify({"ok":False,"error":"no users file"})

    users=json.loads(USERS_FILE.read_text()).get("users",[])

    for u in users:
        if u.get("username")==username and u.get("password")==password:
            return jsonify({
                "ok":True,
                "username":username,
                "role":u.get("role","user")
            })

    return jsonify({"ok":False,"error":"invalid login"})

@app.route("/create_bridge",methods=["POST"])
def create_bridge():

    data=request.json

    host=data.get("host")
    port=str(data.get("port"))

    out=subprocess.check_output([
        "/home/ich/DNX-Remote-VIEW-CLEAN/scripts/create_bridge.py",
        host,
        port
    ])

    return jsonify(json.loads(out))

app.run(
    host="0.0.0.0",
    port=8099
)
