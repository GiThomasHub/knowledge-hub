---
title: Tools entwerfen, die Agenten richtig nutzen
level: L3
summary: Wie du Werkzeuge und MCP-Server für Agenten statt für Programmierer entwirfst – Zuschnitt nach Arbeitsablauf, aussagekräftige Beschreibungen, knappe Antworten, Fehler als Anleitung und Sicherheit im Code statt im Prompt.
competencies: [ki-mcp-03]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill agents-automation, references/tools-und-mcp.md (Entwurfsregeln, Evaluation, Checkliste; geprüft 27.11.2026)
  - https://www.anthropic.com/engineering/writing-tools-for-agents
  - https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works
  - KI-Engineering-Masterclass.docx (Tools und Agenten)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Tool-Design für Agenten: vom Arbeitsablauf her statt API-Endpunkt (schedule_event statt list_users+list_events+create_event), wenige klar getrennte Tools, Namensraum im Namen (crm_search_customers), Beschreibung wie für neue Kollegin (wofür, wann nicht, Parameter, Beispiele, Einheiten), eindeutige Parameter (customer_id, Enums, Defaults), knappe Antworten mit Paginierung und Kürzungshinweis, response_format concise/detailed, Fehler als Korrekturanleitung, Sicherheit im Code (Auth, Autorisierung, Limits, Allowlists), Annotations readOnlyHint/destructiveHint sind nur Hinweise, Lesen und Schreiben getrennt für feine Berechtigungen, mit 10–30 realistischen Aufgaben evaluieren"
---

:::tldr
Werkzeuge für Agenten werden anders gebaut als Funktionen für Programmierer. Der Nutzer ist ein Modell mit **begrenztem Kontext**, das nur die **Beschreibung** sieht und nicht nachfragen kann. Darum: **wenige, mächtige Tools nach Arbeitsablauf** statt einer Hülle um jeden API-Endpunkt, **Beschreibungen wie für eine neue Kollegin**, **knappe Antworten** mit Paginierung, **Fehlermeldungen, die zur Korrektur anleiten** – und **Sicherheit im Code**, nicht im Prompt. Lesende und schreibende Aktionen trennst du, damit sich Rechte fein vergeben lassen.
:::

:::bildlich Schalter statt Werkzeugkasten
Einem neuen Mitarbeiter am Schalter gibst du nicht einen Werkzeugkasten mit 80 Einzelteilen («Kundendatensatz öffnen», «Feld lesen», «Feld schreiben», «Datensatz schliessen»), sondern **ein Formular pro Vorgang**: «Adresse ändern», «Rechnung stornieren». Er macht weniger Fehler, ist schneller und kann nichts kaputt machen, wofür es kein Formular gibt. Gute Agenten-Tools sind solche Formulare.
:::

## Vom Ablauf her, nicht vom Endpunkt

| API-Denken | Agenten-Denken |
|---|---|
| `list_users`, `list_events`, `create_event` – der Agent muss selbst verketten | `schedule_meeting(teilnehmende, dauer, zeitraum)` – findet Termin, prüft Kalender, legt an |
| `get_customer`, `get_invoices`, `get_payments` | `customer_account_summary(customer_id)` – liefert das, was für die Frage nötig ist |
| 80 Tools beim Start | 10–15 klar getrennte Tools; Überlappendes zusammenlegen |

Jeder zusätzliche Aufruf kostet Kontext, Zeit und eine Gelegenheit für Fehler. Ein Tool, das einen **ganzen Arbeitsschritt** erledigt, ist für den Agenten einfacher und robuster.

## Namen, Beschreibungen, Parameter

```json
{
  "name": "crm_search_customers",
  "description": "Sucht Kunden im CRM nach Name, Ort oder Kundennummer. Nutze dies, bevor du Kundendaten änderst, um die customer_id zu finden. Nicht für Rechnungen – dafür billing_search_invoices. Liefert höchstens 20 Treffer; bei mehr einen Filter ergänzen.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Name, Ort oder Kundennummer, z. B. 'Muster AG' oder 'K-10422'" },
      "canton": { "type": "string", "enum": ["ZH", "BE", "LU", "BS", "GE", "VD", "TI", "andere"], "description": "Optionaler Filter nach Kanton" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 20, "default": 10 }
    },
    "required": ["query"]
  }
}
```

- **Namensraum im Namen:** `crm_search_customers`, `billing_search_invoices` statt zweimal `search`.
- **Beschreibung:** wofür, **wann nicht** (und welches Tool dann), Bedeutung jedes Parameters, Beispielwerte, Einheiten, Grenzen.
- **Eindeutige Parameter:** `customer_id` statt `user`; **Enums** statt freier Texte; sinnvolle Standardwerte.

## Antworten und Fehler

- **Knapp:** nur Felder, die der Agent braucht; lesbare Namen statt nackter UUIDs, wo möglich.
- **Paginieren und kürzen mit Hinweis:** «20 von 1240 Treffern – Filter `canton` oder einen genaueren Suchbegriff verwenden.»
- Optional ein Parameter `response_format: "concise" | "detailed"`, damit der Agent selbst die Tiefe wählt.
- **Fehler als Anleitung:** «Datum muss JJJJ-MM-TT sein, erhalten: 23.11.» statt eines Stacktraces. Der Agent kann sich dann selbst korrigieren.

:::falle Sicherheit in der Beschreibung
«Dieses Tool darf nur Entwürfe anlegen, niemals versenden» in der Beschreibung ist **eine Bitte**, keine Grenze. Eine [[Prompt Injection]] in einer gelesenen Mail kann das Modell dazu bringen, die Bitte zu ignorieren. Auch MCP-Annotations wie `readOnlyHint` oder `destructiveHint` sind **Hinweise für den Client**, keine Durchsetzung. Grenzen gehören in den **Code des Tools**: Authentifizierung, Autorisierung pro Aktion, Rate-Limits, Allowlists für Pfade und Hosts. Was das Tool nicht kann, kann auch kein manipuliertes Modell.
:::

## Lesen und Schreiben trennen

Trennst du lesende und schreibende Aktionen in **eigene Tools**, lassen sich Rechte fein vergeben – in Claude Code zum Beispiel:

```json
{
  "permissions": {
    "allow": ["mcp__crm__crm_search_customers", "mcp__crm__crm_get_customer"],
    "ask":   ["mcp__crm__crm_update_address"],
    "deny":  ["mcp__crm__crm_delete_customer"]
  }
}
```

Ein einziges Tool `crm_execute(action, …)` macht das unmöglich: Es ist entweder ganz erlaubt oder ganz gesperrt.

:::gem Tools mit Evals verbessern
Gute Tools entstehen nicht am Reissbrett. Bewährter Ablauf: Prototyp bauen, **10–30 realistische Aufgaben** sammeln, die mehrere Aufrufe brauchen und ein prüfbares Ergebnis haben, Agent lösen lassen, **Transkripte lesen** (falsche Tool-Wahl, fehlende Parameter, zu lange Antworten, Schleifen), dann Beschreibungen und Zuschnitt anpassen. Claude kann die Transkripte selbst analysieren und Verbesserungen vorschlagen. Messen: Erfolgsquote, Anzahl Aufrufe und Tokens pro Aufgabe, Fehler pro Tool.
:::

:::berater Im Kundengespräch
Viele Firmen wollen «einfach die bestehende REST-API per MCP freigeben» – 120 Endpunkte, eins zu eins. Das Ergebnis ist ein Agent, der den Kontext mit Werkzeugbeschreibungen füllt, falsch verkettet und zu viel darf. Der bessere Vorschlag: die **fünf bis zehn häufigsten Vorgänge** als Agenten-Tools schneiden, Lesen und Schreiben trennen, Rechte im Code prüfen und mit echten Aufgaben testen. Typischer Einwand: «Dann müssen wir ja Code schreiben.» – Ja, aber wenig, und es ist der Teil, der über Sicherheit und Qualität entscheidet.
:::

:::spickzettel
- Tools für **Agenten**, nicht für Programmierer: begrenzter Kontext, sieht nur die Beschreibung
- **Nach Arbeitsablauf** schneiden (`schedule_meeting` statt 3 Einzeltools); **wenige**, nicht überlappend
- **Namensraum** im Namen: `crm_search_customers`
- Beschreibung: **wofür, wann nicht, Parameter, Beispiele, Einheiten, Grenzen**
- Parameter eindeutig: `customer_id`, **Enums**, Defaults
- Antworten **knapp**, **paginiert**, Kürzung mit Hinweis; **Fehler als Anleitung**
- **Sicherheit im Code** (Auth, Autorisierung, Limits, Allowlists) – Annotations sind nur Hinweise
- **Lesen und Schreiben trennen** → `allow` / `ask` / `deny` pro Tool
- Mit **10–30 realistischen Aufgaben** evaluieren, Transkripte lesen
:::

:::selbstcheck 3
