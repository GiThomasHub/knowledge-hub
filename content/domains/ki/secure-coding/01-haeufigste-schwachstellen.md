---
title: Die häufigsten Schwachstellen – OWASP Top 10 im Überblick
level: L1
summary: Warum alles, was von aussen kommt, als feindlich gilt, welche Schwachstellen am häufigsten ausgenutzt werden – kaputte Zugriffskontrolle, Injection, XSS, geleakte Secrets – und wie die OWASP Top 10:2025 sie ordnet.
competencies: [ki-scd-01]
volatility: mittel
last_verified: 2026-11-27
sources:
  - https://owasp.org/Top10/2025/0x00_2025-Introduction/
  - Skill secure-coding, SKILL.md (Grundsatz, Schritt 1 – Angriffsfläche, Pflichtbausteine; Stand 26.11.2026)
  - Skill secure-coding, references/eingaben-und-injection.md und references/zugriff-und-identitaet.md (geprüft 27.11.2026)
  - GitHub_GoogleCloud_Masterclass_FINAL.docx (Security)
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Grundsatz: alles, was über eine Grenze hereinkommt, ist feindlich bis geprüft; Angriffsfläche = Eingänge (Formulare, API, Webhooks, Uploads, URLs, Nachrichten) und Senken (SQL, Shell, Dateisystem, HTML, eval, ausgehende Requests); OWASP Top 10:2025: A01 Broken Access Control (inkl. SSRF, IDOR/BOLA), A02 Security Misconfiguration, A03 Software Supply Chain Failures (neu), A04 Cryptographic Failures, A05 Injection (inkl. XSS), A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions (neu); Beispiele IDOR (fremde ID in URL), SQL-Injection, XSS, geleakter API-Key im Repo; KI-generierter Code hat dieselben Lücken; Sicherheit beim Bauen, nicht erst im Review"
---

:::tldr
Der Grundsatz sicherer Programmierung: **Alles, was von aussen kommt, ist feindlich, bis der Code es geprüft hat** – Formulareingaben, API-Aufrufe, hochgeladene Dateien, URLs, Nachrichten. Die häufigsten Lücken sind seit Jahren dieselben: **kaputte Zugriffskontrolle** (jemand sieht fremde Daten, indem er eine ID ändert), **Injection** (Eingaben werden als Befehl ausgeführt, z. B. SQL), **Cross-Site Scripting** (fremdes JavaScript läuft im Browser anderer Nutzer) und **geleakte Secrets** (API-Schlüssel im Repository). Die **OWASP Top 10:2025** ordnen diese Risiken; neu sind darin **Lieferkettenfehler** und **falsche Fehlerbehandlung**.
:::

:::bildlich Der Empfang im Bürogebäude
Ein gutes Bürogebäude lässt niemanden ungeprüft hinein. Am **Empfang** wird kontrolliert, wer kommt und wohin er will (Eingabeprüfung). Der **Badge** öffnet nur die Räume, für die man berechtigt ist – und zwar an **jeder** Tür, nicht nur am Eingang (Zugriffskontrolle). Ein Zettel, den ein Besucher abgibt, wird gelesen, aber nie als Anweisung an die Haustechnik weitergereicht (Injection). Und der Generalschlüssel hängt nicht neben der Eingangstür (Secrets).
:::

## Angriffsfläche: Eingänge und Senken

Bevor man über Lücken spricht, muss klar sein, **wo** Fremdes hereinkommt und **wo** es gefährlich wird.

| Eingänge (woher) | Senken (wo es gefährlich wird) |
|---|---|
| Formulare, API-Aufrufe, Webhooks | SQL- und NoSQL-Abfragen |
| Datei-Uploads, importierte CSV, PDF, ZIP | Shell-Befehle |
| URLs, die der Code abruft | Dateisystem (Pfade) |
| Mails, Chat-Nachrichten, Queue-Nachrichten | HTML-Ausgabe, Templates |
| Header, Cookies | `eval`, Deserialisierung |
| Daten, die andere in die Datenbank geschrieben haben | ausgehende Requests, Weiterleitungen, Logs |

Eine Lücke entsteht, wenn ein **Weg vom Eingang zur Senke ohne wirksamen Schutz** existiert.

## Vier Klassiker

| Schwachstelle | Was passiert | Beispiel |
|---|---|---|
| **Kaputte Zugriffskontrolle** (IDOR/BOLA) | Server prüft nicht, ob das Objekt der angemeldeten Person gehört | `/rechnungen/1043` → in der URL `1044` eintippen → fremde Rechnung |
| **Injection** | Eingabe wird als Code oder Befehl ausgeführt | Suchfeld `' OR 1=1--` gibt alle Kundendaten zurück |
| **Cross-Site Scripting (XSS)** | Eingabe wird ungeprüft als HTML ausgegeben, fremdes JavaScript läuft bei anderen | Kommentar mit `<script>` stiehlt Sitzungen anderer Nutzer |
| **Geleakte Secrets** | Zugangsdaten landen im Code oder Repository | API-Schlüssel im Commit, Bot findet ihn in Minuten |

## OWASP Top 10:2025

| Nr. | Kategorie | Kurz |
|---|---|---|
| A01 | **Broken Access Control** | Zugriff ohne Berechtigung; umfasst jetzt auch SSRF |
| A02 | **Security Misconfiguration** | Debug an, Standardpasswörter, zu offene Einstellungen |
| A03 | **Software Supply Chain Failures** | neu: unsichere Abhängigkeiten, Build- und Verteilwege |
| A04 | **Cryptographic Failures** | schwache oder falsch eingesetzte Kryptografie |
| A05 | **Injection** | SQL, Shell, XSS und Verwandte |
| A06 | **Insecure Design** | Sicherheit fehlt schon im Entwurf |
| A07 | **Authentication Failures** | schwache Anmeldung, Sitzungsfehler |
| A08 | **Software or Data Integrity Failures** | ungeprüfte Updates, unsichere Deserialisierung |
| A09 | **Security Logging and Alerting Failures** | Angriffe werden nicht bemerkt |
| A10 | **Mishandling of Exceptional Conditions** | neu: Fehler führen in einen unsicheren Zustand («fail open») |

:::falle «Die KI hat den Code geschrieben, der ist sicher»
Code, den Claude oder ein anderes Modell schreibt, kann **dieselben Lücken** enthalten wie menschlicher Code – zum Beispiel eine SQL-Abfrage per String-Verkettung oder einen Endpunkt ohne Berechtigungsprüfung. Modelle schlagen ausserdem gelegentlich Paketnamen vor, die es nicht gibt; Angreifer registrieren solche Namen gezielt. KI-generierter Code wird genauso geprüft wie jeder andere: mit Scannern, Tests und Review.
:::

:::gem Sicherheit entsteht beim Bauen
Die meisten Lücken lassen sich mit Standardbausteinen verhindern, die **beim Schreiben** eingesetzt werden: Eingaben per Schema prüfen, Abfragen parametrisieren, Ausgaben kodieren, Zugriff bei jedem Objekt prüfen, Secrets ausserhalb des Codes. Ein Review findet, was trotzdem durchrutscht – aber er ersetzt die Bausteine nicht. Und: **Framework-Funktionen** (ORM, Auth-Bibliothek, Template-Engine) nutzen statt Sicherheit selbst zu bauen.
:::

:::berater Im Kundengespräch
Die Frage «Ist unsere App sicher?» lässt sich nicht mit Ja beantworten. Die ehrliche Antwort beginnt mit der **Angriffsfläche**: «Welche Eingänge hat die App, wer kommt da rein, und was steht auf dem Spiel – Personendaten, Geld, Zugangsdaten?» Daraus ergibt sich, welche Schutzbausteine Pflicht sind. Ein interner Rechner ohne fremde Eingaben braucht fast nichts davon; ein Kundenportal im Internet alles.
:::

:::spickzettel
- Grundsatz: **alles von aussen ist feindlich**, bis geprüft
- Lücke = Weg vom **Eingang** zur **Senke** ohne Schutz
- Klassiker: **kaputte Zugriffskontrolle** (fremde ID), **Injection** (`' OR 1=1--`), **XSS** (`<script>`), **geleakte Secrets**
- OWASP Top 10:2025: **A01 Access Control** (inkl. SSRF), **A02 Misconfiguration**, **A03 Supply Chain** (neu), A04 Krypto, **A05 Injection**, A06 Design, A07 Auth, A08 Integrität, A09 Logging, **A10 Fehlerbehandlung** (neu)
- **KI-Code** hat dieselben Lücken; erfundene Paketnamen prüfen
- Sicherheit **beim Bauen**, Framework-Funktionen statt Eigenbau
:::

:::selbstcheck 3
