---
title: Git und GitHub unter WSL einrichten
level: L1
summary: Git konfigurieren, Zeilenenden zähmen, sich sicher bei GitHub anmelden (gh, SSH, Token), einen bestehenden Ordner verbinden und Commits signieren – ohne die Fallen, die in vielen Anleitungen stehen.
competencies: [ki-git-01, ki-dev-01]
volatility: mittel
last_verified: 2026-11-27
sources:
  - grundlagen/github_wsl_basics.md (Abschnitte 1–6, 11–13, Stand 27.11.2026)
  - Skill dev-environment, references/git-github.md und references/fallstricke.md (geprüft 27.11.2026)
  - https://learn.microsoft.com/windows/wsl/tutorials/wsl-git
  - https://cli.github.com/manual/gh_auth_setup-git
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
  - https://git-scm.com/docs/gitattributes
  - https://git-scm.com/docs/git-credential-store
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Git unter WSL 2 einrichten: git config (user, init.defaultBranch, core.autocrlf input, push.autoSetupRemote), .gitattributes eol=lf, Authentifizierung mit gh auth login/setup-git, SSH-Key ed25519, Fine-grained PAT, credential.helper store vs cache, bestehenden Ordner mit GitHub verbinden, SSH-Commit-Signing"
---

:::tldr
Einmal pro Rechner: Name und E-Mail setzen, `main` als Standard, `core.autocrlf input`, `push.autoSetupRemote true`. Anmelden am einfachsten mit **`gh auth login`** plus **`gh auth setup-git`**, alternativ mit SSH-Key. **Nicht** `credential.helper store` verwenden – das speichert das Token im **Klartext**. Projekte gehören ins Linux-Dateisystem (`~/projekte`), nicht nach `/mnt/c`. Und verbindlich für alle wird das Zeilenende erst mit einer **`.gitattributes`** im Repo.
:::

## Grundkonfiguration (einmal pro Rechner)

```bash
sudo apt update && sudo apt install -y git      # in WSL, nicht in PowerShell
git config --global user.name  "Vorname Nachname"
git config --global user.email "name@beispiel.ch"   # = verifizierte GitHub-Adresse
git config --global init.defaultBranch main
git config --global core.autocrlf input         # LF im Repo, auch wenn Windows-Dateien hereinkommen
git config --global push.autoSetupRemote true   # erster Push ohne -u
git config --global core.editor "code --wait"   # Commit-Nachrichten in VS Code
git config --list                                # prüfen
```

## Zeilenenden: das unsichtbare Problem

Windows beendet Zeilen mit `CRLF`, Linux mit `LF`. Gerät das durcheinander, zeigt Git **riesige Diffs ohne inhaltliche Änderung**, und Shell-Skripte scheitern mit `/usr/bin/env: 'bash\r': No such file or directory`.

:::bildlich Zwei Länder, zwei Steckdosen
CRLF und LF sind wie Schweizer und deutsche Stecker: Beide liefern Strom, passen aber nicht ineinander. `core.autocrlf input` ist dein **persönlicher Adapter**. Eine `.gitattributes` im Repo ist die **Hausnorm**, die für alle gilt, die das Haus betreten – egal, welchen Adapter sie selbst dabeihaben.
:::

```gitattributes
* text=auto eol=lf
*.bat text eol=crlf
*.png binary
```

Bestehendes Repo umstellen: `.gitattributes` anlegen, `git add --renormalize .`, committen.

## Bei GitHub anmelden

GitHub akzeptiert für Git **keine Passwörter** mehr. Drei Wege:

| Weg | Gut für | Einrichten |
|---|---|---|
| **GitHub CLI** (empfohlen) | HTTPS-Remotes, am einfachsten | `gh auth login`, dann `gh auth setup-git` |
| **SSH-Key** | dauerhafte Arbeit, mehrere Konten | `ssh-keygen -t ed25519`, Public Key bei GitHub hinterlegen |
| **Fine-grained Token (PAT)** | Skripte, CI, wenn SSH blockiert ist | auf GitHub erstellen, auf ein Repo und wenige Rechte beschränken |

### SSH-Key

```bash
ssh-keygen -t ed25519 -C "name@beispiel.ch"     # Enter für Standardpfad, Passphrase empfohlen
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub                        # NUR den .pub-Teil zu GitHub kopieren
ssh -T git@github.com                            # «Hi <user>! You've successfully authenticated»
```

Der **private** Schlüssel (`id_ed25519`, ohne `.pub`) verlässt nie deinen Rechner. Wer ihn hat, ist du.

:::falle `credential.helper store` ist nicht verschlüsselt
Viele Anleitungen – auch ältere Notizen – empfehlen `git config --global credential.helper store` mit dem Hinweis, das Token werde «verschlüsselt gespeichert». Das stimmt nicht: Es landet **im Klartext** in `~/.git-credentials`. Jedes Programm mit deinen Rechten – auch ein KI-Agent – kann es lesen. Besser: `gh auth setup-git` (gh verwaltet das Token) oder SSH mit `ssh-agent`. Höchstens `credential.helper 'cache --timeout=3600'` hält es eine Stunde nur im Arbeitsspeicher. Wer `store` schon nutzt: `~/.git-credentials` löschen und das Token **rotieren**.
:::

:::gem Zwei GitHub-Konten auf einem Rechner
Privat und Arbeit parallel? In `~/.ssh/config` zwei Aliase mit je eigenem Key anlegen:

```
Host github.com-arbeit
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_arbeit
```

Dann klonen mit `git clone git@github.com-arbeit:firma/repo.git`. Git wählt den richtigen Schlüssel automatisch.
:::

## Projekte am richtigen Ort

Unter WSL gibt es zwei Dateisysteme: das Linux-Dateisystem (`~/…`) und die eingehängten Windows-Laufwerke (`/mnt/c/…`). Git-Operationen auf `/mnt/c` laufen über eine Übersetzungsschicht und sind **deutlich langsamer**; dazu kommen Probleme mit Dateirechten und Zeilenenden.

```bash
mkdir -p ~/projekte && cd ~/projekte
gh repo clone benutzer/repo        # oder: git clone git@github.com:benutzer/repo.git
code repo                          # VS Code mit WSL verbunden öffnen
explorer.exe .                     # denselben Ordner im Windows-Explorer ansehen
```

Von Windows aus erreichst du die Dateien unter `\\wsl.localhost\Ubuntu\home\<user>\…` (Name der Distribution mit `wsl -l` prüfen).

## Einen bestehenden Ordner mit GitHub verbinden

```bash
cd ~/projekte/mein-projekt
git init
git add . && git commit -m "Initial commit"
gh repo create mein-projekt --private --source=. --remote=origin --push
```

Wurde das Repo schon im Browser angelegt (dann **ohne** README und `.gitignore` anhaken), verbindest du von Hand:

```bash
git remote add origin git@github.com:benutzer/mein-projekt.git
git branch -M main
git push -u origin main     # -u verknüpft main mit origin/main; danach reicht git push
```

`origin` ist nur der übliche **Spitzname** für das Repo auf GitHub.

## Commits signieren

Ein Commit trägt Name und E-Mail aus deiner Konfiguration – die kann jeder beliebig setzen. Eine **Signatur** beweist, dass der Commit wirklich von dir stammt; GitHub zeigt dann «Verified».

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

:::falle «Unverified» trotz Signatur
Der Key ist bei GitHub nur als **Authentication Key** hinterlegt. Er muss **zusätzlich als Signing Key** eingetragen werden (Settings → SSH and GPG keys). Zweite häufige Ursache: `user.email` stimmt nicht mit einer verifizierten Adresse im GitHub-Konto überein.
:::

## Wenn es klemmt

| Meldung | Ursache | Lösung |
|---|---|---|
| `Permission denied (publickey)` | Key fehlt oder nicht bei GitHub | Key hinterlegen, `ssh -T git@github.com` |
| `Support for password authentication was removed` | Passwort statt Token | `gh auth setup-git` oder SSH |
| Git fragt bei jedem Push nach dem Passwort | kein Credential-Helper | `gh auth setup-git` oder SSH-Remote |
| Riesige Diffs ohne Inhalt | Zeilenenden oder Dateirechte gekippt | `.gitattributes`; Projekt raus aus `/mnt/c` |
| `detached HEAD` | Commit statt Branch ausgecheckt | `git switch -c neuer-branch` |

:::berater Im Kundengespräch
Bei Teams mit Windows-Rechnern lohnt ein 30-Minuten-Standard: Projekte in WSL, `gh` als Anmeldung, `.gitattributes` in jedem Repo, signierte Commits. Das eliminiert drei der häufigsten Supportfälle (Passwortabfragen, Zeilenenden-Diffs, langsames Git). Typischer Einwand: «Signieren ist Overkill.» – Sobald Agenten committen, will man unterscheiden können, was ein Mensch und was eine Maschine eingecheckt hat.
:::

:::spickzettel
- `user.name`, `user.email`, `init.defaultBranch main`, `core.autocrlf input`, `push.autoSetupRemote true`
- Hausnorm: **`.gitattributes`** mit `* text=auto eol=lf`, dann `git add --renormalize .`
- Anmelden: **`gh auth login` + `gh auth setup-git`** oder SSH (`ed25519`, nur `.pub` teilen)
- **Nie** `credential.helper store` (Klartext) – höchstens `cache`
- Projekte in **`~/projekte`**, nicht `/mnt/c`
- Ordner verbinden: `git init` → Commit → `gh repo create --source=. --push`
- Signieren mit SSH; Key **auch als Signing Key** bei GitHub
:::

:::selbstcheck 3
