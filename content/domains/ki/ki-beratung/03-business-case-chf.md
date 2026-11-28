---
title: Der Business Case in CHF – mit Annahmen, Szenarien und Messgrössen
level: L3
summary: Wie du für einen KI-Use-Case einen ehrlichen Business Case in Franken rechnest – Nutzen, einmalige und laufende Kosten, Szenarien statt Punktschätzung, sichtbare Annahmen und Metriken, an denen der Erfolg später gemessen wird.
competencies: [ki-ber-03]
volatility: mittel
last_verified: 2026-11-28
sources:
  - claude_financial_services_masterclass (1).docx (Kapitel 11.3 – ROI-Kalkulation, Template für Business Case; Kapitel 9.5 – klare Metriken)
  - https://claude.com/pricing (Lizenzpreise, Stand 28.11.2026; im Beispiel gerundet als Annahme)
  - Skill llm-engineering, references/model-and-effort.md (Kosten-Nutzen-Regel; geprüft 27.11.2026)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Business Case: Nutzen = Personen × gesparte Stunden pro Woche × Nutzungsquote × Arbeitswochen × interner Stundensatz (Vollkosten); plus Qualitätsgewinn, weniger Fehler, schnellere Durchlaufzeit, wo messbar; Kosten einmalig (Projekt, Schulung, Governance) und laufend (Lizenzen oder Tokens, interne Betreuung); Beispiel 25 Personen, 44 Wochen, CHF 90/h, Lizenz CHF 25 pro Person und Monat (Annahme): pessimistisch 0,5 h × 40 % → Nutzen CHF 19 800, Jahr 1 −38 100; Basis 1,5 h × 60 % → CHF 89 100, Jahr 1 +31 200, Folgejahr +60 000, Amortisation ≈ 6 Monate; optimistisch 3 h × 80 % → CHF 237 600; Kosten einmalig CHF 28 800 (Projekt 15 000, Schulung 25×4 h, Governance 40 h × 120), laufend Lizenzen 7 500 und Betreuung 21 600; gesparte Zeit ist nur Wert, wenn sie umgenutzt wird; Messgrössen vorher erheben (Basislinie): Zeit pro Fall, Durchlaufzeit, Fehlerquote, Nutzungsquote, Zufriedenheit; Annahmen offen ausweisen und nach Pilot nachführen"
---

:::tldr
Ein guter [[Business Case]] ist **keine schöne Zahl**, sondern eine **nachvollziehbare Rechnung mit sichtbaren Annahmen**. Der Nutzen ergibt sich meist aus **gesparter Arbeitszeit** (Personen × Stunden × **tatsächliche Nutzung** × interner Stundensatz), ergänzt um Qualität und Tempo, wo sie messbar sind. Dem stehen **einmalige** Kosten (Projekt, Schulung, Governance) und **laufende** Kosten (Lizenzen oder Tokens, interne Betreuung) gegenüber. Statt einer Punktschätzung rechnet man **drei Szenarien** – und legt **vor dem Start** fest, welche Messgrössen den Erfolg später belegen.
:::

:::bildlich Der Wetterbericht
Ein seriöser Wetterbericht sagt nicht «morgen 22 Grad», sondern «18 bis 24 Grad, 30 % Regenrisiko». Ein Business Case mit einer einzigen Zahl wirkt präzise, ist aber nur eine Behauptung. Drei Szenarien zeigen, **wovon** der Erfolg abhängt – und wo man ihn beeinflussen kann.
:::

## Die Bausteine

| Baustein | Formel oder Inhalt |
|---|---|
| **Nutzen Zeit** | Personen × gesparte Stunden pro Woche × **Nutzungsquote** × Arbeitswochen × Stundensatz (Vollkosten) |
| **Nutzen Qualität und Tempo** | weniger Fehler, kürzere Durchlaufzeit, mehr Offerten – nur wenn messbar |
| **Einmalige Kosten** | Projekt und Einrichtung, Schulung (auch die Zeit der Teilnehmenden), Governance und Datenschutzklärung |
| **Laufende Kosten** | Lizenzen oder Tokens, interne Betreuung (Champions, Pflege von Projekten und Skills), Überwachung |

## Ein durchgerechnetes Beispiel

Ein Treuhandbüro führt Claude für **25 Mitarbeitende** ein: Briefe, Protokolle, Zusammenfassungen. Annahmen: **44 Arbeitswochen**, interner Stundensatz **CHF 90** (Vollkosten), Lizenz **CHF 25 pro Person und Monat** (gerundete Annahme, Preise prüfen).

| Kosten | Betrag |
|---|---|
| Einmalig: Projektbegleitung extern | CHF 15 000 |
| Einmalig: Schulung 25 Personen × 4 h × CHF 90 | CHF 9 000 |
| Einmalig: Governance und Datenschutz 40 h × CHF 120 | CHF 4 800 |
| **Einmalig total** | **CHF 28 800** |
| Laufend: Lizenzen 25 × CHF 25 × 12 | CHF 7 500 pro Jahr |
| Laufend: interne Betreuung 20 h pro Monat × CHF 90 | CHF 21 600 pro Jahr |

| Szenario | Gespart pro Person und Woche | Nutzungsquote | Stunden pro Jahr | Nutzen | Ergebnis Jahr 1 | Ergebnis Folgejahr |
|---|---|---|---|---|---|---|
| **Pessimistisch** | 0,5 h | 40 % | 220 | CHF 19 800 | **CHF −38 100** | CHF −9 300 |
| **Basis** | 1,5 h | 60 % | 990 | CHF 89 100 | **CHF +31 200** | CHF +60 000 |
| **Optimistisch** | 3 h | 80 % | 2 640 | CHF 237 600 | **CHF +179 700** | CHF +208 500 |

Im Basisszenario amortisieren sich die einmaligen Kosten nach **rund sechs Monaten**. Das pessimistische Szenario zeigt aber, dass der Business Case **nicht von der Lizenz abhängt**, sondern von der **Nutzung**: Wenn nur wenige Personen Claude regelmässig einsetzen, bleibt das Vorhaben im Minus. Die wichtigste Stellschraube ist darum der **Change** (Lektion [Change und Erfolgsmessung](#/l/ki-beratung/change-und-erfolgsmessung)), nicht der Preis.

:::falle Gesparte Zeit ist noch kein gespartes Geld
Eine Stunde, die eine Mitarbeiterin dank KI spart, ist nur dann CHF 90 wert, wenn sie **sinnvoll umgenutzt** wird – für mehr Mandate, bessere Beratung oder weniger Überstunden. Sonst verpufft sie. Ein ehrlicher Business Case sagt, **wohin** die gewonnene Zeit fliesst, und rechnet nicht mit eingesparten Stellen, die niemand abbauen will.
:::

## Messgrössen festlegen – vor dem Start

| Ebene | Messgrösse | Wie erheben |
|---|---|---|
| **Nutzung** | aktive Nutzende pro Woche, Nutzungsquote | Admin-Auswertung |
| **Effizienz** | Zeit pro Fall, Durchlaufzeit | Stichprobe **vorher** und **nachher** |
| **Qualität** | Fehlerquote, Nacharbeit, Beanstandungen | Stichprobe, Testset |
| **Zufriedenheit** | Mitarbeitende, Kundschaft | kurze Umfrage |
| **Wirtschaftlich** | Nutzen minus Kosten | aus den Messungen oben |

Entscheidend ist die **Basislinie**: Wer vor der Einführung nicht misst, wie lange ein Protokoll heute dauert, kann den Nutzen später nur behaupten.

:::gem Annahmen als eigene Tabelle
Alle Annahmen – Stundensatz, Nutzungsquote, gesparte Zeit, Lizenzpreis, Wechselkurs – gehören in eine **eigene, sichtbare Tabelle** mit Quelle oder Begründung. Nach dem Pilot werden sie durch **gemessene Werte ersetzt**. So wird aus dem Business Case ein lebendes Steuerungsinstrument statt eines Dokuments für die Schublade.
:::

:::berater Im Kundengespräch
Die Geschäftsleitung fragt fast immer: «Was bringt es?» Die beste Antwort ist eine **Bandbreite mit Hebel**: «Im Basisszenario rund CHF 60 000 pro Jahr netto, im schlechtesten Fall ein Verlust – und der Unterschied liegt fast nur daran, ob die Leute es nutzen. Deshalb schlagen wir einen Pilot mit Messung vor und investieren in Schulung und Champions.» Bei API-Projekten kommen statt Lizenzen die **Tokenkosten** dazu (Lektion [Kostenschätzung in CHF](#/l/modelle-kosten/kostenschaetzung-chf)).
:::

:::spickzettel
- Nutzen ≈ **Personen × Stunden × Nutzungsquote × Wochen × Stundensatz**
- Kosten: **einmalig** (Projekt, Schulung, Governance) + **laufend** (Lizenzen/Tokens, Betreuung)
- **Drei Szenarien** statt einer Zahl; Amortisation ausweisen
- Grösster Hebel: **Nutzung**, nicht der Preis
- **Gesparte Zeit ≠ gespartes Geld** – sagen, wohin sie fliesst
- Messgrössen **vor dem Start**: Nutzung, Zeit pro Fall, Qualität, Zufriedenheit; **Basislinie** erheben
- **Annahmen sichtbar** und nach dem Pilot durch Messwerte ersetzen
:::

:::selbstcheck 3
