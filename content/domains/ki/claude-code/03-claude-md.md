---
title: CLAUDE.md, Regeln und Auto Memory – das Gedächtnis zwischen Sessions
level: L2
summary: Wo CLAUDE.md-Dateien liegen und wie sie geladen werden, was hineingehört und was nicht, wie Regeln und Skills die Datei schlank halten und was Claude sich mit Auto Memory selbst merkt.
competencies: [ki-cc-03]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/memory (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/best-practices (Abschnitt Write an effective CLAUDE.md)
  - Claude Folders.docx (Teil C1 – Gedächtnis; Kontrollfrage 2)
  - claude_code_masterclass (1).docx (Kapitel 4, Stand Mai 2026)
  - Skill cc-project-structure (CLAUDE.md-Aufbau)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "CLAUDE.md in Claude Code: Orte (Managed, ~/.claude/CLAUDE.md, ./CLAUDE.md, CLAUDE.local.md), Ladeverhalten (Elternordner beim Start, Unterordner bei Bedarf), unter 200 Zeilen, Include/Exclude-Liste, @-Importe, HTML-Kommentare, .claude/rules mit paths-Frontmatter, Skills statt CLAUDE.md, Auto Memory (MEMORY.md, 200 Zeilen/25 KB), AGENTS.md"
---

:::tldr
Jede Session beginnt mit leerem Kontext. **[[CLAUDE.md]]** (von dir geschrieben) und **Auto Memory** (von Claude geschrieben) sind die beiden Wege, Wissen über Sessions hinweg zu tragen. Die CLAUDE.md wird **jedes Mal vollständig** geladen – darum gehört nur hinein, was Claude **ohne sie falsch machen würde**. Ziel: **unter 200 Zeilen**. Was nur manchmal gilt, kommt in **pfadgebundene Regeln** (`.claude/rules/`) oder **Skills**. Und: CLAUDE.md ist **Anleitung, keine Durchsetzung** – was garantiert passieren muss, gehört in einen Hook.
:::

## Wo CLAUDE.md-Dateien liegen

| Ebene | Ort | Gilt für | Geteilt mit |
|---|---|---|---|
| Organisation | `/etc/claude-code/CLAUDE.md` (Linux/WSL), entsprechende Orte unter macOS und Windows | alle auf dem Rechner | ganze Organisation (IT) |
| Persönlich | `~/.claude/CLAUDE.md` | alle deine Projekte | nur dich |
| Projekt | `./CLAUDE.md` oder `./.claude/CLAUDE.md` | dieses Projekt | Team über Git |
| Lokal | `./CLAUDE.local.md` (selbst in `.gitignore` eintragen) | dieses Projekt, nur du | niemanden |

**Wie geladen wird** (Stand 27.11.2026):

- CLAUDE.md-Dateien im Startordner und **allen Ordnern darüber** werden beim Start geladen.
- CLAUDE.md-Dateien in **Unterordnern** werden erst geladen, wenn Claude dort eine Datei liest oder bearbeitet.
- Alle gefundenen Dateien werden **aneinandergehängt**, nicht überschrieben. Was näher am Startordner liegt, liest Claude zuletzt; bei Widersprüchen kann Claude eine Anweisung willkürlich wählen.

:::bildlich Die Tagesordnung vor jeder Sitzung
Die CLAUDE.md ist die **Tagesordnung**, die vor jeder Sitzung **vollständig vorgelesen** wird. Eine Tagesordnung mit drei Seiten Kleingedrucktem hört niemand mehr richtig zu. Themen, die nur manchmal drankommen, gehören in **Mappen**, die man erst aufschlägt, wenn das Thema auf dem Tisch liegt – das sind Regeln und Skills.
:::

## Was hineingehört – und was nicht

| ✅ Hinein | ❌ Weglassen |
|---|---|
| Befehle, die Claude nicht erraten kann (Build, einzelner Test, Lint) | was Claude aus dem Code selbst ablesen kann |
| Code-Stil, der vom Üblichen abweicht | Standardkonventionen der Sprache |
| Test-Vorgehen und bevorzugter Test-Runner | ausführliche API-Dokumentation (lieber verlinken) |
| Branch- und PR-Konventionen | Informationen, die sich häufig ändern |
| projektspezifische Architekturentscheidungen | lange Erklärungen und Tutorials |
| Eigenheiten der Umgebung (Pflicht-Variablen) | Beschreibung jeder einzelnen Datei |
| Stolpersteine und nicht offensichtliches Verhalten | Selbstverständliches wie «schreibe sauberen Code» |

Die Prüffrage für jede Zeile: **«Würde Claude ohne diese Zeile einen Fehler machen?»** Wenn nicht: streichen.

```markdown
# Befehle
- Tests: `uv run pytest tests/<datei>` – nie die ganze Suite (dauert 8 min)
- Lint: `uv run ruff check --fix`

# Regeln
- Beträge immer als Decimal in CHF, nie float
- Keine direkten DB-Zugriffe aus Handlern – nur über `repo/`

# Git
- Branch `<typ>/<kurz>`, nur Draft-PRs, nie auf main pushen

<!-- Hinweis für Menschen: Abschnitt anpassen, wenn wir auf Postgres wechseln -->
```

:::gem HTML-Kommentare kosten nichts
Block-Kommentare wie `<!-- Notiz -->` werden entfernt, bevor die CLAUDE.md in den Kontext kommt. Ideal für Erklärungen an Kolleginnen («warum gibt es diese Regel?»), ohne Kontext zu verbrauchen.
:::

:::falle Zu lange CLAUDE.md, Regeln werden ignoriert
Wenn Claude etwas trotz einer Regel immer wieder falsch macht, ist die Datei meist **zu lang** und die Regel geht im Rauschen unter. Abhilfe: radikal kürzen, Spezielles auslagern. Hilft auch das nicht, braucht die Regel **Durchsetzung**: einen Hook, der die Aktion blockiert. Und wer zehn Zeilen mit «WICHTIG» markiert, hebt keine davon mehr hervor.
:::

## Auslagern: Importe, Regeln, Skills

**`@`-Importe** binden weitere Dateien ein: `Siehe @README.md` oder `Git-Ablauf: @docs/git.md`. Sie werden **zusammen mit** der CLAUDE.md geladen (bis zu vier Ebenen tief) – sie ordnen also, sparen aber **keinen** Kontext.

**Pfadgebundene Regeln** in `.claude/rules/` laden erst, wenn Claude mit passenden Dateien arbeitet:

```markdown
---
paths:
  - "src/api/**/*.py"
---
# API-Regeln
- Eingaben mit pydantic validieren
- Antwortform: { "data": ... } oder { "error": ... }
```

Eine Regel **ohne** `paths` lädt wie die CLAUDE.md bei jedem Start.

**[[Skill|Skills]]** (`.claude/skills/<name>/SKILL.md`) sind für Abläufe und Fachwissen, die nur manchmal gebraucht werden. Claude lädt sie bei Bedarf oder du rufst sie mit `/name` auf.

| Inhalt | Gehört in |
|---|---|
| gilt immer, kurz | `CLAUDE.md` |
| gilt nur für bestimmte Dateien oder Ordner | `.claude/rules/` mit `paths` |
| Ablauf oder Fachwissen, nur manchmal gebraucht | Skill |
| muss **garantiert** passieren oder verhindert werden | Hook bzw. Permission-Regel |
| nur für mich, nicht fürs Team | `CLAUDE.local.md` oder `~/.claude/CLAUDE.md` |

## Auto Memory – was Claude sich selbst merkt

Neben deiner CLAUDE.md führt Claude eigene Notizen, wenn du es korrigierst oder Vorlieben äusserst (Stand 27.11.2026):

- Ort: `~/.claude/projects/<projekt>/memory/` – ein Index `MEMORY.md` plus Themendateien. Alle Worktrees eines Repos teilen sich den Ordner; er bleibt **auf deinem Rechner**.
- Beim Start werden die **ersten 200 Zeilen bzw. 25 KB** von `MEMORY.md` geladen, Themendateien erst bei Bedarf.
- `/memory` zeigt die Dateien und schaltet Auto Memory ein oder aus (`autoMemoryEnabled`).

:::gem «Merk dir das» oder «Schreib das in die CLAUDE.md»?
«Denk daran: Wir nutzen immer pnpm» landet in **deinem** Auto Memory – nur auf deinem Rechner. Soll das ganze Team davon profitieren, sag ausdrücklich: «Ergänze das in der CLAUDE.md» und committe die Änderung. Persönliches Gedächtnis und Team-Gedächtnis sind zwei verschiedene Orte.
:::

:::gem AGENTS.md wird mitgelesen
Repos, die für andere Coding-Agenten eine `AGENTS.md` haben, funktionieren ohne Umbau: Gibt es keine CLAUDE.md, liest Claude Code die `AGENTS.md` (ab v2.1.277, Stand 27.11.2026). Wer beides will, importiert sie in der CLAUDE.md mit `@AGENTS.md`.
:::

:::berater Im Kundengespräch
Viele Teams starten mit einer CLAUDE.md, die nach drei Monaten 400 Zeilen hat – und wundern sich, dass Claude «nicht mehr zuhört». Die Beratungsleistung: eine **Gedächtnis-Architektur** mit klaren Orten (Team-CLAUDE.md, Regeln pro Bereich, Skills für Abläufe, Hooks für Muss-Regeln) und einem Ritual, die Datei regelmässig zu kürzen. Typischer Einwand: «Je mehr Claude weiss, desto besser.» – Nein: Je **gezielter** Claude etwas weiss, desto besser.
:::

:::spickzettel
- Orte: Organisation · **`~/.claude/CLAUDE.md`** (ich) · **`./CLAUDE.md`** (Team) · `CLAUDE.local.md` (ich, Projekt)
- Elternordner beim Start, **Unterordner bei Bedarf**; alles wird aneinandergehängt
- **Unter 200 Zeilen** · Prüffrage: «Macht Claude ohne die Zeile einen Fehler?»
- `@`-Importe ordnen, sparen aber keinen Kontext
- **`.claude/rules/` mit `paths`** = lädt nur bei passenden Dateien
- Seltene Abläufe → **Skill** · Muss-Regeln → **Hook**
- `<!-- Kommentar -->` kostet keinen Kontext
- Auto Memory: `MEMORY.md`, erste **200 Zeilen / 25 KB**, lokal, `/memory`
:::

:::selbstcheck 3
