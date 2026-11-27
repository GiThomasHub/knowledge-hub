---
title: Prompts testen statt raten
level: L3
summary: Wie du mit einem kleinen Testset aus echten Eingaben misst, ob eine Prompt-Änderung wirklich hilft – Erfolgskriterien, Prüfer, gepaarter Vergleich, Streuung und typische Messfehler.
competencies: [ki-prm-05]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill evals-observability, references/grundlagen.md (Begriffe, Statistik, Fahrplan, Fallen; geprüft 27.11.2026)
  - Skill llm-engineering, references/prompting.md (Abschnitt 8 – Checkliste, 10–30 echte Eingaben; geprüft 27.11.2026)
  - https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
  - https://platform.claude.com/docs/en/test-and-evaluate/define-success
  - KI-Engineering-Masterclass.docx (C.6 – promptfoo, DeepEval)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Prompt-Evaluation im Kleinen: Erfolgskriterien vorab, Testset 10–50 echte Eingaben inkl. Grenz- und Negativfälle, Referenzlösung; Grader Code zuerst, dann LLM-as-Judge mit Rubrik, Mensch zur Kalibrierung; gepaarter Vergleich alt vs. neu auf denselben Fällen; Streuung, mehrere Durchläufe, Konfidenzintervall; Beispiele im Prompt ≠ Testfälle; Ergebnisse pro Kategorie; promptfoo; Snapshot-Test des Prompts"
---

:::tldr
Ob ein Prompt besser geworden ist, merkt man nicht an drei Versuchen im Chat. Man misst es: **Erfolgskriterien vorab festlegen**, ein **kleines Testset aus 20–50 echten Eingaben** (inklusive Grenz- und Negativfällen), **alten und neuen Prompt auf denselben Fällen** laufen lassen und **automatisch bewerten** – Code-Prüfungen zuerst, ein Modell als Prüfer für den Rest. Kleine Unterschiede sind bei kleinen Testsets oft Zufall; entscheidend ist, wie viele Fälle **nur** die neue Version löst.
:::

:::bildlich Die Probefahrt mit festen Strecken
Ein Garagist, der eine Reparatur prüft, fährt nicht «ein bisschen herum». Er fährt **immer dieselben Strecken**: Kopfsteinpflaster, Autobahn, steile Einfahrt. Nur so sieht er, ob das Klappern wirklich weg ist – und ob dafür nicht die Bremse quietscht. Ein Testset ist diese feste Teststrecke für deinen Prompt.
:::

## In fünf Schritten zur Messung

1. **Erfolgskriterien festlegen** – bevor du den Prompt änderst. Konkret und prüfbar: «Kategorie stimmt mit der Referenz überein», «nennt Kündigungsfrist und Fundstelle», «höchstens 120 Wörter», «sagt ‹nicht gefunden›, wenn die Info fehlt».
2. **Testset bauen** – 20–50 echte Eingaben, am besten aus **realen Fehlern**, Support-Fällen und Grenzfällen. Ausgewogen: Fälle, in denen etwas passieren soll, **und** Fälle, in denen es nicht passieren soll. Wo möglich mit Referenzlösung.
3. **Prüfer wählen** – so einfach wie möglich (siehe unten).
4. **Gepaart vergleichen** – alte und neue Version auf **denselben** Fällen; zählen, was nur A, nur B oder beide lösen.
5. **Transkripte lesen** – die schlechtesten Antworten anschauen. Zahlen zeigen, *dass* etwas schiefgeht, die Antworten zeigen *warum*.

## Prüfer: so einfach wie möglich

| Prüfer | Gut für | Schwäche |
|---|---|---|
| **Code** (Vergleich, Regex, Schema, Wortzahl) | Kategorien, Zahlen, Format, Länge | gültige Varianten («CHF 12.50» vs. «12.50 Fr.») → vorher normalisieren |
| **Modell als Prüfer** ([[LLM-as-Judge]]) mit Rubrik | Ton, Vollständigkeit, «nennt X» | nicht deterministisch, kostet; braucht klare Rubrik und die Option «unbekannt» |
| **Mensch** | Kalibrierung, heikle Fälle | skaliert nicht |

Faustregel: **Code zuerst**, Modell-Prüfer für das, was Code nicht kann, Menschen, um den Modell-Prüfer an 20–30 Fällen zu eichen.

## Wie viel ist «besser»?

Bei kleinen Testsets schwanken die Quoten stark. Bei 20 Fällen und einer Erfolgsquote um 70 % liegt das 95-%-Vertrauensintervall bei etwa **±19 Prozentpunkten**, bei 50 Fällen bei etwa ±12. «Neu 75 %, alt 70 %» auf 20 Fällen ist also kein Beleg.

Aussagekräftiger ist der **gepaarte Vergleich**:

| | Neu löst | Neu löst nicht |
|---|---|---|
| **Alt löst** | 12 (beide) | 1 (nur alt) |
| **Alt löst nicht** | 6 (nur neu) | 1 (keiner) |

Sechs Fälle «nur neu» gegen einen «nur alt» ist ein deutliches Signal. Drei gegen zwei wäre Zufall. Weil Modelle streuen, lohnen sich bei wichtigen Entscheiden **mehrere Durchläufe pro Fall** – das ersetzt aber nicht mehr Fälle.

:::falle Das Testset im Prompt
Wer die Testfälle gleichzeitig als Few-Shot-Beispiele in den Prompt packt, misst nur, ob das Modell abschreiben kann: perfekte Quote im Test, schwach im Betrieb. **Beispiele im Prompt und Testfälle sind verschiedene Mengen.** Ebenso gefährlich: nur «soll»-Fälle – dann kippt das Verhalten unbemerkt ins Gegenteil (der Bot sagt plötzlich bei allem «nicht gefunden»).
:::

:::gem Ergebnisse pro Kategorie ausweisen
Ein Durchschnitt versteckt Rückschritte. Der neue Prompt kann insgesamt 4 Punkte besser sein und gleichzeitig bei Rechnungsfragen 15 Punkte schlechter. Testfälle deshalb mit Kategorien versehen und das Ergebnis **pro Kategorie** zeigen.
:::

## Werkzeuge

- **Ein kleines Skript** reicht für den Anfang: Testfälle als YAML oder CSV, eine Schleife über alle Fälle, Prüfer als Funktion, Ergebnis als Tabelle.
- **promptfoo** vergleicht Prompts und Modelle per Konfigurationsdatei und eignet sich als Prüfung in der CI; **DeepEval** ist eine Art «pytest für LLMs».
- **Snapshot-Test des Prompts:** Den zusammengesetzten Prompt als Datei festhalten. Ändert sich der stabile Teil unbeabsichtigt, fällt es im Diff auf – und damit auch ein Cache-Bruch (Lektion [Kontext gestalten](#/l/prompting/kontext-gestalten)).

Mehr zu Evals, Prüfern und Statistik im Thema [Evals und Observability](#/t/evals).

:::berater Im Kundengespräch
«Der neue Prompt fühlt sich besser an» ist kein Abnahmekriterium. Die Gegenfrage: «Auf welchen Fällen?» Ein Testset aus 30 echten Fällen ist in einem halben Tag gebaut und beantwortet bei jeder späteren Änderung – neuer Prompt, neues Modell, neue Version – die Frage «besser oder schlechter?» in Minuten. Typischer Einwand: «Dafür haben wir keine Zeit.» – Die Zeit fehlt später doppelt, wenn eine «Verbesserung» unbemerkt andere Fälle kaputt macht.
:::

:::spickzettel
- **Erfolgskriterien vorab**, konkret und prüfbar
- **Testset 20–50 echte Fälle**: reale Fehler, Grenzfälle, **soll und soll nicht**, mit Referenz
- Prüfer: **Code zuerst**, dann **LLM-as-Judge** mit Rubrik, **Mensch** zum Eichen
- **Gepaart vergleichen**: «nur alt» vs. «nur neu» auf denselben Fällen
- 20 Fälle ≈ ±19 pp Unsicherheit → kleine Unterschiede sind Zufall
- **Beispiele im Prompt ≠ Testfälle**; Ergebnisse **pro Kategorie**
- Transkripte lesen; promptfoo/DeepEval oder eigenes Skript; Snapshot des Prompts
:::

:::selbstcheck 3
