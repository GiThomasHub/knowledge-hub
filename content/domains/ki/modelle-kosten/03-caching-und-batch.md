---
title: Prompt Caching und Batch – die zwei grossen Rabatte
level: L2
summary: Wann Prompt Caching und die Batch-Verarbeitung Kosten senken, welche Bedingungen gelten, wie man beide kombiniert und woran man sieht, dass sie wirklich greifen.
competencies: [ki-mod-03]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  - https://platform.claude.com/docs/en/build-with-claude/batch-processing
  - https://platform.claude.com/docs/en/models/opus-5-5/overview (Cache-Preise Opus 5.5, Mindestlänge 512 Tokens)
  - Skill llm-engineering, references/caching.md (Abschnitte 1, 4, 5, 6, 7; geprüft 27.11.2026)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Prompt Caching: unveränderter Prompt-Anfang (Werkzeuge → System → Nachrichten) wird zwischengespeichert; Schreiben 1,25× (5 Min.) bzw. 2× (1 Std.), Lesen 0,1× bzw. bei Opus 5.5 und Sonnet 5.5 0,05× des Eingabepreises; Mindestlänge je Modell (Opus 5.5: 512 Tokens), darunter still kein Caching; Treffer erst nach Beginn der ersten Antwort; pro Modell eigener Cache; Cache-Killer (Datum, IDs oben, vorne kürzen); Messung über cache_creation_input_tokens und cache_read_input_tokens; Batch: 50 % Rabatt auf Ein- und Ausgabe, asynchron, meist unter 1 Stunde, höchstens 24 Stunden, bis 100 000 Anfragen oder 256 MB, Ergebnisse 29 Tage; nicht für Echtzeit; Kombination mit Caching (Treffer im Batch nach bestem Bemühen, 1-Stunden-Cache empfohlen)"
---

:::tldr
Zwei Mechanismen senken die Kosten am stärksten, ohne die Qualität zu verändern. **Prompt Caching** speichert den **unveränderten Anfang** eines Prompts zwischen; Folgeaufrufe lesen ihn für **ein Zehntel oder weniger** des Eingabepreises. Es lohnt sich bereits ab **einer** Wiederverwendung – aber nur, wenn der Anfang **Zeichen für Zeichen gleich** bleibt. **Batch-Verarbeitung** gibt **50 % Rabatt** auf Ein- und Ausgabe für alles, was nicht sofort fertig sein muss; die meisten Batches sind in unter einer Stunde fertig, spätestens nach 24 Stunden. Beides lässt sich kombinieren.
:::

:::bildlich Vorgekochtes und Sammelbestellung
**Caching** ist wie eine Grossküche, die die Grundsauce einmal am Morgen kocht und dann für jedes Gericht nur noch den frischen Teil zubereitet – solange niemand das Rezept der Grundsauce ändert. **Batch** ist die Sammelbestellung beim Grosshändler: Du gibst alles auf einmal auf, bekommst es nicht sofort, aber zum halben Preis.
:::

## Prompt Caching

Wie es funktioniert, steht ausführlich in der Lektion [Kontext gestalten](#/l/prompting/kontext-gestalten). Hier zählt die Kostenseite.

**Preise relativ zum normalen Eingabepreis** (Stand 27.11.2026):

| Vorgang | Faktor | Beispiel Opus 5.5 (Eingabe 4 USD/MTok) |
|---|---|---|
| Cache schreiben, 5 Minuten | 1,25× | 5.00 USD/MTok |
| Cache schreiben, 1 Stunde | 2× | 8.00 USD/MTok |
| Cache lesen | 0,1× (bei Opus 5.5 und Sonnet 5.5 0,05×) | 0.20 USD/MTok |

**Bedingungen:**

- Der Anfang muss **bis zur Cache-Grenze identisch** sein, in der Reihenfolge Werkzeuge → System → Nachrichten.
- Unter einer **Mindestlänge** pro Modell wird **still nicht** gecacht (bei Opus 5.5: 512 Tokens).
- Ein Eintrag ist erst lesbar, **wenn die erste Antwort begonnen hat** – gleichzeitig abgeschickte Anfragen zahlen alle das Schreiben.
- Jedes **Modell hat seinen eigenen Cache**; ein Wechsel heisst neu schreiben.
- Die Lebensdauer verlängert sich bei jedem Treffer.

:::falle Caching eingeschaltet, aber nichts gespart
Der häufigste Befund in Kostenprüfungen: Caching ist «aktiv», aber die Trefferquote liegt bei null. Ursachen sind fast immer dieselben – **Datum, Uhrzeit oder Anfrage-ID im System-Prompt**, Suchergebnisse **vor** den festen Regeln, JSON mit wechselnder Schlüsselreihenfolge, ein Verlauf, der **vorne gekürzt** wird, oder ein Prompt unter der Mindestlänge. Prüfen lässt sich das an zwei Feldern jeder Antwort: `cache_creation_input_tokens` (geschrieben) und `cache_read_input_tokens` (gelesen). Stehen beide auf 0, wird nicht gecacht.
:::

**Wirkung am Beispiel** (Sonnet 5.5, 10 000 Anfragen pro Monat, je 18 000 Tokens gleiche Richtlinien + 2 000 Tokens Frage, 1 000 Tokens Antwort):

| | ohne Caching | mit Caching |
|---|---|---|
| Richtlinien (18 000 Tokens) | 0.036 USD | 0.0018 USD (Lesen zu 0.10 USD/MTok) |
| Frage (2 000 Tokens) | 0.004 USD | 0.004 USD |
| Antwort (1 000 Tokens) | 0.010 USD | 0.010 USD |
| **pro Anfrage** | **0.050 USD** | **≈ 0.016 USD** |
| **pro Monat** | **≈ 500 USD** | **≈ 160 USD** (plus wenige Schreibvorgänge) |

## Batch-Verarbeitung

| Merkmal | Wert (Stand 27.11.2026) |
|---|---|
| Rabatt | **50 %** auf Ein- und Ausgabe |
| Dauer | meist **unter 1 Stunde**, höchstens **24 Stunden**; danach verfällt der Rest (nicht verrechnet) |
| Umfang | bis **100 000 Anfragen** oder **256 MB** pro Batch |
| Ergebnisse | **29 Tage** abrufbar, Zuordnung über eine eigene ID pro Anfrage |
| Geeignet für | nächtliche Zusammenfassungen, Massen-Klassifikation, Evals, Nachverarbeitung, Berichte |
| Nicht geeignet für | alles, worauf ein Mensch wartet: Chat, Live-Assistent, Streaming |

:::gem Caching und Batch kombinieren
Die Rabatte addieren sich: Batch-Preise **plus** Cache-Faktoren. Weil Batches länger als fünf Minuten laufen können, empfiehlt die Doku für gemeinsame Präfixe den **1-Stunden-Cache**. Treffer innerhalb eines Batches sind allerdings nicht garantiert. Bewährt: erst **eine** Anfrage mit dem gemeinsamen Präfix schicken und abwarten, dann den Rest als Batch einreichen.
:::

## Weitere Kostenhebel

- **Weniger Kontext:** nur relevante Abschnitte mitschicken, alte Werkzeug-Ergebnisse kürzen.
- **Ausgabe begrenzen:** gewünschtes Format klar vorgeben, `max_tokens` pro Aufgabe, keine Wiederholung der Eingabe verlangen.
- **Vorfilter:** einfache Regeln oder ein kleines Modell entscheiden, ob ein teurer Aufruf überhaupt nötig ist.
- **Datenstandort mit Aufpreis:** Wer die Verarbeitung auf eine bestimmte Region festlegt, zahlt je nach Option einen Zuschlag (z. B. 1,1× für USA-only bei neueren Modellen) – nur wenn wirklich nötig.

:::berater Im Kundengespräch
Bei einer Kostenprüfung fragst du zuerst nach den **Trefferquoten des Caches** und danach, **welche Aufrufe nicht eilen**. Diese zwei Fragen decken in vielen Projekten mehr Einsparung auf als jede Modelldiskussion. Typischer Einwand: «Wir brauchen alles sofort.» – Meist stimmt das für die Antworten an Kunden, aber nicht für nächtliche Auswertungen, Testläufe und Nachbearbeitung. Dort sind 50 % ohne Qualitätsverlust zu holen.
:::

:::spickzettel
- **Caching**: Schreiben **1,25×** (5 Min.) / **2×** (1 Std.), Lesen **0,1×** bzw. **0,05×** (Opus/Sonnet 5.5)
- Lohnt ab **1 Wiederverwendung**; Anfang muss **identisch** sein
- **Mindestlänge** pro Modell (Opus 5.5: 512 Tokens), darunter still kein Caching
- Prüfen: **`cache_creation_input_tokens`** / **`cache_read_input_tokens`**
- Cache-Killer: **Datum/IDs oben**, Suchtreffer vor Regeln, **vorne kürzen**, Modellwechsel
- **Batch**: **−50 %**, meist < 1 Std., max. **24 Std.**, bis **100 000 Anfragen / 256 MB**, Ergebnisse 29 Tage
- Batch nur für **Nicht-Eiliges**; mit Caching kombinierbar (**1-Stunden-Cache**)
:::

:::selbstcheck 3
