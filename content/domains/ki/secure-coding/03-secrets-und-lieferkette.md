---
title: Secrets schützen und die Lieferkette absichern
level: L2
summary: Warum Secrets nie in den Code gehören, wie man sie richtig ablegt, was bei einem Leak zu tun ist, und wie Secret Scanning, Push Protection, Dependabot und Lock-Dateien die Lieferkette absichern.
competencies: [ki-scd-03]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill secure-coding, references/krypto-und-lieferkette.md (Abschnitte 4–7; geprüft 27.11.2026)
  - Skill secure-coding, references/vorfall-und-recht.md (Secret rotieren vor Entfernen; geprüft 27.11.2026)
  - https://docs.github.com/en/code-security/getting-started/github-security-features
  - https://owasp.org/Top10/2025/0x00_2025-Introduction/ (A03 Software Supply Chain Failures)
  - Github_TradingAgents.docx (Kap. 10 – Sicherheit)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Secrets (API-Keys, Passwörter, Tokens) nie im Code, Tests, Notebooks, Docker-Images, CI-Logs; Ablage in Umgebungsvariablen bzw. .env (nicht eingecheckt, .env.example mit Platzhaltern) oder Secret Store/Manager, GitHub Actions Secrets; Rotation möglich; geleakter Key: zuerst rotieren/widerrufen, dann aus Historie entfernen (git filter-repo), Löschen allein reicht nie; Schichten: gitleaks als pre-commit, GitHub Secret Scanning mit Push Protection (für öffentliche Repos kostenlos, Push Protection für Nutzer standardmässig an), Partner-Benachrichtigung; Lieferkette (OWASP A03:2025): Lock-Datei committen und exakt installieren (uv sync --locked, npm ci), Scanner pip-audit, npm audit, osv-scanner, Dependabot Alerts/Security Updates/Version Updates, neue Pakete prüfen (Typosquatting, Slopsquatting bei KI-Vorschlägen, Install-Skripte), wenige Abhängigkeiten, Actions auf SHA pinnen, Container-Images pinnen und scannen"
---

:::tldr
**Secrets** – API-Schlüssel, Passwörter, Tokens – gehören **nie** in Code, Tests, Notebooks oder Images, sondern in **Umgebungsvariablen** bzw. eine nicht eingecheckte `.env` oder einen **Secret Store**. Ist ein Secret einmal committet, gilt es als öffentlich: **zuerst widerrufen bzw. rotieren**, dann erst aus der Historie entfernen. Schutz kommt in Schichten: **gitleaks** vor dem Commit, **GitHub Secret Scanning mit Push Protection** beim Push. Die zweite Baustelle ist die **Lieferkette** – seit 2025 eigene Kategorie in den OWASP Top 10: **Lock-Datei**, **Scanner** in der CI, **Dependabot** und **jedes neue Paket prüfen**, auch die von KI vorgeschlagenen.
:::

:::bildlich Schlüssel und Zulieferer
Ein Restaurant lässt den **Tresorschlüssel** nicht im Gästebuch liegen (Secret im Repo) – und wenn er einmal dort lag, wird das **Schloss gewechselt**, nicht nur die Seite herausgerissen. Ebenso prüft es seine **Zulieferer**: Wer liefert die Zutaten, sind die Lieferungen versiegelt, steht auf dem Etikett wirklich «Mehl» und nicht «Mhel»? Eine vergiftete Zutat gefährdet alle Gäste, egal wie sauber die Küche ist.
:::

## Secrets richtig ablegen

| Ort | Geeignet? |
|---|---|
| Im Quellcode, in Tests, Notebooks, Fixtures | **nie** |
| In Docker-Images oder CI-Logs | **nie** |
| `.env` im Projekt, **nicht eingecheckt** (in `.gitignore`), dazu `.env.example` mit Platzhaltern | lokal ja |
| Umgebungsvariablen des Servers | ja |
| Secret Store bzw. Secret Manager der Cloud, GitHub Actions Secrets | ja, für Betrieb und CI |

Wie das in Python sauber umgesetzt wird (z. B. mit `pydantic-settings`), steht in der Lektion [Config und Secrets](#/l/dev-environment/config-und-secrets). Zusätzlich gilt: **Rotation einplanen** – ein Secret, das sich nicht ohne Ausfall wechseln lässt, wird im Ernstfall zu spät gewechselt.

:::falle Gelöscht ist nicht sicher
Wer einen versehentlich committeten Schlüssel im nächsten Commit löscht, hat nichts gewonnen: Er steht weiter in der **Git-Historie**, in Forks, in Caches – und automatisierte Bots durchsuchen öffentliche Repositories in kürzester Zeit nach Schlüsseln. Die richtige Reihenfolge: (1) Schlüssel beim Anbieter **widerrufen bzw. rotieren**, (2) prüfen, ob er missbraucht wurde, (3) erst dann aus der Historie entfernen (z. B. `git filter-repo`).
:::

## Schutzschichten gegen Leaks

| Schicht | Wann | Werkzeug |
|---|---|---|
| **Vor dem Commit** | lokal | gitleaks als pre-commit-Hook |
| **Beim Push** | GitHub | **Push Protection** blockiert Pushes mit erkannten Secrets |
| **Im Repository** | laufend | **Secret Scanning** meldet gefundene Secrets |
| **Bei öffentlichen Leaks** | automatisch | GitHub informiert bei öffentlichen Repos betroffene Anbieter |
| **Vor Release** | CI | Scan über das ganze Repository |

Laut GitHub ist Push Protection für Nutzer **standardmässig eingeschaltet**, und Secret Scanning läuft auf öffentlichen Repositories kostenlos; für private Repositories braucht es je nach Funktion ein kostenpflichtiges Produkt (Stand 27.11.2026).

## Die Lieferkette absichern

Jede Abhängigkeit ist fremder Code, der mit deinen Rechten läuft.

| Massnahme | Umsetzung |
|---|---|
| **Lock-Datei** committen und exakt installieren | `uv.lock` + `uv sync --locked`, `package-lock.json` + `npm ci` |
| **Scanner** in der CI | `pip-audit`, `npm audit`, `osv-scanner` |
| **Dependabot** | Alerts und Security Updates einschalten, Version Updates nach Bedarf |
| **Neue Pakete prüfen** | Name exakt (Tippfehler wie `reqeusts`), Pflege, Herausgeber, Install-Skripte |
| **Wenige Abhängigkeiten** | für drei Zeilen Code kein Paket |
| **CI/CD gehört dazu** | GitHub Actions auf Commit-SHA pinnen, minimale `permissions` (Lektion [Repo absichern](#/l/git-github/repo-absichern-und-agenten)) |
| **Container** | Basis-Images pinnen, regelmässig neu bauen, scannen (z. B. Trivy) |

:::gem Erfundene Paketnamen
Sprachmodelle schlagen gelegentlich Paketnamen vor, die **es nicht gibt**. Angreifer beobachten solche Namen und registrieren sie mit Schadcode – man spricht von **Slopsquatting**. Wer «pip install» auf einen KI-Vorschlag hin ausführt, ohne den Namen zu prüfen, installiert im schlimmsten Fall genau dieses Paket. Darum: Paketname, Herkunft und Downloadzahlen prüfen, bevor etwas hinzukommt – egal, wer es vorgeschlagen hat.
:::

:::berater Im Kundengespräch
Drei Massnahmen bringen in fast jedem Repository mit wenig Aufwand viel: **Secret Scanning mit Push Protection** einschalten, **Dependabot** aktivieren, **Lock-Datei** verbindlich machen. Das ist in einer Stunde erledigt und verhindert die zwei häufigsten Vorfälle – den geleakten Schlüssel und die bekannte, ungepatchte Lücke in einer Abhängigkeit. Typischer Einwand: «Dependabot macht zu viele Pull Requests.» – Gruppieren und Rhythmus einstellen; Sicherheitsupdates aber nicht abschalten.
:::

:::spickzettel
- Secrets **nie** in Code, Tests, Notebooks, Images, Logs
- Ablage: **Umgebungsvariablen**, `.env` (nicht eingecheckt) + `.env.example`, **Secret Store**, Actions Secrets
- Leak: **zuerst rotieren/widerrufen**, dann aus Historie entfernen – Löschen allein reicht **nie**
- Schichten: **gitleaks** (pre-commit) · **Push Protection** · **Secret Scanning**
- Lieferkette (OWASP **A03:2025**): **Lock-Datei** + exakt installieren, **pip-audit/npm audit/osv-scanner**, **Dependabot**
- **Neue Pakete prüfen**: Tippfehler, Herkunft, Install-Skripte; **KI-Vorschläge** (Slopsquatting)
- Actions auf **SHA** pinnen, Images pinnen und scannen
:::

:::selbstcheck 3
