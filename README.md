# DNX Remote VIEW

<!-- DNX-DISCLAIMER-START -->
> **Wichtiger Hinweis / Vollständige Distanzierung (Hobby-Mod-Mode)**
>
> - **Vollständige Distanzierung:** Ich distanziere mich in jeder Hinsicht vollständig vom Projekt **OpenWebRX / OpenWebRX+** sowie dessen Entwicklern und Betreibern. Es besteht keinerlei Verbindung, Zusammenarbeit, Prüfung, Befürwortung oder Partnerschaft.
> - **Keine öffentlichen/offiziellen OpenWebRX-Plugins (nur Mod-Mode):** Bei diesem Projekt handelt es sich ausdrücklich **nicht** um ein öffentliches oder offizielles Plugin von OpenWebRX, sondern ausschließlich um einen privaten, inoffiziellen **Mod-Mode** (Eigenmodifikation).
> - **Kein öffentlicher Support & keine Haftung:** Es gibt **keinen öffentlichen Support**, keine Garantie und keine Haftung. Nutzung, Installation und Anpassung erfolgen vollständig auf eigene Gefahr (immer vorher Backups anlegen und zunächst im eigenen Testsystem prüfen).
> - **Reines Hobbyprojekt – frei nutzbar, änderbar & verbreitbar:** Dieses Projekt entsteht ausschließlich aus reinem Hobby und Interesse am gemeinsamen Funk-/SDR-Hobby. Es steht ausdrücklich frei zur Verfügung und darf frei genutzt, weiterverbreitet, verändert und verbessert werden.
<!-- DNX-DISCLAIMER-END -->

> **Important Notice / Full Disassociation (Hobby Mod-Mode Only)**
>
> - **Full Disassociation:** I completely disassociate myself from **OpenWebRX / OpenWebRX+** and its developers/maintainers. There is no affiliation, endorsement, review, or partnership of any kind.
> - **No Official/Public OpenWebRX Plugins (Mod-Mode Only):** These files are **not** official or public OpenWebRX plugins, but purely unofficial hobby modifications (*mod-mode*).
> - **No Public Support & No Warranty:** There is **no public support**, no warranty, and no liability. Use entirely at your own risk.
> - **Pure Hobby Project — Free to Use, Modify & Redistribute:** Created solely out of personal hobby interest in the shared radio/SDR hobby; freely available to use, share, modify, and improve.

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


# PUBLIC RELEASE SAFETY NOTICE

This release package was built without private bridge IP addresses, passwords or runtime users.
Configure bridges after installation in `/opt/dnx-remote-view/server/bridges.json`.

Private, independent hobby project. Not an official OpenWebRX/OpenWebRX+ component or plugin.
No affiliation, endorsement or support by their developers. Use entirely at your own risk.
To the extent permitted by law, no liability is accepted. Back up first and test on a separate system.

## Gemeinsame Receiver-Schalterzeile

Version 1.1.0 verschiebt den vorhandenen Schalter `DNX Remote VIEW` in dieselbe Zeile wie Gelb Hover, Gruen Tuning, DNX Status, 3D Tool und noVNC/Foto. Die vollständige Remote-VIEW-Funktion bleibt unverändert.

## Farbige Aktivzustände

Status blau, 3D Tool violett, noVNC/Foto dunkelblau und Remote VIEW türkis. Verborgene/inaktive Tools werden grau angezeigt. Der Zustand wird regelmäßig anhand des tatsächlich sichtbaren Fensters geprüft.
