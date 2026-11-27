---
title: Container im Alltag – starten, aufräumen, Fehler finden
level: L2
summary: Die Befehle für den Alltag, was Stop, down, Rebuild und prune überleben, wie du Dockerfiles für schnelle Builds ordnest und die fünf Fehler, die jeden Anfänger einen Abend kosten.
competencies: [ki-ctr-02, ki-ctr-03]
volatility: tief
last_verified: 2026-11-27
sources:
  - grundlagen/container.md (Abschnitte 3, 7.8, 11–13, Stand 27.11.2026)
  - VSCode Terminal Docker.docx (Kontrollfragen 2–4 mit Lösungen, G.2 Cheatsheet, G.3 Stolperfallen)
  - https://docs.docker.com/reference/dockerfile/
  - https://docs.docker.com/reference/compose-file/
  - https://docs.docker.com/build/cache/
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Docker im Alltag: docker run/compose up/down/-v, Layer-Cache und Reihenfolge im Dockerfile, --build, 127.0.0.1 vs 0.0.0.0, node_modules-Volume, /mnt/c unter WSL, docker system prune"
---

:::tldr
Für den Alltag reichen ein Dutzend Befehle. Entscheidend ist, **was welcher Befehl löscht**: Stoppen lässt alles stehen, `down` und Rebuild werfen den Container weg, nur `down -v` und `volume rm` löschen Volumes. Und fast jeder Abend, den Docker kostet, geht auf einen von fünf Fehlern zurück: **`127.0.0.1` statt `0.0.0.0`**, **Windows-`node_modules` im Linux-Container**, **`--build` vergessen**, **Projekt unter `/mnt/c`**, **kein Volume für die Datenbank**.
:::

## Die Befehle, die du wirklich brauchst

```bash
# Einzelner Container
docker run -it --rm -v "$PWD":/app -w /app node:22 sh   # interaktiv, danach weg
docker ps -a                       # was läuft, was liegt herum
docker logs -f <name>              # Logs verfolgen
docker exec -it <name> sh          # Shell in laufendem Container

# Compose (mehrere Dienste)
docker compose up --build          # bauen und starten, Logs im Vordergrund
docker compose up -d               # im Hintergrund
docker compose logs -f <dienst>
docker compose down                # stoppen und Container entfernen
docker compose down -v             # ... samt Volumes. Vorsicht!

# Platz
docker system df                   # wer frisst den Speicher?
docker system prune -a             # ungenutzte Container, Netze, Cache, Images
```

:::gem Der Einzeiler, mit dem Docker «klick» macht
`docker run -it --rm -v "$PWD":/app -w /app node:22 sh` und dann drinnen `ls /`. Du stehst in einem fremden Linux, siehst aber deinen Projektordner unter `/app`. Kein Dockerfile, keine Installation auf deinem Rechner, und nach `exit` ist alles wieder weg (`--rm`).
:::

## Was überlebt was?

| Aktion | Container-Folie (im Container Entstandenes) | Volume | Bind Mount (dein Code) |
|---|---|---|---|
| `Strg+C` / `docker stop` | **bleibt** | bleibt | bleibt |
| PC-Neustart / `wsl --shutdown` | bleibt (Container gestoppt) | bleibt | bleibt |
| `docker compose down` / `docker rm` | **weg** | bleibt | bleibt |
| «Rebuild Container» in VS Code | **weg** | bleibt | bleibt |
| `docker system prune -a` | weg (nur gestoppte Container) | **bleibt** | bleibt |
| `docker compose down -v` | weg | **weg** | bleibt |
| `docker volume rm <name>` | – | **weg** | bleibt |

:::bildlich Pavillon, Lagercontainer, Zimmer 12
Der **Pavillon** (Container) wird bei `down` abgebaut – samt allem, was der Arbeiter darin auf den Boden gelegt hat. Der **Lagercontainer** daneben (Volume) bleibt stehen, bis du ihn ausdrücklich abholen lässt (`-v`). Und **Zimmer 12** (dein Projektordner) war nie im Pavillon: Der Arbeiter hat nur durchs Fenster darauf gegriffen.
:::

## Dockerfiles für schnelle Builds

Docker baut Schicht für Schicht und verwendet unveränderte Schichten aus dem Cache. **Ab der ersten geänderten Zeile wird alles danach neu gebaut.** Daraus folgen drei Regeln:

1. **Selten Geändertes nach oben**, häufig Geändertes nach unten.
2. **Zuerst nur die Abhängigkeitsliste kopieren**, installieren, **dann** den Code:

```dockerfile
COPY package.json package-lock.json ./   # ändert sich selten
RUN npm ci                               # wird gecacht, solange die Liste gleich bleibt
COPY . .                                 # ändert sich ständig – kommt zuletzt
```

3. **Aufräumen im selben `RUN`** wie die Installation (`apt-get clean && rm -rf /var/lib/apt/lists/*`). In einer eigenen Zeile bliebe der Müll in der früheren Schicht und das Image würde nicht kleiner.

:::gem `CMD` ist ein Vorschlag, `ENTRYPOINT` ist fest
`CMD ["python", "app.py"]` wird ersetzt, wenn du `docker run image bash` aufrufst. `ENTRYPOINT ["python", "app.py"]` bleibt, und was du anhängst, wird zum Argument. Und `EXPOSE 8080` **öffnet keinen Port** – es dokumentiert nur. Geöffnet wird mit `-p` bzw. `ports:`.
:::

:::falle `curl … | bash` meldet Erfolg, auch wenn `curl` scheitert
In einer Pipe zählt nur der letzte Befehl. Bricht der Download ab, gilt der `RUN` trotzdem als erfolgreich, und du bekommst ein kaputtes Image. Profis prüfen direkt danach, ob das Ergebnis da ist (`node --version`, `claude --version`), damit der Build sofort abbricht.
:::

## Die fünf Abendkiller

### 1. `localhost` bleibt tot, obwohl die Logs gut aussehen

Die App meldet `listening on 127.0.0.1:3000`, in der `compose.yml` steht `ports: - "3000:3000"`, aber `localhost:3000` im Browser antwortet nicht.

**Mechanismus:** Das Port-Mapping ist korrekt – Docker leitet die Verbindung an das Netzwerkinterface des **Containers** weiter. `127.0.0.1` heisst aber «nur Verbindungen von diesem Rechner selbst», und «dieser Rechner» ist aus Sicht der App der **Container**, nicht dein PC. Am Interface, an dem Docker anklopft, hört niemand zu. **Fix:** Die App auf `0.0.0.0` lauschen lassen (alle Interfaces), z. B. `--host 0.0.0.0` oder `HOST=0.0.0.0` unter `environment:`.

:::bildlich Der Arbeiter spricht in die Ecke
Der Briefschlitz in der Pavillonwand (Port-Mapping) ist da. Aber der Arbeiter steht in der Ecke und spricht nur mit sich selbst (`127.0.0.1`). Er muss sich zur Tür drehen (`0.0.0.0`), sonst kommt keine Post an.
:::

### 2. `invalid ELF header` bei Node

Du bind-mountest `.` nach `/app`, auf dem Host liegt ein `node_modules`, das unter Windows entstanden ist. Viele Pakete enthalten **für ein Betriebssystem kompilierte** Programmteile. Linux versucht, Windows-Binaries auszuführen.

**Fix:** Ein zweites, **benanntes Volume** genau auf `/app/node_modules`:

```yaml
services:
  app:
    volumes:
      - .:/app                          # dein Code, live editierbar
      - node_modules:/app/node_modules  # Linux-Pakete, Docker-intern
volumes:
  node_modules:
```

**Warum das funktioniert:** Bei überlappenden Mounts gewinnt der **spezifischere Pfad**. `/app` kommt vom Bind Mount, `/app/node_modules` vom Volume.

### 3. Die Änderung wirkt nicht

Zwei Ursachen, **in dieser Reihenfolge** prüfen: Ist die Datei **gespeichert** (Punkt im Editor-Tab)? Und hast du nach einer Änderung am **Dockerfile oder an den Abhängigkeiten** mit `--build` neu gebaut? Für reine Code-Änderungen im Bind Mount braucht es kein `--build`.

### 4. Alles ist quälend langsam (Windows mit WSL)

Das Projekt liegt unter `/mnt/c/…`. Mounts von dort laufen über eine Übersetzungsschicht (9P) und sind spürbar langsamer; Datei-Watcher (Vite, `tsc --watch`) reagieren unzuverlässig, Dateirechte verhalten sich anders. **Fix:** Projekte ins Linux-Dateisystem verschieben, z. B. `~/projekte/…`, und VS Code zuerst mit WSL verbinden, dann den Container öffnen.

### 5. Die Datenbank ist nach `down` leer

Postgres schreibt nach `/var/lib/postgresql/data` – ohne Mount in die Container-Folie. `Strg+C` stoppt nur, darum waren die Daten noch da. `down` löscht den Container. **Fix:** unter dem Dienst `volumes: - dbdaten:/var/lib/postgresql/data` und auf oberster Ebene `volumes: dbdaten:`.

## Weitere Stolpersteine

| Symptom | Ursache | Fix |
|---|---|---|
| `command not found: docker` | du bist in PowerShell statt in WSL | `wsl` oder VS Code mit WSL verbinden |
| `permission denied … docker.sock` | dein Linux-Benutzer ist nicht in der Gruppe `docker` | `sudo usermod -aG docker $USER`, danach `wsl --shutdown` |
| `port is already allocated` | Host-Port belegt | anderen Port (`-p 8081:80`) oder belegenden Container stoppen |
| `no space left on device` | alte Images und Cache | `docker system df`, dann `docker system prune -a` |
| Datei im Container wird zu einem **Ordner** (z. B. `.gitconfig`) | Mount-Quelle existierte nicht, Docker hat einen Ordner angelegt | Ordner löschen, Datei anlegen (`touch`), neu starten |
| `Unable to find image …:latest` | Image nur lokal gedacht, aber nie gebaut | zuerst bauen; `latest` ist nur ein Etikett |

:::falle WSL-Platte schrumpft nicht von selbst
Docker unter Windows speichert alles in einer virtuellen Festplatte (`ext4.vhdx`). Nach dem Aufräumen mit `prune` wird darin Platz frei, die Datei auf der Windows-Platte bleibt aber gross. Verkleinern geht nach `wsl --shutdown` mit `diskpart` und `compact vdisk` (PowerShell als Admin).
:::

:::berater Im Kundengespräch
Wenn ein Team über «Docker ist so mühsam» klagt, liegt es selten an Docker. Frag nach den fünf Abendkillern – meist sind es zwei davon. Eine halbe Stunde Einführung mit dem Pavillon-Bild und einer kurzen Compose-Vorlage (Code als Bind Mount, Abhängigkeiten und Datenbank als Volume, App auf `0.0.0.0`) spart dem Team Tage.
:::

:::spickzettel
- `stop` lässt alles stehen · `down`/Rebuild wirft den Container weg · nur `-v`/`volume rm` löscht Volumes · `prune -a` lässt Volumes stehen
- Dockerfile: **Abhängigkeitsliste kopieren → installieren → Code kopieren**
- Aufräumen im **selben** `RUN`; `EXPOSE` öffnet nichts
- `localhost` tot → App auf **`0.0.0.0`**
- `invalid ELF header` → **Volume auf `/app/node_modules`** (spezifischerer Pfad gewinnt)
- Änderung wirkt nicht → **gespeichert?** dann **`--build`?**
- Langsam → raus aus **`/mnt/c`**
- DB leer nach `down` → **Volume** für das Datenverzeichnis
:::

:::selbstcheck 3
