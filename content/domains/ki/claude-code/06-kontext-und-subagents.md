---
title: Kontext managen und Subagenten einsetzen
level: L3
summary: Was das Kontextfenster füllt, wie du mit clear, compact und btw gegensteuerst, wie Subagenten Recherche aus dem Hauptgespräch heraushalten, wie du eigene Subagenten baust und wann parallele Sessions sinnvoll sind.
competencies: [ki-cc-06]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/best-practices (Abschnitte Manage context aggressively, Use subagents for investigation, Run multiple Claude sessions; abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/sub-agents (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/context-window
  - claude_code_masterclass (1).docx (Kapitel 8, 11, 12, Stand Mai 2026)
  - Claude Folders.docx (Teil C3 – skills, commands, agents)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich, was-ist-neu]
prompt_context: "Claude Code Kontext-Management und Subagenten: was das Kontextfenster füllt, Leistungsabfall bei vollem Kontext, Auto-Compaction, /compact mit Fokus, Compact-Anweisungen in CLAUDE.md, Summarize from here, /btw, /context; Subagenten (Explore, Plan, general-purpose, eigene in .claude/agents mit tools, model, permissionMode, memory, isolation worktree), Writer/Reviewer, Worktrees, /batch"
---

:::tldr
Das **Kontextfenster** enthält das ganze Gespräch: jede Nachricht, jede gelesene Datei, jede Befehlsausgabe. Es füllt sich schnell, und **je voller, desto schlechter** arbeitet Claude – frühere Anweisungen gehen verloren, Fehler häufen sich. Gegenmittel: **`/clear`** zwischen Themen, **`/compact`** mit Fokus innerhalb eines Themas, **`/btw`** für Nebenfragen und vor allem **[[Subagent|Subagenten]]**: Sie recherchieren in einem **eigenen** Kontext und liefern nur eine Zusammenfassung zurück.
:::

## Was den Kontext füllt

| Quelle | Wächst mit | Hebel |
|---|---|---|
| Gesprächsverlauf | jedem Austausch | `/clear` zwischen Aufgaben |
| Gelesene Dateien | Dateigrösse | gezielt lesen, Recherche an Subagenten |
| Befehlsausgaben | Länge der Ausgabe | Ausgaben kürzen (z. B. nur die letzten Zeilen mit `tail -50`, `--quiet`) |
| CLAUDE.md und Regeln | jede Zeile, bei jedem Start | kurz halten, pfadgebundene Regeln |
| MCP-Werkzeuge | Anzahl Server und Werkzeuge | nur nötige Server, Tool Search |
| Skills | nur wenn geladen | Abläufe in Skills statt CLAUDE.md |
| Subagent-Ergebnisse | nur die Zusammenfassung | Recherche delegieren |

Mit **`/context`** siehst du jederzeit, was wie viel belegt. Eine Statuszeile mit Kontext-Anteil hält es dauerhaft im Blick.

:::bildlich Der Schreibtisch
Das Kontextfenster ist ein **Schreibtisch**. Jedes Dokument, das Claude anschaut, bleibt darauf liegen. Bei einem leeren Tisch findet Claude alles sofort. Bei einem überladenen Tisch rutscht die Notiz mit deiner wichtigsten Anweisung unter einen Stapel Logdateien. `/clear` räumt den Tisch ab, `/compact` fasst die Stapel zu einer Seite zusammen, und ein Subagent ist ein **Assistent im Nebenraum**, der zwanzig Ordner durchliest und dir eine Seite Ergebnis hinlegt.
:::

## Gegensteuern

- **`/clear`** zwischen Aufgaben, die nichts miteinander zu tun haben.
- **Automatische Verdichtung:** Kurz vor dem Limit fasst Claude Code den Verlauf selbst zusammen und behält Code-Muster, Dateistände und Entscheidungen.
- **`/compact <Anweisung>`** steuert, was erhalten bleibt: `/compact Behalte geänderte Dateien, Testbefehle und die Auth-Entscheidungen`.
- **Teilweise verdichten:** Esc Esc → Checkpoint wählen → «Summarize from here» (ab dort zusammenfassen) oder «Summarize up to here» (davor zusammenfassen).
- **Regel in der CLAUDE.md:** «Beim Verdichten immer die Liste geänderter Dateien und die Testbefehle erhalten.»
- **`/btw`** für Fragen, die nicht im Verlauf bleiben müssen.

:::gem Verdichten an Meilensteinen, nicht am Limit
Wer erst verdichtet, wenn der Kontext voll ist, bekommt eine hastige Zusammenfassung eines chaotischen Verlaufs. Besser: nach jedem abgeschlossenen Teilschritt kurz `/context` prüfen und gezielt `/compact` mit Fokus auf die nächste Phase. Wechselst du das Thema ganz, ist `/clear` sauberer.
:::

## Subagenten

Ein Subagent ist eine spezialisierte Claude-Instanz mit **eigenem Kontextfenster**, eigenen Werkzeugen und eigenem Auftrag. Er liest, sucht und prüft – und gibt nur das Ergebnis zurück. Dein Hauptgespräch bleibt frei für die Umsetzung.

```
Nutze Subagenten, um herauszufinden, wie unser Auth-System den Token-Refresh
macht und ob es schon OAuth-Hilfsfunktionen gibt, die ich wiederverwenden kann.
```

### Eingebaute Subagenten (Stand 27.11.2026)

| Subagent | Werkzeuge | Zweck |
|---|---|---|
| **Explore** | nur lesend (Write und Edit gesperrt) | Dateien finden, Code durchsuchen, Codebasis erkunden |
| **Plan** | nur lesend | Recherche im Plan-Modus, bevor der Plan präsentiert wird |
| **general-purpose** | alle | mehrstufige Aufgaben mit Erkunden und Ändern |

Explore und Plan lassen deine CLAUDE.md und den Git-Status bewusst weg, damit die Recherche schnell und günstig bleibt.

### Eigene Subagenten

```markdown
---
name: security-reviewer
description: Prüft geänderten Code auf Sicherheitslücken. Nach Änderungen an Auth, Eingaben oder Datenbankzugriffen einsetzen.
tools: Read, Grep, Glob
model: opus
---
Du bist ein Senior Security Engineer. Prüfe auf Injection, fehlerhafte
Zugriffskontrolle, Secrets im Code und unsichere Datenverarbeitung.
Nenne Datei und Zeile und einen konkreten Fix.
```

Abgelegt in `.claude/agents/` (Team) oder `~/.claude/agents/` (persönlich). Weitere Felder im Frontmatter: `disallowedTools`, `permissionMode`, `maxTurns`, `skills`, `memory` (eigenes Gedächtnis) und `isolation: worktree` (eigener Git-Worktree).

:::falle «Ändere nichts» im Prompt reicht nicht
Ein Review-Subagent mit allen Werkzeugen und der Anweisung «ändere nichts» kann trotzdem schreiben – eine Anweisung ist keine Grenze. Erst `tools: Read, Grep, Glob` nimmt ihm Write und Edit technisch weg. Gleiches gilt für die **`description`**: Sie entscheidet, wann Claude den Subagenten überhaupt einsetzt. Vage formuliert, bleibt er ungenutzt.
:::

:::gem Prüfen mit frischem Blick
Ein Subagent, der nur den Diff und die Kriterien sieht, nicht aber die Überlegungen, die zur Änderung geführt haben, bewertet unvoreingenommener. «Nutze einen Subagenten, um den Diff gegen `PLAN.md` zu prüfen: Sind alle Anforderungen umgesetzt und getestet? Melde nur Lücken, die die Korrektheit betreffen.» Der letzte Satz ist wichtig: Ein Prüfer, der Lücken finden soll, findet immer welche – sonst endet es in Überengineering.
:::

## Parallel arbeiten

| Weg | Wofür |
|---|---|
| **Git Worktrees** | mehrere CLI-Sessions in getrennten Arbeitsordnern, ohne Kollisionen |
| **Desktop-App** | mehrere Sessions visuell, optional je mit eigenem Worktree |
| **Writer/Reviewer** | Session A schreibt, Session B prüft mit frischem Kontext, A arbeitet das Feedback ein |
| **`/batch <Anweisung>`** | Claude verteilt eine grosse Änderung auf 5 bis 30 Subagenten, jeder im eigenen Worktree |
| **Agent Teams** | experimentell und standardmässig aus: mehrere Sessions mit gemeinsamer Aufgabenliste und Teamleitung |

:::berater Im Kundengespräch
«Warum wird Claude nach zwei Stunden schlechter?» ist eine der häufigsten Fragen. Die Antwort ist fast immer ein überfüllter Kontext. Die Empfehlung an Teams: eine Aufgabe pro Session, Recherche an Subagenten, nach Meilensteinen verdichten, bei Themenwechsel neu beginnen. Typischer Einwand: «Dann verliert Claude doch sein Wissen.» – Das dauerhafte Wissen steht in CLAUDE.md, Regeln und Skills. Der Gesprächsverlauf ist Arbeitsgedächtnis – und das räumt man auf.
:::

:::spickzettel
- Kontext = Gespräch + Dateien + Ausgaben + Startdateien · **voll = schlechter**
- **`/context`** zuerst · `/clear` zwischen Themen · **`/compact <Fokus>`** an Meilensteinen
- Teilweise verdichten: **Esc Esc → Summarize from/up to here**
- `/btw` für Nebenfragen
- **Subagent = eigener Kontext**, liefert nur das Ergebnis
- Eingebaut: **Explore**, **Plan** (nur lesend), **general-purpose**
- Eigene in `.claude/agents/`: **`tools` begrenzen**, präzise **`description`**
- Parallel: Worktrees, Writer/Reviewer, `/batch`
:::

:::selbstcheck 3
