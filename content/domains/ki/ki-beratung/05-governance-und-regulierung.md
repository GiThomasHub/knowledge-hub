---
title: KI-Governance – Datenklassen, Freigaben, Regulierung und Verantwortung
level: L4
summary: Wie du in einem Schweizer Unternehmen eine schlanke KI-Governance aufbaust – mit Datenklassen-Regel, Freigabeprozess für Werkzeuge und Use Cases, klaren Rollen, dem revDSG, dem Stand der Schweizer KI-Regulierung und dem EU AI Act.
competencies: [ki-ber-05]
volatility: hoch
last_verified: 2026-11-28
sources:
  - https://www.fedlex.admin.ch/eli/cc/2022/491/de (DSG, u. a. Art. 21 automatisierte Einzelentscheidung)
  - https://www.bj.admin.ch/de/kuenstliche-intelligenz (Stand Schweizer KI-Regulierung; geprüft 28.11.2026)
  - https://www.kmu.admin.ch/de/bis-anfang-2027-soll-ein-vorentwurf-zur-ki-regulierung-ausgearbeitet-werden (23.09.2026)
  - https://eeas.europa.eu/delegations/chile/artificial-intelligence-council-gives-final-green-light-simplify-and-streamline-rules_en (Digital Omnibus on AI, neue Fristen)
  - https://www.cuatrecasas.com/en/portugal/intellectual-property/art/digital-omnibus-ai-has-been-published (Publikation 24.07.2026, KI-Kompetenz Art. 4)
  - Skill ai-security-privacy, references/schweiz.md (Datenfrage Schweiz; geprüft 27.11.2026)
  - claude_financial_services_masterclass (1).docx (Kapitel 9.5 – Daten-Governance vor Go-Live)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "KI-Governance schlank: Datenklassen-Regel (erlaubt, mit Auflagen, verboten) je Werkzeug und Kontotyp; Freigabe für Werkzeuge (Vertrag, Datenstandort, Training, Admin) und für Use Cases (Steckbrief, Risiko, Prüfschritt); Rollen: Geschäftsleitung (Verantwortung, Risikobereitschaft), KI-Verantwortliche (Koordination), Datenschutz (Beurteilung), IT/Sicherheit (Einstellungen, Konten), Fachbereich (Use-Case-Verantwortung, Prüfung), Champions; Inventar der Use Cases; Weisung/Nutzungsrichtlinie; Recht Schweiz Stand 28.11.2026: keine spezifische KI-Gesetzgebung, geltendes Recht (revDSG, Berufsgeheimnis, Urheberrecht, Arbeitsrecht, Branchenregeln wie FINMA) gilt; Bundesrat Februar 2025: Europaratskonvention ratifizieren, sektorspezifisch, Vernehmlassungsvorlage erwartet Frühjahr 2027 zu Transparenz, Datenschutz, Nichtdiskriminierung, Aufsicht; Konvention unterzeichnet 27.03.2025; DSG Art. 21 automatisierte Einzelentscheidung; EU AI Act gilt für Schweizer Firmen, wenn Systeme in der EU angeboten oder Ergebnisse dort genutzt werden; verbotene Praktiken und KI-Kompetenz (Art. 4) seit 2.2.2025, GPAI seit 2.8.2025, Transparenzpflichten seit August 2026; Digital Omnibus on AI (publiziert 24.07.2026): Hochrisiko Anhang III ab 2.12.2027, Anhang I ab 2.8.2028; Art. 4 KI-Kompetenz bleibt als organisatorische Pflicht; keine Rechtsberatung, Fachpersonen beiziehen"
---

:::tldr
KI-Governance heisst nicht «ein dickes Reglement», sondern **wenige klare Regeln**, die jeder kennt: **Welche Daten** dürfen in **welches Werkzeug** ([[Datenklassen-Regel]])? **Wer gibt** neue Werkzeuge und Use Cases **frei**? **Wer ist verantwortlich**, wenn etwas schiefgeht? Rechtlich gilt in der Schweiz (Stand 28.11.2026) **keine eigene KI-Gesetzgebung**, sondern das bestehende Recht – vor allem das [[revDSG]]; eine Vorlage zur Umsetzung der KI-Konvention des Europarats wird für **Frühjahr 2027** erwartet. Wer KI-Systeme in der **EU** anbietet oder dort Ergebnisse nutzt, muss zudem den [[EU AI Act]] beachten, dessen Hochrisiko-Pflichten auf **Dezember 2027** verschoben wurden. Diese Lektion ist keine Rechtsberatung – im Einzelfall Fachpersonen beiziehen.
:::

:::bildlich Verkehrsregeln
Eine gute Governance ist wie die Verkehrsregeln: wenige, bekannte Grundregeln (rechts fahren, rot heisst halt), ein Fahrausweis (Schulung), Schilder an gefährlichen Stellen (Datenklassen) und eine Polizei, die selten eingreifen muss. Niemand liest vor jeder Fahrt das ganze Strassenverkehrsgesetz – aber alle wissen, was gilt.
:::

## Die vier Bausteine

| Baustein | Inhalt | Ergebnis |
|---|---|---|
| **Datenklassen-Regel** | welche Datenklasse in welches Werkzeug und welchen Kontotyp darf | eine Tabelle auf einer Seite |
| **Freigabe Werkzeuge** | Vertrag, Datenstandort, Training mit Inhalten, Verwaltung, Protokolle | Liste der erlaubten Werkzeuge und Konten |
| **Freigabe Use Cases** | Steckbrief, Risiko, Prüfschritt, verantwortliche Person | **Inventar** aller produktiven Use Cases |
| **Rollen** | wer entscheidet, berät, betreibt, prüft | klare Zuständigkeiten |

### Beispiel einer Datenklassen-Regel

| Datenklasse | Beispiele | Firmenkonto (Team/Enterprise) | Privatkonto | Lokales Modell |
|---|---|---|---|---|
| **Öffentlich** | Website, Medienmitteilungen | erlaubt | erlaubt | erlaubt |
| **Intern** | Protokolle, interne Weisungen | erlaubt | **verboten** | erlaubt |
| **Vertraulich** | Kundendaten, Verträge, Offerten | **mit Auflagen** (Vertrag, Pseudonymisierung prüfen) | **verboten** | erlaubt, wenn Datenwege geprüft |
| **Besonders schützenswert / Berufsgeheimnis** | Gesundheitsdaten, Mandantenakten | nur nach **Einzelfreigabe** durch Datenschutz | **verboten** | nach Prüfung (Lektion [Lokal oder Cloud?](#/l/lokale-llms/lokal-oder-cloud)) |

Ein typischer Auslöser für Governance ist [[Schatten-KI]]: Mitarbeitende nutzen private Konten, weil es kein freigegebenes Werkzeug gibt. Die wirksamste Antwort ist ein freigegebenes Firmenkonto plus klare Regel, nicht ein reines Verbot.

### Rollen

| Rolle | Aufgabe |
|---|---|
| **Geschäftsleitung** | trägt die Verantwortung, legt Ziele und Risikobereitschaft fest |
| **KI-Verantwortliche/r** | koordiniert, pflegt Regeln und Inventar |
| **Datenschutz** | beurteilt Datenklassen, Verträge, Transfers |
| **IT und Sicherheit** | Konten, Einstellungen, Zugriffsrechte, Protokolle |
| **Fachbereich** | trägt den einzelnen Use Case und prüft Ergebnisse |
| **Champions** | unterstützen Kolleginnen und Kollegen, melden Probleme |

## Das Recht in der Schweiz (Stand 28.11.2026)

- **Keine spezifische KI-Gesetzgebung.** Es gelten das **revDSG**, das **Berufsgeheimnis**, Urheber-, Arbeits- und Wettbewerbsrecht sowie **Branchenregeln** (z. B. Vorgaben der FINMA für Finanzinstitute).
- **revDSG** im KI-Kontext: Transparenz gegenüber Betroffenen, Datensicherheit, Bekanntgabe ins Ausland, und bei **automatisierten Einzelentscheidungen** mit Rechtsfolge oder erheblicher Beeinträchtigung eine Informationspflicht samt Möglichkeit, eine Überprüfung durch einen Menschen zu verlangen (**Art. 21 DSG**).
- **Geplante Regulierung:** Die Schweiz hat die **KI-Konvention des Europarats** am **27.03.2025 unterzeichnet**. Der Bundesrat setzt auf einen **sektorspezifischen** Ansatz; eine **Vernehmlassungsvorlage** zu Transparenz, Datenschutz, Nichtdiskriminierung und Aufsicht wird für **Frühjahr 2027** erwartet.

## Der EU AI Act für Schweizer Unternehmen

Der AI Act gilt für Schweizer Firmen, wenn sie KI-Systeme **in der EU anbieten** oder deren **Ergebnisse in der EU verwendet** werden. Stand 28.11.2026:

| Was | Seit bzw. ab |
|---|---|
| Verbotene Praktiken und **KI-Kompetenz** der Mitarbeitenden (Art. 4) | 2. Februar 2025 |
| Pflichten für Allzweck-Modelle (GPAI) | 2. August 2025 |
| Transparenzpflichten (z. B. Hinweis bei Chatbots, Kennzeichnung von Deepfakes) | August 2026, mit Übergangsfristen für bestehende Systeme |
| **Hochrisiko-Systeme** nach Anhang III (z. B. Personalauswahl, Kreditwürdigkeit) | **2. Dezember 2027** (verschoben durch den Digital Omnibus on AI) |
| Hochrisiko-KI in regulierten Produkten (Anhang I) | 2. August 2028 |

Der **Digital Omnibus on AI** wurde am **24.07.2026** im Amtsblatt der EU veröffentlicht. Er verschiebt vor allem die Hochrisiko-Fristen und fasst die Pflicht zur **KI-Kompetenz** als organisatorische Pflicht: Anbieter und Betreiber müssen Massnahmen treffen, die die KI-Kompetenz ihrer Mitarbeitenden fördern.

:::falle «Der AI Act betrifft uns nicht, wir sind in der Schweiz»
Eine Schweizer Bank, die mit einem KI-System die Kreditwürdigkeit von Kundinnen in Deutschland beurteilt, oder ein Personaldienstleister, der Bewerbungen für EU-Stellen vorsortiert, fällt in den Anwendungsbereich – mit Hochrisiko-Pflichten ab Dezember 2027. Umgekehrt löst die blosse Nutzung von Claude für interne Protokolle in der Schweiz keine AI-Act-Pflichten aus. Entscheidend ist **wo** das System angeboten und **wo** sein Ergebnis verwendet wird.
:::

:::gem Das Use-Case-Inventar
Das wirksamste Governance-Werkzeug ist eine einfache **Liste aller produktiven Use Cases**: Zweck, Werkzeug, Datenklasse, Risiko, Prüfschritt, verantwortliche Person, letzte Überprüfung. Sie beantwortet in Minuten die Fragen von Revision, Datenschutz oder Kunden – und zeigt sofort, wo eine neue Regel (etwa aus der Schweizer Vorlage 2027) etwas betrifft.
:::

:::berater Im Kundengespräch
Viele Firmen erwarten ein 40-seitiges KI-Reglement. Wirksamer ist ein **Starterpaket**: eine **Nutzungsrichtlinie** auf zwei Seiten, die **Datenklassen-Tabelle**, die **Liste der freigegebenen Werkzeuge**, das **Use-Case-Inventar** und ein **Freigabeweg** für Neues. Dazu der Hinweis auf das Restrisiko und auf die Grenzen der eigenen Rolle: «Ich zeige Ihnen die Struktur und die Fragen – die rechtliche Beurteilung im Einzelfall macht Ihre Datenschutzberaterin oder Ihr Anwalt.»
:::

:::spickzettel
- Governance = **Datenklassen-Regel · Freigabe Werkzeuge · Freigabe Use Cases · Rollen**
- **Inventar** aller produktiven Use Cases führen
- **Privatkonten** für interne und vertrauliche Daten **verboten**
- Schweiz (Stand 28.11.2026): **keine KI-Gesetzgebung**, es gelten **revDSG**, Berufsgeheimnis, Branchenregeln
- **Art. 21 DSG**: automatisierte Einzelentscheidung → informieren, Überprüfung durch Menschen
- KI-Konvention des Europarats **unterzeichnet 27.03.2025**; Vernehmlassung erwartet **Frühjahr 2027**
- **EU AI Act**: gilt bei Angebot oder Nutzung **in der EU**; KI-Kompetenz seit 2.2.2025; **Hochrisiko ab 2.12.2027**
- **Keine Rechtsberatung** – Fachpersonen beiziehen
:::

:::selbstcheck 3
