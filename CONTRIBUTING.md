# Inhalte beitragen

## Qualitätsmassstab

Eine Lektion ist gut, wenn jemand ohne Vorwissen danach **erklären, anwenden und begründet entscheiden** kann – und weiss, wo die Grenzen liegen. Der Massstab ist das Gespräch mit einem Kunden auf Stufe Senior Consultant.

## Stufen

| Stufe | Bedeutung | Typische Lektion |
|---|---|---|
| L1 Grundlagen | verstehen und erklären | Konzept, Analogie, Begriffe |
| L2 Anwender | einrichten, Fehler finden und beheben | Schritt für Schritt, Konfiguration, Gegenprobe |
| L3 Professional | Varianten vergleichen, begründet entscheiden | Abwägung, Entscheidungsbaum, Kombination |
| L4 Senior Consultant | beraten, Risiken abwägen, Architektur empfehlen | Beratungsstruktur, Restrisiko, Business Case |

## Aufbau einer Lektion

```markdown
---
title: Kurzer, konkreter Titel
level: L2
summary: Ein bis zwei Sätze, was man danach kann (max. 300 Zeichen).
competencies: [ki-sec-03]
volatility: hoch          # hoch | mittel | tief – steuert den Prüfrhythmus
last_verified: 2026-11-26
sources:
  - https://offizielle-doku …
prompts: [mehr, beispiele, pruef-mich]       # IDs aus content/prompts.yaml
prompt_context: "Präziser Fokus für die Copy-Prompts"
---

:::tldr
Die Kernaussage in zwei Sätzen.
:::

## Abschnitt (wird zum Anker und Inhaltsverzeichnis)
…
```

### Bausteine

| Baustein | Wofür | Häufigkeit |
|---|---|---|
| `:::tldr` | Kernaussage ganz oben | genau 1 |
| `:::bildlich Titel` | Analogie aus dem Alltag | mind. 1 |
| `:::gem Titel` | wenig bekannter, wertvoller Trick | 1–3 |
| `:::falle Titel` | typischer Fehler und Korrektur | 1–3 |
| `:::berater` | so erklärst du es dem Kunden, typische Einwände | mind. 1 (ab L2) |
| `:::merke` | ein Satz zum Auswendiglernen | optional |
| `:::praxis` | konkreter Praxisfall | optional |
| `:::spickzettel` | Zusammenfassung zum Ausdrucken | genau 1 am Ende |
| `:::selbstcheck 3` | Mini-Quiz aus den Fragen zu dieser Lektion | genau 1 am Ende |
| ```` ```mermaid ```` | Diagramm (Ablauf, Schichten, Entscheidung) | wo hilfreich |
| `[[Begriff]]` | Glossar-Link mit Tooltip | bei Fachbegriffen |

Callouts dürfen Markdown enthalten (Listen, Code im Text), aber keine verschachtelten Callouts und keine Codeblöcke mit `:::`.

## Fragen

```yaml
id: sec-0031
topic: ai-security
competencies: [ki-sec-04]
level: L2
type: single            # single | multi | true_false | order | scenario | case
situation: "nur bei scenario"
question: "Klare Frage. `Code` und **fett** sind erlaubt."
options: ["…", "…", "…", "…"]
answer: [1]             # Indizes; true_false: [0]=richtig, [1]=falsch; order: Optionen in richtiger Reihenfolge, kein answer
model_answer: "nur bei case"
rubric: ["nur bei case", "…"]
explanation: "Warum richtig – und warum die anderen falsch sind."
source: ai-security/sandbox#die-defaults-und-warum-sie-nicht-reichen
status: draft           # draft → reviewed (Mensch oder beauftragtes Claude-Review, nie Wochen-Task) → retired
created: 2026-11-26
last_verified: 2026-11-26
author: claude-weekly
```

Gute Fragen prüfen Verständnis, nicht Vokabeln. Distraktoren sind typische Missverständnisse. Auf L3/L4 überwiegen Szenarien und Fallstudien.

Die richtige Option darf sich nicht durch ihre Form verraten: ähnlich lang wie die Distraktoren, Begründung in die `explanation`, keine Bezüge auf Positionen («die erste Option») – die App mischt die Optionen. Wahr/Falsch-Aussagen etwa je zur Hälfte wahr und falsch formulieren. `scripts/build.py` warnt, wenn die richtige Option mehr als 30 % länger ist als jeder Distraktor, bei Positionsbezügen und bei Mehrfachauswahl, in der alle Optionen stimmen.

## Ablauf

1. Branch anlegen, Inhalte ändern.
2. `python scripts/build.py --check --report` muss fehlerfrei sein.
3. Lokal ansehen: `python scripts/build.py && python -m http.server -d dist 8000`.
4. Draft-PR öffnen. Nach Review mergen – GitHub Pages veröffentlicht automatisch.
