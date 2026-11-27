---
title: Triggering und Trigger-Evals
level: L3
summary: Wie du erkennst, ob ein Skill zu selten oder zu oft auslöst, wie du das mit einem kleinen Testset misst und die Description gezielt verbesserst – plus Qualitäts-Evals mit und ohne Skill.
competencies: [ki-skp-04]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill evals-observability, references/skill-evals.md (Trigger-Evals, Qualitäts-Evals; geprüft 27.11.2026)
  - Skill ai-engineering-advisor, references/skills-plugins.md (Description, Overlap, Hidden gems; geprüft 27.11.2026)
  - https://code.claude.com/docs/en/skills
  - Skills_Masterclass_v2_1.docx (Kapitel zu Description und Testen)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Skill-Triggering: Undertriggering (Skill löst nicht aus) vs. Overtriggering (löst bei falschen Anfragen aus), Ursachen in der Description; Trigger-Eval mit 8–15 Soll- und 8–15 Nicht-Soll-Anfragen (Nachbarfälle), mehrere Durchläufe, headless claude -p mit stream-json, Skill-Aufruf im Ereignisstrom zählen; Recall ≥ 0,8, Fehlauslösung ≤ 0,1; in der echten Umgebung mit allen installierten Skills testen; einfache Einschritt-Anfragen lösen keinen Skill aus; Qualitäts-Evals mit und ohne Skill; skill-creator mit Description-Optimierung"
---

:::tldr
Ein Skill kann auf zwei Arten versagen: Er **löst nicht aus** (Undertriggering) oder er löst **bei den falschen Anfragen** aus (Overtriggering). Beides liegt fast immer an der **Description**. Statt zu raten, misst du es mit einem **Trigger-Testset**: 8–15 Anfragen, bei denen der Skill laden **soll**, und 8–15, bei denen er es **nicht soll** – vor allem Nachbarfälle anderer Skills. Ziel: mindestens **80 %** Auslösung bei den Soll-Fällen und höchstens **10 %** Fehlauslösung. Getrennt davon prüfst du mit **Qualitäts-Evals**, ob der Skill das Ergebnis überhaupt verbessert.
:::

:::bildlich Der Türsteher
Die Description ist ein **Türsteher**. Ist er zu streng, kommen die richtigen Gäste nicht rein (Undertriggering): «Offerte» steht auf der Liste, aber der Gast sagt «Kostenvoranschlag». Ist er zu locker, lässt er alle rein (Overtriggering): Jede Frage mit dem Wort «Kosten» landet beim Offerten-Skill. Einen Türsteher schult man nicht mit Bauchgefühl, sondern mit einer Liste: Diese Gäste rein, diese nicht.
:::

## Die zwei Fehlerbilder

| | Undertriggering | Overtriggering |
|---|---|---|
| Symptom | Skill wird nie oder selten benutzt | Skill mischt sich in fremde Aufgaben ein |
| Typische Ursache | Description zu knapp, nur Fachbegriffe, keine «Use when …»-Auslöser | Description zu breit («hilft bei Dokumenten»), überlappt mit anderen Skills |
| Abhilfe | Auslöser ergänzen: Alltagssprache, Synonyme, Deutsch und Englisch | Abgrenzen: wofür **nicht**, welcher andere Skill dann zuständig ist |

Claude neigt eher zu **Undertriggering**. Eine gute Description ist deshalb eher ausführlich und «drängend» als zurückhaltend.

:::falle Zu einfache Testanfragen
«Lies diese Datei» oder «Was ist 2+2?» lösen **keinen** Skill aus, egal wie gut die Description ist – solche Einschritt-Aufgaben erledigt Claude direkt. Wer mit solchen Anfragen testet, hält einen funktionierenden Skill für kaputt. Testanfragen müssen **echte, substanzielle** Aufgaben sein, wie sie Nutzerinnen tatsächlich stellen.
:::

## Ein Trigger-Eval bauen

1. **Soll-Anfragen** (8–15): realistisch formuliert, kurz und lang, mit und ohne Fachbegriff, Deutsch und Englisch. «Was würde eine Lohnbuchhaltung für 12 Mitarbeitende kosten?» statt nur «Erstelle eine Offerte».
2. **Nicht-Soll-Anfragen** (8–15): vor allem **Nachbarfälle**, die zu einem anderen Skill gehören. «Prüfe diese Rechnung auf MWST-Fehler» gehört nicht zum Offerten-Skill.
3. **Mehrfach laufen lassen:** jede Anfrage mehrmals, weil das Verhalten streut.
4. **Messen:** In Claude Code headless (`claude -p … --output-format stream-json --verbose`) laufen lassen und im Ereignisstrom zählen, ob ein `Skill`-Aufruf mit dem Namen auftaucht. Mit `--max-turns` klein halten, um Kosten zu begrenzen.
5. **Auswerten:**
   - **Recall** = Anteil der Soll-Fälle, in denen der Skill lädt → Ziel **≥ 0,8**
   - **Fehlauslösung** = Anteil der Nicht-Soll-Fälle, in denen er lädt → Ziel **≤ 0,1**
   - Ergebnisse **pro Anfrage** ansehen, nicht nur den Durchschnitt.

```json
{
  "skill": "offerte-erstellen",
  "should_trigger": [
    "Was würde eine Lohnbuchhaltung für 12 Mitarbeitende im Jahr kosten?",
    "Kannst du mir ein Angebot für die Steuererklärung einer GmbH machen?",
    "Need a quote for monthly bookkeeping, small Zurich company"
  ],
  "should_not_trigger": [
    "Prüfe diese Rechnung auf MWST-Fehler.",
    "Erkläre mir den Unterschied zwischen Einzelfirma und GmbH.",
    "Fasse dieses Mandatsprotokoll zusammen."
  ]
}
```

:::gem In der echten Umgebung testen
Ob ein Skill auslöst, hängt auch davon ab, **was sonst installiert ist**: andere Plugins, aus claude.ai synchronisierte Skills, alte Einzelkopien eines Skills, der inzwischen in einem Plugin steckt. Ein Skill, der allein perfekt auslöst, kann neben einem überlappenden Konkurrenten unberechenbar werden. Darum dort testen, wo der Skill wirklich läuft – und Doppelte deaktivieren.
:::

## Die Description verbessern

- **Fehlende Auslöser** aus den Soll-Fällen übernehmen, die nicht ausgelöst haben – in den Worten der Nutzer.
- **Abgrenzung** ergänzen, wenn Nicht-Soll-Fälle auslösen: «Nicht für Rechnungsprüfung – dafür ist `mwst-pruefung` zuständig.»
- **Wichtigstes nach vorne**, weil lange Descriptions abgeschnitten werden.
- **Überfitting vermeiden:** Wer die Description auf genau die Testanfragen zuschneidet, misst sich selbst. Einige Anfragen als **Hold-out** zurückhalten. Anthropics `skill-creator` enthält eine automatische Description-Optimierung mit Aufteilung in Trainings- und Testanfragen.

## Qualitäts-Evals: bringt der Skill überhaupt etwas?

Auslösen ist nur die halbe Miete. Der zweite Test: **3–10 typische Aufgaben**, je **mit und ohne Skill** ausgeführt, mit klaren Prüfpunkten («Tabelle mit CHF-Beträgen», «MWST separat ausgewiesen», «keine erfundenen Tarife»). Bringt der Skill keinen messbaren Vorteil, ist er Ballast. Nach jeder Änderung an `SKILL.md` oder den Referenzen erneut laufen lassen.

:::berater Im Kundengespräch
«Wir haben 30 Skills, aber niemand weiss, welche funktionieren» ist ein häufiger Befund. Ein Trigger-Eval pro Skill ist in einer Stunde gebaut und beantwortet zwei Fragen: Lädt er, wenn er soll? Stört er, wenn er nicht soll? Zusammen mit einem kleinen Qualitäts-Eval entsteht so eine Liste mit drei Spalten: **behalten, schärfen, entfernen**.
:::

:::spickzettel
- **Undertriggering**: lädt nicht → Auslöser ergänzen (Alltagssprache, Synonyme, DE/EN)
- **Overtriggering**: lädt falsch → abgrenzen, Zuständigkeit anderer Skills nennen
- Claude neigt zu **Undertriggering** → Description eher «drängend»
- Testset: **8–15 Soll** + **8–15 Nicht-Soll** (Nachbarfälle), mehrfach laufen lassen
- Ziel: **Recall ≥ 0,8**, **Fehlauslösung ≤ 0,1**, pro Anfrage auswerten
- Einschritt-Anfragen lösen **nie** aus → substanzielle Testanfragen
- In der **echten Umgebung** mit allen installierten Skills testen
- **Qualitäts-Eval** mit und ohne Skill; Hold-out gegen Überfitting
:::

:::selbstcheck 3
