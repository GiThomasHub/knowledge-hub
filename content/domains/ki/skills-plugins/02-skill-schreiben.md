---
title: Einen guten Skill schreiben
level: L2
summary: Aufbau einer SKILL.md mit präziser Description, klarem Prozess, festem Output-Format und Fehlerbehandlung – plus die Frontmatter-Felder, die in Claude Code den Unterschied machen.
competencies: [ki-skp-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/skills
  - Skill ai-engineering-advisor, references/skills-plugins.md (Description, Hidden gems, Frontmatter; geprüft 27.11.2026)
  - Skills_Masterclass_v2_1.docx (Kapitel 2 – Anatomie eines Skills)
  - Masterclass_Claude_Skills_Plugins.docx (Kapitel 3 – Die SKILL.md im Detail)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "SKILL.md schreiben: Frontmatter name und description (was + wann, dritte Person, konkrete Trigger, auch Formulierungen ohne Fachbegriff), Body mit Prozess, Output-Format, Fehlerbehandlung, Begründungen statt GROSSBUCHSTABEN-Regeln; keine zeitabhängigen Fakten; einheitliche Begriffe; Frontmatter-Felder in Claude Code: when_to_use, disable-model-invocation, user-invocable, allowed-tools, context: fork, paths, arguments; Längengrenzen 1536 Zeichen (Claude Code), portabel name ≤ 64, description ≤ 1024; Speicherorte und Vorrang"
---

:::tldr
Eine `SKILL.md` hat zwei Teile: oben das **Frontmatter** mit `name` und `description`, darunter die **Anleitung**. Die **Description** ist das wichtigste Feld überhaupt – Claude sieht vor dem Laden **nur sie** und entscheidet daran, ob der Skill passt. Sie sagt **was** der Skill tut **und wann** er gebraucht wird, mit konkreten Auslöser-Formulierungen. Die Anleitung beschreibt **Prozess**, **Output-Format** und **Fehlerbehandlung** – und erklärt das **Warum**, statt Regeln in GROSSBUCHSTABEN zu stapeln.
:::

## Das Grundgerüst

```markdown
---
name: offerte-erstellen
description: Erstellt Offerten für Treuhand-Mandate nach der Firmenvorlage mit
  CHF-Beträgen, MWST 8.1 % und Zahlungsbedingungen. Use when the user asks for an
  Offerte, ein Angebot, einen Kostenvoranschlag oder «was würde das kosten» für
  Buchhaltung, Lohn oder Steuern – auch wenn das Wort Offerte nicht fällt.
---

# Offerte erstellen

## Ablauf
1. Mandatsart und Umfang klären (Buchhaltung, Lohn, Steuern). Fehlt der Umfang,
   eine Rückfrage stellen statt zu schätzen – falsche Annahmen landen sonst im Preis.
2. Stundensätze aus references/tarife.md nehmen, nicht aus dem Gedächtnis.
3. Beträge mit scripts/berechne.py rechnen (Rappenrundung, MWST getrennt).
4. Text nach assets/vorlage.md füllen.

## Output
Markdown mit den Abschnitten Ausgangslage, Leistungen, Preis (Tabelle), Bedingungen.

## Wenn etwas fehlt
- Tarif nicht gefunden: «Tarif fehlt – bitte ergänzen» im Preisfeld, nicht raten.
- Skript schlägt fehl: Fehler nennen, keine Beträge von Hand rechnen.
```

## Die Description: Visitenkarte und Türsteher

| Schwach | Stark |
|---|---|
| «Hilft bei Offerten.» | «Erstellt Offerten für Treuhand-Mandate nach Firmenvorlage … Use when the user asks for an Offerte, ein Angebot, einen Kostenvoranschlag …» |
| sagt nur **was** | sagt **was und wann** |
| nur der Fachbegriff | auch Formulierungen, die Nutzer wirklich verwenden |
| keine Abgrenzung | nennt, wann **dieser** Skill statt eines ähnlichen gilt |

Bewährtes Muster: **erster Satz = was**, **zweiter Satz = «Use when …» mit konkreten Auslösern**, in der dritten Person. Claude neigt eher dazu, Skills **zu selten** zu laden – die Description darf deshalb ruhig «drängend» sein und viele Auslöser nennen.

:::falle Längengrenzen sind je nach Ort verschieden
In **Claude Code** werden `description` und das Zusatzfeld `when_to_use` zusammen bei **1536 Zeichen** abgeschnitten (abgeschnitten, nicht abgelehnt). Für Skills, die auch in der Claude-App oder über die API laufen sollen, gilt als sichere Grundlinie: `name` höchstens 64 Zeichen (Kleinbuchstaben, Ziffern, Bindestriche, ohne «claude» und «anthropic»), `description` höchstens 1024 Zeichen ohne XML-Tags (Stand 27.11.2026). Wer die wichtigsten Auslöser ans Ende einer langen Description schreibt, verliert sie beim Abschneiden zuerst.
:::

## Der Body: Prozess, Format, Fehlerfälle

- **Prozess als nummerierte Schritte** – in der Reihenfolge, in der Claude arbeiten soll.
- **Output-Format** genau festlegen: Abschnitte, Tabellen, Dateiname. Bei wiederkehrender Form eine **Vorlage** in `assets/` mitliefern.
- **Fehlerbehandlung**: Was tun, wenn Daten fehlen, ein Skript scheitert, die Anfrage ausserhalb des Auftrags liegt?
- **Begründen statt brüllen:** «Nutze pdfplumber, weil es Tabellenstrukturen erhält» wirkt besser als «IMMER PDFPLUMBER». Mit Begründung kann das Modell auch Fälle richtig entscheiden, die du nicht vorhergesehen hast.
- **Wiederkehrende Arbeit in ein Skript:** Schreibt Claude bei jedem Lauf dasselbe Hilfsprogramm neu, gehört es einmal sauber nach `scripts/`.
- **Einheitliche Begriffe:** nicht einmal «Mandant», einmal «Kunde», einmal «Auftraggeber» – sonst wird das Modell unsicher.
- **Keine zeitabhängigen Fakten** im Skill (Versionen, Preise, «aktuell»): Sie veralten still. Entweder zur Laufzeit nachschlagen oder in einem klar markierten Block mit Datum halten.

:::bildlich Das Onboarding-Handbuch
Ein Skill ist das Handbuch, das du einer neuen, sehr fähigen Mitarbeiterin für **genau einen** Job gibst. Auf dem Umschlag (Description) steht, für welche Aufgaben sie es aufschlagen soll. Drinnen steht der Ablauf, wie das Ergebnis aussieht und was sie tut, wenn etwas fehlt. Ein Handbuch mit «IMMER!» und «NIE!» auf jeder Seite, aber ohne Begründung, macht sie unsicher statt kompetent.
:::

## Frontmatter-Felder in Claude Code

| Feld | Wirkung |
|---|---|
| `name` | Name und Befehl `/name`; ohne Angabe der Ordnername |
| `description` | entscheidet über das automatische Laden |
| `when_to_use` | zusätzliche Auslöser, zählt zur 1536-Zeichen-Grenze |
| `disable-model-invocation: true` | **nur du** kannst ihn auslösen (z. B. `/deploy`) |
| `user-invocable: false` | nicht im `/`-Menü, **nur Claude** lädt ihn |
| `allowed-tools` | gibt Werkzeuge für den auslösenden Durchgang vorab frei |
| `context: fork` | läuft als Subagent in eigenem Kontextfenster |
| `paths` | lädt nur automatisch, wenn an passenden Dateien gearbeitet wird |
| `arguments` | benannte Argumente für `$name` im Text |

:::gem Speicherorte und Vorrang
In Claude Code liegen persönliche Skills in `~/.claude/skills/<name>/SKILL.md`, Projekt-Skills in `.claude/skills/<name>/SKILL.md`, Plugin-Skills im Plugin unter `skills/`. Bei gleichem Namen gilt laut Doku: **Enterprise vor persönlich, persönlich vor Projekt**. Plugin-Skills haben einen Namensraum (`/plugin:skill`) und kollidieren nicht. Ein Skill hat Vorrang vor einer gleichnamigen alten Befehlsdatei in `.claude/commands/`. Manche ältere Anleitungen behaupten das Gegenteil (Projekt vor global) – das ist falsch.
:::

:::berater Im Kundengespräch
Wenn ein Team sagt «Unser Skill wird nie benutzt», liegt es fast immer an der **Description**, nicht am Inhalt. Lass dir die Description zeigen und frage: «Würde jemand, der diese Aufgabe hat, genau diese Worte verwenden?» Typischer Einwand: «Der Skill ist doch super geschrieben.» – Claude sieht vor dem Laden nur die Description. Der beste Inhalt nützt nichts, wenn die Tür zu bleibt.
:::

:::spickzettel
- `SKILL.md` = **Frontmatter** (`name`, `description`) + **Anleitung**
- **Description = was + wann**, dritte Person, konkrete Auslöser, auch ohne Fachbegriff
- Grenzen: Claude Code **1536 Zeichen** (description + when_to_use); portabel **name ≤ 64**, **description ≤ 1024**
- Body: **Prozess · Output-Format · Fehlerbehandlung**
- **Warum** erklären statt GROSSBUCHSTABEN; Wiederholtes in **`scripts/`**
- Einheitliche Begriffe, **keine zeitabhängigen Fakten**
- Felder: `disable-model-invocation`, `user-invocable`, `allowed-tools`, `context: fork`, `paths`
- Vorrang: **Enterprise > persönlich > Projekt**; Plugin-Skills mit Namensraum
:::

:::selbstcheck 3
