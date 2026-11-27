---
title: Die Betriebsform wählen – lokal, CI, Claude-Cloud, Managed Agents oder eigene Cloud
level: L4
summary: Nach welchen Kriterien du für einen Kunden entscheidest, wo ein Agent läuft – Laufzeit, Nutzerzahl, Zugriff auf Daten, Compliance, Kosten und Betriebsaufwand – und wie die fünf typischen Betriebsformen im Vergleich abschneiden.
competencies: [ki-aut-05]
volatility: hoch
last_verified: 2026-11-27
sources:
  - Claude_Managed_Agents_Leitfaden_v2.docx (Abschnitte 4, 5, 7, 8 – Stand Mai 2026)
  - GitHub_GoogleCloud_Masterclass_FINAL.docx (9.1 Cloud Run, 11.3 Cloud Scheduler, 13.1 Kostenfallen)
  - https://code.claude.com/docs/en/desktop-scheduled-tasks (Vergleich der Planungsoptionen, abgerufen 27.11.2026)
  - https://code.claude.com/docs/en/web-scheduled-tasks (abgerufen 27.11.2026)
  - Skill agents-automation, references/frameworks.md (Claude Managed Agents; geprüft 27.11.2026)
  - Lektion ai-security/datenfrage-schweiz (Knowledge Hub)
prompts: [mehr, beispiele, kundengespraech, pruef-mich, elevator-pitch]
prompt_context: "Betriebsform für KI-Agenten wählen: lokal (Claude Desktop Scheduled Tasks, cron), CI (GitHub Actions mit claude-code-action), Claude Cloud Scheduled Tasks, Claude Managed Agents (Produkt für viele Nutzer, Sessions, Container), eigene Cloud (Cloud Run, Cloud Scheduler, Secret Manager, Region); Kriterien Laufzeit, Nutzerzahl, Datenzugriff, Compliance und Datenstandort (revDSG), Kosten, Betriebsaufwand, Beobachtbarkeit"
---

:::tldr
Wo ein Agent läuft, entscheidet sich an sechs Fragen: **Wie lange** läuft er? **Für wen** – eine Person, ein Team oder viele Kunden? **Welche Daten** braucht er und wo liegen sie? Was verlangt die **Compliance** (Datenstandort, Verträge, Berufsgeheimnis)? Was darf es **kosten**? Wer **betreibt** es? Daraus ergeben sich fünf typische Formen: **lokal**, **CI (GitHub Actions)**, **Claude Cloud Scheduled Tasks**, **Claude Managed Agents** und **eigene Cloud** (z. B. Cloud Run). Es gibt keine beste Form – nur eine passende.
:::

## Die fünf Betriebsformen

| | Lokal | CI (GitHub Actions) | Claude Cloud Scheduled Task | Claude Managed Agents | Eigene Cloud (z. B. Cloud Run) |
|---|---|---|---|---|---|
| **Läuft auf** | eigenem Rechner/Server | GitHub-Runner | Anthropic-Cloud | Anthropic-Cloud (Container pro Session) | eigenem Cloud-Projekt |
| **Typischer Nutzer** | eine Person | ein Entwicklungsteam | Person oder Team | **viele Nutzer** eines Produkts | Produkt oder interner Dienst |
| **Rechner muss laufen** | ja | nein | nein | nein | nein |
| **Zugriff auf lokale Dateien** | ✅ direkt | nur Repo-Inhalt | Repos und Connectors | was du der Session gibst | was du anbindest |
| **Auslöser** | Zeitplan, manuell | Zeitplan, Repo-Ereignis, manuell | Zeitplan (min. 1 Std.), API, GitHub-Ereignis | API-Aufruf aus deinem Backend | Scheduler, HTTP, Queue |
| **Konfiguration** | Skript, Desktop-App | YAML im Repo, reviewbar | Formular oder `/schedule` | Code (Agent- und Umgebungsdefinition) | Code und Infrastruktur |
| **Betriebsaufwand** | gering, aber du bist der Betrieb | gering | sehr gering | gering für Infrastruktur, Produktlogik bei dir | **hoch** (Deployment, Secrets, Monitoring) |
| **Kontrolle über Datenstandort** | vollständig | GitHub-Region | Anbieter | Anbieter | **wählbar** (z. B. Region Zürich) |

:::bildlich Vom Velo bis zur eigenen Flotte
- **Lokal** ist dein **eigenes Velo**: sofort da, kostet nichts extra – aber nur, wenn du selbst fährst.
- **CI** ist der **Firmenwagen im Pool**: gemeinsam genutzt, nach Regeln, gut dokumentiert.
- **Claude Cloud Scheduled Task** ist das **Abo-Taxi**: kommt pünktlich, du kümmerst dich um nichts.
- **Managed Agents** ist ein **Fahrdienst für deine Kunden**: du bestellst über eine Schnittstelle, der Anbieter stellt Fahrzeuge in beliebiger Zahl.
- **Eigene Cloud** ist die **eigene Flotte**: maximale Kontrolle über Route und Garage – aber auch Wartung, Versicherung und Fahrdienstleitung.
:::

## Die sechs Entscheidungsfragen

| Frage | Spricht für … |
|---|---|
| **Laufzeit**: Minuten oder Stunden? | kurze Läufe: CI, Cloud Scheduled Task · lange, autonome Arbeit: Managed Agents, eigene Cloud mit Jobs |
| **Nutzer**: ich, mein Team, unsere Kunden? | ich: lokal · Team: CI, Cloud Scheduled Task · Kunden: Managed Agents oder eigene Cloud mit eigenem Backend |
| **Daten**: lokal, im Repo, in Firmensystemen? | lokale Dateien: lokal · Repo: CI · Firmensysteme: Connectors bzw. eigene Anbindung |
| **Compliance**: Datenstandort, Verträge, Berufsgeheimnis? | strenge Vorgaben: eigene Cloud mit Region in der Schweiz oder EU, kommerzielle Verträge (DPA), Pseudonymisierung |
| **Kosten**: Abo, Tokens, Infrastruktur? | Einzelperson mit Abo: lokal oder Cloud Scheduled Task · nutzungsabhängig: API-basierte Formen |
| **Betrieb**: Wer überwacht, wer reagiert auf Fehler? | ohne eigene Ops: Claude-Cloud oder Managed Agents · mit Plattformteam: eigene Cloud |

:::falle Entwicklungs-Werkzeug als Produkt ausliefern
Claude Code im Terminal ist ein Werkzeug **für Entwickler**, die selbst damit arbeiten. Ein internes Werkzeug für 200 Mitarbeitende baut man nicht, indem man jedem eine Claude-Code-Installation gibt. Für Produkte mit vielen Nutzern braucht es ein eigenes Backend – mit Managed Agents oder der API dahinter –, eine Anmeldung, Rechte pro Nutzer und Protokollierung.
:::

## Managed Agents genauer

Bei **Claude Managed Agents** betreibt Anthropic die Schleife, die Werkzeuge und eine **abgeschottete Umgebung pro Session**; du definierst den Agenten und seine Umgebung per Code und startest Sessions aus deinem Backend.

- **Passt für:** Produkte mit vielen Nutzern, lange autonome Aufgaben, Automatisierung ohne eigenen Rechner (z. B. täglicher Bericht, ausgelöst durch einen Cloud Scheduler).
- **Kosten:** Token wie bei der API plus eine Laufzeitgebühr pro Session-Stunde; die Masterclass nennt Stand Mai 2026 USD 0.08 pro Stunde – vor einer Offerte aktuell prüfen.
- **Wegwerfumgebung:** Die Umgebung startet pro Session sauber. Was bleiben soll, muss das Ergebnis ausdrücklich exportieren.

:::falle «Die Daten bleiben ja nicht beim Anbieter»
Eine Wegwerfumgebung heisst nicht, dass die Daten die Schweiz oder das eigene Rechenzentrum nie verlassen. Während der Session werden sie in der Infrastruktur des Anbieters verarbeitet. Für Personendaten, Kundendaten und Berufsgeheimnisse gelten deshalb die Fragen aus der Lektion [Datenfrage Schweiz](#/l/ai-security/datenfrage-schweiz): Vertrag, Kontotyp, Datenstandort, Übermittlung ins Ausland, Pseudonymisierung.
:::

## Eigene Cloud genauer

Ein Agent als **Container in der eigenen Cloud**, z. B. Google Cloud Run, ausgelöst durch einen Cloud Scheduler, mit Schlüsseln aus einem Secret Manager:

- **Vorteile:** Region wählbar (für Schweizer Kunden etwa eine Region in Zürich), eigene Netzwerkregeln, eigene Protokollierung, Integration in bestehende Systeme.
- **Pflichten:** Deployment-Pipeline, Secrets (nie als Klartext-Umgebungsvariable), Monitoring, **Budget-Alarme** und **Obergrenzen** (z. B. `--max-instances` bei Cloud Run – ohne Limit eine Kostenfalle), Updates.
- **Muster für lange Aufgaben:** Anfrage annehmen, Auftrag in eine Warteschlange legen, asynchron verarbeiten, Ergebnis speichern – der Nutzer wartet nicht auf den Agenten.

:::gem Entwickeln lokal, betreiben in der Cloud
Ein natürlicher Weg: Den Ablauf **lokal mit Claude Code** entwickeln und testen, als **`claude -p`-Skript** oder mit dem **Agent SDK** stabilisieren, dann je nach Bedarf in **CI**, als **Cloud Scheduled Task** oder in **Managed Agents / eigener Cloud** betreiben. Weil Prompt, Werkzeugliste, Grenzen und Schema dieselben bleiben, ist der Wechsel der Betriebsform kein Neubau.
:::

## Drei Beispiele

| Fall | Empfehlung | Begründung |
|---|---|---|
| Entwicklerin will wöchentlich ihre Abhängigkeiten prüfen lassen | **CI** (GitHub Actions) oder **Cloud Scheduled Task** | Repo-Bezug, kurzer Lauf, Ergebnis als Draft-PR |
| Treuhandbüro: täglicher Marktbericht per Mail an 30 Mitarbeitende | **Managed Agents** + Scheduler, oder **eigene Cloud** bei strengen Datenvorgaben | kein Rechner soll laufen, mehrere Empfänger, Bericht als Export |
| Versicherung: Agent prüft Schadensmeldungen mit Personendaten | **eigene Cloud** mit Region Schweiz/EU, Pseudonymisierung, kommerzieller Vertrag | Compliance und Datenstandort dominieren, Protokollierung im eigenen System |

:::berater Im Kundengespräch
Die Frage «Wo läuft das?» kommt meist zu spät – nach der Demo. Besser früh: «Wer nutzt es, wie lange läuft es, welche Daten fasst es an, und wer ist nachts zuständig, wenn es klemmt?» Die Antworten sortieren die Optionen in wenigen Minuten. Typischer Einwand: «Wir wollen alles in der eigenen Cloud.» – Das ist möglich und bei sensiblen Daten oft richtig, bedeutet aber eigenen Betrieb mit Deployment, Monitoring und Bereitschaft. Für interne Hilfsjobs ohne sensible Daten ist ein verwalteter Dienst meist die wirtschaftlichere Wahl.
:::

:::spickzettel
- Fünf Formen: **lokal · CI · Claude Cloud Scheduled Task · Managed Agents · eigene Cloud**
- Sechs Fragen: **Laufzeit · Nutzer · Daten · Compliance · Kosten · Betrieb**
- Lokal = Rechner muss laufen · CI = YAML im Repo · Cloud Task = min. 1 Std., kein Ops
- **Managed Agents** = Produkt für viele Nutzer, Container pro Session, Token + Laufzeitgebühr
- **Eigene Cloud** = Region wählbar, aber Deployment, Secrets, Monitoring, **Limits** und Budget-Alarme
- Wegwerfumgebung ≠ Daten verlassen die eigene Infrastruktur nie → **Datenfrage** prüfen
- Entwickeln lokal → stabilisieren mit `claude -p`/SDK → betreiben, wo es passt
:::

:::selbstcheck 3
