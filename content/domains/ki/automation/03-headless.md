---
title: Claude headless – claude -p in Skripten und CI
level: L2
summary: Claude Code ohne Bildschirm betreiben – Ausgabe als JSON oder nach Schema, Werkzeuge und Rechte für unbeaufsichtigte Läufe, harte Grenzen, Bare-Modus für reproduzierbare CI und Erfolg über Exit-Code statt Textsuche.
competencies: [ki-aut-03]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/headless (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/cli-reference
  - https://code.claude.com/docs/en/best-practices (Abschnitte Run non-interactive mode, Fan out across files)
  - Skill agents-automation, references/claude-code.md (Headless) und assets/headless-run.sh (geprüft 27.11.2026)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich, was-ist-neu]
prompt_context: "Claude Code headless: claude -p, --output-format text/json/stream-json, --json-schema mit structured_output, --allowedTools mit Regelsyntax, --permission-mode dontAsk/auto/acceptEdits, Manual als Standard für -p ab v2.1.302, --permission-prompts none, --max-turns, --max-budget-usd, --bare für CI, Exit-Codes (0, ungleich 0, 143 bei SIGTERM), total_cost_usd, Pipes, --continue/--resume, Fan-out-Schleife"
---

:::tldr
**`claude -p "<Auftrag>"`** führt Claude Code **ohne Dialog** aus: ein Auftrag, ein Ergebnis, dann Ende. Für Skripte zählen vier Dinge: **maschinenlesbare Ausgabe** (`--output-format json`, optional `--json-schema`), **klare Rechte** (`--allowedTools` plus `--permission-mode dontAsk`), **harte Grenzen** (`--max-turns`, `--max-budget-usd`, Timeout) und **Erfolg über Exit-Code und JSON-Felder** – nie über Textsuche. In CI empfiehlt die Doku zusätzlich **`--bare`**, damit keine Hooks, Plugins oder CLAUDE.md-Dateien der Maschine hineinfunken.
:::

## Grundform

```bash
claude -p "Erkläre in drei Sätzen, was dieses Projekt macht"
cat build-error.txt | claude -p "Erkläre die Ursache dieses Build-Fehlers knapp" > erklaerung.txt
git diff main | claude -p "Melde Tippfehler im Diff als datei:zeile, sonst nichts"
```

Eingaben über eine **Pipe** sind auf 10 MB begrenzt; Grösseres als Datei ablegen und im Prompt auf den Pfad verweisen. Claude Code beendet sich mit **Exit-Code 0** bei Erfolg und **ungleich 0** bei einem Fehler (Stand 27.11.2026).

:::bildlich Vom Gespräch zum Auftragszettel
Interaktiv sitzt du neben Claude und beantwortest Rückfragen. Headless legst du einen **Auftragszettel** in den Briefkasten und kommst morgen wieder. Darum muss auf dem Zettel alles stehen: was zu tun ist, was er darf, wie viel er ausgeben darf – und in welcher **Form** er das Ergebnis abliefern soll, damit es ein Programm weiterverarbeiten kann.
:::

## Ausgabe für Programme

| Format | Ergebnis | Wofür |
|---|---|---|
| `text` (Standard) | reiner Text | Menschen, einfache Pipes |
| `json` | ein Objekt mit `result`, `session_id`, Nutzung und **`total_cost_usd`** | Skripte, Kosten mitschreiben |
| `stream-json` | ein JSON-Objekt pro Zeile, zuletzt ein `result` | Live-Verarbeitung, Monitoring |

**Strukturierte Ausgabe nach Schema:**

```bash
claude -p "Liste die Hauptfunktionen in auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

:::falle `structured_output` kann fehlen
Endet ein Lauf ohne gültige strukturierte Ausgabe – etwa weil Claude den Auftrag ablehnt oder eine Grenze erreicht –, fehlt das Feld `structured_output`. Ein Skript, das blind `.structured_output.findings` liest, läuft dann mit leeren Daten weiter und meldet «0 Funde». Immer zuerst prüfen, ob das Feld da ist, und sonst laut scheitern.
:::

## Rechte ohne Mensch

Headless kann niemand Rückfragen beantworten. Was passiert dann?

- **`--allowedTools`** gibt Werkzeuge **ohne Rückfrage** frei, in der Syntax der Permission-Regeln: `"Read,Grep,Glob,Bash(uv run pytest *)"`. Das Leerzeichen vor `*` ist wichtig: `Bash(git diff *)` erlaubt `git diff …`, `Bash(git diff*)` würde auch `git diff-index` erfassen.
- **Startmodus:** Ab v2.1.302 starten `claude -p`-Läufe ohne gesetzten Modus im Modus **Manual**. Was eine Freigabe bräuchte, wird dann **abgelehnt**, sofern nichts anderes es erlaubt.
- **`--permission-mode dontAsk`:** lehnt ausdrücklich alles ab, was fragen würde, und lässt nur Freigegebenes und Ungefährliches (z. B. Lesen im Arbeitsordner) zu – die Wahl für **gesperrte CI-Läufe**.
- **`--permission-mode auto`:** ein Klassifikator prüft die Aktionen statt dir; dazu `--permission-prompts none`, damit nichts auf eine Antwort wartet.
- **`--dangerously-skip-permissions`:** nur in einem isolierten Container ohne Secrets und nie als root.

```bash
claude -p "Prüfe src/ auf ungefangene Ausnahmen bei Dateizugriffen. Ändere nichts." \
  --bare \
  --output-format json \
  --allowedTools "Read,Grep,Glob" \
  --permission-mode dontAsk \
  --max-turns 15 \
  --max-budget-usd 2
```

:::gem `--bare` für reproduzierbare CI
Ohne `--bare` lädt `claude -p` alles, was eine interaktive Session auch laden würde: Hooks, Skills, Subagenten, Plugins, MCP-Server, Auto Memory und CLAUDE.md – aus dem Arbeitsordner **und** aus `~/.claude` der Maschine. Ohne `--bare` führt ein `-p`-Lauf sogar die Hooks aus der `.claude/settings.json` eines Projekts aus und verbindet dessen `.mcp.json`-Server – auch in einem Ordner, dem nie jemand vertraut hat, und ohne Rückfrage. Mit `--bare` wird nichts davon gelesen; was nötig ist, gibst du ausdrücklich mit (`--settings`, `--mcp-config`, `--append-system-prompt`). Laut Doku soll `--bare` künftig Standard für `-p` werden (Stand 27.11.2026). Achtung: Im Bare-Modus gilt nur `ANTHROPIC_API_KEY`, kein Abo-Login.
:::

## Erfolg richtig auswerten

```bash
set +e
timeout 1800 claude -p "$PROMPT" --bare --output-format json --json-schema "$SCHEMA" \
  --allowedTools "Read,Grep,Glob" --permission-mode dontAsk \
  --max-turns 15 --max-budget-usd 2 < /dev/null > lauf.json
rc=$?
set -e

[ "$rc" -eq 0 ] || { echo "FEHLER: Exit $rc (124 = Timeout)"; exit 1; }
jq -e '.structured_output.findings | type == "array"' lauf.json >/dev/null \
  || { echo "FEHLER: keine gültige strukturierte Ausgabe"; exit 1; }
echo "Kosten USD: $(jq -r '.total_cost_usd' lauf.json)"
# Erst JETZT, nach der Prüfung: Issue anlegen, Draft-PR öffnen usw. – im Skript, nicht durch den Agenten
```

| Prüfung | Warum |
|---|---|
| **Exit-Code** | Grenze erreicht, Fehler oder Timeout (`timeout` liefert 124; SIGTERM führt bei Claude Code zu 143) |
| **Feld vorhanden und gültig** | Ablehnung oder Abbruch erkennen |
| **Kosten mitschreiben** | `total_cost_usd` ist eine Schätzung, aber ein guter Frühwarner |
| **Folgenreiches im Skript** | Commit, Push, Versand erst nach der Prüfung – nicht dem Agenten überlassen |

:::falle Erfolg aus dem Text erraten
`if grep -q "erfolgreich" ausgabe.txt` – und der Agent schrieb «nicht erfolgreich». Oder er schrieb gar nichts, weil er nach 15 Schritten abgebrochen hat. Textsuche ist kein Erfolgskriterium. Exit-Code und definierte JSON-Felder sind es.
:::

## Viele Dateien: Fan-out

Für grosse Migrationen ruft eine Schleife `claude -p` pro Datei auf:

```bash
for datei in $(cat zu_migrieren.txt); do
  claude -p "Migriere $datei von Python 2 auf 3. Antworte nur OK oder FAIL." \
    --allowedTools "Edit,Bash(git commit *)" \
    --permission-mode dontAsk
done
```

Erst an **zwei, drei Dateien** testen, den Prompt anhand der Fehler schärfen, dann auf alle anwenden. Alternativ verteilt `/batch <Anweisung>` in einer Session die Arbeit auf 5 bis 30 Subagenten in eigenen Worktrees.

:::berater Im Kundengespräch
`claude -p` ist der Baustein, mit dem Claude in bestehende Prozesse kommt: in CI, in Pre-Commit-Hooks, in nächtliche Skripte. Die Botschaft an die IT: «Jeder Lauf hat eine Werkzeugliste, ein Budget, ein Zeitlimit und ein maschinenlesbares Ergebnis – und alles, was nach aussen wirkt, macht weiterhin Ihr Skript nach einer Prüfung.» Typischer Einwand: «Dann kann der Agent ja nichts.» – Er kann alles, was freigegeben ist. Und was nicht freigegeben ist, wird abgelehnt statt still ausgeführt.
:::

:::spickzettel
- **`claude -p "<Auftrag>"`**: ein Auftrag, ein Ergebnis, Exit-Code 0 / ≠ 0
- Ausgabe: **`--output-format json`** (`result`, `session_id`, `total_cost_usd`) · `stream-json` · **`--json-schema`** → `structured_output` (kann fehlen!)
- Rechte: **`--allowedTools`** (Regelsyntax, Leerzeichen vor `*`) + **`--permission-mode dontAsk`**; `-p` startet ab v2.1.302 in Manual
- Grenzen: **`--max-turns`**, **`--max-budget-usd`**, `timeout`
- CI: **`--bare`** (keine Hooks, Plugins, CLAUDE.md, MCP aus der Umgebung; nur API-Key)
- Erfolg über **Exit-Code + JSON-Felder**, nie über Textsuche
- Folgenreiches **im Skript nach der Prüfung**
:::

:::selbstcheck 3
