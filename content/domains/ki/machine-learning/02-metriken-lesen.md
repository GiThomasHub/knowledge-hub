---
title: Metriken richtig lesen – warum 99 % Accuracy nichts heissen kann
level: L2
summary: Konfusionsmatrix, Accuracy, Precision, Recall und F1 an einem durchgerechneten Betrugsbeispiel in CHF, die Wahl des Schwellenwerts nach Fehlerkosten und die wichtigsten Metriken für Regression.
competencies: [ki-ml-02]
volatility: tief
last_verified: 2026-11-27
sources:
  - Machine_Learning_Masterclass.docx (Teil B4 – Der Trainingszyklus im Detail, Metriken; Kontrollfrage 3)
  - Machine_Learning_Masterclass.docx (Teil H4 – Klassifikation, classification_report)
  - https://scikit-learn.org/stable/modules/model_evaluation.html
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Konfusionsmatrix: richtig positiv (TP), falsch positiv (FP, Fehlalarm), falsch negativ (FN, verpasst), richtig negativ (TN); Accuracy = (TP+TN)/alle, täuscht bei unausgewogenen Klassen; Precision = TP/(TP+FP) – wie viele Alarme stimmen; Recall = TP/(TP+FN) – wie viele echte Fälle gefunden; F1 = harmonisches Mittel; Beispiel 100 000 Transaktionen, 0,5 % Betrug: immer «kein Betrug» = 99,5 % Accuracy, Recall 0; Modell A: TP 400, FN 100, FP 1600 → Accuracy 98,3 %, Precision 20 %, Recall 80 %, F1 0,32, Kosten CHF 232 000 bei CHF 2000 pro verpasstem Betrug und CHF 20 pro Abklärung; Modell B: TP 300, FN 200, FP 300 → Accuracy 99,5 %, Precision 50 %, Recall 60 %, F1 0,55, Kosten CHF 406 000; Schwellenwert nach Fehlerkosten wählen; Basislinie immer mitberichten; Regression: MAE, RMSE (bestraft grosse Fehler stärker), R²; Metrik pro Klasse und Untergruppe"
---

:::tldr
Eine Kennzahl allein sagt wenig. [[Accuracy]] (Anteil richtiger Vorhersagen) **täuscht**, sobald eine Klasse selten ist: Wenn nur 0,5 % aller Transaktionen Betrug sind, erreicht ein Modell, das **immer** «kein Betrug» sagt, 99,5 % Accuracy – und findet keinen einzigen Betrugsfall. Aussagekräftig sind [[Precision]] (wie viele Alarme stimmen?) und [[Recall]] (wie viele echte Fälle werden gefunden?), abgeleitet aus der [[Konfusionsmatrix]]. Welche Balance richtig ist, entscheiden die **Kosten der Fehler** – und jede Metrik wird mit einer **Basislinie** verglichen.
:::

:::bildlich Der Rauchmelder
Ein Rauchmelder, der nie Alarm gibt, liegt an 364 von 365 Tagen richtig – eine hervorragende «Accuracy» – und ist trotzdem nutzlos. Einer, der bei jedem Toast piepst, verpasst kein Feuer (hoher **Recall**), aber man hört bald nicht mehr hin (tiefe **Precision**). Gesucht ist der Melder, dessen Fehler am wenigsten kosten.
:::

## Die Konfusionsmatrix

| | **Vorhersage: Betrug** | **Vorhersage: kein Betrug** |
|---|---|---|
| **Tatsächlich Betrug** | richtig positiv (**TP**) | falsch negativ (**FN**) – verpasst |
| **Tatsächlich kein Betrug** | falsch positiv (**FP**) – Fehlalarm | richtig negativ (**TN**) |

Daraus ergeben sich die wichtigsten Kennzahlen:

| Metrik | Formel | Frage |
|---|---|---|
| **Accuracy** | (TP + TN) ÷ alle | Wie oft liegt das Modell richtig? |
| **Precision** | TP ÷ (TP + FP) | Wenn es Alarm gibt – wie oft stimmt er? |
| **Recall** | TP ÷ (TP + FN) | Von allen echten Fällen – wie viele findet es? |
| [[F1-Score]] | 2 × P × R ÷ (P + R) | Ausgleich zwischen Precision und Recall |

## Ein durchgerechnetes Beispiel

Eine Bank prüft **100 000 Kartentransaktionen**, davon sind **500 Betrug** (0,5 %). Ein verpasster Betrug kostet im Schnitt **CHF 2 000**, eine Abklärung nach einem Fehlalarm **CHF 20**.

| | TP | FN | FP | Accuracy | Precision | Recall | F1 | Fehlerkosten |
|---|---|---|---|---|---|---|---|---|
| **Immer «kein Betrug»** | 0 | 500 | 0 | **99,5 %** | – | **0 %** | 0 | CHF 1 000 000 |
| **Modell A** | 400 | 100 | 1 600 | 98,3 % | 20 % | **80 %** | 0,32 | **CHF 232 000** |
| **Modell B** | 300 | 200 | 300 | 99,5 % | **50 %** | 60 % | **0,55** | CHF 406 000 |

Drei Einsichten: Modell A hat die **tiefste Accuracy** und ist trotzdem das **wirtschaftlich beste**. Modell B hat dieselbe Accuracy wie das nutzlose «Immer nein» und den **besten F1** – aber höhere Kosten als A, weil ein verpasster Betrug hundertmal mehr kostet als eine Abklärung. Und keine der Zahlen ist ohne die **Basislinie** «immer nein» richtig einzuordnen.

:::falle Die Accuracy-Falle
Wer bei seltenen Ereignissen – Betrug, Ausfälle, Krankheiten, Maschinenschäden – nur die Accuracy berichtet, kann ein nutzloses Modell als Erfolg verkaufen. Bei unausgewogenen Klassen gehören **Precision und Recall pro Klasse** in jeden Bericht, dazu die Basislinie. In scikit-learn liefert `classification_report` diese Werte direkt pro Klasse.
:::

## Den Schwellenwert wählen

Viele Klassifikatoren liefern eine **Wahrscheinlichkeit** («73 % Betrug»). Ab welchem Wert Alarm gegeben wird, ist eine **Geschäftsentscheidung**:

- **Tiefer Schwellenwert** → mehr Alarme → höherer Recall, tiefere Precision (Modell A).
- **Hoher Schwellenwert** → weniger Alarme → höhere Precision, tieferer Recall (Modell B).

Die Wahl folgt den **Fehlerkosten** und der **Kapazität**: Wie viele Fälle kann das Team pro Tag abklären? Was kostet ein verpasster Fall? F1 ist nur dann ein guter Massstab, wenn beide Fehler etwa gleich schwer wiegen.

## Metriken für Zahlen (Regression)

| Metrik | Bedeutung | Gut zu wissen |
|---|---|---|
| **MAE** | mittlerer absoluter Fehler | in der Einheit des Ziels, z. B. «im Schnitt CHF 180 daneben» |
| **RMSE** | Wurzel des mittleren quadrierten Fehlers | bestraft **grosse** Fehler stärker als MAE |
| **R²** | Anteil der erklärten Streuung | 1 = perfekt, 0 = so gut wie der Mittelwert; kann negativ werden |

Auch hier gilt: Vergleich mit einer **einfachen Basislinie** – etwa «Wert vom Vormonat» oder «Durchschnitt» – und Auswertung pro **Untergruppe** (Region, Kundensegment), weil ein guter Durchschnitt schlechte Teilgruppen verdecken kann.

:::gem Dieselbe Logik gilt für LLM-Evals
Precision und Recall tauchen auch bei Sprachmodellen auf: beim Retrieval (findet die Suche die relevanten Dokumente?), bei Klassifikation per Prompt und bei LLM-Judges. Wer hier sauber denkt, baut auch bessere [Evals](#/t/evals).
:::

:::berater Im Kundengespräch
Wenn ein Anbieter «99 % Genauigkeit» verspricht, sind drei Fragen fällig: **Wie häufig ist der gesuchte Fall?** **Wie hoch sind Precision und Recall für genau diesen Fall?** **Was erreicht eine einfache Basislinie?** Danach die Fehler in Franken übersetzen – Fehlalarme kosten Arbeitszeit, verpasste Fälle Schaden. So wird aus einer Marketingzahl eine Entscheidungsgrundlage.
:::

:::spickzettel
- **Konfusionsmatrix**: TP, **FP (Fehlalarm)**, **FN (verpasst)**, TN
- **Accuracy** (TP+TN)/alle – **täuscht bei seltenen Klassen**
- **Precision** TP/(TP+FP): Stimmen die Alarme?
- **Recall** TP/(TP+FN): Werden die Fälle gefunden?
- **F1**: Ausgleich, nur sinnvoll bei ähnlich teuren Fehlern
- **Schwellenwert** nach **Fehlerkosten** und **Kapazität** wählen
- Regression: **MAE**, **RMSE** (grosse Fehler), **R²**
- Immer **Basislinie** und **Untergruppen** mitberichten
:::

:::selbstcheck 3
