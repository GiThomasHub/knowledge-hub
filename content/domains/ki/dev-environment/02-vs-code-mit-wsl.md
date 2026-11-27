---
title: VS Code mit WSL – das Startritual und der Alltag
level: L1
summary: VS Code richtig mit WSL verbinden, die Remote-Anzeige lesen, Erweiterungen am richtigen Ort installieren, fremden Ordnern nicht blind vertrauen und die Terminal-Befehle für Dateien, die du jeden Tag brauchst.
competencies: [ki-dev-02]
volatility: tief
last_verified: 2026-11-27
sources:
  - grundlagen/vs_code.md (Abschnitte 1–5, 7, 10, Stand 27.11.2026)
  - VS-Code-Handbuch.docx (Ebenen und Remote-Anzeige)
  - VSCode Terminal Docker.docx (Startritual, Restricted Mode, Auto Save, Stolperfallen)
  - Skill dev-environment, references/wsl.md (Abschnitt VS Code mit WSL)
  - https://code.visualstudio.com/docs/remote/wsl
  - https://code.visualstudio.com/docs/editing/workspaces/workspace-trust
prompts: [mehr, einfach, beispiele, pruef-mich]
prompt_context: "VS Code mit WSL: Erweiterung WSL, code . aus der Ubuntu-Shell, Remote-Anzeige unten links, Erweiterungen 'Install in WSL', Workspace Trust/Restricted Mode, Auto Save, Command Palette, Source Control Panel, Terminal-Grundbefehle mkdir/cp/mv/rm/unzip"
---

:::tldr
**Das Startritual:** Ubuntu-Terminal öffnen → `cd ~/projekte/app` → **`code .`** → unten links muss **`WSL: Ubuntu`** stehen. Dann laufen Terminal, Dateien und Erweiterungen im Linux, nur das Fenster unter Windows. Fremde Ordner bleiben im **eingeschränkten Modus**, bis du sie geprüft hast. Und im Linux-Terminal gibt es **keinen Papierkorb**: `rm -rf` ist endgültig.
:::

## VS Code ist eine Fernbedienung

:::bildlich Eine Fernbedienung, mehrere Häuser
VS Code ist eine **Fernbedienung**, die verschiedene Häuser steuern kann: das Windows-Haus, das Linux-Haus (WSL) oder einen Container. Das Display sieht immer gleich aus. Aber Dateien, Terminal und Erweiterungen wohnen in dem Haus, mit dem die Fernbedienung gerade verbunden ist – und die **Anzeige unten links** sagt dir, welches das ist.
:::

| Anzeige unten links | Du arbeitest in | Terminal ist |
|---|---|---|
| (nichts / nur Icon) | Windows | PowerShell |
| `WSL: Ubuntu` | Linux (WSL) | bash im Linux |
| `Dev Container: …` | Container | Shell im Container |

## Einrichten (einmalig)

1. **VS Code unter Windows** installieren – nicht im Linux.
2. Erweiterung **«WSL»** von Microsoft (`ms-vscode-remote.remote-wsl`) installieren, für Container zusätzlich **«Dev Containers»**.
3. In der Ubuntu-Shell einmal `code .` ausführen. Beim ersten Mal installiert VS Code einen kleinen Server im Linux.

## Das Startritual

```bash
cd ~/projekte/app      # in den Projektordner im Linux
code .                 # VS Code öffnet sich, verbunden mit WSL
```

Alternativ in VS Code: auf die Anzeige unten links klicken → «Connect to WSL» → Ordner öffnen.

:::falle Projekt unter Windows geöffnet, ohne es zu merken
Wer VS Code über das Startmenü öffnet und «Ordner öffnen» wählt, landet im **Windows-Haus**. Das Terminal ist PowerShell, `git`, `uv` und `docker` fehlen oder sind die Windows-Varianten, und der Interpreter ist falsch. Zwei Sekunden Kontrolle: **Steht unten links `WSL: Ubuntu`?**
:::

### Erweiterungen am richtigen Ort

Erweiterungen, die mit Code arbeiten (Python, Ruff, ESLint, Docker), müssen **im Linux-Teil** installiert sein. Ist VS Code mit WSL verbunden, zeigt das Erweiterungs-Panel dafür den Knopf **«Install in WSL: Ubuntu»**. Reine Oberflächen-Erweiterungen (Farbschemas, Tastenbelegungen) bleiben unter Windows.

## Fremden Ordnern nicht blind vertrauen

Öffnest du einen Ordner zum ersten Mal, fragt VS Code, ob du den Autoren vertraust. Antwortest du «Nein», startet der **eingeschränkte Modus** (Restricted Mode): Aufgaben, Debugging und manche Erweiterungen, die Code aus dem Ordner ausführen könnten, bleiben aus.

:::gem Erst lesen, dann vertrauen
Bei einem fremden Repo bleibt der **Besucherausweis** an, bis du `README`, `package.json` (was startet `npm start` wirklich?) oder `pyproject.toml` gelesen hast. Ein präparierter Ordner kann über `.vscode/tasks.json` oder Erweiterungs-Einstellungen Befehle ausführen, sobald du ihm vertraust. Für wirklich fremden Code gehört die Arbeit ohnehin in einen Container.
:::

## Die Tastenkürzel, die sich lohnen

| Aktion | Kürzel |
|---|---|
| **Command Palette** – findet jede Funktion | `Strg+Shift+P` |
| Datei per Name öffnen | `Strg+P` |
| Terminal ein/aus | ``Strg+` `` |
| Suchen im ganzen Projekt | `Strg+Shift+F` |
| Source Control (Git) | `Strg+Shift+G` |
| Erweiterungen | `Strg+Shift+X` |
| Einstellungen | `Strg+,` |
| Nächstes gleiches Wort zusätzlich markieren | `Strg+D` |
| Zeile verschieben / duplizieren | `Alt+↑/↓` / `Shift+Alt+↓` |

:::gem Auto Save einschalten
Die häufigste Ursache für «meine Änderung wirkt nicht»: Die Datei ist **nicht gespeichert** (weisser Punkt im Tab). Einstellung `files.autoSave` auf `afterDelay` – und das Problem verschwindet.
:::

### Source Control ohne Terminal

Das Git-Panel (`Strg+Shift+G`) zeigt alle geänderten Dateien. `+` neben einer Datei entspricht `git add`, das Textfeld mit Häkchen `git commit`, das «…»-Menü bietet Push und Pull. Ein Klick auf eine Datei öffnet den Vergleich vorher/nachher. Die Erweiterung **GitLens** zeigt pro Zeile, wer sie wann geändert hat.

## Dateien im Terminal

```bash
mkdir -p a/b/c                 # Ordner samt Zwischenordnern, kein Fehler wenn vorhanden
cp -r quelle/ ziel/            # Ordner kopieren (-r = rekursiv)
mv alt.txt neu.txt             # umbenennen oder verschieben
rm datei.txt                   # Datei löschen
rm -r ordner/                  # Ordner löschen
ls -la                         # alles anzeigen, auch versteckte Dateien (.env, .git)
unzip "/mnt/c/Users/<du>/Downloads/projekt.zip" -d ~/projekte/projekt   # ZIP aus Windows direkt nach Linux
```

:::falle Kein Papierkorb
`rm -rf ordner/` löscht **sofort und endgültig**, ohne Rückfrage (`-f` = force). Ein Leerzeichen an der falschen Stelle (`rm -rf ~ /tmp/x` statt `rm -rf ~/tmp/x`) löscht dein ganzes Home. Bei Wichtigem zuerst `ls` mit demselben Pfad, oder in einen `_papierkorb/`-Ordner verschieben. Und für Code gilt: Was in Git committet ist, kommt zurück.
:::

:::gem ZIP mit eigenem Hauptordner
Viele Downloads (z. B. von GitHub) enthalten schon einen Ordner `projekt-main/`. Mit `-d ~/projekte/projekt` entstünde dann `projekt/projekt-main/…`. Vorher mit `unzip -l datei.zip` hineinschauen; bei einem Hauptordner normal entpacken und danach mit `mv` umbenennen. Wer über den Windows-Explorer nach WSL kopiert, findet oft `*:Zone.Identifier`-Dateien – entfernen mit `find . -name "*:Zone.Identifier" -delete`.
:::

### Kleine Shell-Grammatik

| Zeichen | Bedeutung |
|---|---|
| `~` | dein Home (`/home/<name>`) |
| `.` / `..` | dieser Ordner / eine Ebene höher |
| senkrechter Strich (Pipe) | Ausgabe an den nächsten Befehl weitergeben, z. B. `ls -la` gefolgt von `grep env` |
| `>` / `>>` | in Datei schreiben (überschreiben / anhängen) |
| `&&` | nächsten Befehl nur bei Erfolg ausführen |
| `-r`, `-f`, `-a`, `-v` | häufig: rekursiv, force, alle, ausführlich (je nach Befehl) |

:::berater Im Kundengespräch
Bei der Einführung von KI-Werkzeugen wie Claude Code scheitert es selten an der KI, sondern an der Werkbank: falsches Haus, falscher Ordner, ungespeicherte Dateien. Ein 15-minütiges «Startritual» für alle (`cd`, `code .`, Anzeige unten links prüfen) erspart dem Support die Hälfte der Tickets. Typischer Einwand: «Wir nutzen doch eine andere IDE.» – Das Prinzip gilt überall: Das Werkzeug muss dort laufen, wo die Dateien liegen.
:::

:::spickzettel
- Startritual: **`cd ~/projekte/x && code .`** → unten links **`WSL: Ubuntu`**
- VS Code unter **Windows** installieren, Erweiterung **WSL**; Code-Erweiterungen **«Install in WSL»**
- Fremde Ordner: **eingeschränkter Modus**, erst lesen, dann vertrauen
- `Strg+Shift+P` findet alles · **Auto Save** an
- `mkdir -p`, `cp -r`, `mv`, `rm -r`, `ls -la`
- **Kein Papierkorb** – `rm -rf` ist endgültig
- ZIP: zuerst `unzip -l`, dann entpacken
:::

:::selbstcheck 3
