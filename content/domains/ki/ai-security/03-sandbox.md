---
title: Die Bash-Sandbox – Shell-Befehle wirklich einsperren
level: L2
summary: Was die Sandbox von Claude Code umschliesst, welche Defaults gefährlich offen sind, wie du sie fail-closed einrichtest und mit Gegenproben prüfst.
competencies: [ki-sec-04, ki-sec-02]
volatility: hoch
last_verified: 2026-11-26
sources:
  - Skill ai-security-privacy, references/schichten.md (Abschnitt Bash-Sandbox, geprüft 23.11.2026)
  - https://code.claude.com/docs/en/sandboxing
  - VSCode Terminal Docker.docx (Teil D.4)
prompts: [mehr, einfach, finde-den-fehler, pruef-mich, was-ist-neu]
prompt_context: "Claude Code Bash-Sandbox (bubblewrap unter Linux/WSL2): failIfUnavailable, allowUnsandboxedCommands, denyRead, Netz-Allowlist, strictAllowlist, credentials"
---

:::tldr
Die Sandbox umschliesst **Shell-Befehle samt allen Kindprozessen** auf Betriebssystemebene. Damit greift sie dort, wo Permission-Regeln versagen: bei `grep -r`, Python-Skripten, `npm install`. Aber Achtung: Standardmässig ist sie **aus**, darf **fast alles lesen** – auch `~/.ssh` – und läuft bei einem Fehler **ungeschützt weiter**, wenn du sie nicht fail-closed einstellst.
:::

## Was die Sandbox ist

Unter Linux und WSL 2 nutzt Claude Code das Werkzeug **bubblewrap** (`bwrap`). Es startet jeden Shell-Befehl in einem abgeschotteten Bereich: Das Dateisystem ist weitgehend schreibgeschützt, Netzwerkverkehr läuft nur über einen lokalen Proxy mit Erlaubnisliste.

:::bildlich Der Glaskasten im Werkraum
Permission-Regeln sind wie ein Schild an der Werkzeugwand: «Die Säge nicht benutzen.» Wer die Säge aus dem Nebenraum holt, hält sich formell an das Schild. Die Sandbox ist ein **Glaskasten**, in dem der Handwerker arbeitet: Egal welches Werkzeug er nimmt – er kommt nur an das, was im Kasten liegt, und telefonieren kann er nur über die Zentrale, die nur bestimmte Nummern durchstellt.
:::

## Was sie umschliesst – und was nicht

| Was Claude Code tut | Sandbox schützt? |
|---|---|
| Bash- und PowerShell-Befehle **samt Kindprozessen** | ✅ |
| Datei-Tools (Read, Edit, Write) | ❌ → dafür Permission-Regeln |
| WebFetch und WebSearch | ❌ → dafür Permission-Regeln |
| Hooks, lokale MCP-Server, Statuszeile, LSP | ❌ laufen mit vollen Rechten |
| Selbst getippte `!`-Befehle | ❌ meist ausserhalb |
| Was ans Modell geht | ❌ |

Deshalb ergänzen sich Sandbox und Regeln: Die Regeln decken die Datei-Tools ab, die Sandbox die Shell. Alles Übrige deckt erst ein Container ab.

## Die Defaults – und warum sie nicht reichen

Ist die Sandbox aktiv, gilt standardmässig:

- **Schreiben** nur im Arbeitsordner, im Temp-Ordner und in per `--add-dir` hinzugefügten Ordnern. ✅
- **Netzwerk** nur über den Proxy. Die Erlaubnisliste startet leer, neue Hosts lösen je nach Modus eine Rückfrage aus. ✅
- **Lesen fast überall – inklusive `~/.ssh` und `~/.aws/credentials`.** ⚠️
- **Umgebungsvariablen werden vererbt – inklusive Secrets.** ⚠️

:::falle «Sandbox an» heisst nicht «Schlüssel sicher»
Die Sandbox verhindert standardmässig vor allem Schreiben und unkontrollierten Netzverkehr. Ein Befehl in der Sandbox kann deinen SSH-Schlüssel trotzdem **lesen**. Ohne Netz kommt er damit zwar nicht nach draussen – aber er landet im Kontext und damit beim Modell. Lesesperren musst du selbst setzen.
:::

## Einrichten in vier Schritten

### 1. Abhängigkeiten installieren

```bash
sudo apt-get install bubblewrap socat
# optional, blockt Unix-Sockets (wichtig unter WSL, siehe unten):
npm install -g @anthropic-ai/sandbox-runtime
```

In der Session zeigt `/sandbox` fehlende Teile im Tab «Dependencies». Nach der Installation Claude Code neu starten.

:::praxis Ubuntu 24.04 und AppArmor
Neuere Ubuntu-Versionen beschränken unprivilegierte User-Namespaces, die bubblewrap braucht. Prüfen mit `sysctl kernel.apparmor_restrict_unprivileged_userns`. Steht dort `1`, ein AppArmor-Profil **nur für `/usr/bin/bwrap`** anlegen – nicht den Schalter global auf 0 setzen, das schwächt das ganze System.
:::

### 2. Fail-closed einschalten

Das Wichtigste zuerst: Wenn die Sandbox nicht starten kann, soll **nichts** laufen. Sonst läuft bei fehlendem bwrap alles ungeschützt – mit einer Warnung, die man leicht übersieht. Dieses Verhalten nennt man [[Fail-closed]].

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

- `failIfUnavailable: true` – kein Start ohne funktionierende Sandbox.
- `allowUnsandboxedCommands: false` – Claude darf einen gescheiterten Befehl **nicht** «nochmals ohne Sandbox» versuchen.

:::gem Allow-Regeln öffnen die Hintertür
Eine Regel wie `"allow": ["Bash(curl *)"]` genehmigt auch den Retry **ohne** Sandbox – ohne Rückfrage. Wer die Sandbox ernst meint, setzt `allowUnsandboxedCommands: false` oder streicht solche Allow-Regeln.
:::

### 3. Lesen einschränken

Das Muster «alles zu, Projekt auf» – **nur in den Projekt-Settings**, weil `.` relativ zur Settings-Datei ist:

```json
{
  "sandbox": {
    "filesystem": {
      "denyRead": ["~/"],
      "allowRead": ["."]
    }
  }
}
```

Der engere Pfad gewinnt: Das Projekt ist lesbar, der Rest des Home-Ordners nicht. In den User-Settings würde `.` auf `~/.claude` zeigen – dort deshalb absolute Pfade verwenden, z. B. `"denyRead": ["~/.ssh", "~/.aws", "/mnt"]`.

Ergänzend gibt es seit v2.1.257 `permissions.blockReadsOutsideWorkingDirectories: true`: Datei-Tools und Lesebefehle verweigern dann Lesen ausserhalb der Arbeitsordner in jedem Modus.

### 4. Netz und Secrets begrenzen

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": ["registry.npmjs.org", "pypi.org", "files.pythonhosted.org"],
      "strictAllowlist": true
    },
    "credentials": {
      "envVars": [{ "name": "ANTHROPIC_API_KEY", "mode": "deny" }, { "name": "GITHUB_TOKEN", "mode": "deny" }]
    }
  }
}
```

- `strictAllowlist: true` verweigert unbekannte Hosts, statt nachzufragen.
- `credentials.envVars` mit `mode: "deny"` entfernt die Variable vor jedem Befehl.

:::falle Wo ein Schlüssel wirkt, ist entscheidend
`strictAllowlist` und `sandbox.credentials` werden in **Projekt-Settings ignoriert** (Schutz davor, dass ein Repo sie aufweicht oder umleitet). Sie wirken nur in `~/.claude/settings.json`, in Managed Settings oder per `--settings`. Wer sie ins Repo schreibt, hat eine Konfiguration ohne Wirkung.
:::

:::gem Breite Domains sind Ausgänge
`github.com` oder `*.amazonaws.com` in der Erlaubnisliste wirken harmlos. Der Proxy prüft aber nur den Hostnamen. Über einen erlaubten Dienst (ein Gist, ein Bucket) lässt sich genauso Inhalt nach draussen schaffen. Die Liste so eng wie möglich halten.
:::

## WSL und Windows-Programme

Aus WSL lassen sich Windows-Programme starten (`cmd.exe`, `powershell.exe`, alles unter `/mnt/c/`). Ob die Sandbox das verhindert, hängt am **seccomp-Filter** aus `@anthropic-ai/sandbox-runtime`. Ohne ihn ist der Start von Windows-Programmen nicht zuverlässig gesperrt – und ein Windows-Programm läuft ausserhalb jeder Linux-Sandbox. Für strenge Fälle: eine eigene WSL-Distribution nur für Claude, mit abgeschaltetem Interop und ohne Automount von `C:`.

## Prüfen: die Gegenproben

Lass **Claude** in der Session diese Befehle ausführen (nicht selbst mit `!` tippen):

| Gegenprobe | Erwartung |
|---|---|
| `cat ~/.ssh/id_ed25519` | scheitert ohne Rückfrage |
| `curl -sS https://example.com` | verweigert (mit `strictAllowlist`) |
| `curl --noproxy '*' https://example.com` | `Could not resolve host` |
| `touch ~/sandbox-probe` | verweigert |
| `env` gefiltert nach `token` | keine Treffer für gesperrte Variablen |

Dazu `/sandbox`: Der Tab «Dependencies» darf keine fehlenden Teile zeigen.

:::berater Im Kundengespräch
Die häufigste Fehleinschätzung: «Wir haben die Sandbox aktiviert, also ist alles abgeschottet.» Die ehrliche Antwort: *«Die Sandbox ist ein starker Baustein für Shell-Befehle. Standardmässig darf sie aber fast alles lesen, und ohne fail-closed läuft sie bei einem Fehler einfach ohne Schutz weiter. Wir stellen sie so ein, dass sie im Zweifel blockiert – und beweisen es Ihnen mit fünf Gegenproben.»* Der Nachweis per Gegenprobe überzeugt einen CISO mehr als jede Folie.
:::

:::spickzettel
- Sandbox = Shell **samt Kindprozessen**. Datei-Tools, Hooks, MCP: nicht abgedeckt.
- Default: aus · liest fast alles (auch `~/.ssh`) · vererbt Secrets.
- Installieren: `bubblewrap socat`, optional `@anthropic-ai/sandbox-runtime` (seccomp).
- **Fail-closed:** `failIfUnavailable: true`, `allowUnsandboxedCommands: false`.
- Lesen: `denyRead ["~/"]` + `allowRead ["."]` **nur im Projekt**; User-Settings: absolute Pfade.
- `strictAllowlist` und `credentials` wirken **nicht** in Projektdateien.
- Domains eng halten. Prüfen mit Gegenproben **durch Claude**.
:::

:::selbstcheck 3
