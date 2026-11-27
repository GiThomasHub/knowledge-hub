---
title: Mindeststandards und Vorgehen bei einer Lücke – inklusive Meldepflichten Schweiz
level: L4
summary: Wie du für ein Team verbindliche Mindeststandards für sicheren Code festlegst und was zu tun ist, wenn eine Lücke gefunden oder ausgenutzt wurde – erste Stunden, Behebung, koordinierte Offenlegung, Datensicherheit nach DSG und Meldepflichten an EDÖB und BACS.
competencies: [ki-scd-05]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill secure-coding, references/vorfall-und-recht.md (Sofortmassnahmen, Meldepflichten, DSG Art. 7, 8, 24, 61, DSV, ISG; geprüft 27.11.2026)
  - Skill secure-coding, SKILL.md (Pflichtbausteine, Definition of Done; Stand 26.11.2026)
  - https://www.fedlex.admin.ch/eli/cc/2022/491/de (Datenschutzgesetz DSG)
  - https://www.edoeb.admin.ch (Meldung von Datensicherheitsverletzungen)
  - https://www.ncsc.admin.ch (Bundesamt für Cybersicherheit BACS, Meldepflicht kritische Infrastrukturen)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Mindeststandards: Pflichtbausteine (Eingaben, Injection, Ausgabe, Zugriff pro Objekt, Login/Sessions, CSRF, SSRF, Secrets, Krypto, Fehler fail closed, Logging, Konfiguration/Header, Überlast-Grenzen, Abhängigkeiten), Definition of Done (Angriffsfläche, keine offenen hohen Funde, Scanner in CI, Negativtests, SECURITY.md), CI-Gates, Framework statt Eigenbau; Vorfall: Zeitpunkt festhalten, Beweise sichern, eindämmen, Secrets rotieren, Umfang klären, Meldepflicht prüfen; danach Korrektur mit Regressionstest, gleiche Lücke anderswo suchen, Nachbesprechung ohne Schuld; koordinierte Offenlegung, Private Vulnerability Reporting, Security Advisory; Recht CH: DSG Art. 7 (Datenschutz durch Technik), Art. 8 (Datensicherheit), Art. 24 (Meldung an EDÖB bei voraussichtlich hohem Risiko so rasch als möglich, Information Betroffener bei Bedarf), Dokumentation 2 Jahre (Art. 15 DSV), Art. 61 lit. c Busse bis CHF 250 000 bei vorsätzlicher Missachtung der Mindestanforderungen; ISG: Cyberangriffe auf kritische Infrastrukturen an BACS innert 24 Stunden (seit 1.4.2025); DSGVO Art. 33 72 Stunden; keine Rechtsberatung"
---

:::tldr
Sicherheit im Team braucht zwei Dinge: **verbindliche Mindeststandards** für jeden Code mit Angriffsfläche – Pflichtbausteine, Scanner in der CI, Negativtests, keine offenen hohen Funde vor dem Release – und einen **eingeübten Ablauf für den Ernstfall**. Wird eine Lücke gefunden oder ausgenutzt, zählen die ersten Stunden: **Zeitpunkt festhalten, Beweise sichern, eindämmen, Secrets rotieren, Umfang klären, Meldepflicht prüfen**. In der Schweiz verlangt das **DSG** angemessene Datensicherheit (Art. 8) und eine **Meldung an den EDÖB**, wenn eine Verletzung voraussichtlich zu einem **hohen Risiko** für Betroffene führt (Art. 24). Betreiberinnen **kritischer Infrastrukturen** melden Cyberangriffe zusätzlich innert **24 Stunden** dem **BACS**.
:::

:::bildlich Brandschutz
Brandschutz besteht aus **Vorschriften** (Fluchtwege, Rauchmelder, Feuerlöscher – geprüft bei der Abnahme) und einem **Notfallplan** (wer ruft wen, wo ist der Sammelplatz). Beides wird geübt, bevor es brennt. Wer erst im Feuer überlegt, wo der Löscher hängt, hat schon verloren. Genauso ist es mit Sicherheitslücken.
:::

## Mindeststandards für das Team

| Bereich | Standard |
|---|---|
| **Pflichtbausteine** | Eingaben per Schema, parametrisierte Abfragen, kodierte Ausgabe, Zugriff pro Objekt, sichere Anmeldung (Argon2id/bcrypt, Rate-Limit, MFA), CSRF-Schutz, SSRF-Allowlist, Secrets ausserhalb des Codes, geprüfte Kryptografie, **fail closed**, Logging ohne Secrets, sichere Konfiguration, Grenzen gegen Überlast, gepflegte Abhängigkeiten |
| **Bauen** | Framework-Funktionen statt Eigenbau (ORM, Auth-Bibliothek, Template-Engine, CSRF-Middleware) |
| **CI** | Code-Scanner (CodeQL oder Semgrep), Abhängigkeits-Scanner, **Secret Scanning mit Push Protection**, Dependabot |
| **Tests** | Negativtests für Zugriff und Eingaben bei jedem sicherheitsrelevanten Pfad |
| **Review** | Pull Request mit Review; bei sicherheitsrelevanten Änderungen gezielter Security Review |
| **Definition of Done** | Angriffsfläche dokumentiert, keine offenen Funde «hoch», Scanner grün, Negativtests grün, `SECURITY.md` bei öffentlichen Repos |

:::gem Standards als Pflichtbausteine, nicht als Prosa
Ein Sicherheitsleitfaden mit 40 Seiten Prosa wird nicht gelesen. Wirksamer sind **wenige, prüfbare Bausteine**, die in der **CI** durchgesetzt werden: Scanner, die bei «hoch» blockieren, ein Ruleset, das Merges ohne Review verhindert, Negativtests, die laufen. Für Claude Code lassen sich dieselben Bausteine als Regel in der `CLAUDE.md` und als eigener Prüfbefehl festhalten – damit auch KI-generierter Code sie einhält.
:::

## Wenn eine Lücke gefunden wird: die ersten Stunden

1. **Festhalten:** Zeitpunkt der Entdeckung notieren – ab dann laufen Fristen. Wer weiss es, was ist bekannt?
2. **Beweise sichern**, bevor etwas geändert wird: Logs exportieren, Systemzustände sichern. Nicht «aufräumen».
3. **Eindämmen:** betroffenen Endpunkt sperren (Feature-Flag, Wartungsseite), kompromittierte Konten sperren.
4. **Secrets rotieren**, die betroffen sein könnten – ein geleakter Schlüssel ist erst nach dem Rotieren ungefährlich.
5. **Umfang klären:** Welche Daten, wie viele Personen, seit wann?
6. **Meldepflicht prüfen** – die Uhr läuft.

**Danach:** Korrektur mit einem **Test, der die Lücke nachstellt**; nach **demselben Muster** im ganzen Code suchen; Betroffene informieren, wenn nötig; **Nachbesprechung ohne Schuldzuweisung** – welcher Baustein, Test oder Alarm hat gefehlt?

**Von aussen gemeldet:** schnell danken und den Eingang bestätigen, beheben, Veröffentlichung abstimmen (**koordinierte Offenlegung**). Auf GitHub helfen **Private Vulnerability Reporting** und **Security Advisories**; öffentliche Repositories brauchen eine `SECURITY.md` mit Meldeweg.

## Recht in der Schweiz (Stand 27.11.2026)

| Bestimmung | Inhalt |
|---|---|
| **Art. 7 DSG** | Datenschutz durch Technik und datenschutzfreundliche Voreinstellungen – schon bei der Planung |
| **Art. 8 DSG** | dem Risiko angemessene **Datensicherheit** durch technische und organisatorische Massnahmen; konkretisiert in Art. 1–3 DSV |
| **Art. 24 DSG** | **Meldung an den EDÖB** «so rasch als möglich», wenn eine Verletzung der Datensicherheit **voraussichtlich zu einem hohen Risiko** für die Betroffenen führt; Information der Betroffenen, wenn zu ihrem Schutz nötig |
| **Art. 15 DSV** | Verletzungen **dokumentieren**, auch nicht gemeldete; Aufbewahrung mindestens zwei Jahre |
| **Art. 61 lit. c DSG** | Busse bis **CHF 250 000** für die verantwortliche Person bei **vorsätzlicher** Missachtung der Mindestanforderungen an die Datensicherheit |
| **ISG** (seit 1.4.2025) | Betreiberinnen **kritischer Infrastrukturen** melden Cyberangriffe dem **BACS** innert **24 Stunden** |
| **DSGVO** (bei EU-Bezug) | Meldung an die Aufsichtsbehörde innert **72 Stunden** (Art. 33) |

:::falle Auftragsbearbeiter meldet direkt beim EDÖB
Wer als **Dienstleister** für einen Kunden Personendaten bearbeitet (Auftragsbearbeiter), meldet eine Verletzung **dem Verantwortlichen**, also dem Kunden – nicht selbst dem EDÖB. Der Kunde entscheidet über die Meldung. Darum gehört in jeden Vertrag mit Datenbearbeitung ein klarer **Meldeweg mit Frist** zwischen Dienstleister und Kunde. Und: Diese Lektion ist **keine Rechtsberatung** – bei Personendaten im Spiel früh die verantwortliche Datenschutzperson oder eine Fachperson beiziehen.
:::

:::berater Im Kundengespräch
Bei einem neuen Kunden lohnt die Frage: «**Was passiert, wenn morgen früh ein Forscher Ihnen eine Lücke meldet?**» Fehlt die Antwort, schlägst du drei Dinge vor: (1) einen **einseitigen Notfallablauf** mit Rollen und Telefonnummern, (2) eine **`SECURITY.md`** bzw. einen Meldeweg auf der Website, (3) eine **Vorab-Klärung der Meldepflichten** mit der Datenschutzverantwortlichen – inklusive der Frage, ob das Unternehmen unter das ISG fällt. Das kostet einen halben Tag und spart im Ernstfall Stunden, in denen Fristen laufen.
:::

:::spickzettel
- Mindeststandards: **Pflichtbausteine**, **Framework statt Eigenbau**, **Scanner + Secret Scanning + Dependabot in CI**, **Negativtests**, keine offenen Funde «hoch»
- Ernstfall: **festhalten → Beweise sichern → eindämmen → Secrets rotieren → Umfang → Meldepflicht prüfen**
- Danach: **Regressionstest**, gleiches Muster suchen, Nachbesprechung **ohne Schuld**
- Von aussen gemeldet: danken, beheben, **koordinierte Offenlegung**; `SECURITY.md`
- **DSG Art. 8** Datensicherheit · **Art. 24** Meldung an **EDÖB** bei voraussichtlich **hohem Risiko**, «so rasch als möglich» · Dokumentation **2 Jahre**
- **Art. 61 lit. c**: bis **CHF 250 000** bei Vorsatz
- **ISG**: kritische Infrastrukturen an **BACS** innert **24 Std.**; DSGVO **72 Std.**
- Auftragsbearbeiter meldet **dem Verantwortlichen**; keine Rechtsberatung
:::

:::selbstcheck 3
