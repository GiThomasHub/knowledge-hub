---
title: LLMs fürs Management erklären – und AI-Washing erkennen
level: L4
summary: Ein Fünf-Minuten-Briefing ohne Fachjargon – was ein Sprachmodell leistet, wo es versagt, wie man es sinnvoll einsetzt – und die Prüffragen, mit denen man übertriebene KI-Versprechen von Anbietern entlarvt.
competencies: [ki-kig-06]
volatility: mittel
last_verified: 2026-11-27
sources:
  - https://www.sec.gov/newsroom/press-releases/2024-36 (SEC-Verfahren wegen AI-Washing, 18.03.2024)
  - Machine_Learning_Masterclass.docx (A3 – Stolperfalle «Wir setzen AI ein»)
  - KI-Engineering-Masterclass.docx (B.7 – Evaluation als Profi-Merkmal)
  - Skill evals-observability, references/grundlagen.md (Messen statt raten; geprüft 27.11.2026)
  - Skill ai-security-privacy, references/schweiz.md (Datenfrage Schweiz; geprüft 27.11.2026)
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Management-Briefing LLM in fünf Minuten: was es ist (Sprachvorhersage auf riesigen Textmengen, sehr fähiger, aber unzuverlässiger Assistent), Stärken (Texte verstehen, zusammenfassen, entwerfen, übersetzen, Informationen extrahieren, Code, Werkzeuge bedienen), Schwächen (Halluzination, Wissensstichtag, Rechnen, keine Verantwortung, Datenschutz), Einsatzmuster (Mensch prüft, Entwurf statt Entscheid, messen), Kosten pro Token; AI-Washing: falsche oder übertriebene Behauptungen über KI-Einsatz, SEC-Verfahren gegen Delphia und Global Predictions 2024 (zusammen 400 000 USD); Prüffragen an Anbieter: welche Technik konkret, welches Modell, wo laufen Daten, wie gemessen, Fehlerquote, was passiert bei Fehlern, Demo mit eigenen Daten, Mensch im Ablauf; revDSG"
---

:::tldr
Ein Management braucht keine Technik, sondern ein **zutreffendes Bild**: Ein Sprachmodell ist ein **sehr fähiger, aber unzuverlässiger Assistent für Sprache** – stark beim Verstehen, Zusammenfassen, Entwerfen und Herausziehen von Informationen, schwach bei Fakten ohne Quelle, Aktualität, Rechnen und Verantwortung. Daraus folgt das Einsatzmuster: **Entwurf statt Entscheid, Mensch oder Programm prüft, Wirkung wird gemessen.** Und wer Anbieter bewertet, braucht ein Raster gegen **AI-Washing** – übertriebene oder falsche Behauptungen über den KI-Einsatz, für die Aufsichtsbehörden bereits Bussen verhängt haben.
:::

## Das Fünf-Minuten-Briefing

| Minute | Botschaft | In einem Satz |
|---|---|---|
| **1. Was es ist** | Ein Sprachmodell hat aus riesigen Textmengen gelernt, wie Sprache weitergeht. | «Es formuliert das Plausibelste – meist richtig, nicht immer.» |
| **2. Was es kann** | Texte verstehen, zusammenfassen, entwerfen, übersetzen, Daten aus Dokumenten herausziehen, Code schreiben, Werkzeuge bedienen. | «Überall, wo heute Menschen Text lesen und schreiben, kann es beschleunigen.» |
| **3. Wo es versagt** | Erfindet plausible Details, kennt Neues nicht, rechnet unzuverlässig, trägt keine Verantwortung. | «Es klingt immer sicher – auch wenn es falsch liegt.» |
| **4. Wie man es einsetzt** | Entwurf statt Entscheid, Quellen mitgeben, prüfen, wo Fehler teuer sind, Wirkung messen. | «Wir bauen Prüfungen dort ein, wo ein Fehler wehtut.» |
| **5. Was es kostet und braucht** | Kosten pro Nutzung statt Lizenz; Datenfrage klären; klein starten, messen, ausbauen. | «Ein Pilot mit klarer Messung in sechs Wochen, nicht ein Grossprojekt.» |

:::bildlich Der brillante Neue ohne Probezeitende
Ein Sprachmodell ist wie ein neuer Mitarbeiter, der **alles gelesen** hat, **sehr schnell** arbeitet und **nie müde** wird – der aber **niemals sagt, wenn er unsicher ist**, und dessen Probezeit **nie endet**. Man gibt ihm wertvolle Arbeit, aber man unterschreibt nichts ungeprüft, was er vorbereitet hat.
:::

## Ohne Fachjargon

| Statt … | … sag |
|---|---|
| «Das LLM halluziniert.» | «Es erfindet manchmal Details, die plausibel klingen.» |
| «Das Kontextfenster ist zu klein.» | «Es kann pro Auftrag nur eine bestimmte Menge lesen.» |
| «Wir machen RAG.» | «Es sucht in unseren Dokumenten und antwortet mit Quellenangabe.» |
| «Knowledge Cutoff Juni 2026.» | «Sein Wissen endet im Juni 2026; Neueres müssen wir ihm geben.» |
| «Wir brauchen Evals.» | «Wir messen an echten Fällen, wie oft es richtig liegt.» |

:::gem Konkrete Zahl statt Begeisterung
Ein Management überzeugt keine Demo, sondern eine Zahl aus dem eigenen Betrieb: «Bei 50 echten Kundenanfragen aus dem letzten Monat lag der Entwurf in 41 Fällen ohne Korrektur richtig, in 7 mit kleiner Korrektur, in 2 falsch – beide hat die Prüfung abgefangen. Zeitersparnis pro Anfrage: rund 6 Minuten.» Solche Zahlen entstehen aus einem kleinen Testset (Lektion [Prompts testen](#/l/prompting/prompts-testen)).
:::

## AI-Washing erkennen

**AI-Washing** bezeichnet Behauptungen über den KI-Einsatz, die **falsch oder irreführend** sind – analog zu Greenwashing. Es ist nicht nur ein Marketingproblem: Die US-Börsenaufsicht SEC hat am **18.03.2024** zwei Vermögensverwalter, Delphia und Global Predictions, wegen falscher Angaben zu ihrem KI-Einsatz gebüsst – zusammen mit **400 000 USD**. Global Predictions hatte unter anderem behauptet, «Expert AI-driven forecasts» zu liefern.

**Prüffragen an einen Anbieter:**

| Frage | Worauf achten |
|---|---|
| **Welche Technik genau?** Regeln, klassisches ML, eigenes Modell, Sprachmodell welches Anbieters? | Ausweichende Antworten («proprietäre KI») sind ein Warnzeichen |
| **Was macht die KI konkret** – und was Menschen oder feste Regeln? | Oft ist «KI» ein kleiner Teil eines manuellen Prozesses |
| **Wie wurde gemessen?** Auf welchen Daten, mit welcher Fehlerquote? | Keine Zahlen = keine Messung |
| **Was passiert bei Fehlern?** Wer merkt es, wer haftet? | Fehlende Antwort = fehlende Prüfung |
| **Wo laufen die Daten?** Welche Unterauftragnehmer, welches Land? | Für Personendaten Pflichtfrage unter dem revDSG |
| **Demo mit unseren Daten?** | Eine Demo nur mit Anbieterdaten zeigt den besten Fall |

:::falle Auch die eigene Firma kann AI-Washing betreiben
AI-Washing betrifft nicht nur Anbieter. Wenn das eigene Marketing «KI-gestützte Beratung» verspricht, wo ein Mitarbeiter gelegentlich einen Chat öffnet, entsteht dasselbe Risiko – gegenüber Kunden, Investoren und Aufsicht. Die Regel für die eigene Kommunikation: **konkret sagen, was die KI tut, was Menschen tun und wie geprüft wird.**
:::

:::berater Im Kundengespräch
Bewährter Ablauf für ein Management-Briefing: (1) Fünf-Minuten-Briefing mit **einem Beispiel aus dem eigenen Geschäft**, (2) **drei Anwendungsfälle** mit hohem Textanteil und überschaubarem Fehlerrisiko auswählen, (3) für einen davon einen **Piloten mit Messung** vorschlagen – Testset, Zielwert, Prüfschritt, Datenfrage geklärt. Typischer Einwand: «Die Konkurrenz ist schon viel weiter.» – Oft ist die Konkurrenz vor allem lauter. Die Prüffragen gegen AI-Washing helfen auch, deren Versprechen einzuordnen.
:::

:::spickzettel
- LLM = **sehr fähiger, aber unzuverlässiger Assistent für Sprache**
- Stark: **verstehen, zusammenfassen, entwerfen, extrahieren, Code, Werkzeuge**
- Schwach: **erfundene Details, Wissensstichtag, Rechnen, keine Verantwortung**
- Einsatz: **Entwurf statt Entscheid**, Quellen mitgeben, **prüfen, wo Fehler teuer sind**, **messen**
- Management überzeugt eine **Zahl aus dem eigenen Betrieb**, nicht eine Demo
- **AI-Washing** = falsche/irreführende KI-Behauptungen; SEC-Bussen **18.03.2024**, zusammen **400 000 USD**
- Prüffragen: **Technik? Was macht die KI? Gemessen wie? Fehler? Daten wo? Demo mit unseren Daten?**
- Auch das **eigene Marketing** prüfen
:::

:::selbstcheck 3
