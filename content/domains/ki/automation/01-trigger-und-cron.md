---
title: Trigger und Cron – wann ein Agent loslegt
level: L1
summary: Die drei Arten, einen Lauf auszulösen (periodisch, aktiv, reaktiv), Cron-Ausdrücke sicher lesen und schreiben, Zeitzonen und Sommerzeit im Griff behalten und die Eigenheiten verschiedener Planer kennen.
competencies: [ki-aut-01]
volatility: mittel
last_verified: 2026-11-27
sources:
  - ai_agent_masterclass (2).docx (Trigger-Arten)
  - Claude_Managed_Agents_Leitfaden_v2.docx (Abschnitt 3 – HTTP vs. Webhook, Zeitplan)
  - GitHub_GoogleCloud_Masterclass_FINAL.docx (11.3 Cloud Scheduler, Zeitzone)
  - https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
  - https://code.claude.com/docs/en/desktop-scheduled-tasks (Vergleich der Planungsoptionen, abgerufen 27.11.2026)
  - https://crontab.guru/
prompts: [mehr, einfach, beispiele, pruef-mich]
prompt_context: "Trigger für Automatisierung: periodisch (Cron, Zeitplan), aktiv (Button, workflow_dispatch, API-Aufruf), reaktiv (Webhook, Ereignis wie PR oder Issue); Cron-Syntax mit fünf Feldern (Minute Stunde Tag Monat Wochentag), */, Bereiche, Listen; Zeitzonen UTC vs. Europe/Zurich, Sommerzeit; Mindestintervalle und Verzögerungen bei GitHub Actions, Claude Cloud Scheduled Tasks, Desktop Scheduled Tasks, /loop"
---

:::tldr
Ein automatischer Lauf startet auf eine von drei Arten: **periodisch** (nach Zeitplan, z. B. jeden Montag 06:17), **aktiv** (jemand drückt einen Knopf oder ruft eine API auf) oder **reaktiv** (ein Ereignis tritt ein, z. B. ein neuer Pull Request). Zeitpläne werden meist als **Cron-Ausdruck** mit fünf Feldern geschrieben: Minute, Stunde, Tag, Monat, Wochentag. Die häufigste Falle ist die **Zeitzone**: Viele Planer rechnen in **UTC** – 06:00 UTC ist im Winter 07:00 und im Sommer 08:00 in Zürich.
:::

## Drei Arten von Triggern

| Art | Wer löst aus? | Beispiele | Typisch für |
|---|---|---|---|
| **Periodisch** | die Uhr | Cron in GitHub Actions, Cloud Scheduler, geplante Aufgaben in Claude | Wochenberichte, Abhängigkeits-Checks, Inhaltspflege |
| **Aktiv** | ein Mensch oder Programm, bewusst | Knopf «Run workflow» (`workflow_dispatch`), API-Aufruf, `/schedule run` | Ad-hoc-Läufe, Tests eines Zeitplans |
| **Reaktiv** | ein Ereignis | PR geöffnet, Kommentar mit `@claude`, neue Datei im Bucket, Webhook aus Slack | Reviews, Triage, Verarbeitung eingehender Daten |

:::bildlich Wecker, Klingel und Rauchmelder
- **Periodisch** ist der **Wecker**: Er klingelt zur gleichen Zeit, egal, ob etwas los ist.
- **Aktiv** ist die **Türklingel**: Jemand drückt bewusst darauf.
- **Reaktiv** ist der **Rauchmelder**: Er meldet sich, sobald etwas passiert – nicht vorher, nicht nachher.
:::

:::gem Jeder Zeitplan braucht auch einen Knopf
Ein Lauf, der nur montags um 06:17 startet, lässt sich schlecht testen: Du wartest eine Woche, um zu sehen, ob er funktioniert. Darum zu jedem periodischen Trigger immer auch einen **aktiven** Auslöser einrichten – in GitHub Actions `workflow_dispatch`, bei Claude-Aufgaben «Run now» bzw. `/schedule run`.
:::

## Cron lesen

```
┌───────── Minute       (0–59)
│ ┌─────── Stunde       (0–23)
│ │ ┌───── Tag im Monat (1–31)
│ │ │ ┌─── Monat        (1–12)
│ │ │ │ ┌─ Wochentag    (0–6, 0 = Sonntag; 1–5 = Mo–Fr)
│ │ │ │ │
17 6 * * 1
```

| Zeichen | Bedeutung | Beispiel |
|---|---|---|
| `*` | jeder Wert | `* * * * *` = jede Minute |
| `,` | Liste | `0 8,12,17 * * *` = um 8, 12 und 17 Uhr |
| `-` | Bereich | `0 9 * * 1-5` = werktags um 9 Uhr |
| `/` | Schrittweite | `*/15 * * * *` = alle 15 Minuten |

| Ausdruck | Bedeutung (in der Zeitzone des Planers) |
|---|---|
| `17 6 * * 1` | jeden Montag um 06:17 |
| `0 7 * * 1-5` | werktags um 07:00 |
| `30 2 1 * *` | am 1. jedes Monats um 02:30 |
| `0 */4 * * *` | alle vier Stunden zur vollen Stunde |
| `0 0 * * 0` | jeden Sonntag um Mitternacht |

:::falle Tag im Monat UND Wochentag
Sind **beide** Felder gesetzt (z. B. `0 9 1 * 1`), läuft der Job bei klassischem Cron, wenn **eines** von beiden zutrifft – also am 1. jedes Monats **und** an jedem Montag, nicht «am ersten Montag». Den ersten Montag eines Monats drückt man anders aus, etwa mit Tagen 1–7 plus einer Prüfung im Skript.
:::

## Zeitzonen und Sommerzeit

Viele Planer – klassisch auch GitHub Actions – interpretieren Cron in **UTC**. Zürich liegt im Winter bei UTC+1 (MEZ), im Sommer bei UTC+2 (MESZ).

| Gewünscht in Zürich | Winter (UTC+1) | Sommer (UTC+2) |
|---|---|---|
| 07:00 | `0 6 * * *` | `0 5 * * *` |
| 18:00 | `0 17 * * *` | `0 16 * * *` |

**Lösungen:**

- Wo der Planer eine **Zeitzone** kennt, diese setzen: Google Cloud Scheduler mit `--time-zone='Europe/Zurich'`, Claude-Aufgaben in der Zeitzone des Kontos; für GitHub Actions gibt es laut aktuellen Berichten seit März 2026 ein optionales `timezone`-Feld pro Cron-Eintrag (Stand 27.11.2026, vor Gebrauch in der Doku prüfen).
- Wo nicht: bewusst in UTC planen und akzeptieren, dass sich die lokale Zeit zweimal im Jahr um eine Stunde verschiebt – für Wochenberichte meist egal.

:::gem Nicht zur vollen Stunde
Planer sind zur **vollen Stunde** und um Mitternacht UTC am stärksten ausgelastet. GitHub weist ausdrücklich darauf hin, dass geplante Läufe bei hoher Last **verzögert** und im Extremfall **ausgelassen** werden können. Ein Zeitpunkt wie `17 6 * * 1` statt `0 6 * * 1` ist ein kleiner, wirksamer Trick.
:::

## Die Planer im Vergleich

| Planer | Läuft wo | Mindestintervall | Eigenheiten (Stand 27.11.2026) |
|---|---|---|---|
| **GitHub Actions `schedule`** | GitHub-Runner | 5 Minuten | UTC als Standard; Verzögerungen bei Last; in **öffentlichen** Repos nach **60 Tagen ohne Aktivität** automatisch deaktiviert; in Forks standardmässig aus |
| **Claude Cloud Scheduled Tasks** | Anthropic-Cloud | 1 Stunde | läuft auch, wenn dein Rechner aus ist; Trigger auch per API und GitHub-Ereignis |
| **Claude Desktop Scheduled Tasks** | dein Rechner | 1 Minute | nur, wenn die App offen und der Rechner wach ist; Zugriff auf lokale Dateien |
| **`/loop`** in Claude Code | aktuelle Session | 1 Minute | endet mit der Session – für kurzes Abfragen, nicht für Betrieb |
| **Google Cloud Scheduler** | Google Cloud | 1 Minute | Zeitzone wählbar, ruft z. B. einen Cloud-Run-Dienst per HTTP auf |
| **cron / systemd-Timer** | eigener Server | 1 Minute | volle Kontrolle, aber Server muss laufen |

:::falle Der stille Tod eines Zeitplans
Ein geplanter Lauf, der nicht startet, meldet keinen Fehler – er passiert einfach nicht. Typische Ursachen: 60 Tage Inaktivität in einem öffentlichen Repo, der Laptop war zu, die Session ist beendet, das Konto hat die Funktion verloren. Darum am Ende jedes Laufs ein **Lebenszeichen** (Bericht, Eintrag, Nachricht) – und wer es nicht mehr sieht, merkt, dass etwas fehlt.
:::

:::berater Im Kundengespräch
«Wann soll der Agent laufen?» klingt banal, entscheidet aber über Betriebsform und Kosten. Leitfragen: Muss er auf Ereignisse **sofort** reagieren (reaktiv) oder reicht ein **Rhythmus** (periodisch)? Muss er laufen, wenn alle Laptops aus sind? In welcher Zeitzone denkt das Team? Typischer Einwand: «Einfach jede Minute prüfen lassen.» – Polling kostet bei jedem Lauf; ein Webhook, der nur bei Ereignissen auslöst, ist meist günstiger und schneller.
:::

:::spickzettel
- Trigger: **periodisch** (Uhr) · **aktiv** (Knopf/API) · **reaktiv** (Ereignis)
- Zu jedem Zeitplan einen **manuellen Auslöser** (`workflow_dispatch`, «Run now»)
- Cron: **Minute Stunde Tag Monat Wochentag** · `*` alle · `,` Liste · `-` Bereich · `/` Schritt
- Tag **und** Wochentag gesetzt = **oder**, nicht «und»
- Viele Planer rechnen in **UTC**; Zürich = UTC+1 (Winter) / UTC+2 (Sommer)
- **Nicht zur vollen Stunde** planen (Last, Verzögerung)
- GitHub: min. 5 Min., öffentliche Repos nach 60 Tagen Inaktivität aus · Claude Cloud: min. 1 Std. · Desktop: nur bei offener App
- **Lebenszeichen** am Ende jedes Laufs
:::

:::selbstcheck 3
