---
title: Testset und Code-Grader bauen
level: L2
summary: Wie du aus echten Fällen ein Testset mit Referenzlösungen baust, deterministische Grader schreibst, Agenten am Endzustand prüfst und typische Fallen wie kaputte Aufgaben oder einseitige Sets vermeidest.
competencies: [ki-evl-02]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill evals-observability, SKILL.md (Schritt 2 – Testset, Schritt 3 – Grader; geprüft 27.11.2026)
  - Skill evals-observability, references/grundlagen.md (Grader-Typen, Fahrplan, Fallen; geprüft 27.11.2026)
  - https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
  - https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Testset: 20–50 Aufgaben aus echten Fehlern, Support-Fällen, manuellen Prüfungen; eindeutig (zwei Fachleute urteilen gleich), Referenzlösung, die alle Grader besteht; ausgewogen soll/soll nicht; isolierte Umgebung pro Durchlauf; versioniert im Repo; Format JSONL; Code-Grader: exakter Vergleich, Normalisierung (CHF 12.50 vs. 12.50 Fr.), Regex, JSON-Schema, Unit-Tests, Endzustand prüfen statt Weg; Teilpunkte; abkürzungsresistent (Reward Hacking); Fallen: kaputte Aufgabe (0 % über alle Varianten), geteilter Zustand, zu starrer Grader, Testset im Prompt, einseitiges Set, nur Durchschnitt, Sättigung; Transkripte lesen"
---

:::tldr
Ein gutes Testset besteht aus **20–50 Aufgaben aus echten Fällen** – echten Fehlern, Support-Anfragen, manuellen Prüfungen. Jede Aufgabe ist **eindeutig** (zwei Fachleute würden gleich urteilen) und hat eine **Referenzlösung**. Das Set ist **ausgewogen**: Fälle, in denen etwas passieren soll, **und** solche, in denen es nicht passieren soll. Bewertet wird **zuerst per Code** – Vergleich, Schema, Test, Endzustand –, denn das ist schnell, billig und reproduzierbar. Bei Agenten zählt das **Ergebnis**, nicht der Weg.
:::

:::bildlich Die Fahrprüfung
Eine gute Fahrprüfung hat feste Aufgaben: einparken, Vortritt, Autobahnauffahrt – und auch Situationen, in denen man **nicht** fahren darf (Rotlicht). Bewertet wird, ob das Auto korrekt in der Parklücke steht, nicht, ob der Prüfling genau dreimal gelenkt hat. Und die Prüfungsfragen stehen nicht vorher im Lehrbuch.
:::

## Aufgaben sammeln

| Quelle | Beispiel |
|---|---|
| **Echte Fehler** | «Assistent nannte bei Teilzeit den falschen Ferienanspruch» |
| **Support-Fälle** | häufige Kundenfragen mit bekannter richtiger Antwort |
| **Manuelle Prüfungen** | was Fachleute heute vor dem Versand kontrollieren |
| **Grenzfälle** | fehlende Angaben, widersprüchliche Dokumente, Dialekt, zwei Anliegen in einer Mail |
| **Negativfälle** | Fragen ausserhalb des Auftrags, eingeschleuste Anweisungen, Fragen ohne Antwort im Bestand |

**Anforderungen an jede Aufgabe:**

- **Eindeutig:** Zwei Fachleute kämen zum selben Urteil. Unklare Aufgaben messen Zufall.
- **Referenzlösung:** eine Lösung, die alle Grader besteht – sie beweist, dass die Aufgabe lösbar ist.
- **Ausgewogen:** soll **und** soll nicht. Sonst lernt das System «immer ablehnen» oder «immer suchen».
- **Isoliert:** jeder Durchlauf in frischer Umgebung, kein geteilter Zustand.
- **Versioniert:** im Repository, mit Kategorie und Herkunft.

```json
{"id": "ferien-017", "kategorie": "arbeitsrecht", "eingabe": "Wie viele Ferientage habe ich mit 60 % Pensum und 25 Tagen bei 100 %?", "erwartet": {"tage": 15}, "herkunft": "Support-Ticket 2026-10, anonymisiert"}
{"id": "ferien-018", "kategorie": "ausserhalb", "eingabe": "Schreib mir ein Gedicht über Ferien.", "erwartet": {"verhalten": "lehnt höflich ab und verweist auf den Zweck"}, "herkunft": "Negativfall"}
```

## Code-Grader zuerst

| Grader | Prüft | Beispiel |
|---|---|---|
| **Exakter Vergleich** | Wert stimmt | `tage == 15` |
| **Normalisierung + Vergleich** | gültige Varianten gelten | «CHF 12.50», «12.50 Fr.», «Fr. 12.5» → `12.50` |
| **Regex / Enthält** | Pflichtelement vorhanden oder verboten | nennt eine Fundstelle; enthält keine IBAN |
| **JSON-Schema** | Form und Wertebereiche | Pflichtfelder, Typen, erlaubte Werte |
| **Unit-Tests** | Code funktioniert | generierte Funktion besteht Tests |
| **Endzustand** | was tatsächlich passiert ist | Gibt es den Termin im Kalender wirklich? |

```python
def grade(output: dict, expected: dict) -> bool:
    if "tage" in expected:
        return output.get("tage") == expected["tage"]
    if expected.get("verhalten", "").startswith("lehnt"):
        return output.get("abgelehnt") is True
    return False
```

:::gem Ergebnis statt Weg – und abkürzungssicher
Bei Agenten prüft der Grader den **Endzustand** (Datei angelegt? Buchung vorhanden? Test grün?), nicht, ob genau die erwarteten Schritte gemacht wurden – es gibt oft mehrere richtige Wege. Gleichzeitig muss der Grader **Abkürzungen** erkennen: Ein Agent, der die Tests ändert, statt den Code zu reparieren, darf nicht bestehen. Darum Tests für den Agenten **unveränderbar** machen und den echten Zustand prüfen, nicht die Behauptung «erledigt».
:::

## Typische Fallen

| Falle | Erkennen | Abhilfe |
|---|---|---|
| **Kaputte Aufgabe** | 0 % über alle Varianten | Referenzlösung durch alle Grader laufen lassen |
| **Grader zu starr** | gültige Antworten fallen durch | Transkripte lesen, normalisieren |
| **Geteilter Zustand** | Ergebnisse hängen von der Reihenfolge ab | frische Umgebung pro Durchlauf |
| **Testset im Prompt** | perfekte Quote, im Betrieb schwach | Beispiele im Prompt ≠ Testaufgaben |
| **Einseitiges Set** | Verhalten kippt ins Gegenteil | Negativfälle ergänzen |
| **Nur Durchschnitt** | Rückschritt in einer Kategorie bleibt versteckt | Ergebnisse pro Kategorie |
| **Sättigung** | 100 %, kein Signal mehr | schwierigere Aufgaben ergänzen |

:::falle Nur die Zahl anschauen
Eine Quote von 70 % sagt nicht, **warum** 30 % scheitern. Erst das **Lesen der Transkripte** zeigt, ob das System, der Grader oder die Aufgabe schuld ist. In vielen Projekten stellt sich beim ersten Lesen heraus, dass ein Viertel der «Fehler» in Wahrheit zu starre Grader oder unklare Aufgaben waren.
:::

:::berater Im Kundengespräch
Der Aufbau eines ersten Testsets ist ein guter **Workshop-Inhalt** mit den Fachleuten des Kunden: Sie bringen echte Fälle mit, man legt gemeinsam fest, was richtig ist, und markiert Grenzfälle. Nebeneffekt: Oft zeigt sich dabei, dass sich auch die Fachleute nicht einig sind – ein wichtiger Befund, bevor man eine KI dafür verantwortlich macht.
:::

:::spickzettel
- **20–50 Aufgaben** aus **echten** Fällen: Fehler, Support, manuelle Prüfungen, Grenz- und **Negativfälle**
- Jede Aufgabe **eindeutig**, mit **Referenzlösung**, Kategorie, Herkunft; **versioniert**
- **Ausgewogen**: soll **und** soll nicht; **isoliert** pro Durchlauf
- **Code-Grader zuerst**: Vergleich, **Normalisierung**, Regex, **Schema**, Tests, **Endzustand**
- Agenten: **Ergebnis statt Weg**, **abkürzungssicher** (Tests unveränderbar)
- Fallen: **kaputte Aufgabe**, **starrer Grader**, geteilter Zustand, **Testset im Prompt**, einseitig, nur Durchschnitt, Sättigung
- **Transkripte lesen**
:::

:::selbstcheck 3
