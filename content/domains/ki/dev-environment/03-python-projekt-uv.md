---
title: Python-Projekte mit uv – eine Quelle, ein Lock, keine Überraschungen
level: L2
summary: Wie ein sauberes Python-Projekt aufgebaut ist, was pyproject.toml, uv.lock, .python-version und .venv jeweils tun, der Alltag mit uv und warum pip install und requirements.txt von Hand der Vergangenheit angehören.
competencies: [ki-dev-03]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill dev-environment, references/python-projekt.md und references/fallstricke.md (Stand 23.11.2026, geprüft 27.11.2026)
  - grundlagen/vs_code.md (Abschnitt 8) und grundlagen/container.md (9.11), Stand 27.11.2026
  - https://docs.astral.sh/uv/concepts/projects/
  - https://docs.astral.sh/uv/concepts/projects/dependencies/
  - https://peps.python.org/pep-0735/
  - https://peps.python.org/pep-0668/
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich, was-ist-neu]
prompt_context: "Python-Projekt mit uv: uv init --package, src-Layout, pyproject.toml (requires-python, dependencies, dependency-groups), uv.lock, .python-version, .venv, uv add/sync/run/lock, uv sync --locked in CI, uv export, uv tool install, PEP 668 externally-managed-environment, VS Code Interpreter"
---

:::tldr
**uv** ersetzt `pyenv`, `venv`, `pip` und `pip-tools` durch ein einziges, sehr schnelles Werkzeug. Die **Quelle** der Abhängigkeiten ist `pyproject.toml`, die **exakten Versionen** stehen in `uv.lock`, die Python-Version in `.python-version` – alle drei werden committet. Die Umgebung `.venv/` erzeugt uv selbst und sie kommt **nie** ins Git. Pakete kommen mit **`uv add`**, Befehle laufen mit **`uv run`**, und in CI oder Container gilt **`uv sync --locked`**.
:::

## Warum nicht einfach pip?

Der klassische Weg – `python -m venv .venv`, aktivieren, `pip install`, `requirements.txt` von Hand pflegen – hat drei Schwächen: Man vergisst das Aktivieren, die Liste weicht von dem ab, was wirklich installiert ist, und zwei Rechner bekommen unterschiedliche Versionen von Unter-Abhängigkeiten.

:::bildlich Einkaufsliste und Kassenbon
`pyproject.toml` ist die **Einkaufsliste**: «Brot, Milch, mindestens Version 2 von httpx». `uv.lock` ist der **Kassenbon**: genau welches Brot, welche Marke, welche Packungsgrösse – inklusive allem, was automatisch mit in den Wagen kam. Wer nach dem Kassenbon einkauft, hat zu Hause exakt dasselbe im Kühlschrank wie du.
:::

## Wie ein Projekt aussieht

```
~/projekte/rechnungen/
├── .python-version      Python-Version            → committen
├── pyproject.toml       Abhängigkeiten (Quelle)   → committen
├── uv.lock              exakte Versionen           → committen, nie von Hand ändern
├── .venv/               Umgebung, von uv erzeugt   → NIE committen
├── src/rechnungen/      dein Code (src-Layout)
│   ├── __init__.py
│   └── settings.py
├── tests/
├── .env.example         Namen der Variablen        → committen
├── .env                 lokale Werte, Secrets      → NIE committen
└── .gitignore  .gitattributes
```

:::gem Warum das src-Layout
Liegt der Code unter `src/<paket>/`, laufen Tests gegen das **installierte Paket** statt gegen zufällig importierbare Dateien im Projektordner. Packaging-Fehler («im Test geht's, installiert nicht») fallen dadurch sofort auf. `uv init --package <name>` legt diese Struktur an; für reine Skriptsammlungen gibt es `uv init --no-package`.
:::

## Der Alltag mit uv

| Ziel | Befehl | Nicht so |
|---|---|---|
| Projekt anlegen | `uv init --package rechnungen` | Ordner und `python -m venv` von Hand |
| Python-Version festlegen | `uv python pin 3.13` | System-Python von Ubuntu nutzen |
| Paket hinzufügen | `uv add httpx` | `pip install httpx` |
| Entwicklungswerkzeug | `uv add --dev pytest` | in die normalen Abhängigkeiten mischen |
| Umgebung herstellen | `uv sync` | `pip install -r requirements.txt` |
| In CI und Container | **`uv sync --locked`** | `uv sync` ohne Flag |
| Befehl ausführen | `uv run pytest` | Aktivieren vergessen |
| Ein Paket aktualisieren | `uv lock --upgrade-package httpx` | Versionen im Lock editieren |
| Paket entfernen | `uv remove httpx` | |
| Globales Werkzeug | `uv tool install ruff` oder einmalig `uvx ruff check` | `sudo pip install` |
| `requirements.txt` für ein Ziel, das sie verlangt | `uv export --format requirements-txt > requirements.txt` | von Hand pflegen |

`uv run` sorgt selbst dafür, dass die Umgebung zum Lock passt – kein `source .venv/bin/activate` nötig.

:::falle `uv sync` ohne `--locked` in CI
Ohne Flag darf `uv sync` den Lock anpassen, wenn er nicht zur `pyproject.toml` passt. In CI und im Container willst du das Gegenteil: **abbrechen**, wenn jemand vergessen hat, den aktualisierten Lock zu committen. `uv sync --locked` tut genau das – und macht «bei mir läuft's» sichtbar, bevor es in Produktion geht.
:::

## Die `pyproject.toml` lesen

```toml
[project]
name = "rechnungen"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "httpx>=0.27",            # Untergrenzen, keine harten Pins – die macht der Lock
    "pydantic-settings>=2.5",
]

[dependency-groups]
dev = ["pytest>=8", "ruff>=0.6"]   # nur für Entwicklung, nie im ausgelieferten Paket

[project.scripts]
rechnungen = "rechnungen.cli:main"  # Befehl «rechnungen» nach der Installation

[build-system]                     # von uv init --package gesetzt, nicht löschen
requires = ["uv_build>=…"]      # Versionsbereich trägt uv selbst ein
build-backend = "uv_build"
```

- **`requires-python`** ist eine Untergrenze und muss zur `.python-version` passen.
- **`[dependency-groups]`** (PEP 735) ist der Ort für Test- und Linting-Werkzeuge. `[project.optional-dependencies]` ist für echte optionale Funktionen eines Pakets gedacht.

## Typische Fehler

| Symptom | Ursache | Lösung |
|---|---|---|
| `externally-managed-environment` bei `pip install` | Ubuntu schützt das System-Python (PEP 668) | nie System-pip; `uv add` im Projekt, `uv tool install` für Werkzeuge |
| `ModuleNotFoundError`, obwohl installiert | falsche Umgebung (System-Python, alter `venv/`) | `uv run …`; in VS Code den Interpreter `.venv/bin/python` wählen |
| CI installiert andere Versionen als lokal | `uv.lock` fehlt im Git oder CI ohne `--locked` | Lock committen, `uv sync --locked` |
| `requirements.txt` und `pyproject.toml` widersprechen sich | zwei Quellen | nur `pyproject.toml` + `uv.lock`; requirements höchstens per `uv export` |
| `.venv/` oder `__pycache__/` im Repo | `.gitignore` fehlte | `.gitignore` ergänzen, `git rm -r --cached .venv` |
| Python-Version weicht zwischen Rechnern ab | keine `.python-version` | `uv python pin`, `requires-python` setzen |

:::gem Ein bestehendes Projekt in zehn Minuten umstellen
`uv init --bare` (nur `pyproject.toml`), dann `uv add -r requirements.txt` und `uv add --dev -r requirements-dev.txt`. Danach `uv sync`, `uv run pytest` – und die alten `requirements*.txt` und `venv/` löschen. Ab jetzt gibt es eine Quelle.
:::

### VS Code findet die Umgebung

VS Code erkennt `.venv` meist von selbst. Falls nicht: `Strg+Shift+P` → «Python: Select Interpreter» → `.venv/bin/python`. Erst dann stimmen Autovervollständigung, Tests und Debugger.

:::berater Im Kundengespräch
«Reproduzierbarkeit» klingt technisch, ist aber ein Geschäftsargument: Wenn ein KI-Agent oder eine neue Entwicklerin ein Projekt klont, muss `uv sync` in Sekunden **exakt** die Umgebung herstellen, mit der getestet wurde. Ohne Lock-Datei sucht man bei jedem Fehler zuerst, ob es an anderen Versionen liegt. Typischer Einwand: «pip funktioniert doch.» – Für ein Skript ja. Für ein Projekt, das mehrere Menschen und Agenten anfassen, ist eine einzige, gesperrte Quelle die günstigere Versicherung.
:::

:::spickzettel
- Committen: **`pyproject.toml` + `uv.lock` + `.python-version`** · nie: **`.venv/`**, `.env`
- `uv init --package` → src-Layout
- **`uv add`** / `uv add --dev` · **`uv run`** · `uv remove`
- CI und Container: **`uv sync --locked`**
- Aktualisieren: `uv lock --upgrade-package <p>` bzw. `uv lock --upgrade`
- Werkzeuge: `uv tool install` / `uvx`, nie `sudo pip`
- `requirements.txt` nur per **`uv export`**
- VS Code: Interpreter `.venv/bin/python`
:::

:::selbstcheck 3
