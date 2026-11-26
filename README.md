# 🧭 Knowledge Hub

Wissensdatenbank und Fragekatalog, die aus einem Anfänger einen **Senior Consultant** machen – zuerst für die Domäne **Künstliche Intelligenz**.

**Credo:** Was ein Senior Consultant wissen muss, steht in der [Kompetenzmatrix](content/domains/ki/competencies.yaml). Jede Kompetenz braucht eine Lektion und genügend geprüfte Fragen. Die App zeigt die Abdeckung, die Wochen-Tasks schliessen die Lücken.

## Was die App kann

- **Lektionen** mit Bausteinen: In einem Satz, Bildlich, Hidden Gem, Stolperfalle, Beraterblick, Spickzettel, Diagramme, Glossar-Tooltips
- **Prompt-Buttons** (Mehr, Beispiele, Einfach erklärt, Prüf mich, Kundengespräch, Finde den Fehler, Elevator Pitch, Was ist neu): Ein Klick kopiert einen präzisen Prompt, den du in einem LLM deiner Wahl einfügst
- **Fragekatalog** mit sechs Typen (Single, Mehrfach, Richtig/Falsch, Reihenfolge, Szenario, Fallstudie)
- **Daily 5** nach dem Karteikasten-Prinzip, **Quiz**, **Prüfungsmodus**, **Selbstcheck** in jeder Lektion
- **Suche** über Lektionen, Abschnitte und Glossar
- **Kompetenz-Radar**, **Lernpfade**, **Was ist neu**, **Abdeckungsbericht**
- **Sync über Geräte** mit Supabase (optional, Login per E-Mail-Link)

## Aufbau

```
content/          Inhalte (Markdown + YAML) – hier wird gearbeitet
  domains/ki/     Domäne KI: _domain.yaml, competencies.yaml, je Thema _topic.yaml + Lektionen
  questions/      eine Frage pro Datei
  prompts.yaml    Vorlagen der Prompt-Buttons
  glossary.yaml   Glossar
  paths/          Lernpfade
  changelog/      «Was ist neu»
schema/           JSON-Schemas, gegen die der Build prüft
scripts/build.py  Validierung, Rendering, Suchindex, Abdeckung → dist/
src/              App (HTML/CSS/JS ohne Framework)
supabase/         Datenbankschema mit Row Level Security
docs/             Wochen-Tasks
```

## Lokal

```bash
pip install -r requirements.txt
python scripts/build.py --report          # validieren + dist/ bauen + Abdeckung
python -m http.server -d dist 8000        # http://localhost:8000
```

## Einrichtung (einmalig)

### GitHub Pages
Repo → **Settings → Pages → Source: GitHub Actions**. Danach veröffentlicht jeder Push auf `main` automatisch (Workflow `deploy.yml`).

### Sync über Geräte (Supabase)
1. Projekt auf supabase.com anlegen (Region EU, z. B. Frankfurt oder Zürich, falls verfügbar).
2. SQL Editor → Inhalt von `supabase/migrations/20261126000000_progress.sql` ausführen.
3. Authentication → Providers → **Email** aktiv (Magic Link).
4. Authentication → URL Configuration: **Site URL** und **Redirect URLs** auf die Pages-Adresse setzen (z. B. `https://githomashub.github.io/knowledge-hub/`).
5. Project Settings → API: **Project URL** und **anon public key** in `src/config.js` eintragen und committen. Der anon key ist öffentlich gedacht; den Zugriff schützt Row Level Security (jede Person sieht nur ihren eigenen Fortschritt).

Gespeichert werden nur E-Mail-Adresse und Lernstand. Ohne Konfiguration bleibt der Fortschritt lokal im Browser (Export/Import als JSON möglich).

## Pflege

- **Wochen-Tasks** (Inhalts-Review am Montag, Fragen und Abdeckung am Donnerstag): siehe [docs/wochen-tasks.md](docs/wochen-tasks.md). Sie erstellen nur Draft-PRs.
- **Neue Fragen** kommen als `status: draft` und erscheinen in Daily 5 und Prüfung erst, wenn ein Mensch sie auf `reviewed` setzt.
- Regeln für Claude: [CLAUDE.md](CLAUDE.md) · Schreibanleitung: [CONTRIBUTING.md](CONTRIBUTING.md)

## Herkunft

Dieses Repo ersetzt `grundlagen` als Wissensquelle (Entscheid 26.11.2026). Die Inhalte von `grundlagen` (Container, Git/WSL, VS Code, Diverses) werden schrittweise in die Themen `container`, `git-github` und `dev-environment` überführt.
