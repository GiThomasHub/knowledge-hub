---
title: Use Cases bewerten – Nutzen, Machbarkeit, Daten und Risiko
level: L2
summary: Wie du aus einer langen Wunschliste die richtigen KI-Use-Cases auswählst – mit vier Kriterien, einem einfachen Punkteraster, typischen Mustern guter Use Cases und Ausschlussgründen.
competencies: [ki-ber-02]
volatility: tief
last_verified: 2026-11-28
sources:
  - claude_financial_services_masterclass (1).docx (Kapitel 9 – Erfolgsfaktoren, Stufe 1 erster Use Case; Kapitel 11.3 – ROI-Kalkulation)
  - Machine_Learning_Masterclass.docx (Teil I – Problem definieren, reicht eine feste Regel?)
  - Skill ai-security-privacy, references/schweiz.md (Datenfrage Schweiz; geprüft 27.11.2026)
  - Skill evals-observability, SKILL.md (Erfolgskriterien festlegen; geprüft 27.11.2026)
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Use-Case-Bewertung nach vier Kriterien je 1–5: Nutzen (Zeit, Qualität, Umsatz, Risiko; Häufigkeit × Zeit pro Fall), Machbarkeit (Aufgabe passt zu LLM-Stärken, Fehler erkennbar, Integration), Datenlage (Daten zugänglich, Qualität, Datenklasse erlaubt), Risiko (Folgen eines Fehlers, Regulierung, Reputation; hoch = schlecht, darum umgekehrt bewerten); Portfolio-Matrix Nutzen gegen Machbarkeit: Quick Wins, strategische Projekte, Lückenfüller, vermeiden; gute Muster: häufig, textlastig, Entwurf mit menschlicher Prüfung, klare Qualitätskriterien; Ausschluss: Fehler nicht erkennbar und folgenreich, verbotene Datenklasse, feste Regel reicht, kein Verantwortlicher; Ergebnis als Use-Case-Steckbrief"
---

:::tldr
Nicht jede gute Idee ist ein guter KI-Use-Case. Bewertet wird nach vier Kriterien: **Nutzen** (wie viel Zeit, Qualität oder Geld steht auf dem Spiel?), **Machbarkeit** (passt die Aufgabe zu den Stärken eines Sprachmodells, und lassen sich Fehler erkennen?), **Datenlage** (sind die nötigen Daten zugänglich, gut genug und dürfen sie genutzt werden?) und **Risiko** (was passiert, wenn das Ergebnis falsch ist?). Die besten ersten Use Cases sind **häufig**, **textlastig**, liefern einen **Entwurf, den ein Mensch prüft**, und haben **klare Qualitätskriterien**.
:::

:::bildlich Der Immobilienkauf
Eine Wohnung kauft man nicht nur wegen der schönen Aussicht (Nutzen). Man prüft auch, ob man sie finanzieren kann (Machbarkeit), ob die Unterlagen vollständig sind (Datenlage) und ob das Dach dicht ist (Risiko). Wer nur auf die Aussicht schaut, kauft die falsche Wohnung – und wer nur auf Risiken schaut, kauft nie.
:::

## Die vier Kriterien

| Kriterium | Leitfragen | Hoch (5) | Tief (1) |
|---|---|---|---|
| **Nutzen** | Wie oft? Wie lange pro Fall? Welche Qualität, welcher Umsatz, welches Risiko wird beeinflusst? | täglich, viele Personen, Stunden pro Woche | selten, wenige Minuten |
| **Machbarkeit** | Passt die Aufgabe zu einem Sprachmodell? Sind Fehler erkennbar? Wie aufwendig ist die Anbindung? | Texte entwerfen, zusammenfassen, einordnen; Ergebnis leicht prüfbar | exakte Berechnung, Fehler unsichtbar, viele Systeme |
| **Datenlage** | Sind die Daten zugänglich, aktuell, vollständig? Erlaubt die Datenklasse den Einsatz? | Dokumente digital, erlaubte Datenklasse | Papier, verstreut, besonders schützenswerte Daten ohne Klärung |
| **Risiko** (umgekehrt) | Was kostet ein Fehler? Regulierung? Reputation? | Entwurf intern, Mensch prüft | automatische Entscheidung mit Rechtsfolge |

Ein einfaches Raster: jedes Kriterium **1–5**, Risiko so bewertet, dass **5 = geringes Risiko**. Wichtiger als die Summe ist das Gespräch darüber – die Zahlen machen Annahmen sichtbar.

## Ein Beispiel: Treuhandbüro mit 40 Mitarbeitenden

| Use Case | Nutzen | Machbarkeit | Daten | Risiko (5 = gering) | Einschätzung |
|---|---|---|---|---|---|
| Entwürfe für Kundenbriefe und E-Mails | 4 | 5 | 4 | 4 | **Quick Win** |
| Protokolle aus Besprechungsnotizen | 3 | 5 | 4 | 5 | **Quick Win** |
| Belege aus PDFs in die Buchhaltung übernehmen | 5 | 3 | 3 | 3 | **strategisch**, mit Prüfregeln |
| Steuererklärungen automatisch einreichen | 5 | 2 | 3 | 1 | **vermeiden** (heute) |
| Rabatte nach fester Staffel berechnen | 2 | 5 | 5 | 5 | **keine KI nötig** – feste Regel |

## Das Portfolio

Die Bewertung ergibt ein Portfolio; zuerst kommen die [[Quick Win|Quick Wins]].

| | **Machbarkeit hoch** | **Machbarkeit tief** |
|---|---|---|
| **Nutzen hoch** | **Quick Wins** – zuerst | **Strategische Projekte** – planen |
| **Nutzen tief** | **Lückenfüller** – bei Gelegenheit | **Vermeiden** |

Quick Wins schaffen Vertrauen und Erfahrung, strategische Projekte den grossen Nutzen. Ein gutes Portfolio enthält **beides** – und Datenlage und Risiko entscheiden, ob ein Use Case überhaupt auf die Liste kommt.

:::falle Der Leuchtturm, der nie leuchtet
Viele Firmen starten mit dem ambitioniertesten Use Case («der Agent, der alle Kundenanfragen selbständig löst»), weil er die Geschäftsleitung begeistert. Nach Monaten scheitert er an Datenqualität, Integration oder Haftungsfragen – und das ganze KI-Vorhaben gilt als gescheitert. Besser: **ein Quick Win in Wochen** und das grosse Projekt mit den Erfahrungen daraus.
:::

## Ausschlussgründe

Ein Use Case kommt vorerst **nicht** in Frage, wenn:

- **Fehler nicht erkennbar und folgenreich** sind (niemand merkt einen falschen Wert, und er kostet viel),
- die **Datenklasse** den Einsatz nicht erlaubt und keine Lösung in Sicht ist,
- eine **feste Regel** die Aufgabe einfacher und zuverlässiger löst (Lektion [Regel, ML oder GenAI?](#/l/machine-learning/regel-ml-oder-genai)),
- es **keine verantwortliche Person** im Fachbereich gibt, die Ergebnisse beurteilt und den Use Case trägt.

:::gem Der Steckbrief
Jeder ausgewählte Use Case bekommt einen [[Use-Case-Steckbrief|Steckbrief]] auf einer Seite: Aufgabe, Nutzende, Häufigkeit und heutiger Aufwand, Datenquellen und Datenklasse, Erfolgskriterien (woran messen wir «gut»?), Risiken und Prüfschritt, verantwortliche Person. Der Steckbrief ist die Grundlage für Business Case, Testset und Freigabe – und verhindert, dass ein Projekt mit unklarem Ziel startet.
:::

:::berater Im Kundengespräch
In einem Workshop sammeln Fachleute oft 30 und mehr Ideen. Statt sie alle zu diskutieren: **zuerst die Ausschlussgründe** anwenden, dann die übrigen mit dem Raster bewerten und **zwei bis drei** auswählen – mindestens einen Quick Win. Und die Frage stellen, die oft vergessen wird: **«Wer im Fachbereich prüft die Ergebnisse, und wie viel Zeit hat diese Person dafür?»**
:::

:::spickzettel
- Vier Kriterien: **Nutzen · Machbarkeit · Datenlage · Risiko** (je 1–5, Risiko umgekehrt)
- Nutzen ≈ **Häufigkeit × Zeit pro Fall × Personen**
- Gute erste Use Cases: **häufig, textlastig, Entwurf mit menschlicher Prüfung, klare Qualitätskriterien**
- Portfolio: **Quick Wins** zuerst, **strategische Projekte** planen, Rest bei Gelegenheit oder vermeiden
- Ausschluss: **Fehler unsichtbar und teuer**, **verbotene Datenklasse**, **Regel reicht**, **kein Verantwortlicher**
- Ergebnis: **Steckbrief** auf einer Seite
:::

:::selbstcheck 3
