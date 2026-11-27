---
title: Das passende Modell pro Aufgabe – und max_tokens
level: L2
summary: Kleine, mittlere und grosse Modelle im Vergleich, welche Aufgabe auf welche Stufe gehört, wann man eskaliert und wie max_tokens Kosten begrenzt, ohne Antworten abzuschneiden.
competencies: [ki-mod-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://platform.claude.com/docs/en/models/opus-5-5/overview (Modellvergleich, Default effort)
  - Skill llm-engineering, references/model-and-effort.md (Abschnitt 2 – Routing-Matrix, Abschnitt 3 – Eskalationsregel, max_tokens; geprüft 27.11.2026)
  - Skill llm-engineering, references/effort-and-thinking.md (Beispiel C – Kundenmails sortieren; geprüft 27.11.2026)
  - ai_agent_masterclass (2).docx (Modellwahl im Agenten)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Modellstufen: klein/schnell (Haiku 5.5), mittel/ausgewogen (Sonnet 5.5), gross/tief (Opus 5.5), Spitze (Fable 5.2, nur mit Nachweis); Zuordnung: Klassifizieren, Routing, Extraktion, Umformatieren → klein; Zusammenfassen, Übersetzen → klein oder mittel; Entwerfen, normales Coding, Analyse → mittel; Review, Kritik, Debugging → mittel mit hohem Aufwand; Schlussurteil, Synthese widersprüchlicher Quellen, Planung → gross; Eskalationsregel: flaches Denken → erst Aufwand erhöhen, fehlendes Wissen/Urteilsvermögen → Modell wechseln; max_tokens pro Rolle, enthält Denk-Tokens, zu klein schneidet ab (stop_reason max_tokens); kleines Modell mit langem Prompt über 100 000 Tokens bei Haiku 5.5 × 5; Effort-Sweep auf echten Beispielen"
---

:::tldr
Nicht jede Aufgabe braucht das grösste Modell. **Klein** (Haiku 5.5) für Einordnen, Herausziehen und Umformatieren – schnell und sehr günstig. **Mittel** (Sonnet 5.5) als Arbeitspferd für Entwürfe, normales Coding und Analysen. **Gross** (Opus 5.5) für Planung, Schlussurteile und schwierige, lange Aufgaben, bei denen ein Fehler teuer ist. Die Faustregel beim Eskalieren: **Fehlt Gründlichkeit, erst den Aufwand erhöhen; fehlt Wissen oder Urteilsvermögen, das Modell wechseln.** Und `max_tokens` begrenzt die Ausgabe – inklusive Denken. Zu knapp gesetzt, schneidet es Antworten mitten im Satz ab.
:::

:::bildlich Die Kanzlei
In einer Anwaltskanzlei sortiert nicht die Partnerin die Post. Die **Sachbearbeitung** (klein) ordnet Eingänge zu und erfasst Daten. Die **Associates** (mittel) schreiben Entwürfe und Analysen. Die **Partnerin** (gross) entscheidet die heiklen Fälle und unterschreibt das Gutachten. Wer alles der Partnerin gibt, zahlt Partnerinnen-Honorare für Postsortierung – und wartet länger.
:::

## Die Modellstufen (Stand 27.11.2026)

| Stufe | Modell | Preis USD/MTok (ein/aus) | Stärke |
|---|---|---|---|
| **klein** | Claude Haiku 5.5 | 0.10 / 0.50 (Prompt bis 100 000 Tokens) | am schnellsten, sehr günstig, hohe Mengen |
| **mittel** | Claude Sonnet 5.5 | 2 / 10 | beste Kombination aus Tempo und Können |
| **gross** | Claude Opus 5.5 | 4 / 20 | lange, anspruchsvolle Arbeit, Agenten, Planung |
| **Spitze** | Claude Fable 5.2 | 8 / 40 | schwierigste Fälle – nur mit Nachweis, nie als Standard |

## Welche Aufgabe auf welche Stufe

| Aufgabe | Stufe | Aufwand |
|---|---|---|
| Einordnen, Routing, Absicht erkennen | klein | tief |
| Daten herausziehen, Formular füllen, Umformatieren | klein | mittel; Schema erzwingen |
| Zusammenfassen, Übersetzen | klein (mittel, wenn Nuancen zählen) | mittel |
| Entwürfe, normales Coding, Analyse | **mittel** | mittel |
| Review, Kritik, Fehlersuche | mittel | **hoch** |
| Schlussurteil, Synthese widersprüchlicher Quellen | **gross** | hoch |
| Planung, mehrdeutige oder lange Agenten-Aufgaben | **gross** | hoch |

:::gem Erst den Aufwand drehen, dann das Modell
Scheitert eine Aufgabe, lohnt die Diagnose: Hat das Modell **zu oberflächlich** gearbeitet – einen Fall übersehen, eine Prüfung ausgelassen? Dann **eine Aufwandsstufe höher** (Lektion [Routing, Aufwand und Budget](#/l/modelle-kosten/routing-aufwand-budget)). Fehlt ihm **Wissen** oder **Urteilsvermögen**, oder verliert es bei langen Aufgaben den Faden? Dann **eine Modellstufe höher**. Und scheitert es am **Format** (Schemafehler), hilft weder das eine noch das andere, sondern ein erzwungenes Schema.
:::

## max_tokens: die Obergrenze der Ausgabe

`max_tokens` legt fest, wie viele Tokens das Modell **höchstens erzeugen** darf. Das schützt vor ausufernden Antworten und Kosten – aber:

- `max_tokens` **enthält die Denk-Tokens**. Hoher Aufwand mit kleinem Limit führt dazu, dass das Modell nach dem Denken keinen Platz mehr für die Antwort hat.
- Wird das Limit erreicht, endet die Antwort mit `stop_reason: "max_tokens"` – **mitten im Satz** oder mitten im JSON.
- Darum **pro Aufgabe** setzen: klein für Einordnen (die Antwort ist ein Wort), grosszügig für Entwürfe und Agenten-Schritte.

| Aufgabe | sinnvolle Grössenordnung |
|---|---|
| Kategorie zurückgeben | wenige hundert Tokens |
| Daten aus einem Dokument herausziehen | einige tausend |
| Brief oder Bericht entwerfen | einige tausend bis zehntausend, je nach Aufwand |
| Agenten-Schritt mit hohem Aufwand | grosszügig; Denk-Tokens einrechnen |

:::falle Kleines Modell, langer Prompt
Haiku 5.5 ist bis 100 000 Tokens Prompt sehr günstig – **darüber werden alle Preise verfünffacht**, und zwar für die ganze Anfrage. Ein Agent, der eine grosse Codebasis oder einen langen Verlauf mitschickt, rutscht unbemerkt über die Grenze. Dann kann ein kleines Modell plötzlich so viel kosten wie ein grösseres. Bei kleinen Modellen deshalb den Prompt kurz halten oder die Grenze bewusst in Kauf nehmen. Ausserdem: Neue Tokenizer zählen für denselben Text oft mehr Tokens – nach einem Modellwechsel neu zählen.
:::

## Mit Belegen entscheiden

Ob ein kleineres Modell reicht, entscheidet kein Bauchgefühl, sondern ein kurzer Vergleich:

1. **10–30 echte Eingaben** sammeln, inklusive schwieriger Fälle.
2. Jede mit zwei, drei Einstellungen laufen lassen (z. B. klein/mittel, mittel/mittel, mittel/hoch).
3. Mit einer einfachen Prüfung bewerten (Schema gültig, Feld stimmt, Rubrik).
4. Die **günstigste** Einstellung nehmen, die die Qualitätsschwelle mit etwas Reserve schafft – und Entscheid samt Datum festhalten.
5. Nach jedem **Modellwechsel** wiederholen, weil die Stufen pro Modell neu kalibriert sind.

:::berater Im Kundengespräch
«Wir nehmen einfach überall das beste Modell» ist bequem und meist der teuerste Fehler. Ein Beispiel aus dem Alltag einer Schreinerei: Eingehende Mails auf Deutsch, Französisch und Italienisch werden von Haiku 5.5 in «Offerte», «Reklamation» oder «Termin» eingeordnet – schnell und für Bruchteile eines Rappens pro Mail. Nur die Antwortentwürfe für Reklamationen schreibt Sonnet 5.5. Gleiche Qualität, ein Bruchteil der Kosten.
:::

:::spickzettel
- **klein (Haiku 5.5)**: einordnen, herausziehen, umformatieren · **mittel (Sonnet 5.5)**: entwerfen, coden, analysieren · **gross (Opus 5.5)**: planen, urteilen, lange Aufgaben
- **Spitze** nur mit Nachweis, nie als Standard
- Oberflächlich → **Aufwand +1** · fehlendes Wissen/Urteil → **Modell +1** · Formatfehler → **Schema**
- **`max_tokens`** pro Aufgabe; **enthält Denken**; zu klein → `stop_reason: max_tokens`, Antwort abgeschnitten
- Haiku 5.5: über **100 000 Tokens Prompt × 5**
- Nach Modellwechsel **Tokens neu zählen** und **neu vergleichen**
- Entscheid per **Vergleich auf 10–30 echten Eingaben**
:::

:::selbstcheck 3
