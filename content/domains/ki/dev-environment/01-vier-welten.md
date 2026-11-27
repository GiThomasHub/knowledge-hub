---
title: Die vier Welten auf deinem Rechner – Windows, WSL, VS Code, Container
level: L1
summary: Wo du gerade tippst, wo deine Dateien wirklich liegen, warum Projekte nach ~/ gehören und nicht nach /mnt/c, und was bei WSL einmal richtig eingestellt sein sollte.
competencies: [ki-dev-01]
volatility: tief
last_verified: 2026-11-27
sources:
  - VSCode Terminal Docker.docx (Teil A.2–A.5 – Koffer, «existiert nicht» vs. «gesperrt», vier Welten, zwei Koffer)
  - VS-Code-Handbuch.docx (Fernbedienung und Häuser, Ebenen Windows/WSL/Container)
  - grundlagen/github_wsl_basics.md (Abschnitte 1, 11) und grundlagen/container.md (7.8), Stand 27.11.2026
  - Skill dev-environment, references/wsl.md (geprüft 27.11.2026)
  - https://learn.microsoft.com/windows/wsl/filesystems
  - https://learn.microsoft.com/windows/wsl/wsl-config
prompts: [mehr, einfach, beispiele, pruef-mich]
prompt_context: "Windows mit WSL 2: PowerShell vs. Ubuntu-Shell vs. VS Code Remote vs. Container, Linux-Dateisystem (~) vs. /mnt/c, ext4.vhdx, \\\\wsl.localhost, wsl --shutdown, wsl --export, wsl.conf (systemd), .wslconfig (memory, autoMemoryReclaim)"
---

:::tldr
Auf einem Windows-Rechner mit WSL gibt es **vier Orte**, an denen du tippen kannst: **PowerShell** (Windows), die **Ubuntu-Shell** (WSL), **VS Code** (kann in beiden stehen) und den **Container**. Sie sehen ähnlich aus und sind es nicht. Wenn ein Befehl «command not found» meldet, lautet die erste Frage: **falsches Gebäude?** Und: Projekte gehören ins Linux-Dateisystem (`~/projekte`), **nie** nach `/mnt/c` – dort ist alles um ein Vielfaches langsamer.
:::

## Hauptgebäude, Anbau, Schreibtisch, Pavillon

:::bildlich Ein Grundstück, vier Orte
- **Windows mit PowerShell** ist das **Hauptgebäude**.
- **WSL 2 mit Ubuntu** ist der **Linux-Anbau** auf demselben Grundstück: ein echtes Linux, das in einer schlanken virtuellen Maschine mitläuft.
- **VS Code** ist dein **Schreibtisch** – du kannst ihn in beiden Gebäuden aufstellen. Die Oberfläche sieht gleich aus, aber Dateien, Terminal und Erweiterungen wohnen dort, wo er gerade steht.
- Ein **Container** ist ein **Pavillon auf dem Hof**: Er sieht nur, was du ihm durchs Fenster reichst.
:::

| Welt | Erkennst du an | Dort funktioniert |
|---|---|---|
| Windows / PowerShell | `PS C:\Users\…>` | `wsl`, `wsl --shutdown`, Windows-Programme |
| WSL / Ubuntu | `name@rechner:~$` | `git`, `docker`, `npm`, `uv`, `ls`, `sudo` |
| VS Code | unten links: `WSL: Ubuntu` (oder nichts = Windows) | je nachdem, wo er verbunden ist |
| Container | `vscode@a1b2c3:/workspace$` oder `root@…:/app#` | nur, was im Image steckt |

:::falle «command not found» heisst meist: falsches Gebäude
`docker: command not found` in PowerShell? Du bist im Hauptgebäude, Docker wohnt im Anbau → `wsl` eintippen oder VS Code mit WSL verbinden. `wsl: command not found` in Ubuntu? Umgekehrt → `exit`, dann in PowerShell. Erst danach lohnt es sich, nach Tippfehlern zu suchen.
:::

## Wo deine Dateien wirklich liegen

Dein ganzes Linux steckt in **einer einzigen Datei** auf der Windows-Platte, einer virtuellen Festplatte (`ext4.vhdx`). Darin liegt ein echtes Linux-Dateisystem.

| Du speicherst in … | Das liegt … | Windows kommt ran? | Tempo für Git, npm, uv, Docker |
|---|---|---|---|
| `~/projekte/app` | in der virtuellen Linux-Platte | über `\\wsl.localhost\Ubuntu\home\…` | **schnell** – hier arbeiten |
| `/mnt/c/Users/…` | auf der normalen Windows-Platte | ja, direkt | **langsam** – nur zum Austausch |

:::bildlich Der Koffer und der enge Gang
Die `ext4.vhdx` ist ein **Koffer**, in dem dein Linux wohnt. Zwischen Hauptgebäude und Anbau gibt es einen **Verbindungsgang** (`/mnt/c` in die eine, `\\wsl.localhost` in die andere Richtung). Er funktioniert, ist aber **eng**: Jede Datei muss übersetzt werden. Ein `npm install`, das im Anbau 20 Sekunden dauert, braucht über den Gang Minuten. Darum: **Werkstatt im Anbau.**
:::

Warum `/mnt/c` für aktive Arbeit ungeeignet ist:

- Jeder Dateizugriff läuft über eine Übersetzungsschicht – `git status`, `uv sync`, `npm install` werden um ein Vielfaches langsamer.
- **Datei-Watcher** (Dev-Server, `tsc --watch`, Tests) bekommen Änderungen oft nicht mit.
- **Dateirechte** und **Zeilenenden** verhalten sich anders, was zu Phantom-Diffs in Git führt.

Faustregel: **Das Werkzeug läuft dort, wo die Dateien liegen.** VS Code mit WSL-Verbindung erfüllt das automatisch.

```bash
mkdir -p ~/projekte                       # einmalig
cp -r /mnt/c/Users/<du>/Downloads/app ~/projekte/   # aus Windows hereinholen, dann hier arbeiten
explorer.exe .                            # aktuellen Linux-Ordner im Windows-Explorer zeigen
pwd                                       # muss mit /home/ beginnen
```

:::gem «Existiert nicht» ist stärker als «gesperrt»
Ein gesperrter Ordner meldet «Zugriff verweigert» – man weiss, dass dahinter etwas liegt, und ein Schloss kann man aufbrechen. Ein Ordner, der in einer Umgebung **gar nicht existiert**, meldet «No such file or directory». Darum ist ein Container, in dem `/mnt/c` und `~/.ssh` nicht eingehängt sind, ein stärkerer Schutz als jede Rechte-Sperre: Er baut das Zimmer gar nicht erst.
:::

## Backup ist deine Sache

:::falle OneDrive sieht deinen Code nicht
Die Windows-Sicherung und OneDrive erfassen die `ext4.vhdx` nicht sinnvoll – sie sehen eine riesige, undurchsichtige Datei, keine einzelnen Dateien. Sichern heisst: **Code per Git auf GitHub** pushen, und bei Bedarf die ganze Distribution exportieren (`wsl --export Ubuntu D:\backup\ubuntu.tar` in PowerShell). Und Achtung: `wsl --unregister Ubuntu` steht in Foren als Wundermittel, **löscht aber die ganze Distribution** – ohne Nachfrage, ohne Papierkorb.
:::

## WSL einmal richtig einstellen

| Datei | Gilt für | Empfehlung |
|---|---|---|
| `/etc/wsl.conf` (in Ubuntu) | diese eine Distribution | `[boot] systemd=true` (Dienste wie Docker-Engine, ssh-agent); eigener Benutzer statt root |
| `%UserProfile%\.wslconfig` (in Windows) | alle WSL-2-Distributionen | `memory=` (z. B. halber RAM), `autoMemoryReclaim=gradual`; bei VPN-Problemen `networkingMode=mirrored` |

Änderungen wirken erst nach `wsl --shutdown` in PowerShell und einigen Sekunden Wartezeit. `wsl --shutdown` ist ohnehin der **Universal-Fix**, wenn WSL hängt, die Uhrzeit nach dem Ruhezustand falsch ist oder eine Gruppen-Änderung (z. B. `docker`) noch nicht wirkt.

:::gem Was `wsl --shutdown` wirklich tut
Es fährt die WSL-VM herunter: Laufende Prozesse und Container werden gestoppt. **Nicht** gelöscht werden deine Dateien in `~`, Images und Volumes von Docker und die Container selbst. Beim nächsten `wsl` ist alles wieder da – Container mit `restart: unless-stopped` starten sogar von selbst neu.
:::

:::berater Im Kundengespräch
In Teams mit Windows-Rechnern sind 80 % der «Docker ist langsam» und «Git macht komische Diffs»-Klagen ein Ortsproblem: Die Projekte liegen unter `/mnt/c`. Die Empfehlung in einem Satz: «Arbeiten im Linux-Teil, Windows nur zum Anschauen.» Typischer Einwand: «Dann finde ich meine Dateien nicht mehr.» – `explorer.exe .` öffnet jeden Linux-Ordner im gewohnten Explorer, und VS Code zeigt ohnehin alles an.
:::

:::spickzettel
- Vier Welten: **PowerShell** · **Ubuntu (WSL)** · **VS Code** (unten links prüfen) · **Container**
- «command not found» → zuerst: **falsches Gebäude?**
- Projekte in **`~/projekte`**, nie unter `/mnt/c` (langsam, Watcher, Rechte, Zeilenenden)
- `explorer.exe .` zeigt Linux-Ordner in Windows; `pwd` muss mit `/home/` beginnen
- Backup = **Git push** (+ `wsl --export`); `wsl --unregister` **löscht alles**
- `wsl.conf`: `systemd=true` · `.wslconfig`: `memory`, `autoMemoryReclaim`
- `wsl --shutdown` = Universal-Fix, löscht keine Daten
:::

:::selbstcheck 3
