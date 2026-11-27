---
title: Tracing im Betrieb – Kosten, Latenz, Fehler und Datenschutz
level: L3
summary: Was pro Modellaufruf festgehalten werden muss, wie OpenTelemetry und Werkzeuge wie Langfuse helfen, wie man Claude Code überwacht, welche Alarme sich lohnen und wie Traces datenschutzkonform bleiben.
competencies: [ki-evl-04]
volatility: hoch
last_verified: 2026-11-27
sources:
  - Skill evals-observability, references/observability.md (Felder, OpenTelemetry, Claude Code, Kosten, Datenschutz; geprüft 27.11.2026)
  - Skill evals-observability, references/werkzeuge.md (Langfuse, Phoenix, LangSmith, Braintrust, MLflow; Stand 23.11.2026)
  - https://code.claude.com/docs/en/monitoring-usage
  - https://opentelemetry.io/docs/specs/semconv/gen-ai/
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Observability für LLM-Systeme: pro Aufruf Trace-/Span-ID, Modell, API-Version, Aufwand, Prompt-Version, Tokens (Input, Output, Cache-Read, Cache-Write), geschätzte Kosten, Latenz (gesamt, erstes Token), stop_reason, Wiederholungen, Validierungsergebnis, Tool-Aufrufe als Spans; Inhalte nur bewusst; OpenTelemetry mit GenAI Semantic Conventions (Status Development); Backends Langfuse (Open Source, Self-Hosting möglich), Phoenix, LangSmith, Braintrust, MLflow; Claude Code: CLAUDE_CODE_ENABLE_TELEMETRY=1, OTEL_METRICS_EXPORTER, OTEL_LOGS_EXPORTER, Traces Beta mit CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1 und OTEL_TRACES_EXPORTER, Prompts und Tool-Details standardmässig geschwärzt (OTEL_LOG_USER_PROMPTS, OTEL_LOG_TOOL_DETAILS, OTEL_LOG_TOOL_CONTENT), zentral über Managed Settings, Kosten sind Schätzungen; Alarme Kosten, Fehlerquote, Schemafehler, Cache-Trefferquote, lange Läufe; Online-Evals 1–5 %; Fehler zurück ins Testset; Datenschutz revDSG: Traces sind Datensammlung, Inhalte schwärzen, kurze Aufbewahrung, Self-Hosting, keine Secrets"
---

:::tldr
Evals prüfen **vor** dem Einsatz, **Observability** zeigt, was **im** Betrieb passiert. Dafür wird jeder Modellaufruf als **Trace** festgehalten: Modell und Prompt-Version, Tokens inklusive Cache, Kosten, Latenz, Abbruchgrund, Wiederholungen, Validierungsergebnis und jeder Werkzeugaufruf. Der herstellerneutrale Standard dafür ist **OpenTelemetry**; Werkzeuge wie **Langfuse** oder **Phoenix** machen die Daten sichtbar. Claude Code exportiert Telemetrie nativ – und schwärzt Prompts und Werkzeugdetails **standardmässig**. Denn Traces enthalten schnell Personendaten: Unter dem **revDSG** sind sie eine Datensammlung mit Zweck, Zugriff und Aufbewahrungsfrist.
:::

:::bildlich Der Fahrtenschreiber
Ein Lastwagen hat einen **Fahrtenschreiber**: Geschwindigkeit, Pausen, Strecke – lückenlos. Nach einem Vorfall lässt sich rekonstruieren, was passiert ist; im Alltag zeigt er, wo Zeit und Treibstoff verloren gehen. Er zeichnet aber **nicht** die Gespräche in der Kabine auf. Gutes LLM-Tracing funktioniert genauso: alles Technische lückenlos, Inhalte nur bewusst.
:::

## Was pro Aufruf festhalten

| Feld | Wozu |
|---|---|
| **Trace-ID, Span-ID**, übergeordneter Span | alle Aufrufe eines Laufs zusammenführen |
| **Modell, API-Version, Aufwand, Prompt-Version** | Ursachen von Veränderungen finden |
| **Tokens**: Eingabe, Ausgabe, Cache lesen, Cache schreiben | Kosten und Cache-Trefferquote |
| **Kosten** (geschätzt) | Budget und Alarme |
| **Latenz** gesamt und bis zum ersten Token | Antwortzeiten (Median, 95 %) |
| **`stop_reason`**, Wiederholungen, Fehlercode | Abbrüche erkennen, Robustheit |
| **Validierungsergebnis** | Qualität im Betrieb |
| **Werkzeugaufrufe** mit Dauer und Status, je als eigener Span | Agentenverhalten nachvollziehen |
| **Inhalte** (Prompt, Antwort) | **nur bewusst** – siehe Datenschutz |

Am einfachsten laufen alle Aufrufe durch **einen** Client im Code, der einmal loggt – statt Logging an jeder Stelle.

## Werkzeuge

| Werkzeug | Betrieb | Gut für |
|---|---|---|
| **Langfuse** | Open Source, selbst betreiben oder Cloud | Tracing, Prompt-Verwaltung, Datasets, Judges; Datenhoheit |
| **Arize Phoenix** | Open Source, lokal | schneller Start, OpenTelemetry-basiert |
| **LangSmith** | SaaS | wer mit LangChain/LangGraph arbeitet |
| **Braintrust** | SaaS | Evals, Monitoring und Release-Gates in einem |
| **OpenTelemetry + eigenes Backend** | selbst | herstellerneutral, z. B. mit Grafana |

OpenTelemetry hat für Sprachmodelle eigene **GenAI-Konventionen** (z. B. `gen_ai.usage.input_tokens`); ihr Status ist noch «in Entwicklung», Namen können sich ändern.

## Claude Code überwachen

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1          # Pflicht
export OTEL_METRICS_EXPORTER=otlp              # Metriken
export OTEL_LOGS_EXPORTER=otlp                 # Ereignisse
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.intern.example.ch
# Traces (Beta): zusätzlich
export CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
export OTEL_TRACES_EXPORTER=otlp
```

- Metriken u. a. zu Sitzungen, **Kosten**, **Tokens**, Codezeilen, Commits und Pull Requests.
- **Standardmässig geschwärzt:** Prompt-Text, Werkzeugdetails und -inhalte. Einschalten nur bewusst mit `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`.
- Für die ganze Organisation zentral über **Managed Settings**.
- Die Kostenwerte sind **Schätzungen**, keine Rechnung.

## Alarme und der Weg zurück ins Testset

| Alarm | Hinweis auf |
|---|---|
| Tageskosten über dem Doppelten des Medians | Schleife, Kontextwachstum, falsches Modell |
| Fehlerquote oder Schemafehler steigen | Modell- oder Datenänderung, Prompt-Regression |
| Cache-Trefferquote fällt | Prompt-Anfang hat sich verändert |
| Ungewöhnlich lange Läufe | Agent dreht sich im Kreis |

**Online-Evals:** Ein kleiner Anteil echter Antworten (z. B. 1–5 %) wird laufend von einem geeichten Judge bewertet – beobachtet wird der **Trend**.

**Vom Betrieb zurück ins Testset:** Fehler im Trace finden → Fall **anonymisieren** → als Aufgabe mit Referenzlösung ins Testset → Korrektur bauen → Regressionstest läuft → der Fall bleibt dauerhaft drin.

:::falle Inhalte in Traces vergessen
Prompts und Antworten enthalten Personendaten, Kundendetails, manchmal Gesundheits- oder Finanzangaben. Wer sie ungefiltert an einen SaaS-Tracing-Dienst schickt, hat eine **neue Datensammlung bei einem Dritten** angelegt – oft im Ausland, oft ohne Löschfrist. Unter dem revDSG braucht das Zweck, Vertrag, Zugriffsregeln und Aufbewahrungsfrist. Pragmatische Regel: **Metadaten immer, Inhalte geschwärzt**; Inhalte nur in der Entwicklung oder begründet und kurz (z. B. 30 Tage); bei sensiblen Daten **selbst betreiben** (z. B. Langfuse). Und **nie Secrets** – API-Keys und Tokens aus Headern und Werkzeugparametern filtern.
:::

:::gem Kosten pro brauchbarem Ergebnis
Die nützlichste Kennzahl im Betrieb ist nicht «Kosten pro Aufruf», sondern **Kosten pro erfolgreichem Ergebnis** – inklusive Wiederholungen, gescheiterter Validierungen und Nacharbeit. Ein Tracing, das Validierungsergebnisse mitschreibt, liefert diese Zahl direkt.
:::

:::berater Im Kundengespräch
Bei agentischen oder produktiven KI-Systemen ist fehlendes Tracing ein **blockierender Mangel**: Ohne Trace lässt sich weder ein Vorfall aufklären noch eine Kostenexplosion erklären. Der Vorschlag an den Kunden: von Anfang an Tracing mit geschwärzten Inhalten, ein Dashboard für Kosten, Fehler und Latenz, drei Alarme – und eine schriftliche Regel, welche Inhalte wie lange gespeichert werden.
:::

:::spickzettel
- Pro Aufruf: **IDs**, **Modell/Prompt-Version/Aufwand**, **Tokens inkl. Cache**, **Kosten**, **Latenz**, **stop_reason**, Wiederholungen, **Validierung**, Werkzeug-Spans
- **Ein Client**, der zentral loggt
- **OpenTelemetry** (GenAI-Konventionen); Backends **Langfuse**, Phoenix, LangSmith, Braintrust
- Claude Code: **`CLAUDE_CODE_ENABLE_TELEMETRY=1`**, Exporter setzen; Traces Beta mit **`CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`**
- Prompts und Werkzeugdetails **standardmässig geschwärzt**; Kosten sind **Schätzungen**
- Alarme: **Kosten**, **Fehlerquote**, **Cache-Trefferquote**, **lange Läufe**; Online-Evals 1–5 %
- Betriebsfehler → **anonymisiert ins Testset**
- **revDSG**: Inhalte schwärzen, kurz aufbewahren, Self-Hosting bei Sensiblem, **keine Secrets**
:::

:::selbstcheck 3
