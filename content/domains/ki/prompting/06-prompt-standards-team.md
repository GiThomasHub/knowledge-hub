---
title: Prompt-Standards und Prompt-Bibliothek fürs Team
level: L4
summary: Wie du für ein Team oder einen Kunden Prompt-Standards, eine versionierte Prompt-Bibliothek und einen Freigabeprozess aufbaust – vom Chat-Prompt der Fachabteilung bis zum Produktions-Prompt im Code.
competencies: [ki-prm-06]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill llm-engineering, references/prompting.md (Abschnitte 1, 6–8; geprüft 27.11.2026)
  - Skill llm-engineering, references/context-and-prompt-layout.md (Abschnitt 6 – ein Tag-Vokabular, eine Funktion, Snapshot-Test; geprüft 27.11.2026)
  - Skill evals-observability, references/grundlagen.md (Suite als versioniertes Artefakt; geprüft 27.11.2026)
  - ai_agent_masterclass (2).docx (11.2 – System-Prompt-Vorlage; 11.3 – Skills)
  - KI-Engineering-Masterclass.docx (C.4.2 – DSPy)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Prompt-Governance im Team: zwei Welten (Arbeits-Prompts der Fachabteilung vs. Produktions-Prompts im Code); Vorlage mit Rolle/Kontext/Aufgabe/Einschränkungen/Format/Beispielen/Testfällen; Prompt-Bibliothek versioniert im Git, Besitzer, Changelog; Freigabe per PR mit Testset; ein Tag-Vokabular, eine Build-Funktion, Snapshot-Test; Skills und Projekt-Anweisungen als Verteilweg; keine Kunden- oder Personendaten in Beispielen; Veralten (Sampling-Parameter, Prefill); DSPy"
---

:::tldr
In Teams entstehen Prompts überall: im Chat, in Notizen, im Code. Ohne Standard schreibt jede Person ihren eigenen, niemand weiss, welcher gilt, und Verbesserungen gehen verloren. Ein tragfähiges Setup hat vier Teile: eine **Vorlage** (die fünf Hebel plus Beispiele und Testfälle), eine **versionierte Bibliothek** mit Besitzerin je Prompt, einen **Freigabeprozess** (Änderung nur mit Testset-Ergebnis) und **Verteilwege**, die zu den Werkzeugen passen – Skills und Projekt-Anweisungen für die Fachabteilung, Code mit Snapshot-Tests für Produktions-Prompts.
:::

:::bildlich Vorlagen-Ordner einer Treuhandfirma
In einer guten Treuhandfirma schreibt niemand eine Mahnung von Grund auf neu. Es gibt **Musterbriefe** im gemeinsamen Ordner, jede Vorlage hat eine verantwortliche Person, Änderungen werden kurz geprüft, und alte Versionen fliegen raus. Eine Prompt-Bibliothek ist genau das – nur dass man die Wirkung einer Änderung **messen** kann.
:::

## Zwei Welten, zwei Regeln

| | Arbeits-Prompts (Fachabteilung) | Produktions-Prompts (im Code) |
|---|---|---|
| Wer nutzt sie | Menschen im Chat, in Claude-Projekten, in Claude Code | eine Anwendung, oft tausendfach pro Tag |
| Fehlerfolge | ein schlechtes Ergebnis, das ein Mensch sieht | stille Fehler in vielen Datensätzen |
| Ablage | geteilte Bibliothek, Skills, Projekt-Anweisungen | Git-Repository, neben dem Code |
| Freigabe | Besitzerin prüft, kurzer Test | Pull Request mit Testset-Ergebnis und Review |
| Format der Antwort | Text, Markdown | per Schema erzwungen |

Wer beide gleich behandelt, macht entweder die Fachabteilung mit Bürokratie langsam oder die Anwendung mit Chat-Prompts unzuverlässig.

## Die Vorlage

```markdown
# Prompt: Vertragszusammenfassung für die GL          (Version 1.3)
Besitzerin: Team Legal Ops · Modell: siehe config · Zuletzt getestet: 27.11.2026

## Zweck
Wofür, für wen, was passiert mit dem Ergebnis.

## Prompt
<rolle> … </rolle>
<kontext> … </kontext>
<aufgabe> … </aufgabe>
<einschraenkungen> … (inkl. «nicht gefunden» erlaubt) </einschraenkungen>
<ausgabeformat> … </ausgabeformat>
<examples> 1–3 verschiedene Beispiele, eines davon negativ </examples>

## Testfälle
Verweis auf tests/vertrag/*.yaml (≠ Beispiele oben), Erfolgskriterien, letzte Quote.

## Änderungen
1.3 – Haftungsgrenze mit Fundstelle verlangt (nur neu: 5, nur alt: 0 von 30)
```

:::gem Der Zweck steht vor dem Prompt
Die wichtigste Zeile der Vorlage ist nicht der Prompt, sondern der **Zweck**. Wer in einem Jahr den Prompt anpassen muss, versteht ohne Zweck nicht, warum eine seltsam wirkende Einschränkung da ist – und löscht genau die Zeile, die einen teuren Fehler verhindert hat.
:::

## Bibliothek und Freigabe

- **Ablage im Git:** Produktions-Prompts als Dateien neben dem Code (z. B. `prompts/vertrag_gl.md`), Testfälle in `tests/`. Jede Änderung ist nachvollziehbar und lässt sich zurückdrehen.
- **Eine Funktion baut den Prompt:** ein gemeinsames Tag-Vokabular und **ein** Modul, das Prompts zusammensetzt. Ein **Snapshot-Test** hält den fertigen Prompt fest; jede Abweichung im stabilen Teil fällt im Diff auf – auch ein Bruch des Prompt Caches.
- **Freigabe per Pull Request:** Die Beschreibung enthält das Testset-Ergebnis im gepaarten Vergleich («nur neu: 5, nur alt: 0 von 30») und die Kategorien, die sich verschlechtert haben. Ohne Messung kein Merge.
- **Besitzerin je Prompt:** Eine Person ist verantwortlich, beantwortet Fragen und entscheidet über Änderungen.
- **Konfiguration getrennt:** Modell, Aufwandsstufe und Limits stehen in einer Konfigurationsdatei, nicht im Prompt-Text.

:::falle Beispiele aus echten Kundendaten
Die besten Few-Shot-Beispiele stammen aus echten Fällen – und genau darin stecken Namen, Adressen, Vertragsbeträge. Landen sie in der Prompt-Bibliothek, verteilt sich Kundendatenschutz plötzlich über jedes Projekt, jeden Chat und jedes Repository. Unter dem revDSG und bei Berufsgeheimnissen ist das heikel. Darum: Beispiele **anonymisieren oder erfinden**, bevor sie in die Bibliothek kommen, und das in der Vorlage als Pflichtschritt festhalten.
:::

## Verteilen, wo gearbeitet wird

| Werkzeug | Verteilweg |
|---|---|
| Claude-App (Chat) | Projekt-Anweisungen und Projektwissen; wiederkehrende Abläufe als **Skill** |
| Claude Code | CLAUDE.md für Projektregeln, **Skills** für Abläufe, Slash-Befehle |
| Eigene Anwendung | Prompt-Dateien im Repository, über die Build-Funktion geladen |

Ein Skill bündelt Anweisungen, Beispiele und Hilfsdateien und wird automatisch geladen, wenn die Aufgabe passt – damit wird eine gute Vorlage zum Standard, ohne dass jemand sie kopieren muss. Mehr dazu im Thema [Skills und Plugins](#/t/skills-plugins).

## Pflege: Prompts veralten

Prompts altern mit den Modellen. Einige Beispiele (Stand 27.11.2026):

- **Sampling-Parameter** wie `temperature=0` «für Determinismus» führen in der Claude-API-Version 2026-10-21 zu einem Fehler. Verlässlichkeit kommt aus Schemas, Validatoren und Tests.
- **Vorausgefüllte Antworten** (Prefill) zum Erzwingen eines Formats werden von den neuesten Modellen abgelehnt – stattdessen strukturierte Ausgaben.
- **Manuelle Denkbudgets** sind bei aktuellen Modellen durch adaptives Denken mit Aufwandsstufe ersetzt; «Denke Schritt für Schritt»-Gerüste helfen dann selten.
- **Lange Superlativ-Rollen** («der weltbeste …») bringen messbar wenig.

Darum: Bei jedem **Modellwechsel** das Testset laufen lassen und die Bibliothek nach veralteten Mustern durchsuchen. Werkzeuge wie **DSPy** gehen noch weiter: Man beschreibt Ein- und Ausgabe plus Beispiele, und ein Optimierer sucht den besten Prompt – sinnvoll bei vielen Aufrufen und gutem Testset.

:::berater Im Kundengespräch
Ein typischer Auftrag: «Unsere Leute nutzen KI, aber jeder anders – bringt Ordnung rein.» Ein bewährter Ablauf: (1) die **zehn häufigsten Aufgaben** sammeln und vorhandene Prompts einsammeln, (2) pro Aufgabe die beste Variante mit einem **kleinen Testset** bestimmen, (3) in die **Vorlage** überführen, Beispiele anonymisieren, Besitzerin bestimmen, (4) über **Skills oder Projekt-Anweisungen** verteilen, (5) vierteljährlich und bei Modellwechseln prüfen. Typischer Einwand: «Das ist doch Overhead.» – Der Overhead ist eine Seite pro Prompt; dafür arbeitet die ganze Abteilung auf dem Niveau der besten Person.
:::

:::spickzettel
- **Zwei Welten**: Arbeits-Prompts (leichtgewichtig) vs. Produktions-Prompts (Git, Tests, PR)
- **Vorlage**: Zweck · Prompt (5 Hebel + Beispiele) · Testfälle · Änderungen · Besitzerin · Version
- **Zweck zuerst** – erklärt später jede Einschränkung
- Produktions-Prompts: **Git**, **eine Build-Funktion**, **Snapshot-Test**, Freigabe nur mit **gepaartem Testset-Ergebnis**
- Modell/Aufwand in **Konfiguration**, nicht im Prompt
- Beispiele **anonymisieren** (revDSG, Berufsgeheimnis)
- Verteilen über **Projekt-Anweisungen, CLAUDE.md, Skills**
- Veraltet: `temperature`, Prefill, manuelle Denkbudgets, Superlativ-Rollen → bei **Modellwechsel** Testset laufen lassen
:::

:::selbstcheck 3
