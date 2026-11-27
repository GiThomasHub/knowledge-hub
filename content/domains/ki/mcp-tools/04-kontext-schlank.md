---
title: Viele Werkzeuge, schlanker Kontext
level: L3
summary: Warum Werkzeugbeschreibungen und -antworten das Kontextfenster füllen und wie du gegensteuerst – mit Tool Search, Ausgabegrenzen, MCP-Servern nur im Subagenten und dem Abschalten ungenutzter Server.
competencies: [ki-mcp-04]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/mcp (Output limits, Tool Search, Scopes)
  - https://code.claude.com/docs/en/agent-sdk/tool-search
  - https://code.claude.com/docs/en/sub-agents (mcpServers im Subagenten)
  - Skill agents-automation, references/tools-und-mcp.md (wenige Tools, knappe Antworten; geprüft 27.11.2026)
  - Skill ai-security-privacy, references/schichten.md (Bare Toolname als Deny entfernt das Tool; geprüft 27.11.2026)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Kontext-Kosten von Tools: jede Werkzeugbeschreibung belegt Kontext bei jedem Aufruf, grosse Tool-Antworten ebenso; Tool Search: Definitionen von MCP-Tools werden zurückgestellt und bei Bedarf über ein Such-Tool geladen, Steuerung über ENABLE_TOOL_SEARCH (auto, auto:N, false), nicht verfügbar u. a. bei eigener ANTHROPIC_BASE_URL; alwaysLoad für Ausnahmen; Ausgabe: Warnung ab 10 000 Tokens, Grenze 25 000 Tokens (MAX_MCP_OUTPUT_TOKENS), Texte über 50 000 Zeichen werden in Datei gespeichert; MCP-Server nur im Subagenten über mcpServers im Frontmatter (verbindet beim Start, trennt am Ende; nicht bei Plugin-Subagenten); ungenutzte Server in /mcp abschalten; Deny mit blossem Toolnamen entfernt Tool aus dem Kontext; /context zeigt Verbrauch"
---

:::tldr
Jedes Werkzeug kostet Kontext: seine **Beschreibung** liegt bei jedem Aufruf im Fenster, und seine **Antworten** ebenso. Fünf MCP-Server mit je 30 Tools können einen grossen Teil des Fensters belegen, bevor die eigentliche Arbeit beginnt. Claude Code steuert dagegen mit **Tool Search**: Definitionen von MCP-Tools werden zurückgestellt und erst bei Bedarf geladen. Dazu kommen **Ausgabegrenzen** für Tool-Antworten. Den Rest erledigst du selbst: **ungenutzte Server abschalten**, Server, die nur eine Teilaufgabe braucht, **nur im Subagenten** einbinden, und Tools so bauen, dass ihre Antworten **knapp** sind.
:::

:::bildlich Der Werkzeuggürtel
Ein Handwerker trägt nicht seine ganze Werkstatt am Gürtel. Am Gürtel hängen die fünf Werkzeuge, die er ständig braucht, dazu ein **Katalog** der Werkstatt. Braucht er die Spezialzange, schaut er im Katalog nach und holt sie (**Tool Search**). Für die Elektroarbeit im Keller schickt er einen **Elektriker** mit eigenem Koffer (**Subagent mit eigenem MCP-Server**) – der Koffer belastet seinen Gürtel nie.
:::

## Wo der Kontext hingeht

| Kostenquelle | Wann | Gegenmittel |
|---|---|---|
| Werkzeugbeschreibungen | bei **jedem** Aufruf, für alle geladenen Tools | Tool Search, weniger Server, Server nur im Subagenten |
| Werkzeugantworten | bei jedem Aufruf, bleiben im Verlauf | knappe Antworten, Paginierung, Ausgabegrenzen |
| Doppelte Server | wenn derselbe Dienst über App-Connector **und** lokale Konfiguration kommt | einen davon abschalten |

Mit `/context` siehst du in Claude Code, wie viel des Fensters auf Werkzeuge, Verlauf und Anweisungen entfällt.

## Tool Search

Statt alle MCP-Werkzeugbeschreibungen vorab zu laden, stellt Claude Code sie **zurück** und gibt dem Modell ein **Such-Werkzeug**. Braucht Claude ein Werkzeug, sucht es danach und lädt nur die passende Definition. In aktuellen Versionen ist Tool Search **standardmässig aktiv** (Stand 27.11.2026).

| `ENABLE_TOOL_SEARCH` | Verhalten |
|---|---|
| nicht gesetzt | Standard: zurückstellen |
| `auto` / `auto:N` | erst zurückstellen, wenn die Definitionen einen Anteil N % des Kontexts überschreiten |
| `false` | aus – alle Definitionen werden vorab geladen |

Server, deren Tools immer sofort da sein müssen, lassen sich von der Zurückstellung ausnehmen (`alwaysLoad`). Tool Search ist nicht überall verfügbar – etwa mit einer eigenen `ANTHROPIC_BASE_URL` (z. B. hinter einem Gateway) oder bei manchen Cloud-Anbietern; dann werden alle Definitionen wieder vorab geladen.

:::falle «Tool Search löst alles»
Tool Search spart Platz für **Beschreibungen**, nicht für **Antworten**. Ein Tool, das 3000 Zeilen JSON zurückgibt, füllt das Fenster trotzdem. Und viele überlappende Tools bleiben verwirrend, auch wenn sie erst bei Bedarf geladen werden: Das Modell muss beim Suchen immer noch zwischen `search`, `find` und `lookup` wählen. Tool Search ersetzt kein gutes Tool-Design.
:::

## Ausgabegrenzen

Claude Code begrenzt, was ein MCP-Werkzeug zurückgeben darf (Stand 27.11.2026):

- **Warnung** ab **10 000 Tokens** Ausgabe.
- **Grenze** standardmässig **25 000 Tokens**, anpassbar mit `MAX_MCP_OUTPUT_TOKENS`.
- Textergebnisse über **50 000 Zeichen** werden in eine **Datei** geschrieben, statt im Kontext zu landen.

Die Grenze hochzusetzen ist selten die Lösung. Besser: Das Tool liefert gefilterte, paginierte Antworten (Lektion [Tools entwerfen](#/l/mcp-tools/tools-entwerfen)).

## MCP-Server nur im Subagenten

Braucht nur eine Teilaufgabe einen Server – etwa Browser-Tests mit Playwright –, bindest du ihn **im Subagenten** ein statt in der Hauptsession:

```markdown
---
name: browser-tester
description: Testet die Web-App im Browser und meldet Fehler mit Screenshot-Beschreibung.
tools: Read, Grep
mcpServers:
  playwright:
    type: stdio
    command: npx
    args: ["-y", "@playwright/mcp@latest"]
---
Teste die angegebenen Seiten und liefere eine kurze Liste der Fehler.
```

Ein so definierter Server **verbindet sich beim Start des Subagenten und trennt sich am Ende**; die Hauptsession sieht seine Werkzeuge nie. Der Subagent liefert nur ein kurzes Ergebnis zurück. Einschränkung: Subagenten aus **Plugins** unterstützen `mcpServers` aus Sicherheitsgründen nicht.

:::gem Abschalten statt ertragen
Ein Server, den du in diesem Projekt nicht brauchst, gehört abgeschaltet: per Schalter in `/mcp` (auch für claude.ai-Connectors) oder mit einer Deny-Regel nur mit dem Servernamen, etwa `"deny": ["mcp__slack"]` – ein solcher Deny entfernt die Werkzeuge ganz aus dem Kontext. Das spart Platz **und** verkleinert die Angriffsfläche.
:::

:::berater Im Kundengespräch
Klagen wie «Claude Code wird mit der Zeit dumm und vergisst Anweisungen» haben oft eine einfache Ursache: zu viele Server, zu grosse Tool-Antworten. Ein Blick auf `/context` zeigt es meist sofort. Die Massnahmen in Reihenfolge: ungenutzte Server abschalten, Spezial-Server in Subagenten verschieben, Tools mit grossen Antworten überarbeiten – erst danach über grössere Kontextfenster nachdenken.
:::

:::spickzettel
- Tool-**Beschreibungen** und -**Antworten** kosten Kontext bei **jedem** Aufruf; prüfen mit **`/context`**
- **Tool Search**: MCP-Definitionen zurückgestellt, Laden bei Bedarf; Standard aktiv; `ENABLE_TOOL_SEARCH` (`auto:N`, `false`)
- Nicht verfügbar u. a. mit eigener **`ANTHROPIC_BASE_URL`**; Ausnahmen mit `alwaysLoad`
- Ausgabe: **Warnung 10 000**, **Grenze 25 000 Tokens** (`MAX_MCP_OUTPUT_TOKENS`), **> 50 000 Zeichen → Datei**
- Spezial-Server **nur im Subagenten** (`mcpServers` im Frontmatter) – nicht bei Plugin-Subagenten
- Ungenutzte Server **abschalten** (`/mcp`, Deny mit Servername)
- Tool Search ersetzt **kein** gutes Tool-Design
:::

:::selbstcheck 3
