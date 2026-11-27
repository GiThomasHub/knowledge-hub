---
title: LLM-as-Judge kalibrieren und über mehrere Läufe messen
level: L3
summary: Wie ein Modell als Prüfer verlässlich wird – eine Dimension pro Urteil, Rubrik mit Ankern, «Unbekannt», Gegenmittel gegen Verzerrungen, Kalibrierung gegen Menschen – und wie man mit pass@k, pass^k und Konfidenzintervallen richtig liest.
competencies: [ki-evl-03]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill evals-observability, references/llm-judge.md (Regeln, Bias, Kalibrierung, Kosten; geprüft 27.11.2026)
  - Skill evals-observability, references/grundlagen.md (pass@k, pass^k, Wilson-Intervall, gepaarter Vergleich; geprüft 27.11.2026)
  - https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
  - https://arxiv.org/abs/2306.05685 (Zheng et al. 2023 – Judging LLM-as-a-Judge, Positions- und Längenbias)
  - https://arxiv.org/abs/2107.03374 (Chen et al. 2021 – pass@k-Schätzer)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "LLM-as-Judge: eine Dimension pro Aufruf, Rubrik mit Ankern oder binär, Ausweg «Unbekannt», erst Begründung dann Urteil als JSON, Referenz mitgeben, nur Nötiges zeigen; Verzerrungen: Position (Reihenfolge tauschen), Länge, Selbstbevorzugung (andere Modellfamilie/-stufe), Freundlichkeit; Kalibrierung: 30–100 Fälle blind von Fachperson, Übereinstimmung und Cohen's Kappa (> 0,6 brauchbar, > 0,8 gut), Uneinigkeiten lesen, bei Rubrik-/Modellwechsel wiederholen; Kosten: kleines Modell für binäre Fragen mit Referenz, Caching, Batch; mehrere Läufe k = 3–5: pass@k (mindestens einer) vs. pass^k (alle), Beispiel 75 % pro Lauf → pass^3 ≈ 42 %; Konfidenzintervall Wilson: n = 20 ±19 pp, n = 50 ±12 pp, n = 200 ±6 pp; gepaarter Vergleich (McNemar); mehrere Läufe ersetzen nicht mehr Aufgaben"
---

:::tldr
Wo Code nicht bewerten kann – Ton, Vollständigkeit, Begründung –, prüft ein **Modell als Prüfer** ([[LLM-as-Judge]]). Verlässlich wird es nur mit Disziplin: **eine Dimension pro Urteil**, eine **Rubrik mit klaren Ankern** (am besten bestanden/nicht bestanden), ein erlaubtes **«Unbekannt»**, eine **Referenzantwort**, und eine **Kalibrierung gegen Menschen**. Dazu kommt die Statistik: LLM-Ausgaben schwanken, darum **mehrere Läufe pro Aufgabe**. **pass@k** misst, ob mindestens einer von k gelingt, **pass^k**, ob alle gelingen – für Kundenkontakt zählt das zweite. Und bei kleinen Testsets ist ein Unterschied von ein paar Prozentpunkten oft Zufall.
:::

:::bildlich Der Prüfungsexperte
Eine gute Prüfungsexpertin bekommt ein **Bewertungsraster** mit Beispielen für «genügend» und «ungenügend», bewertet **ein Kriterium nach dem anderen**, darf «nicht beurteilbar» sagen, und ihre Noten werden zu Beginn mit denen erfahrener Kolleginnen **verglichen**. Ohne Raster und Abgleich wäre ihre Note eine Meinung. Mit beidem ist sie ein Messinstrument.
:::

## Regeln für einen verlässlichen Judge

1. **Eine Dimension pro Aufruf:** «korrekt», «vollständig», «Ton» getrennt bewerten. Ein Sammelurteil ist nicht nachvollziehbar.
2. **Rubrik mit Ankern:** Was heisst bestanden, was nicht – mit Beispielen. **Binär** ist stabiler als eine 1-bis-10-Skala.
3. **«Unbekannt» erlauben**, wenn die Information zum Urteil fehlt – sonst erfindet der Judge ein Urteil. Die «Unbekannt»-Quote überwachen.
4. **Erst begründen, dann urteilen**, Ausgabe als strukturiertes JSON.
5. **Referenz mitgeben:** «Stimmt die Antwort inhaltlich mit der Referenz überein?» ist viel stabiler als «Ist die Antwort gut?».
6. **Nur zeigen, was nötig ist:** keine Hinweise, welche Version neu ist.

```json
{"reasoning": "Nennt Frist und Fundstelle, beide stimmen mit der Referenz überein.", "verdict": "pass"}
```

## Bekannte Verzerrungen

| Verzerrung | Wirkung | Gegenmittel |
|---|---|---|
| **Position** | im Paarvergleich wird A oder B bevorzugt | jedes Paar zweimal mit getauschter Reihenfolge; nur konsistente Urteile zählen |
| **Länge** | längere Antwort wirkt besser | Rubrik «knapp und vollständig»; Länge separat messen |
| **Selbstbevorzugung** | Modell mag den eigenen Stil | Judge aus anderer Modellfamilie oder -stufe; gegen Menschen kalibrieren |
| **Milde** | Judge ist zu nachsichtig | binäre Kriterien, «Unbekannt» erlauben |

## Kalibrierung gegen Menschen

1. **30–100 Ausgaben** von einer Fachperson **blind** bewerten lassen.
2. Den Judge auf dieselben Ausgaben ansetzen.
3. **Übereinstimmung** messen: Anteil gleicher Urteile und **Cohen's Kappa** (über 0,6 brauchbar, über 0,8 gut).
4. Die Fälle **lesen**, in denen beide uneins sind, und die Rubrik schärfen.
5. Bei jeder Änderung von Rubrik oder Judge-Modell **wiederholen**; danach Stichproben pro Release.

:::falle Den Judge nie prüfen
Ein ungeeichter Judge liefert Zahlen, die präzise aussehen und nichts bedeuten. Typisch: Der Judge gibt fast allen Antworten «bestanden», weil die Rubrik vage ist – und das Team freut sich über 95 %. Erst der Abgleich mit 50 menschlichen Urteilen zeigt, dass Mensch und Judge nur in zwei Dritteln der Fälle übereinstimmen. Ein Judge ist ein Messgerät; Messgeräte werden geeicht.
:::

## Mehrere Läufe: pass@k und pass^k

Weil Ausgaben schwanken, läuft jede Aufgabe **mehrmals** (k = 3–5).

| Kennzahl | Bedeutung | Passt für |
|---|---|---|
| **pass@k** | Chance, dass **mindestens einer** von k Versuchen gelingt | Aufgaben, bei denen ein Treffer reicht und ein Test filtert (z. B. Code mit Tests) |
| **pass^k** | Chance, dass **alle** k Versuche gelingen | **Verlässlichkeit** – alles mit Kundenkontakt |

Beispiel: Ein System löst eine Aufgabe in **75 %** der Läufe. Dann liegt **pass@3** bei rund **98 %**, **pass^3** aber nur bei rund **42 %** (0,75 × 0,75 × 0,75). Für einen Kundenassistenten, der jedes Mal stimmen muss, ist die zweite Zahl die ehrliche.

## Unsicherheit richtig lesen

Eine Quote aus wenigen Aufgaben ist unsicher. Bei einer Quote um **70 %** beträgt das 95-%-Vertrauensintervall (Wilson) ungefähr:

| Anzahl Aufgaben | Unsicherheit |
|---|---|
| 20 | ± 19 Prozentpunkte |
| 50 | ± 12 Prozentpunkte |
| 200 | ± 6 Prozentpunkte |

- **Gepaart vergleichen:** Alte und neue Version auf **denselben** Aufgaben laufen lassen und zählen, welche Aufgaben **nur** die eine oder **nur** die andere löst. Das ist viel aussagekräftiger als zwei unabhängige Quoten.
- **Mehrere Läufe ersetzen nicht mehr Aufgaben:** Sie verringern die Streuung pro Aufgabe, aber nicht die Unsicherheit über die Vielfalt der Fälle.

:::gem Kosten des Judges im Griff
Judges laufen oft tausendfach. Für **binäre Fragen mit Referenz** reicht meist ein kleines oder mittleres Modell mit tiefem Aufwand; für feine Qualitätsurteile ein grösseres. Den gleichbleibenden Teil des Judge-Prompts (Rubrik, Beispiele) **vorne** platzieren für Prompt Caching, nächtliche Läufe über die **Batch-Verarbeitung** (−50 %). Und: Judge-Prompt und -Modell **versionieren** – ein Wechsel verschiebt die Messlatte.
:::

:::berater Im Kundengespräch
Wenn ein Anbieter «94 % Genauigkeit» verspricht, sind drei Rückfragen fällig: **Auf wie vielen Fällen?** (Bei 30 Fällen ist das ± 10 Prozentpunkte.) **Wer hat bewertet?** (Ein ungeeichter Judge oder Fachleute?) **Ein Lauf oder mehrere?** (Bei Kundenkontakt zählt, ob es jedes Mal stimmt.) Diese drei Fragen trennen belastbare Zahlen von Marketing.
:::

:::spickzettel
- Judge: **eine Dimension pro Aufruf**, **Rubrik mit Ankern** (binär), **«Unbekannt»**, **Referenz**, erst Begründung dann Urteil (JSON)
- Verzerrungen: **Position** (tauschen), **Länge**, **Selbstbevorzugung** (andere Modellfamilie), **Milde**
- **Kalibrieren**: 30–100 Fälle blind, **Cohen's Kappa** > 0,6 brauchbar, > 0,8 gut; Uneinigkeiten lesen
- **k = 3–5 Läufe**: **pass@k** (mindestens einer) vs. **pass^k** (alle); 75 % → pass^3 ≈ **42 %**
- Unsicherheit bei ~70 %: **n=20 ±19**, **n=50 ±12**, **n=200 ±6** Prozentpunkte
- **Gepaart** vergleichen; mehr Läufe ≠ mehr Aufgaben
- Judge-Kosten: kleines Modell für binär + Referenz, **Caching**, **Batch**; **versionieren**
:::

:::selbstcheck 3
