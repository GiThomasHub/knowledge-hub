---
title: Befehle, Modi und Tastenkürzel
level: L1
summary: Die Slash-Befehle, die du wirklich brauchst, die sechs Rechte-Modi und wann welcher passt, die Tastenkürzel für Stoppen und Zurückspulen sowie Sessions fortsetzen.
competencies: [ki-cc-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/commands (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/permission-modes (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/best-practices (Abschnitte Manage your session, Rewind with checkpoints)
  - https://code.claude.com/docs/en/memory (Abschnitt /memory)
  - claude_code_masterclass (1).docx (Kapitel 3, Stand Mai 2026)
prompts: [mehr, beispiele, pruef-mich, was-ist-neu]
prompt_context: "Claude Code Slash-Befehle (/init, /clear, /compact, /context, /memory, /rewind, /btw, /resume, /model, /permissions, /status, /doctor, /usage), Rechte-Modi (Manual/default, acceptEdits, plan, auto, dontAsk, bypassPermissions), Shift+Tab, Esc, Esc Esc, Ctrl+G, @Datei, claude --continue/--resume"
---

:::tldr
Fünf Befehle tragen den Alltag: **`/init`** (Start-CLAUDE.md erzeugen), **`/clear`** (frischer Kontext), **`/compact`** (zusammenfassen), **`/context`** (was frisst Platz?) und **`/rewind`** (zurückspulen). Mit **Shift+Tab** wechselst du den Rechte-Modus, **Esc** stoppt Claude ohne Kontextverlust, **Esc Esc** öffnet das Zurückspulen. Und: Seit v2.1.283 startet Claude Code standardmässig im **Auto-Modus** – wer jede Aktion freigeben will, wählt **Manual** (Stand 27.11.2026).
:::

## Die wichtigsten Slash-Befehle

| Befehl | Was er tut | Wann |
|---|---|---|
| `/init` | untersucht das Projekt und schreibt eine erste `CLAUDE.md` | einmal pro Projekt, danach von Hand kürzen |
| `/clear` | neues Gespräch mit leerem Kontext; das alte bleibt über `/resume` erreichbar | zwischen Aufgaben, die nichts miteinander zu tun haben |
| `/compact [Fokus]` | fasst das bisherige Gespräch zusammen, um Platz zu schaffen | mitten in einer grossen Aufgabe, z. B. `/compact Fokus auf die API-Änderungen` |
| `/context` | zeigt, was wie viel vom Kontextfenster belegt und welche Anweisungsdateien geladen sind | wenn Claude «vergesslich» wird oder etwas nicht geladen scheint |
| `/memory` | listet CLAUDE.md-Dateien und Auto Memory, öffnet sie, schaltet Auto Memory ein und aus | wenn eine Regel nicht befolgt wird |
| `/rewind` | Gespräch und/oder Code auf einen früheren Checkpoint zurücksetzen | wenn ein Ansatz in die falsche Richtung ging |
| `/btw <Frage>` | Nebenfrage, deren Antwort **nicht** in den Verlauf kommt | kurze Nachfrage mitten in einer Aufgabe |
| `/resume` | früheres Gespräch auswählen und fortsetzen | nach einer Pause |
| `/model` | Modell wechseln | anderes Modell für eine Teilaufgabe |
| `/permissions` | Allow-, Ask- und Deny-Regeln ansehen und ändern | Rechte prüfen |
| `/status` | Version, Konto, geladene Settings-Quellen | Diagnose |
| `/doctor` | Installations- und Konfigurationsprüfung | wenn etwas nicht funktioniert |
| `/usage` | Token-Verbrauch und Plan-Kontingent | Kosten im Blick |

Mit `/` allein siehst du alle verfügbaren Befehle – inklusive der [[Skill|Skills]] deines Teams, die ebenfalls mit `/name` aufgerufen werden.

:::falle `/clear` und `/compact` verwechseln
`/clear` wirft den Gesprächsverlauf weg und beginnt neu – richtig, wenn die nächste Aufgabe nichts mit der letzten zu tun hat. `/compact` behält die Essenz als Zusammenfassung – richtig, wenn du mitten in **derselben** Aufgabe Platz brauchst. Wer mitten im Refactoring `/clear` tippt, muss danach alles neu erklären. Wer zwischen zwei Themen nur `/compact` macht, schleppt Ballast mit.
:::

## Die Rechte-Modi

Der Modus bestimmt, was Claude **ohne Rückfrage** tun darf (Stand 27.11.2026, Claude Code v2.1.283+):

| Modus (Konfigurationswert) | Ohne Rückfrage | Passt für |
|---|---|---|
| **Manual** (`default`) | nur Lesen | Einstieg, sensible Arbeit |
| `acceptEdits` | Lesen, Dateien bearbeiten, einfache Dateibefehle (`mkdir`, `mv`, `cp` …) | Code, den du danach im Diff prüfst |
| `plan` | Lesen (nichts ändern) | Codebasis verstehen, Plan erstellen |
| **`auto`** | alles, mit Hintergrundprüfung durch ein Klassifikator-Modell | lange Aufgaben, weniger Rückfragen |
| `dontAsk` | nur vorab erlaubte Werkzeuge; alles andere wird abgelehnt | gesperrte CI-Läufe und Skripte |
| `bypassPermissions` | alles | **nur** isolierte Container oder VMs |

- **Shift+Tab** wechselt im Terminal: von `auto` zu `default`, dann `default` → `acceptEdits` → `plan`. `bypassPermissions` erscheint nur, wenn die Session damit gestartet wurde; `dontAsk` gibt es nur per `--permission-mode dontAsk`.
- **Beim Start:** `claude --permission-mode plan`. **Dauerhaft:** `"permissions": { "defaultMode": "acceptEdits" }` in den Settings.
- **Deny-Regeln gelten in jedem Modus**, auch in `bypassPermissions`.

:::bildlich Die Leine
Die Modi sind verschieden lange **Leinen**. Manual: Du hältst die Leine kurz und gibst jeden Schritt frei. `acceptEdits`: Im Garten (deinen Dateien) darf er frei laufen, auf die Strasse (Befehle) nur mit dir. `plan`: Er darf nur schnuppern, nichts anfassen. `auto`: Lange Leine mit einem **Aufpasser**, der eingreift, wenn es gefährlich wird. `bypassPermissions`: keine Leine – nur in einem eingezäunten Gelände vertretbar.
:::

:::falle Auto-Modus ist ein Aufpasser, keine Mauer
Der Auto-Modus blockiert laut Doku standardmässig unter anderem `curl … | bash`, das Senden sensibler Daten nach aussen, Produktions-Deployments, Force-Push und `git reset --hard`. Alles andere läuft ohne deine Freigabe – auch ein Schritt, den eine präparierte Datei per [[Prompt Injection]] ausgelöst hat und den der Klassifikator nicht erkennt. Für sensible Arbeit: Manual oder `acceptEdits`, ergänzt durch Regeln und Sandbox (Lektion [Permissions](#/l/ai-security/permissions)).
:::

:::gem Ein Projekt kann sich nicht selbst «auto» geben
Steht `defaultMode: "auto"` oder `"bypassPermissions"` in der `.claude/settings.json` eines Repos, ignoriert Claude Code den Wert. Bei `bypassPermissions` startet die Session sogar im Modus Manual. So kann ein fremdes Repo sich nicht selbst mehr Rechte geben. Wer standardmässig im Auto-Modus starten will, setzt das in `~/.claude/settings.json`.
:::

## Tastenkürzel und Eingaben

| Eingabe | Wirkung |
|---|---|
| **Esc** | Claude sofort stoppen – der Kontext bleibt, du kannst umlenken |
| **Esc Esc** (oder `/rewind`) | Menü zum Zurückspulen: nur Gespräch, nur Code, beides oder «ab hier zusammenfassen» |
| **Shift+Tab** | Rechte-Modus wechseln |
| **Ctrl+G** | im Plan-Modus den Plan im Editor öffnen und direkt bearbeiten |
| `@datei` | Datei referenzieren – Claude liest sie vor der Antwort |
| Bild einfügen | Screenshot per Einfügen oder Drag & Drop mitgeben |

:::gem Checkpoints machen Mut zum Ausprobieren
Jeder Prompt erzeugt einen **Checkpoint**. Claude sichert Dateien, bevor es sie ändert. Statt jeden Schritt vorsichtig zu planen, kannst du sagen: «Probier den radikalen Ansatz» – und bei Misserfolg mit Esc Esc zurückspulen. Aber: Checkpoints erfassen nur Änderungen über Claudes Datei-Werkzeuge, **nicht** was ein Bash-Befehl tut, und ersetzen Git nicht.
:::

## Sessions fortsetzen

```bash
claude --continue        # letzte Session im aktuellen Ordner fortsetzen
claude --resume          # Session aus einer Liste wählen
```

In der Session benennt `/rename oauth-migration` das Gespräch, damit du es später findest. Gute Praxis: **eine Session pro Arbeitsstrang**, wie ein Branch.

:::berater Im Kundengespräch
Die Frage «Wie autonom soll Claude arbeiten?» ist keine Glaubensfrage, sondern eine Einstellung pro Situation. Empfehlung: Plan-Modus zum Verstehen, `acceptEdits` für die tägliche Arbeit mit Review im Diff, Auto-Modus für klar abgegrenzte Routineaufgaben, `bypassPermissions` nur im Container. Typischer Einwand: «Die vielen Rückfragen nerven.» – Dann nicht die Leine kappen, sondern sichere Befehle per Allow-Regel freigeben und die Sandbox einschalten.
:::

:::spickzettel
- Alltag: **`/init` · `/clear` · `/compact [Fokus]` · `/context` · `/rewind`**
- Diagnose: `/memory` · `/permissions` · `/status` · `/doctor` · `/usage`
- `/btw` = Nebenfrage ohne Kontextverbrauch
- Modi: **Manual (`default`)** · `acceptEdits` · `plan` · **`auto` (Standard seit v2.1.283)** · `dontAsk` · `bypassPermissions` (nur Container)
- **Shift+Tab** wechselt · Deny-Regeln gelten **immer**
- **Esc** stoppt · **Esc Esc** spult zurück · Checkpoints ≠ Git
- `claude --continue` / `--resume`, Sessions mit `/rename` benennen
:::

:::selbstcheck 3
