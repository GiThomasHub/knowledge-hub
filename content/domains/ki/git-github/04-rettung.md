---
title: Git-Rettung – rückgängig machen und Verlorenes finden
level: L2
summary: Welcher Befehl in welcher Lage den Schaden behebt – restore, reset, revert, stash, cherry-pick und reflog – plus Force-Push ohne Kollateralschaden und das richtige Vorgehen bei einem geleakten Secret.
competencies: [ki-git-03]
volatility: tief
last_verified: 2026-11-27
sources:
  - grundlagen/github_wsl_basics.md (Abschnitte 12, 13, Stand 27.11.2026)
  - Skill github-workflow, references/git-rettung.md (geprüft 27.11.2026)
  - VSCode Terminal Docker.docx (Notausgang git checkout -- .)
  - https://git-scm.com/docs/git-restore
  - https://git-scm.com/docs/git-revert
  - https://git-scm.com/docs/git-reflog
  - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Git-Rettung: git restore, restore --staged, commit --amend, reset --soft/--hard, revert (auch -m 1), stash, cherry-pick, reflog, fsck, push --force-with-lease, versehentlich committetes Secret (rotieren, filter-repo, Push Protection)"
---

:::tldr
**Lokal darf man alles umschreiben, Gepushtes auf geteilten Branches nur mit `revert`.** Ungespeicherte Änderung weg: `git restore`. Letzten Commit auflösen: `git reset --soft HEAD~1`. Gepushten Commit neutralisieren: `git revert`. Kurz beiseitelegen: `git stash`. Und wenn «alles weg» scheint: **`git reflog`** – Git vergisst fast nichts. Bei einem geleakten Secret hilft nur eines zuerst: **sperren und neu ausstellen**.
:::

## Die Grundregel

:::bildlich Tagebuch und Zeitung
Dein **lokaler Branch** ist ein Tagebuch: Du darfst Seiten herausreissen und neu schreiben, niemand merkt es. Ein **gepushter, geteilter Branch** ist eine gedruckte Zeitung: Was gedruckt ist, ist bei allen Lesern. Einen Fehler korrigierst du dort mit einer **Berichtigung** in der nächsten Ausgabe (`git revert`), nicht indem du heimlich alte Ausgaben austauschst.
:::

Vor jedem riskanten Schritt kostet eine Sicherung eine Sekunde: `git branch backup/vorher`.

## Welcher Befehl für welche Lage?

| Lage | Befehl | Hinweis |
|---|---|---|
| Änderung an einer Datei verwerfen (nicht vorgemerkt) | `git restore <datei>` | **endgültig** – nicht committete Änderungen kennt auch reflog nicht |
| Alle ungespeicherten Änderungen verwerfen | `git restore .` | der «Notausgang» zum letzten Foto |
| Datei aus dem Staging nehmen | `git restore --staged <datei>` | Änderung bleibt im Arbeitsverzeichnis |
| Letzte Commit-Nachricht ändern / Datei vergessen | `git add <datei>`, `git commit --amend` | nur **vor** dem Push |
| Letzten Commit auflösen, Änderungen behalten | `git reset --soft HEAD~1` | Änderungen liegen wieder im Staging |
| Letzten Commit samt Änderungen löschen | `git reset --hard HEAD~1` | reflog rettet notfalls |
| Gepushten Commit rückgängig machen | `git revert <sha>` | **neuer Gegen-Commit**, Historie bleibt |
| Squash-Merge eines PRs zurücknehmen | `git revert <sha>` oder Knopf «Revert» im PR | erzeugt einen PR mit Gegen-Commit |
| Merge-Commit zurücknehmen | `git revert -m 1 <merge-sha>` | `-m 1` = Seite von `main` behalten |
| Commit auf dem falschen Branch | `git switch richtig && git cherry-pick <sha>`, dann auf dem falschen `git reset --hard HEAD~1` | |

`git checkout -- .` ist die ältere Schreibweise für `git restore .` und steht noch in vielen Anleitungen.

:::falle `reset --hard` auf gepushten Commits
`git reset --hard HEAD~3` auf einem geteilten Branch, danach Force-Push: Die drei Commits verschwinden für alle, die schon darauf aufgebaut haben – deren nächster Pull wird zum Chaos. Auf geteilten Branches immer `revert`. Ein Ruleset auf `main` verhindert den Force-Push technisch.
:::

## Kurz beiseitelegen: stash

Du bist mitten in einer Änderung, musst aber schnell einen Bug auf einem anderen Branch beheben:

```bash
git stash              # ungespeicherte Änderungen in die Schublade
git switch main        # sauber wechseln
# … Bugfix …
git switch -          # zurück
git stash pop          # Schublade wieder auspacken
git stash list         # was liegt alles in der Schublade?
```

:::gem Stash vergisst neue Dateien
`git stash` nimmt standardmässig nur Dateien mit, die Git schon kennt. Neue, nie vorgemerkte Dateien bleiben liegen. Mit `git stash -u` kommen auch sie in die Schublade.
:::

## Verlorenes wiederfinden: reflog

Git protokolliert **jede Bewegung** deines aktuellen Stands (`HEAD`) – auch nach `reset --hard`, abgebrochenem Rebase oder gelöschtem Branch. Einträge bleiben standardmässig rund 90 Tage.

```bash
git reflog                     # Liste: HEAD@{0}, HEAD@{1}, … mit Beschreibung
git branch rettung HEAD@{3}    # Stand als Branch sichern (sicherster Weg)
git reset --hard HEAD@{3}      # oder direkt dorthin zurück
```

:::bildlich Die Blackbox im Flugzeug
Der Reflog ist die **Blackbox**: Er zeichnet jede Bewegung auf, auch die, die zum Absturz geführt hat. Solange ein Stand einmal committet war, findest du ihn dort wieder – selbst wenn kein Branch mehr darauf zeigt.
:::

Gelöschter Branch eines PRs auf GitHub: im PR «Restore branch».

## Force-Push ohne Kollateralschaden

- Nur auf **eigene** Branches, nie auf `main`.
- Immer `git push --force-with-lease`: bricht ab, wenn der Stand auf GitHub nicht mehr dem entspricht, den du zuletzt gesehen hast.
- Nach einem Force-Push auf einen PR die Reviewer informieren; Approvals können verfallen.

## Ein Secret wurde committet

1. **Sofort sperren und neu ausstellen** (Token beim Anbieter widerrufen). Sobald gepusht, ist die Historie kompromittiert – das ist der einzige wirklich wirksame Schritt.
2. Noch nicht gepusht: `git reset --soft HEAD~1`, Secret entfernen, in `.env` auslagern, neu committen.
3. Gepusht: **nach** dem Rotieren aus der Historie entfernen mit `git filter-repo --replace-text` (oder BFG), Force-Push mit Absprache. Bei öffentlichen Repos kann es in Forks und Caches weiterleben.
4. **Push Protection** von GitHub einschalten, damit es nicht wieder passiert.

:::falle «Bypass» klicken
Meldet GitHub beim Push `Push cannot contain secrets`, hat die Push Protection ein Secret erkannt. Der Knopf «bypass» ist fast nie die richtige Antwort: Secret entfernen, wie oben beschrieben, und dann pushen.
:::

## Typische Meldungen

| Meldung | Bedeutung | Lösung |
|---|---|---|
| `rejected … (fetch first)` | GitHub hat neue Commits | `git pull --rebase`, dann push |
| `rejected … (non-fast-forward)` nach Rebase | Branch umgeschrieben | `git push --force-with-lease` (nur eigener Branch) |
| `detached HEAD` | Commit statt Branch ausgecheckt | `git switch -c neuer-branch` |
| `GH013: Repository rule violations` | Ruleset verbietet den Push | Branch und PR statt direkt auf `main` |
| `refusing to merge unrelated histories` | zwei Repos ohne gemeinsamen Commit | meist falsches Remote, nicht einfach erzwingen |

:::berater Im Kundengespräch
Die häufigste Angst bei Git und bei KI-Agenten ist «etwas kaputtmachen». Die Antwort: Was committet ist, ist praktisch nicht verloren – und mit `revert` lässt sich auch ein schlechter Merge in Minuten sauber zurücknehmen, ohne Historie zu fälschen. Darum gilt für Agenten: **oft committen, nur auf eigenen Branches**, nie auf `main`. Typischer Einwand: «Dann sieht man ja jeden Fehler in der Historie.» – Genau. Das ist Nachvollziehbarkeit, kein Makel.
:::

:::spickzettel
- Lokal umschreiben ok · Gepushtes Geteiltes nur **`revert`**
- Datei verwerfen `restore` · aus Staging `restore --staged` · Commit korrigieren `--amend` (vor Push)
- Commit auflösen `reset --soft HEAD~1` · gepushten neutralisieren `revert <sha>` · Merge `revert -m 1`
- Beiseitelegen `stash` / `stash pop` (`-u` für neue Dateien)
- «Alles weg» → **`git reflog`** → `git branch rettung HEAD@{n}`
- Force-Push nur eigener Branch, nur **`--force-with-lease`**
- Secret geleakt → **sofort rotieren**, dann Historie bereinigen, Push Protection an
:::

:::selbstcheck 3
