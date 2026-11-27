---
title: Plugins bauen und über einen Marketplace verteilen
level: L3
summary: Aufbau eines Plugins mit Manifest und Komponenten, lokal testen, Versionierung, ein eigener Marketplace als Git-Repository und die Verteilung ans Team – per Repo-Einstellungen oder zentral für die ganze Organisation.
competencies: [ki-skp-05]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/plugins/create
  - https://code.claude.com/docs/en/plugins/marketplace-reference
  - https://code.claude.com/docs/en/plugins-reference
  - https://code.claude.com/docs/ja/plugins/org (Verteilung über extraKnownMarketplaces und enabledPlugins)
  - https://claude.com/docs/plugins/overview
  - https://dev.classmethod.jp/articles/claude-code-plugin-update-not-applied/ (Versionsauflösung, Sekundärquelle)
  - Masterclass_Claude_Skills_Plugins.docx (Kapitel 9 – Marketplaces)
  - Claude Folders.docx (Warum es keinen .claude/plugins-Ordner gibt)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Claude-Code-Plugins: Ordner mit .claude-plugin/plugin.json (nur das Manifest dort), Komponenten im Plugin-Wurzelordner (skills/, agents/, hooks/hooks.json, .mcp.json, commands/, output-styles/, .lsp.json); Namensraum /plugin:skill; testen mit claude --plugin-dir, /reload-plugins, claude plugin validate; Installation in ~/.claude/plugins/cache, enabledPlugins in settings.json; Versionierung: version in plugin.json, sonst Commit-SHA; Marketplace = Repo mit .claude-plugin/marketplace.json (name, owner, plugins); /plugin marketplace add, /plugin install name@marketplace; Team per .claude/settings.json extraKnownMarketplaces + enabledPlugins (nur in vertrauten Ordnern), Organisation per Managed Settings, strictKnownMarketplaces/blockedMarketplaces; Plugins in claude.ai unter Customize > Plugins"
---

:::tldr
Ein **Plugin** ist ein Ordner mit einem **Manifest** (`.claude-plugin/plugin.json`) und beliebigen Komponenten: Skills, Subagents, Hooks, MCP-Server, Befehle. Du testest es lokal mit `claude --plugin-dir ./mein-plugin` und verteilst es über einen **Marketplace** – ein Git-Repository mit einer `marketplace.json`, die deine Plugins auflistet. Ins Team kommt es per `/plugin marketplace add` und `/plugin install`, automatisch über die **Projekt-Einstellungen** eines Repos oder zentral über **Managed Settings**. Anders als ein kopierter `.claude`-Ordner ist ein Plugin **versioniert** und lässt sich mit einem Befehl aktualisieren.
:::

:::bildlich Der Bausatz und der Katalog
Ein Plugin ist ein **Bausatz im Karton**: Rezepte, Werkzeuge, Bestelllisten, alles beschriftet. Ein Marketplace ist der **Katalog** des Herstellers, in dem mehrere Bausätze stehen. Wer den Katalog abonniert, kann jeden Bausatz mit einem Klick bestellen – und bekommt neue Auflagen automatisch.
:::

## Aufbau eines Plugins

```
treuhand-plugin/
├── .claude-plugin/
│   └── plugin.json        nur das Manifest gehört hierhin
├── skills/
│   ├── offerte-erstellen/SKILL.md
│   └── mwst-pruefung/SKILL.md
├── agents/
│   └── belegpruefer.md    Subagent
├── hooks/
│   └── hooks.json         z. B. Formatprüfung nach jeder Änderung
└── .mcp.json              mitgelieferte MCP-Server
```

```json
{
  "name": "treuhand-plugin",
  "description": "Offerten, MWST-Prüfung und Belegkontrolle für Treuhand-Mandate",
  "version": "1.2.0",
  "author": { "name": "Team Treuhand" }
}
```

:::falle Komponenten im falschen Ordner
Der häufigste Anfängerfehler: `skills/` oder `hooks/` in den Ordner `.claude-plugin/` legen. Dort liegt **nur** `plugin.json`; alle Komponenten gehören in den **Wurzelordner des Plugins** – dort werden sie geladen, anderswo nicht. Ebenso wirkungslos: einen Ordner `.claude/plugins/` im Projekt von Hand anlegen. Claude Code durchsucht diesen Pfad nicht; installierte Plugins liegen im Cache unter `~/.claude/plugins/cache/`, das Projekt merkt sich nur, **dass** ein Plugin aktiv ist (`enabledPlugins` in `settings.json`).
:::

## Lokal entwickeln und testen

| Befehl | Zweck |
|---|---|
| `claude --plugin-dir ./treuhand-plugin` | Plugin für **diese Session** laden, ohne Installation (auch als `.zip`) |
| `/treuhand-plugin:offerte-erstellen` | Plugin-Skill aufrufen – Plugin-Skills haben einen **Namensraum** |
| `/reload-plugins` | Änderungen an Hooks, Agents, MCP und Output-Styles ohne Neustart laden |
| `claude plugin validate <pfad>` | Manifest und Marketplace-Datei prüfen |

Den Namensraum gibt es, damit Plugins nicht kollidieren: Zwei Plugins dürfen beide einen Skill `review` haben.

## Versionierung

Claude Code kopiert installierte Plugins in einen versionierten Cache. Massgebend ist das Feld `version`: Steht es in `plugin.json`, bekommen Nutzer **erst dann** ein Update, wenn du die Version **erhöhst**. Fehlt es (auch im Marketplace-Eintrag), dient bei Git-Quellen der **Commit-SHA** als Version – jeder Commit ist dann eine neue Version (Stand 27.11.2026).

:::gem Explizite Versionen für Team-Plugins
Für stabile Team-Plugins lohnt sich eine explizite `version` nach SemVer: Niemand bekommt einen halbfertigen Stand, nur weil jemand auf `main` committet hat. Der Preis: Wer vergisst, die Version zu erhöhen, wundert sich, warum «already at the latest version» erscheint, obwohl sich der Skill geändert hat. Die Version gehört deshalb in jede Freigabe-Checkliste.
:::

## Ein eigener Marketplace

Ein Marketplace ist ein Repository mit der Datei `.claude-plugin/marketplace.json`. Pflichtfelder sind `name`, `owner` und `plugins`:

```json
{
  "name": "firma-tools",
  "owner": { "name": "IT Firma AG" },
  "plugins": [
    { "name": "treuhand-plugin", "source": "./plugins/treuhand-plugin" },
    { "name": "lohn-plugin", "source": { "source": "github", "repo": "firma/lohn-plugin" } }
  ]
}
```

Nutzen in Claude Code:

```
/plugin marketplace add firma/firma-tools
/plugin install treuhand-plugin@firma-tools
```

In der **Claude-App** und in **Cowork** fügst du einen Marketplace unter **Customize › Plugins** hinzu (GitHub-Repository, auch GitHub Enterprise); dort installierte Plugins hängen am Konto.

## Ans Team verteilen

| Reichweite | Weg |
|---|---|
| alle, die in **einem Repository** arbeiten | in `.claude/settings.json` des Repos `extraKnownMarketplaces` und `enabledPlugins` setzen – gilt nur in Ordnern, denen die Person **vertraut** |
| die **ganze Organisation** | dieselben Schlüssel in den **Managed Settings**; mit `strictKnownMarketplaces` bzw. `blockedMarketplaces` festlegen, welche Marketplaces überhaupt erlaubt sind |
| Konten in claude.ai / Cowork | Admins stellen Plugins für die Organisation bereit oder machen sie zur Pflicht |

```json
{
  "extraKnownMarketplaces": {
    "firma-tools": { "source": { "source": "github", "repo": "firma/firma-tools" } }
  },
  "enabledPlugins": { "treuhand-plugin@firma-tools": true }
}
```

:::berater Im Kundengespräch
Der Moment, ein Plugin zu bauen, ist erreicht, wenn **dieselbe Konfiguration in mehrere Projekte kopiert** wird. Kopien laufen innert Wochen auseinander; ein Plugin ist versioniert, lässt sich zentral durchsetzen und mit einem Befehl aktualisieren. Typischer Einwand: «Ein Marketplace ist doch Overkill für fünf Leute.» – Ein Marketplace ist ein Git-Repository mit einer JSON-Datei. Der Aufwand ist eine Stunde; der Nutzen ist, dass alle dieselbe, geprüfte Version haben.
:::

:::spickzettel
- Plugin = Ordner mit **`.claude-plugin/plugin.json`** + Komponenten im **Wurzelordner**
- Komponenten: `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `commands/`
- Testen: **`claude --plugin-dir`**, `/reload-plugins`, `claude plugin validate`
- Plugin-Skills: **`/plugin:skill`** (Namensraum)
- `version` gesetzt → Update nur bei **Erhöhung**; ohne → **Commit-SHA**
- Marketplace: **`.claude-plugin/marketplace.json`** mit `name`, `owner`, `plugins`
- `/plugin marketplace add owner/repo` · `/plugin install name@marketplace`
- Team: **`extraKnownMarketplaces` + `enabledPlugins`** im Repo; Organisation: **Managed Settings**, `strictKnownMarketplaces`
:::

:::selbstcheck 3
