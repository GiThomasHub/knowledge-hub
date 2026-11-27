---
title: Overfitting, Data Leakage und Scheinkorrelationen erkennen
level: L3
summary: Warum Modelle im Test glänzen und im Einsatz versagen – Overfitting, saubere Aufteilung der Daten, die häufigsten Formen von Data Leakage, Scheinkorrelationen und Drift.
competencies: [ki-ml-03]
volatility: tief
last_verified: 2026-11-27
sources:
  - Machine_Learning_Masterclass.docx (Teil E – Profi-Fallen; E2 Overfitting, E3 Scheinkorrelationen, E4 Data Leakage, E5 Distribution Shift)
  - Machine_Learning_Masterclass.docx (Teil B4 – Train/Validation/Test-Split, Cross-Validation; Teil H5 – Pipelines)
  - https://scikit-learn.org/stable/common_pitfalls.html
  - https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Overfitting: Training sehr gut, Test deutlich schlechter – Modell lernt Rauschen auswendig; Underfitting: schon im Training schlecht; Bias-Variance-Tradeoff; Gegenmittel: einfacheres Modell, Regularisierung (Ridge/Lasso, Baumtiefe), mehr Daten, Cross-Validation; Split Training/Validierung/Test (z. B. 70/15/15), Test nur einmal am Schluss; Data Leakage = Information, die zum Vorhersagezeitpunkt nicht verfügbar wäre, fliesst ins Training: Zeitreihen zufällig gemischt (chronologisch splitten, TimeSeriesSplit), Skalierung/Imputation/Feature-Auswahl vor dem Split (Pipeline nutzen), Zielinformation in Features (z. B. Feld, das erst nach dem Ereignis gesetzt wird), Duplikate oder dieselbe Person in Training und Test (Gruppen-Split); Warnsignal: zu gute Ergebnisse; Scheinkorrelationen: bei vielen Merkmalen findet man immer zufällige Zusammenhänge, bei 100 zufälligen Merkmalen und 5 %-Niveau rund 5 scheinbar signifikante, Wahrscheinlichkeit für mindestens einen 99 %; Kausalität fachlich begründen, auf neuen Daten bestätigen; Distribution Shift/Drift: Welt ändert sich, überwachen"
---

:::tldr
Ein Modell ist nur so gut wie seine Leistung auf **Daten, die es nie gesehen hat**. Drei Fallen täuschen darüber hinweg: [[Overfitting]] – das Modell lernt die Trainingsdaten samt Zufallsrauschen auswendig und versagt bei neuen Fällen. [[Data Leakage]] – Informationen, die im echten Einsatz noch gar nicht vorliegen würden, gelangen ins Training; klassisch bei **Zeitreihen, die zufällig gemischt** statt **chronologisch geteilt** werden. [[Scheinkorrelation|Scheinkorrelationen]] – bei genügend Merkmalen findet ein Algorithmus immer zufällige Zusammenhänge. Das wichtigste Warnsignal aller drei: **Ergebnisse, die zu gut sind, um wahr zu sein.**
:::

:::bildlich Die Prüfung mit bekannten Fragen
Overfitting ist ein Student, der die Lösungen der Übungsserie **auswendig** lernt: perfekt bei genau diesen Aufgaben, hilflos bei neuen. Data Leakage ist ein Student, der die **Prüfungsfragen vorher gesehen** hat: Die Note ist hervorragend – und sagt nichts darüber aus, was er kann. Beide fallen erst auf, wenn eine wirklich neue Prüfung kommt.
:::

## Training, Validierung, Test

Die Daten werden in drei Teile geteilt, typisch etwa **70/15/15**:

- **Training** – daraus lernt das Modell.
- **Validierung** – damit werden Varianten und Einstellungen (Hyperparameter) verglichen.
- **Test** – **einmal am Schluss**, als ehrliche Schätzung für den Einsatz. Wer den Testsatz immer wieder anschaut und danach nachbessert, passt das Modell unbemerkt an ihn an.

[[Cross-Validation]] teilt die Trainingsdaten mehrfach unterschiedlich auf (z. B. 5-fach) und liefert so eine stabilere Schätzung als ein einziger Split.

## Overfitting und Underfitting

| | Training | Test | Ursache | Gegenmittel |
|---|---|---|---|---|
| **Underfitting** | schlecht | schlecht | Modell zu einfach | mehr Merkmale, mächtigeres Modell |
| **Gute Passung** | gut | fast so gut | – | – |
| **Overfitting** | sehr gut | deutlich schlechter | Modell zu komplex für die Datenmenge | einfacheres Modell, **Regularisierung** (Ridge/Lasso, Baumtiefe begrenzen), mehr Daten, Cross-Validation |

Ein Modell mit 98 % im Training und 61 % im Test hat nicht «gelernt», sondern auswendig gelernt. Die Spannung zwischen zu einfach und zu komplex heisst **Bias-Variance-Tradeoff**.

## Data Leakage – die unsichtbare Falle

Data Leakage liegt vor, wenn beim Bau des Modells Informationen genutzt werden, die **zum Zeitpunkt der Vorhersage nicht verfügbar** wären. Die vier häufigsten Formen:

| Form | Beispiel | Korrektur |
|---|---|---|
| **Zeitreihe gemischt** | Tageskurse oder Monatsumsätze zufällig in Training und Test verteilt – das Modell «kennt» die Nachbartage aus der Zukunft | **chronologisch teilen**: Training = Vergangenheit, Test = spätere Periode; `TimeSeriesSplit` |
| **Vorverarbeitung vor dem Split** | Mittelwert für die Skalierung oder fehlende Werte aus **allen** Daten berechnet, inklusive Test | Vorverarbeitung nur auf Trainingsdaten lernen – in scikit-learn mit einer **Pipeline** |
| **Zielinformation im Merkmal** | Kündigungsmodell mit dem Feld «Rückgabegerät erhalten», das erst **nach** der Kündigung gesetzt wird | für jedes Merkmal fragen: **Wüsste ich das zum Vorhersagezeitpunkt?** |
| **Dieselbe Einheit doppelt** | derselbe Kunde, Patient oder dasselbe Gerät in Training **und** Test | nach **Gruppen** teilen (z. B. pro Kunde) |

```python
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

modell = make_pipeline(StandardScaler(), Ridge())     # Skalierung lernt nur aus dem jeweiligen Training
cv = TimeSeriesSplit(n_splits=5)                       # Test liegt immer zeitlich nach dem Training
print(cross_val_score(modell, X, y, cv=cv))            # X, y chronologisch sortiert
```

:::falle «Unser Modell erreicht 97 %»
Ein überraschend gutes Ergebnis ist zuerst ein **Verdacht**, kein Erfolg. Typische Muster: Ein einzelnes Merkmal erklärt fast alles (Zielinformation?), die Testleistung ist besser als bei allen bekannten Ansätzen, oder sie bricht im Pilotbetrieb sofort ein. Dann die Liste oben Punkt für Punkt prüfen – und das Modell auf einer **wirklich späteren** Periode testen.
:::

## Scheinkorrelationen

Bei genügend Merkmalen findet ein Algorithmus **immer** zufällige Zusammenhänge. Rechnet man mit 100 rein zufälligen Merkmalen auf dem üblichen 5-%-Niveau, erscheinen im Schnitt **5** als «signifikant», und die Wahrscheinlichkeit, dass **mindestens eines** auffällt, liegt bei über **99 %**. Dazu kommen echte, aber nicht kausale Zusammenhänge: Glacéverkauf und Badeunfälle steigen gemeinsam – wegen des Wetters, nicht wegen des Glacés.

Gegenmittel:
- **Fachlich begründen**, warum ein Zusammenhang bestehen sollte.
- Auf **neuen, späteren Daten** bestätigen, bevor man darauf baut.
- Viele Tests gleichzeitig mit einer **strengeren Schwelle** auswerten.
- Für Entscheidungen über Ursache und Wirkung ein **Experiment** (z. B. A/B-Test) statt nur Beobachtungsdaten.

:::gem Auch ein gutes Modell altert
Selbst ein sauber validiertes Modell verliert an Qualität, wenn sich **die Welt** ändert: neue Produkte, neue Regulierung, eine Krise, anderes Kundenverhalten (**Distribution Shift**, im Betrieb oft [[Drift]] genannt). Darum gehören zu jedem produktiven Modell eine **Überwachung** der Eingabedaten und der Treffsicherheit und ein Plan für das Nachtrainieren.
:::

:::berater Im Kundengespräch
Bei der Abnahme eines ML-Projekts lohnen sich fünf Fragen: **Wie wurde geteilt** – bei Zeitdaten chronologisch? **Wann wurde der Testsatz zum ersten Mal angeschaut?** **Welche Merkmale wären zum Vorhersagezeitpunkt noch nicht bekannt?** **Wie gross ist der Abstand zwischen Training und Test?** **Wie wird Drift im Betrieb erkannt?** Wer diese Fragen nicht beantworten kann, hat ein Risiko, keine Zahl.
:::

:::spickzettel
- **Neue Daten** sind der einzige ehrliche Massstab; **Test nur einmal am Schluss**
- **Overfitting**: Training sehr gut, Test deutlich schlechter → einfacher, **regularisieren**, mehr Daten, **Cross-Validation**
- **Underfitting**: schon im Training schlecht
- **Data Leakage**: Info, die beim Vorhersagen **noch nicht verfügbar** wäre
- Zeitreihen **chronologisch** teilen (`TimeSeriesSplit`), nie mischen
- Vorverarbeitung **in der Pipeline**; Zielinformation prüfen; nach **Gruppen** teilen
- **Scheinkorrelationen**: 100 Zufallsmerkmale → ≈ 5 «signifikant»; fachlich begründen, neu bestätigen
- **Zu gut, um wahr zu sein** = Verdacht; **Drift** im Betrieb überwachen
:::

:::selbstcheck 3
