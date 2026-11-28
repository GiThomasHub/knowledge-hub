---
title: Die Produktlandschaft – welches Claude wofür?
level: L1
summary: Chat, Projekte, Aufgaben an Claude übergeben (Cowork), Claude Code, die Integrationen in Browser und Office, die API und Managed Agents – was sie sind, für wen sie passen und welcher Plan für Unternehmen zählt.
competencies: [ki-ber-01]
volatility: hoch
last_verified: 2026-11-28
sources:
  - https://claude.com/pricing (Pläne und enthaltene Produkte; geprüft 28.11.2026)
  - https://support.claude.com/en/articles/11049741 (Max-Plan; geprüft 28.11.2026)
  - https://platform.claude.com/docs/en/managed-agents/overview (Managed Agents, Beta; geprüft 28.11.2026)
  - https://claude.com/platform/claude-managed-agents (Preis Managed Agents; geprüft 28.11.2026)
  - Claude_Managed_Agents_Leitfaden_v2.docx (Kapitel 4 und 7 – Vergleich und wann nutze ich was)
  - claude_financial_services_masterclass (1).docx (Kapitel 9 – Einführung in Stufen)
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Produktlandschaft Anthropic Stand 28.11.2026: Claude-App (Web, Desktop, Mobile) für Chat, Projekte (geteilte Wissensbasis und Anweisungen), Artefakte, Recherche, Memory, Skills, Connectors; längere Aufgaben an Claude übergeben mit Dateien und Apps (früher Cowork genannt); Claude Code für Entwicklung im Terminal, in VS Code, im Web; Integrationen Claude in Chrome, Claude for Microsoft 365 und Outlook, Claude im Team-Chat; API (Messages API) für eigene Anwendungen; Managed Agents (Beta) als fertiger Agent-Harness in verwalteter Infrastruktur für lange, asynchrone Aufgaben, Preis Token plus USD 0.08 pro Session-Stunde; Pläne Free, Pro, Max für Einzelpersonen, Team und Enterprise für Organisationen mit SSO, zentraler Verwaltung, kein Training mit Inhalten standardmässig; Grundregel: benutzen (App, Claude Code) vs. bauen (API, Managed Agents)"
---

:::tldr
Anthropic bietet nicht «ein» Claude, sondern eine Familie von Produkten. Die wichtigste Unterscheidung: **Produkte, die Menschen benutzen** – die **Claude-App** mit Chat, Projekten und längeren Aufgaben, **Claude Code** für die Entwicklung und Integrationen in **Browser und Office** – und **Bausteine, mit denen man eigene Lösungen baut**: die **API** und [[Managed Agents]]. Für Unternehmen zählt zudem der **Plan**: **Team** und **Enterprise** bringen zentrale Verwaltung, Single Sign-on und standardmässig **kein Training mit den eigenen Inhalten**. Stand 28.11.2026 – die Produktnamen und Funktionen ändern sich schnell.
:::

:::bildlich Werkzeug oder Werkstatt
Die Claude-App und Claude Code sind wie **Werkzeuge**, die Mitarbeitende direkt in die Hand nehmen. Die API und Managed Agents sind eine **Werkstatt**, in der die eigene IT ein neues Werkzeug baut – etwa einen Kundenservice-Assistenten oder einen nächtlichen Prüfprozess – das danach viele andere benutzen.
:::

## Die Landschaft im Überblick

```mermaid
flowchart LR
  subgraph B["Benutzen"]
    A1["Claude-App: Chat, Projekte, Aufgaben"]
    A2["Claude Code"]
    A3["Chrome, Microsoft 365, Team-Chat"]
  end
  subgraph S["Bauen"]
    S1["API (Messages)"]
    S2["Managed Agents"]
  end
  S1 --> P["Eigene Anwendung für viele Nutzende"]
  S2 --> P
```

| Produkt | Für wen | Typischer Einsatz |
|---|---|---|
| **Claude-App: Chat** | alle Mitarbeitenden | Texte entwerfen, zusammenfassen, recherchieren, Daten auswerten |
| **Projekte** | Teams | gemeinsame Wissensbasis und Anweisungen pro Thema, z. B. «Offerten» oder «Personalreglement» |
| **Aufgaben übergeben** (bisher «Cowork») | Fachleute ohne Programmierkenntnisse | mehrstufige Arbeit mit Dateien und angebundenen Apps, z. B. Berichte aus mehreren Quellen erstellen |
| **Claude Code** | Entwicklerinnen und Entwickler | Code lesen, schreiben, testen, Pull Requests vorbereiten |
| **Claude in Chrome, Claude for Microsoft 365 / Outlook** | Wissensarbeit im Browser und in Office | Webformulare bearbeiten, in Excel, Word, PowerPoint und Outlook arbeiten |
| **API (Messages)** | IT, Produktteams | Claude in eigene Software einbauen: Chatbot, Klassifikation, Extraktion |
| **Managed Agents** | IT, Produktteams | fertiger Agenten-Rahmen in verwalteter Infrastruktur für lange, asynchrone Aufgaben |

## Managed Agents in einem Satz

Managed Agents ist ein **vorgefertigter, konfigurierbarer Agenten-Rahmen** (Harness), der in einer von Anthropic verwalteten Umgebung läuft – Werkzeuge, Sandbox, Sitzungen und Zeitpläne sind schon da. Er eignet sich für **lange, asynchrone Aufgaben**, etwa einen Prüfprozess, der jede Nacht läuft. Abgerechnet werden die Tokens plus **USD 0.08 pro aktive Sitzungsstunde**; das Produkt ist im **Beta-Status** (Stand 28.11.2026). Wer die volle Kontrolle über den Ablauf braucht, baut stattdessen mit der Messages API selbst (Thema [Agenten](#/t/agents)).

## Pläne – was für Unternehmen zählt

| | Free / Pro / Max | Team / Enterprise |
|---|---|---|
| Gedacht für | Einzelpersonen | Organisationen |
| Verwaltung | eigenes Konto | **zentrale Verwaltung**, **Single Sign-on**, Ausgabenkontrolle |
| Training mit Inhalten | Einstellung des Kontos (Opt-out) | **standardmässig nein** |
| Firmenweite Skills, Connectors | nein | ja, durch Admins steuerbar |

:::falle Privatkonto für Firmendaten
Der häufigste Fehler bei der Einführung ist nicht das falsche Produkt, sondern der **falsche Kontotyp**: Mitarbeitende nutzen ein privates Free- oder Pro-Konto für Kundendaten, weil es schneller geht. Damit fehlen Verwaltung, Vertrag und die geprüften Datenschutzeinstellungen. Für geschäftliche Daten gehört der Einsatz auf ein **Team- oder Enterprise-Konto** mit geklärter Datenfrage (Lektion [Datenfrage Schweiz](#/l/ai-security/datenfrage-schweiz)).
:::

:::gem Benutzen vor Bauen
Viele Firmen starten mit einem API-Projekt, obwohl die Claude-App mit einem gut gepflegten **Projekt** und einigen **Skills** denselben Nutzen in Tagen statt Monaten bringt. Die Faustregel: Zuerst prüfen, ob ein vorhandenes Produkt die Aufgabe löst. Gebaut wird erst, wenn **viele Personen** eine **gleichbleibende** Lösung brauchen, die in **eigene Systeme** eingebettet ist.
:::

:::berater Im Kundengespräch
Auf die Frage «Welches Claude sollen wir kaufen?» helfen drei Gegenfragen: **Wer nutzt es** – alle Mitarbeitenden, ein Fachteam oder Entwicklerinnen? **Wo passiert die Arbeit** – im Chat, in Office, im Code oder in einem eigenen System? **Wie heikel sind die Daten?** Daraus ergibt sich fast immer: Team- oder Enterprise-Plan für die Breite, Claude Code für die Entwicklung, und API oder Managed Agents erst für die Prozesse, die automatisch und für viele laufen sollen.
:::

:::spickzettel
- **Benutzen**: Claude-App (Chat, **Projekte**, Aufgaben übergeben), **Claude Code**, Chrome, Microsoft 365
- **Bauen**: **API** (volle Kontrolle), **Managed Agents** (fertiger Harness, lange asynchrone Aufgaben, Beta)
- Managed Agents: Tokens + **USD 0.08 pro Sitzungsstunde** (Stand 28.11.2026)
- Unternehmen: **Team/Enterprise** – zentrale Verwaltung, SSO, **kein Training standardmässig**
- **Kein Privatkonto für Firmendaten**
- Faustregel: **Benutzen vor Bauen**
- Produktnamen und Funktionen **ändern sich schnell** – vor jeder Empfehlung prüfen
:::

:::selbstcheck 3
