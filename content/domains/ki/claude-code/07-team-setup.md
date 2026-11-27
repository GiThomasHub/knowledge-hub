---
title: Claude Code im Team – Setup, Governance und Kosten
level: L4
summary: Wie du ein Claude-Code-Setup für ein Entwicklungsteam konzipierst – welcher Baustein welche Aufgabe übernimmt, wie Managed Settings und Plugins Regeln verteilen, wie du Kosten misst und begrenzt und wie ein Rollout in Etappen aussieht.
competencies: [ki-cc-07]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://code.claude.com/docs/en/managed-settings (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/settings (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/costs (abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/best-practices (Abschnitte Install plugins, Set up hooks)
  - Claude Folders.docx (Teil C6 – Plugins, Teil D – Kosten steuern, Teil E – Synthese)
  - Skill cc-project-structure und Skill ai-security-privacy (Profile, Managed Settings)
prompts: [mehr, beispiele, kundengespraech, pruef-mich, was-ist-neu]
prompt_context: "Claude Code Team-Setup: Bausteine (CLAUDE.md, Rules, Skills, Subagenten, Hooks, MCP, Plugins) mit klarer Verantwortung, Managed Settings (managed-settings.json, MDM, Server-managed, disableBypassPermissionsMode, allowManagedPermissionRulesOnly, /status Setting sources), Plugins und Marketplaces, Kosten (/usage, Spend-Report, Workspace-Limits, Kontext und Modellwahl), Rollout mit Pilotgruppe, Agenten nur Draft-PRs"
---

:::tldr
Ein gutes Team-Setup gibt **jedem Baustein genau eine Aufgabe**: CLAUDE.md für das, was immer gilt; Regeln für Bereiche; Skills für Abläufe; Subagenten für isolierte Prüfungen; Hooks und Permission-Regeln für das, was **garantiert** gelten muss; MCP für Systeme; **Plugins** zum Verteilen. Was niemand aufweichen darf, kommt in **Managed Settings**. Kosten wachsen mit dem **Kontext** – gemessen wird mit `/usage` und dem Spend-Report, gestartet wird mit einer **Pilotgruppe**.
:::

## Jeder Baustein, eine Aufgabe

| Baustein | Aufgabe | Wird … |
|---|---|---|
| `CLAUDE.md` | Befehle, Konventionen, Stolpersteine, die **immer** gelten | bei jedem Start geladen |
| `.claude/rules/` | Regeln für bestimmte Dateien oder Bereiche | bei passenden Dateien geladen |
| Skills | wiederholbare Abläufe und Fachwissen | bei Bedarf oder per `/name` geladen |
| Subagenten | isolierte Recherche und Prüfungen | mit eigenem Kontext gestartet |
| Hooks | Muss-Regeln: formatieren, blockieren, protokollieren | **immer** ausgeführt |
| Permission-Regeln | was Claude darf, fragen muss oder nie darf | **immer** durchgesetzt |
| MCP-Server | Anbindung an GitHub, Tickets, Datenbanken | bei Bedarf aufgerufen |
| Plugins | Pakete aus Skills, Agenten, Hooks und MCP – versioniert verteilt | einmal installiert, zentral aktualisiert |

:::bildlich Das Betriebshandbuch einer Werkstatt
Ein gutes Setup ist wie das Handbuch einer Werkstatt: eine **Hausordnung** für alle (CLAUDE.md), **Arbeitsanweisungen** pro Maschine (Regeln), **Rezepte** für wiederkehrende Aufträge (Skills), eine **Qualitätskontrolle** mit eigenem Prüfstand (Subagenten), **Not-Aus-Schalter**, die immer funktionieren (Hooks, Deny-Regeln), und **Lieferanten** mit klaren Verträgen (MCP). Plugins sind die **Werkzeugkisten**, die man an jede Filiale verschicken kann.
:::

:::gem Das Signal zum Aufteilen
Sobald die CLAUDE.md gleichzeitig Testkonventionen, API-Regeln und Deployment-Schritte trägt, ist das kein Zeichen für «mehr schreiben», sondern für **aufteilen**: Testregeln in eine pfadgebundene Regel, Deployment in einen Skill. Jede Datei eine Verantwortung – dann bleibt das Setup wartbar, auch wenn zehn Leute daran arbeiten.
:::

## Governance: Was niemand aufweichen darf

**Managed Settings** stehen über allen anderen Ebenen: Weder User-, Projekt- noch lokale Settings oder `--settings` überschreiben sie, bis auf wenige sicherheitsrelevante Ausnahmen, bei denen ein strengerer Wert gilt (Stand 27.11.2026). Verteilt werden sie als `managed-settings.json`, per MDM oder über die claude.ai-Konsole.

Typische Inhalte:

```json
{
  "permissions": {
    "deny": ["Read(~/.ssh/**)", "Read(**/.env)", "Bash(curl *)"],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true
}
```

- **`disableBypassPermissionsMode`** sperrt `--dangerously-skip-permissions`.
- **`allowManagedPermissionRulesOnly`** lässt nur noch die zentral definierten Allow-, Ask- und Deny-Regeln gelten.
- Eine zentrale **Managed-CLAUDE.md** (unter Linux/WSL `/etc/claude-code/CLAUDE.md`) trägt Firmenstandards in jede Session.
- **Prüfen:** `/status` auf einem Rechner ausführen – die Zeile «Setting sources» muss die Managed Settings zeigen.

:::falle Sicherheit über die Team-CLAUDE.md regeln
«Lies nie `.env`» in der CLAUDE.md ist eine Bitte, die ein Kollege lokal überschreiben und ein Agent missverstehen kann. Was die Organisation schützen muss – Secrets, Kundendaten, gefährliche Modi –, gehört in **Managed Settings** mit Deny-Regeln. Details zu Profilen und Schichten: Lektion [Schichten kombinieren](#/l/ai-security/sandbox-vs-permissions).
:::

## Plugins: verteilen statt kopieren

Ein **[[Plugin]]** bündelt Skills, Subagenten, Hooks, MCP-Server und Output-Styles zu einem installierbaren, versionierten Paket. Installiert wird über **Marketplaces** (GitHub-Repos, lokale Pfade, URLs) mit `/plugin`. Im Projekt steht nur der Name unter `enabledPlugins`; der Code liegt im globalen Plugin-Cache.

| Ohne Plugin | Mit Plugin |
|---|---|
| `.claude/`-Dateien von Repo zu Repo kopieren | einmal veröffentlichen, überall installieren |
| jede Kopie driftet auseinander | eine Version, zentral aktualisiert |
| keine Kontrolle, was installiert ist | Marketplace-Policy bestimmt erlaubte Quellen |

:::falle Fremde Plugins und Skills sind Code
Ein Plugin kann Hooks mitbringen, die bei jedem Werkzeugaufruf mit deinen Rechten laufen, und Skills, die Claude Anweisungen geben. Vor der Installation gilt dasselbe wie für jede Abhängigkeit: Quelle prüfen, Inhalt lesen, Version festhalten – und im Team nur Plugins aus freigegebenen Marketplaces zulassen.
:::

## Kosten messen und steuern

Claude Code wird nach Token-Verbrauch abgerechnet, und **die Kosten wachsen mit dem Kontext**: Je mehr Claude pro Anfrage verarbeitet, desto teurer.

**Messen:**

- **`/usage`** zeigt in der Session den Token-Verbrauch und bei Abo-Plänen das Plan-Kontingent.
- Bei **Team- und Enterprise-Plänen** zeigt der Spend-Report in der Organisations-Analyse die geschätzten Ausgaben pro Person und Modell (täglich aktualisiert, CSV-Export).
- Über die **Claude Console** (API) lassen sich Ausgaben- und Ratenlimits pro Workspace setzen.
- **Richtwert** aus der Doku für Unternehmen: im Schnitt rund **13 USD pro Entwickler und aktivem Tag** bzw. 150–250 USD pro Monat, bei 90 % der Nutzer unter 30 USD pro Tag (Stand 27.11.2026; Plan-Preise unter claude.com/pricing).

**Senken:**

| Hebel | Wirkung |
|---|---|
| schlanke CLAUDE.md, Regeln mit `paths`, Abläufe als Skills | weniger Kontext bei **jeder** Anfrage |
| `/clear` zwischen Themen, `/compact` an Meilensteinen | kleinerer Verlauf |
| Recherche an Subagenten | Hauptkontext bleibt klein |
| nur nötige MCP-Server | weniger Werkzeugdefinitionen |
| passendes Modell pro Aufgabe (`/model`) | einfache Aufgaben auf günstigeren Modellen |
| Hooks, die Ausgaben vorfiltern | weniger Rauschen im Kontext |

:::gem Erst messen, dann budgetieren
Schätzungen für ein ganzes Team sind unzuverlässig, weil der Verbrauch stark von Codebasis, Modellwahl und Arbeitsweise abhängt. Die Doku empfiehlt deshalb eine **kleine Pilotgruppe**, deren Verbrauch eine Basislinie liefert – erst danach wird breit ausgerollt und budgetiert.
:::

## Rollout in Etappen

1. **Pilot (2–4 Wochen):** 3–5 Personen, Team-CLAUDE.md, Basis-Permissions, Verbrauch messen, Stolpersteine sammeln.
2. **Standard:** `.claude/settings.json` mit Allow- und Deny-Regeln, zwei bis drei Skills für häufige Abläufe, ein Review-Subagent, Hooks für Formatierung und Schutz von Secrets.
3. **Governance:** Managed Settings für Sicherheitsregeln und gesperrte Modi, freigegebene Marketplaces, Plugins zum Verteilen.
4. **Automatisierung:** Agenten in CI und geplanten Läufen – **nur Branches und Draft-PRs, Menschen mergen** (Lektion [Repo absichern](#/l/git-github/repo-absichern-und-agenten)).
5. **Pflege:** monatlich CLAUDE.md und Regeln kürzen, Kosten- und Qualitätskennzahlen prüfen.

:::berater Im Kundengespräch
Die Geschäftsleitung fragt nach Nutzen, Risiko und Kosten – in dieser Reihenfolge. **Nutzen:** Claude übernimmt Recherche, Routineänderungen, Tests und Reviews; der Mensch entscheidet. **Risiko:** Managed Settings und Deny-Regeln schützen Secrets und Kundendaten, Agenten liefern nur Draft-PRs. **Kosten:** Pilot mit Basislinie, danach Budget pro Person und Monat, sichtbar im Spend-Report. Typischer Einwand: «Wir lassen jeden selbst konfigurieren.» – Dann gibt es zehn verschiedene Sicherheitsniveaus und keine Kostenkontrolle.
:::

:::spickzettel
- **Jeder Baustein eine Aufgabe:** CLAUDE.md · Rules · Skills · Subagenten · Hooks · Permissions · MCP · Plugins
- CLAUDE.md wird zu gross → **aufteilen**, nicht verlängern
- **Managed Settings** über allem; `disableBypassPermissionsMode`, `allowManagedPermissionRulesOnly`; prüfen mit **`/status`**
- Sicherheit gehört in **Managed Settings**, nicht in die Team-CLAUDE.md
- **Plugins** verteilen versioniert; fremde Plugins sind Code → prüfen, Marketplaces freigeben
- Kosten wachsen mit dem **Kontext**; messen mit **`/usage`**, Spend-Report, Workspace-Limits
- Rollout: **Pilot → Standard → Governance → Automatisierung → Pflege**
:::

:::selbstcheck 3
