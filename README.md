# DNX Remote VIEW

Browser-based runtime, remote and multiuser workspace environment for OpenWebRX+.

---

# ⚠ DISCLAIMER

## 🇩🇪 Deutsch

DNX Remote VIEW ist KEIN offizieller Bestandteil
von OpenWebRX oder OpenWebRX+.

Dieses Projekt ist ein unabhängiges experimentelles
Runtime-, Remote- und Multiuser-System,
entwickelt von KanotixPinguin.

Es dient ausschließlich:
- Testzwecken
- Entwicklungszwecken
- experimentellen Runtime-Umgebungen

Die Nutzung erfolgt vollständig auf eigene Gefahr.

Bitte kontaktiert NICHT die offiziellen Entwickler,
Programmierer oder Maintainer von OpenWebRX/OpenWebRX+
für Probleme, Fehler oder Support bezüglich
DNX Remote VIEW.

DNX Remote VIEW gehört nicht zum offiziellen
OpenWebRX/OpenWebRX+ Projekt.

---

## 🇬🇧 English

DNX Remote VIEW is NOT an official part
of OpenWebRX or OpenWebRX+.

This project is an independent experimental
runtime, remote and multiuser environment
developed by KanotixPinguin.

It is intended only for:
- testing
- development
- experimental runtime environments

Use entirely at your own risk.

Please DO NOT contact the official
OpenWebRX/OpenWebRX+ developers
for issues related to DNX Remote VIEW.

DNX Remote VIEW is not affiliated with the official
OpenWebRX/OpenWebRX+ project.

---

# FEATURES

- Runtime Windows
- Movable Panels
- Resizable Windows
- Runtime Taskbar
- Runtime Tabs
- Dockable Runtime Sections
- VNC Runtime Bridges
- Public / Private / Shared Sources
- Runtime User Layers
- Multiuser Runtime
- Shared SDR Sessions
- Admin Runtime Controls
- Runtime Workspace Environment
- Runtime API
- Browser-based Remote Infrastructure

---

# REQUIRED PACKAGES

Automatically installed by install.sh:

- python3
- python3-flask
- websockify
- novnc
- git

---

# INSTALLATION

## Clone Repository

git clone https://github.com/KanotixPinguin/DNX-Remote-VIEW.git

cd DNX-Remote-VIEW

## Run Installer

chmod +x install.sh

./install.sh

The installer automatically:
- installs required packages
- installs Runtime API
- installs Runtime UI
- installs VNC bridge system
- installs systemd service
- restores runtime bridges

---

# UNINSTALL

chmod +x uninstall.sh

./uninstall.sh

Removes:
- Runtime UI
- Runtime API
- Runtime services
- Runtime bridge system

---

# SYSTEMD SERVICE

Installed service:

dnx-remote-view.service

The service restores:
- runtime bridges
- runtime infrastructure
- persistent runtime state

---

# MULTIUSER SYSTEM

## guest
- public runtime only

## user
- private runtime layer
- shared runtime layer

## admin
- global runtime control
- bridge management
- public runtime control

---

# VNC RUNTIME SYSTEM

DNX Remote VIEW dynamically creates:
- VNC runtime bridges
- browser-accessible runtime sessions
- shared runtime windows

without manual noVNC setup.

---

# API

Default Runtime API Port:

8099

Provides:
- login system
- bridge creation
- runtime save/load
- global runtime state
- user runtime layers

---

# RUNTIME FEATURES

- movable runtime windows
- resizable runtime windows
- runtime persistence
- runtime tabs
- workspace save/load
- collaborative runtime workspaces

---

# HELP SYSTEM

Integrated help system:
- DE/EN documentation
- troubleshooting
- VNC help
- runtime overview
- multiuser help
- admin guide

inside DNX Remote VIEW.

---

# TROUBLESHOOTING

## Runtime API offline

python3 scripts/dnx_runtime_api.py

## VNC Bridge offline

python3 scripts/restore_bridges.py

## Runtime UI issues

Hard reload browser:

CTRL + SHIFT + R

---

# AUTHOR

KanotixPinguin

Experimental Runtime Infrastructure Project

