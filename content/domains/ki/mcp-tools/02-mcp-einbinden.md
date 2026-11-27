---
title: MCP-Server in Claude Code einbinden
level: L2
summary: MCP-Server mit claude mcp add hinzufügen, den richtigen Scope wählen (local, project, user), die Vorrangregeln kennen und Secrets aus der Konfiguration heraushalten.
competencies: [ki-mcp-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/mcp
  - https://code.claude.com/docs/en/mcp-quickstart
  - Skill ai-security-privacy, references/schichten.md (Abschnitt 5 – MCP-Steuerung; geprüft 27.11.2026)
  - Skill agents-automation, references/tools-und-mcp.md (Eigener MCP-Server; geprüft 27.11.2026)
  - claude_code_masterclass (1).docx (MCP in Claude Code)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "MCP in Claude Code: claude mcp add --transport http <name> <url>, stdio mit -- <befehl>, claude mcp list/get/remove, /mcp in der Session (Status, OAuth-Login); Scopes local (Default, ~/.claude.json, nur du, nur dieses Projekt), project (.mcp.json im Repo, geteilt, braucht Freigabe), user (~/.claude.json, alle Projekte); Vorrang local > project > user > Plugin > claude.ai-Connectors, keine Feldvermischung; Umgebungsvariablen ${VAR} und ${VAR:-default} in .mcp.json; Secrets nie in .mcp.json; ANTHROPIC_API_KEY in url/headers bleibt leer; claude -p lädt Projekt-Server ohne Rückfrage; disabledMcpjsonServers"
---

:::tldr
Mit `claude mcp add` registrierst du einen MCP-Server. Entscheidend ist der **Scope**: **local** (Standard) gilt nur für dich in diesem Projekt, **project** schreibt eine `.mcp.json` ins Repository und teilt den Server mit dem Team, **user** gilt für dich in allen Projekten. Secrets gehören **nie** in die Konfiguration: In `.mcp.json` stehen nur Platzhalter wie `${GITHUB_TOKEN}`, die Werte kommen aus der Umgebung – oder du meldest dich per **OAuth** über `/mcp` an.
:::

:::bildlich Schlüssel am Brett
Ein Server ist wie ein Lieferant, dem du Zugang zum Lager gibst. **Local** ist ein Schlüssel in **deiner** Schublade für **ein** Lager. **User** ist dein Schlüsselbund für **alle** Lager. **Project** ist der Schlüssel am **Brett im Büro**, den alle Kolleginnen sehen – deshalb hängt dort nur ein **Zettel mit dem Hinweis, wo der Schlüssel liegt**, nie der Schlüssel selbst.
:::

## Server hinzufügen

```bash
# Entfernter Server (empfohlen, wo verfügbar)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Lokaler Server als Prozess
claude mcp add --transport stdio buchhaltung -- uv run --directory ~/projects/bh-mcp server.py

# Fürs Team teilen
claude mcp add --transport http sentry --scope project https://mcp.sentry.dev/mcp

# Verwalten
claude mcp list          # alle Server und ihr Zustand
claude mcp get notion    # Details und Scope
claude mcp remove notion
```

In der Session zeigt `/mcp` den Status aller Server; dort meldest du dich bei Servern mit **OAuth** im Browser an. Die Tokens werden sicher gespeichert und automatisch erneuert.

## Die drei Scopes

| Scope | Gilt für | Geteilt | Gespeichert in |
|---|---|---|---|
| **local** (Standard) | dich, nur dieses Projekt | nein | `~/.claude.json` (unter dem Projektpfad) |
| **project** | alle im Projekt | ja, über Git | `.mcp.json` im Projektordner |
| **user** | dich, alle Projekte | nein | `~/.claude.json` |

**Vorrang** bei gleichem Namen: **local → project → user → Plugin-Server → claude.ai-Connectors**. Gewinnt eine Quelle, wird **ihr ganzer Eintrag** verwendet; Felder werden nicht zwischen Scopes gemischt.

:::falle Projekt-Server laufen nicht immer erst nach Freigabe
In einer **interaktiven** Session fragt Claude Code, bevor Server aus einer `.mcp.json` des Projekts genutzt werden – denn ein geklontes Repo könnte einen beliebigen Prozess als «MCP-Server» eintragen. In **`claude -p`**, im Agent SDK und in Cloud-Sessions werden Projekt-Server dagegen **ohne Rückfrage** geladen (Stand 27.11.2026). Wer `claude -p` in einem fremden Repository laufen lässt, startet damit womöglich fremden Code. Einzelne Server blockierst du mit `disabledMcpjsonServers`; für unbeaufsichtigte Läufe in fremden Repos gehört die Konfiguration bewusst eingeschränkt (Lektion [Headless](#/l/automation/headless)).
:::

## Secrets aus der Konfiguration halten

```json
{
  "mcpServers": {
    "crm": {
      "type": "http",
      "url": "${CRM_URL:-https://crm.example.ch}/mcp",
      "headers": { "Authorization": "Bearer ${CRM_TOKEN}" }
    }
  }
}
```

- `${VAR}` wird durch den Wert aus der Umgebung ersetzt, `${VAR:-standard}` mit Ersatzwert. Das funktioniert in `command`, `args`, `env`, `url` und `headers`.
- Fehlt eine Variable ohne Ersatzwert, bleibt der Platzhalter stehen und Claude Code warnt.
- Werte wie `ANTHROPIC_API_KEY` werden in `url` und `headers` entfernter Server bewusst **leer** eingesetzt – damit ein fremdes Projekt nicht deinen Claude-Schlüssel an seinen Server schicken kann.
- Wo der Dienst **OAuth** anbietet, ist die Anmeldung über `/mcp` besser als ein statischer Token: kein Secret in Dateien, Zugriff jederzeit widerrufbar.

:::gem Zuerst ausprobieren, dann programmieren
Bevor du einen Skill oder Code gegen ein MCP-Werkzeug schreibst: Werkzeug **einmal aufrufen** und die echte Antwort ansehen. Viele Server benennen Parameter anders als erwartet oder liefern verschachtelte Strukturen. Zum Testen eigener Server eignen sich `/mcp` in der Session oder der MCP Inspector.
:::

## Welcher Scope wofür?

| Situation | Scope |
|---|---|
| Ausprobieren, persönlicher Test | **local** |
| Werkzeug, das du überall brauchst (z. B. Doku-Suche) | **user** |
| Werkzeug, das zum Projekt gehört und alle brauchen (z. B. Fehler-Tracking des Produkts) | **project**, Secrets per `${VAR}` oder OAuth |
| Vorgabe der Firma für alle Rechner | **Managed Settings** (Lektion [Anbindung bewerten](#/l/mcp-tools/anbindung-bewerten)) |

:::berater Im Kundengespräch
Bei der Prüfung eines Repos lohnt ein Blick in die `.mcp.json`: Stehen dort Tokens im Klartext, ist das ein Sicherheitsvorfall – auch in privaten Repos, denn Repos werden geklont, geforkt und manchmal versehentlich öffentlich. Die Empfehlung: Token sofort widerrufen, durch `${VAR}` oder OAuth ersetzen, Secret Scanning im Repository aktivieren.
:::

:::spickzettel
- `claude mcp add --transport http <name> <url>`; lokal: `--transport stdio <name> -- <befehl>`
- `claude mcp list | get | remove`; in der Session **`/mcp`** (Status, OAuth-Login)
- Scopes: **local** (Standard, nur du, dieses Projekt) · **project** (`.mcp.json`, Team) · **user** (du, alle Projekte)
- Vorrang: **local > project > user > Plugin > claude.ai-Connector**, ganzer Eintrag gewinnt
- Projekt-Server: interaktiv mit **Freigabe**, in `claude -p` **ohne** Rückfrage
- Secrets: **`${VAR}`** / **`${VAR:-standard}`**, besser **OAuth**; nie Klartext in `.mcp.json`
- Werkzeug **einmal aufrufen**, bevor du Code dagegen schreibst
:::

:::selbstcheck 3
