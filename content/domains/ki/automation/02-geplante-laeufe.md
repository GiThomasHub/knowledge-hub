---
title: Geplante Läufe einrichten – GitHub Actions und Claude Scheduled Tasks
level: L2
summary: Einen wöchentlichen Agenten-Lauf mit GitHub Actions und der Claude-Code-Action aufsetzen, Secrets und Rechte richtig vergeben, alternativ eine Cloud Scheduled Task in Claude anlegen und einen Prompt schreiben, der ohne Vorwissen funktioniert.
competencies: [ki-aut-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - Skill agents-automation, references/claude-code.md (GitHub Actions, geplante Aufgaben) und assets/claude-action.yml (geprüft 27.11.2026)
  - https://code.claude.com/docs/en/github-actions
  - https://code.claude.com/docs/en/web-scheduled-tasks (abgerufen 27.11.2026)
  - https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
  - Knowledge Hub, docs/wochen-tasks.md (eigene Wochen-Tasks als Praxisbeispiel)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich, was-ist-neu]
prompt_context: "Geplante Agenten-Läufe: GitHub Actions mit on.schedule (cron) und workflow_dispatch, Secrets (ANTHROPIC_API_KEY) in den Repo-Secrets, permissions minimal, timeout-minutes, concurrency; anthropics/claude-code-action@v1 mit prompt und claude_args (--max-turns, --max-budget-usd, --allowedTools); Claude Cloud Scheduled Tasks (claude.ai/code, /schedule, Repos, Connectors, min. 1 Stunde, keine Rückfragen während des Laufs); Prompt ohne Vorwissen"
---

:::tldr
Für einen geplanten Agenten-Lauf gibt es zwei bequeme Wege: **GitHub Actions** mit der offiziellen **Claude-Code-Action** (läuft auf GitHub-Runnern, Zeitplan per Cron, Schlüssel als **Repo-Secret**) oder eine **Cloud Scheduled Task** in Claude (läuft in Anthropics Cloud, ohne eigene Pipeline). In beiden Fällen gilt: **Secrets nie in die Datei**, **Rechte minimal**, **harte Grenzen** (Schritte, Budget, Zeit) und ein **Prompt, der ohne Vorwissen funktioniert** – denn jeder Lauf beginnt mit einer frischen Session.
:::

## Weg 1: GitHub Actions mit der Claude-Code-Action

```yaml
# .github/workflows/claude-weekly.yml
name: claude-weekly

on:
  schedule:
    - cron: "17 6 * * 1"        # Montag 06:17 UTC
  workflow_dispatch:            # Knopf «Run workflow» zum Testen

permissions:
  contents: write               # nur für eigene Branches; Ruleset schützt main
  pull-requests: write

concurrency:
  group: claude-weekly          # nie zwei Läufe gleichzeitig
  cancel-in-progress: false

jobs:
  weekly:
    runs-on: ubuntu-latest
    timeout-minutes: 45         # harte Zeitgrenze für den ganzen Job
    steps:
      - uses: actions/checkout@v4                 # in Produktion auf Commit-SHA pinnen
      - uses: anthropics/claude-code-action@v1    # dito
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Prüfe die Abhängigkeiten in pyproject.toml auf veraltete Major-Versionen.
            Harte Regeln: nichts mergen, nicht auf main pushen; Änderungen nur als
            Draft-PR auf Branch deps/<JJJJ-MM-TT>. Wenn nichts zu tun ist: nur ein
            kurzer Vermerk im Job-Log.
          claude_args: >-
            --max-turns 20
            --max-budget-usd 3
            --allowedTools "Read,Grep,Glob,Edit,Bash(uv lock *),Bash(uv run pytest *)"
```

| Baustein | Wozu |
|---|---|
| `schedule` + `workflow_dispatch` | Zeitplan **und** Knopf zum Testen |
| `permissions` | nur, was der Lauf braucht; Standard-Token auf «read» im Repo |
| `concurrency` | verhindert, dass ein langsamer Lauf vom nächsten überholt wird |
| `timeout-minutes` | harte Zeitgrenze für den Runner |
| `secrets.ANTHROPIC_API_KEY` | Schlüssel aus den Repo-Secrets, nie im Klartext |
| `claude_args` | CLI-Optionen der Action seit v1: Schritte, Budget, erlaubte Werkzeuge |

**Secret anlegen:** Repo → Settings → Secrets and variables → Actions → «New repository secret» → Name `ANTHROPIC_API_KEY`, Wert aus der Claude Console. Oder per CLI: `gh secret set ANTHROPIC_API_KEY`.

:::falle Secrets in Forks und Logs
Für Pull Requests aus **Forks** stellt GitHub Secrets aus gutem Grund nicht bereit – ein fremder PR soll deinen Schlüssel nicht abgreifen können. Wer das mit `pull_request_target` «löst», öffnet genau diese Tür (Lektion [Repo absichern](#/l/git-github/repo-absichern-und-agenten)). Und: Secrets nie mit `echo` ausgeben oder in Prompts einbauen, die im Log landen.
:::

:::gem Die gleiche Action reagiert auch auf `@claude`
Dieselbe Action kann in einem zweiten Job auf Kommentare mit `@claude` in Issues und Pull Requests reagieren – Claude liest den Kontext, arbeitet und antwortet im Thread. Weil Issue- und PR-Texte von Fremden stammen können, gilt dort besonders: Werkzeuge eng begrenzen, Auslöser auf Personen mit Schreibrecht beschränken, fremden Text als Daten behandeln.
:::

## Weg 2: Claude Cloud Scheduled Tasks

Eine **Cloud Scheduled Task** (früher «Routine») ist eine gespeicherte Claude-Code-Konfiguration aus **Prompt, Repositories und Connectors**, die automatisch läuft (Stand 27.11.2026):

- **Anlegen:** im Web unter claude.ai/code, in der Desktop-App (Code → Scheduled → New task → Cloud) oder in Claude Code mit `/schedule`; verwalten mit `/schedule list`, `/schedule update`, `/schedule run`.
- **Verfügbar** in den Plänen Pro, Max, Team und Enterprise; Team- und Enterprise-Owner können die Funktion für alle abschalten.
- **Trigger:** Zeitplan (mindestens stündlich), einmalig, per API-Aufruf oder auf GitHub-Ereignisse.
- **Ablauf:** Jeder Lauf ist eine **vollständige Cloud-Session ohne Rückfragen** – es gibt keine Freigabe-Dialoge während des Laufs.

| | GitHub Actions + Action | Claude Cloud Scheduled Task |
|---|---|---|
| Infrastruktur | GitHub-Runner (eigene Minuten) | Anthropic-Cloud |
| Konfiguration | YAML im Repo, versioniert, per PR geprüft | Formular bzw. `/schedule`, ausserhalb des Repos |
| Abrechnung | API-Key (Token) + Runner-Minuten | im Rahmen des Claude-Plans |
| Grenzen setzen | `claude_args`, `timeout-minutes` | im Prompt und über Repo-Schutz |
| Gut für | Teams mit CI-Kultur, Prüfung im Review | schnelle Einrichtung, Arbeit über mehrere Repos und Connectors |

:::praxis Die Wochen-Tasks dieses Knowledge Hub
Dieser Knowledge Hub wird von zwei geplanten Claude-Aufgaben gepflegt: eine prüft Inhalte auf Fehler, Updates und neue Themen, die andere ergänzt Fragen. Beide arbeiten nach denselben Regeln: eigener Branch `weekly/<art>-JJJJ-MM-TT`, höchstens ein **Draft-PR** pro Lauf, begrenzte Anzahl Lektionen und Fragen, Build-Prüfung vor dem PR, nie mergen. Die vollständigen Prompts stehen in `docs/wochen-tasks.md` im Repo.
:::

## Der Prompt für einen geplanten Lauf

Ein geplanter Lauf weiss **nichts** von früheren Gesprächen. Der Prompt muss alles enthalten:

```
Ziel: <ein Satz>
Kontext: <Repo/Ordner, was wo liegt, welche Regeln-Datei gilt>
Harte Regeln: nie mergen; nur Branch <präfix>/<JJJJ-MM-TT> als Draft-PR;
              keine Secrets ausgeben; nichts löschen
Schritte: 1. … 2. … 3. …
Abbruch: wenn <Bedingung> → nur Bericht, keine Änderung
Wenn nichts zu tun ist: <was dann – kurzer Bericht, kein PR>
Bericht: Deutsch, kurz – erledigt / offen / Kosten / Links
```

:::gem «Wenn nichts zu tun ist» ausdrücklich regeln
Ein Agent mit dem Auftrag «verbessere die Abhängigkeiten» findet **immer** etwas – notfalls etwas Unnötiges. Die Zeile «Wenn nichts zu tun ist: nur kurzer Bericht, kein PR» verhindert Beschäftigungstherapie und PR-Flut.
:::

:::berater Im Kundengespräch
«Wo soll der Lauf eingerichtet werden?» hängt von der Kultur ab. Teams mit etablierter CI wollen die Konfiguration **im Repo**, versioniert und reviewbar – das spricht für GitHub Actions. Fachabteilungen ohne Pipeline wollen eine **Oberfläche** – das spricht für Claude Scheduled Tasks. Typischer Einwand: «Der Agent soll einfach jeden Morgen laufen.» – Gern, aber erst nach einem Testlauf per Knopf, mit Grenzen, mit Bericht und nur mit Draft-PRs als Ergebnis.
:::

:::spickzettel
- GitHub: **`schedule` + `workflow_dispatch`**, `permissions` minimal, **`concurrency`**, **`timeout-minutes`**
- Schlüssel als **Repo-Secret** (`gh secret set ANTHROPIC_API_KEY`), nie im YAML
- Claude-Code-Action v1: `prompt` + **`claude_args`** (`--max-turns`, `--max-budget-usd`, `--allowedTools`)
- Actions und Action **pinnen**; kein `pull_request_target` für Fork-PRs
- Claude Cloud Scheduled Task: Prompt + Repos + Connectors, **min. 1 Std.**, **keine Rückfragen** im Lauf, `/schedule`
- Prompt **ohne Vorwissen**: Ziel, Kontext, harte Regeln, Schritte, Abbruch, «wenn nichts zu tun», Bericht
:::

:::selbstcheck 3
