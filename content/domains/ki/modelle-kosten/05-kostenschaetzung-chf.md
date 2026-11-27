---
title: Kostenschätzung in CHF mit Szenarien – und Abo oder API?
level: L4
summary: Schritt für Schritt eine Kostenschätzung für einen Kunden erstellen – Mengengerüst, Rechnung pro Anwendungsfall, Szenarien, Puffer, Hebel – und begründet entscheiden, wann Abos und wann die API passen.
competencies: [ki-mod-05]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://platform.claude.com/docs/en/models/opus-5-5/overview (Preise, Cache-Preise)
  - https://platform.claude.com/docs/en/build-with-claude/batch-processing (Batch −50 %)
  - https://support.claude.com/en/articles/11049741 (Max-Plan 100 USD pro Monat)
  - https://coworker.ai/blog/claude-code-pricing (Planübersicht Pro, Max, Team, Enterprise – Sekundärquelle, Stand November 2026)
  - https://tradingeconomics.com/switzerland/currency/news/601255 (USD/CHF um 0.84, Mitte November 2026)
  - https://www.estv.admin.ch (MWST-Normalsatz 8,1 %)
  - Skill llm-engineering, references/model-and-effort.md (Abschnitt 7 – Kosten-Nutzen-Regel; geprüft 27.11.2026)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Kostenschätzung LLM in CHF: Mengengerüst je Anwendungsfall (Anzahl pro Monat, Eingabe-/Ausgabe-Tokens, gecachter Anteil, Modell, Batch ja/nein), Rechnung pro Fall in USD, Umrechnung zum Kurs (Mitte Nov. 2026 ≈ 0.84) mit Währungspuffer, Zuschlag für Wiederholungen, Tests und Entwicklung, Szenarien tief/basis/hoch, MWST 8,1 % je nach Abrechnungsweg; Hebel: Modellstufe, Aufwand, Caching, Batch, Kontext kürzen, Kaskade; Betriebs- und Entwicklungskosten oft grösser als Tokenkosten; Abo vs. API: Abos (Pro 20 USD, Max 100/200 USD, Team pro Sitz, Enterprise Sitz + Nutzung zu API-Preisen) für Menschen in Apps und Claude Code, API für eigene Anwendungen und Automatisierung; Messung nach dem Start"
---

:::tldr
Eine gute Kostenschätzung ist **kein einzelner Betrag**, sondern ein nachvollziehbares **Mengengerüst** pro Anwendungsfall, daraus drei **Szenarien** (tief, basis, hoch), ein **Puffer** für Wiederholungen, Tests und Währung, und eine Liste der **Hebel**, mit denen sich die Kosten senken lassen. Fast immer zeigt sich dabei: Die **Tokenkosten** sind kleiner als erwartet – die **Entwicklung, Pflege und Prüfung** kosten mehr. Und die Frage **Abo oder API** hängt davon ab, **wer** das Modell nutzt: Menschen in den Claude-Apps und in Claude Code → Abo; eigene Anwendungen und automatisierte Abläufe → API.
:::

:::bildlich Die Offerte des Elektrikers
Ein guter Elektriker offeriert nicht «etwa 5000 Franken», sondern listet Material und Stunden pro Raum auf, nennt, was teurer werden kann (alte Leitungen), rechnet eine Reserve ein und schlägt Varianten vor. Genau so sieht eine glaubwürdige KI-Kostenschätzung aus: **Positionen, Annahmen, Reserve, Varianten.**
:::

## Schritt 1: Mengengerüst pro Anwendungsfall

Beispiel: Ein Treuhandbüro mit 15 Mitarbeitenden plant drei automatisierte Anwendungen. Preise und Kurs Stand 27.11.2026.

| Anwendungsfall | pro Monat | Modell | Eingabe-Tokens | davon gecacht | Ausgabe-Tokens | Batch |
|---|---|---|---|---|---|---|
| **A** Mails einordnen | 3 000 | Haiku 5.5 | 1 500 | – | 50 | nein |
| **B** Antwortentwürfe | 1 200 | Sonnet 5.5 | 14 500 | 12 000 | 1 500 (inkl. Denken) | nein |
| **C** Monatsberichte | 20 | Opus 5.5 | 80 000 | – | 6 000 | **ja** |

## Schritt 2: Rechnen

| Fall | Rechnung pro Monat (USD, Preise pro Million Tokens) | USD |
|---|---|---|
| **A** | 3 000 × (1 500 × 0.10 + 50 × 0.50) / 1 000 000 | 0.53 |
| **B** | 1 200 × (12 000 × 0.10 [Cache lesen] + 2 500 × 2 + 1 500 × 10) / 1 000 000 | 25.44 |
| **C** | 20 × (80 000 × 4 + 6 000 × 20) / 1 000 000 × 0.5 [Batch] | 4.40 |
| **Total** | | **≈ 30.40** |

Zum Kurs von rund **0.84 CHF pro USD** (Mitte November 2026) sind das etwa **CHF 26 pro Monat** – für drei produktive Anwendungen.

## Schritt 3: Szenarien und Puffer

| Szenario | Annahme | USD/Monat | CHF/Monat (Kurs 0.84) |
|---|---|---|---|
| **tief** | halbe Mengen | ≈ 15 | ≈ 13 |
| **basis** | Mengengerüst oben | ≈ 30 | ≈ 26 |
| **hoch** | doppelte Mengen **und** Entwürfe mit Opus 5.5 statt Sonnet 5.5 | ≈ 112 | ≈ 94 |

Dazu kommen:

- **Zuschlag 20–30 %** für Wiederholungen, Tests, Evals und Entwicklungsläufe.
- **Währungspuffer:** mit einem vorsichtigeren Kurs rechnen (z. B. 0.90), weil die Preise in USD gelten.
- **MWST:** 8,1 % je nach Abrechnungsweg – auf der Rechnung oder als Bezugsteuer bei Leistungen aus dem Ausland. Mit der Treuhand klären.

:::falle Nur die Tokens offerieren
Im Beispiel kosten die Tokens rund CHF 26 pro Monat. Die **Entwicklung** (Prompts, Schema, Anbindung ans Mailsystem, Tests), der **Betrieb** (Überwachung, Fehlerfälle, Modellwechsel) und die **menschliche Prüfung** der Entwürfe kosten ein Vielfaches davon. Eine Schätzung, die nur die API-Rechnung zeigt, wirkt günstig und ist irreführend. Eine ehrliche Offerte weist **einmalige Kosten**, **laufende Betriebskosten** und **Tokenkosten** getrennt aus.
:::

## Schritt 4: Hebel benennen

| Hebel | Wirkung im Beispiel |
|---|---|
| **Caching** der Wissensbasis bei B | ohne Caching wären es ≈ 53 USD statt ≈ 25 USD |
| **Batch** bei C | halbiert die Berichtskosten |
| **Modellstufe** | Opus statt Sonnet bei B verdoppelt ungefähr diesen Posten |
| **Aufwand** | weniger Denk-Tokens bei B, falls ein Vergleich gleiche Qualität zeigt |
| **Kontext kürzen** | nur relevante Richtlinien statt der ganzen Sammlung |
| **Kaskade** | nur unsichere Mails an ein grösseres Modell |

## Abo oder API?

| | Abo (Claude-Apps, Claude Code) | API |
|---|---|---|
| Wer nutzt es | **Menschen** im Chat, in Cowork, in Claude Code | **eigene Anwendungen**, Automatisierung, Integration |
| Abrechnung | fester Betrag pro Person und Monat, mit Nutzungslimits | pro Token, ohne Obergrenze ausser dem eigenen Limit |
| Planbarkeit | hoch | abhängig von Menge – darum Szenarien und Budgetgrenze |
| Preise (Stand Nov. 2026, vor Offerte prüfen) | Pro 20 USD/Monat; Max-Pläne 100 bzw. 200 USD; Team pro Sitz (Standard 25 USD, Premium 125 USD monatlich); Enterprise Sitz plus Nutzung zu API-Preisen | siehe Preistabellen |

**Faustregeln:**

- **Menschen, die täglich mit Claude arbeiten** → Abo; bei Teams mit zentraler Verwaltung ein Team- oder Enterprise-Plan.
- **Intensive Claude-Code-Nutzung** → ein höherer Plan ist oft günstiger als dieselbe Nutzung über die API; der Plan teilt sich das Nutzungslimit zwischen Chat und Claude Code.
- **Eigene Anwendungen, Automatisierung, Batch-Verarbeitung** → API, mit Budgetgrenze und Ausgabenlimit.
- **Beides kombinieren** ist normal: Abos für die Mitarbeitenden, API für die Pipelines.

:::gem Nach dem Start messen, nicht weiter schätzen
Die beste Schätzung ist nach vier Wochen Betrieb überholt – im Guten wie im Schlechten. Darum gehört in jede Offerte ein **Messpunkt**: Nach einem Monat werden die tatsächlichen Tokens pro Fall, die Cache-Trefferquote und die Wiederholungsquote ausgewertet und die Schätzung angepasst. Das schafft Vertrauen und zeigt, wo die Hebel wirklich liegen.
:::

:::berater Im Kundengespräch
Ein bewährter Aufbau für die Kostenfolie: (1) **Mengengerüst** mit den Annahmen des Kunden, (2) **drei Szenarien** in CHF, (3) **einmalige und laufende Kosten** getrennt, (4) **Hebel** mit Wirkung, (5) **Messpunkt** nach einem Monat. Typischer Einwand: «Was, wenn die Preise steigen?» – Die Preise pro Token sind in den letzten Jahren bei gleicher Leistung meist gesunken, aber Garantien gibt es keine. Das hohe Szenario und die Budgetgrenze decken das Risiko ab.
:::

:::spickzettel
- **Mengengerüst** pro Anwendungsfall: Anzahl · Ein-/Ausgabe-Tokens · Cache-Anteil · Modell · Batch
- Rechnen in USD, umrechnen in CHF (Mitte Nov. 2026 ≈ **0.84**), **Währungspuffer**
- **Szenarien tief/basis/hoch**, Zuschlag **20–30 %** für Wiederholungen und Tests, **MWST 8,1 %** klären
- Tokenkosten oft **klein** – Entwicklung, Betrieb, Prüfung **getrennt** ausweisen
- Hebel: **Caching, Batch, Modellstufe, Aufwand, Kontext, Kaskade**
- **Abo** für Menschen (Apps, Claude Code) · **API** für eigene Anwendungen und Automatisierung · Kombination normal
- **Messpunkt** nach einem Monat
:::

:::selbstcheck 3
