---
title: Konfiguration und Secrets trennen
level: L2
summary: Die vier Schichten von Defaults bis Umgebungsvariablen, .env und .env.example richtig nutzen, Secrets typisiert laden, persönliche Schlüssel ausserhalb des Repos halten und den Unterschied zwischen Bauzeit und Laufzeit verstehen.
competencies: [ki-dev-04]
volatility: tief
last_verified: 2026-11-27
sources:
  - Skill dev-environment, references/config-und-secrets.md und references/fallstricke.md (geprüft 27.11.2026)
  - grundlagen/diverses.md (Abschnitt 1.3, Claude-API-Key isoliert hinterlegen), Stand 27.11.2026
  - grundlagen/container.md (3.4 ENV vs. ARG, .dockerignore; 10 .env)
  - VSCode Terminal Docker.docx (D.3 – Secrets im Image bleiben im Image)
  - https://12factor.net/config
  - https://docs.pydantic.dev/latest/concepts/pydantic_settings/
  - https://docs.docker.com/build/building/secrets/
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Konfiguration vs. Secrets: 12-Factor, Schichten Defaults/Config-Datei/.env/Umgebungsvariablen, .env.example, pydantic-settings mit SecretStr und fail fast, persönliche API-Keys in ~/.config mit eigenem Variablennamen, read -rs, Bauzeit (ARG, COPY) vs. Laufzeit (ENV, --env-file, Secrets) bei Docker und CI"
---

:::tldr
**Konfiguration gehört in die Umgebung, nicht in den Code – und Secrets gehören nie ins Repo.** Vier Schichten überschreiben sich von oben nach unten: Defaults im Code → Config-Datei → `.env` → Umgebungsvariablen. `.env` enthält Werte und steht in `.gitignore`; **`.env.example`** enthält nur die Namen und wird committet. Secrets werden zur **Laufzeit** hineingereicht, nie zur **Bauzeit** in ein Image gebacken.
:::

## Was ist Konfiguration, was ist ein Secret?

| | Konfiguration | Secret |
|---|---|---|
| Beispiele | Log-Level, Modellname, Timeout, Pfade, Feature-Flags | API-Keys, Passwörter, Tokens, private Schlüssel |
| Schaden bei Veröffentlichung | meist keiner | Missbrauch, Kosten, Datenabfluss |
| Ins Git? | Defaults und nicht-geheime Config ja | **nie** |

:::bildlich Bedienungsanleitung und Tresorschlüssel
Die **Konfiguration** ist die Bedienungsanleitung: Jeder darf sie lesen, sie gehört zum Gerät. Ein **Secret** ist der **Tresorschlüssel**: Er liegt nicht in der Schachtel mit der Anleitung, sondern wird erst am Einsatzort übergeben – und jeder Standort hat seinen eigenen.
:::

## Vier Schichten

| Schicht | Wo | Was | Ins Git? |
|---|---|---|---|
| 1 Defaults | `src/<paket>/settings.py` | sinnvolle Standardwerte, Typen, Prüfung | ja |
| 2 Config-Datei (optional) | `config.toml` oder `config/<umgebung>.toml` | nicht-geheime Einstellungen je Umgebung | ja |
| 3 `.env` | Projektordner | lokale Werte und Secrets für die Entwicklung | **nein** |
| 4 Umgebungsvariablen | Shell, CI-Secrets, Container | Produktion, CI, Überschreiben im Einzelfall | – |

Spätere Schichten gewinnen. So läuft das Projekt lokal mit `.env`, in CI mit GitHub-Secrets und in Produktion mit den Variablen des Containers – **ohne Codeänderung**.

### `.env` und `.env.example`

```bash
# .env.example  → ins Git: alle Namen, Kommentar, kein Wert
APP_LOG_LEVEL=INFO          # DEBUG, INFO, WARNING
APP_ANTHROPIC_API_KEY=      # Pflicht, aus der Console
APP_BUDGET_CHF=20           # Monatsgrenze für API-Kosten
```

Jede neue Variable kommt **immer auch** in `.env.example`. Sonst weiss niemand im Team – und kein Agent –, was nötig ist.

## Typisiert laden statt `os.getenv` überall

```python
from functools import lru_cache
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")
    log_level: str = "INFO"
    budget_chf: float = 20.0
    anthropic_api_key: SecretStr          # kein Default → Pflicht

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

- **Pflichtwerte ohne Default:** Fehlt der Key, bricht der Start mit klarer Meldung ab (**fail fast**) statt später mit `None` irgendwo im Code.
- **`SecretStr`** zeigt sich in Logs und Fehlermeldungen als `**********`. Den Wert holt man nur bewusst mit `.get_secret_value()`.
- **Einmal laden, überall importieren** – kein verstreutes `os.getenv`.

:::falle `os.getenv("KEY")` ohne Prüfung
`os.getenv` liefert bei fehlender Variable stillschweigend `None`. Der Fehler zeigt sich dann Stunden später als kryptisches «401 Unauthorized» oder `NoneType has no attribute …`. Wer ohne pydantic arbeitet, nutzt `os.environ["KEY"]` – das wirft sofort einen Fehler, wenn der Wert fehlt.
:::

## Persönliche Schlüssel ausserhalb des Repos

Einen API-Key, den du in mehreren Projekten nutzt, kopierst du nicht in jede `.env`:

```bash
mkdir -p ~/.config/claude-privat && chmod 700 ~/.config/claude-privat
read -rs KEY && printf '%s' "$KEY" > ~/.config/claude-privat/key && unset KEY   # verdeckt eingeben
chmod 600 ~/.config/claude-privat/key
```

:::gem Eigener Variablenname statt Standardname
Liegt dein Key als `ANTHROPIC_API_KEY` in der Umgebung, greift **jedes** Werkzeug darauf zu, das diesen Standardnamen kennt – auch solche, die du gar nicht damit verbinden wolltest. Ein eigener Name (z. B. `MEINPROJEKT_ANTHROPIC_KEY`), den nur deine Konfiguration ausdrücklich liest, macht die Nutzung bewusst. Und `read -rs` statt `export KEY=…` hält den Wert aus der Shell-History.
:::

## Bauzeit und Laufzeit

Software entsteht in zwei Momenten: **Bauzeit** (Image bauen, Paket erstellen, CI-Build) und **Laufzeit** (das Programm läuft beim Nutzer, im Container, auf dem Server). Was zur Bauzeit hineinkommt, steckt im Ergebnis – und reist mit jeder Kopie mit.

| | Bauzeit | Laufzeit |
|---|---|---|
| Docker | `ARG`, `COPY`, `RUN` | `ENV`-Werte beim Start, `-e`, `--env-file`, Secrets, Volumes |
| Python-Paket | `pyproject.toml`, Code | `.env`, Umgebungsvariablen |
| CI | Workflow-Datei | Repository-Secrets, Environments |
| Darf ein Secret hinein? | **nein** | **ja**, genau hier |

:::falle `COPY .env .` im Dockerfile
Das Secret steckt danach in einer Schicht des Images, auch wenn eine spätere Zeile die Datei löscht. Wer das Image teilt oder in eine Registry pusht, teilt den Schlüssel. Richtig: `.env` in `.dockerignore`, Werte erst beim Start übergeben (`docker run --env-file .env …`). Braucht der **Build selbst** ein Secret (z. B. Zugang zu einer privaten Paketquelle), gibt es dafür Build-Secrets (`RUN --mount=type=secret`), die nicht im Image landen.
:::

## Prüfen

```bash
git ls-files | grep -E '(^|/)\.env$'     # muss leer sein
git check-ignore -v .env                 # zeigt, welche Regel .env ignoriert
```

Ist ein Secret je committet worden: **rotieren**, nicht nur löschen – es bleibt in der Git-Historie (Lektion [Git-Rettung](#/l/git-github/rettung)). Und weil KI-Agenten Dateien lesen können: `.env` zusätzlich per Deny-Regel vor Claude Code schützen (Lektion [Permissions](#/l/ai-security/permissions)).

:::berater Im Kundengespräch
«Wo liegen bei Ihnen die API-Keys?» ist eine der aufschlussreichsten Fragen in einem KI-Projekt. Die Zielantwort: nirgends im Code, nirgends im Image, lokal in einer ignorierten `.env`, in CI als Secret, in Produktion aus einem Secret-Speicher – und jeder Key ist einem Zweck und einer Person zuordenbar und rotierbar. Typischer Einwand: «Das Repo ist doch privat.» – Private Repos werden geklont, geforkt, an Agenten gegeben und irgendwann öffentlich. Ein Secret im Git ist ein Secret mit unbekanntem Verteiler.
:::

:::spickzettel
- Config in die Umgebung, **Secrets nie ins Repo**
- Schichten: **Defaults → Config-Datei → `.env` → Umgebungsvariablen** (spätere gewinnen)
- `.env` in `.gitignore` · **`.env.example`** mit allen Namen committen
- pydantic-settings: Typen, Pflichtwerte (**fail fast**), **`SecretStr`**, einmal laden
- Persönliche Keys in `~/.config/…` (`chmod 600`), **eigener Variablenname**, `read -rs`
- **Bauzeit** (ARG, COPY) ohne Secrets · **Laufzeit** (`--env-file`, CI-Secrets) mit
- Committet? **Rotieren**, dann bereinigen
:::

:::selbstcheck 3
