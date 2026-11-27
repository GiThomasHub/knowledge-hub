---
title: Skill-Bibliothek als institutionelles Wissen
level: L4
summary: Wie eine Organisation ihr Wissen in eine gepflegte Skill-Bibliothek überführt – Zuständigkeiten, Katalog, Nutzungsdaten, Review-Rhythmus – und wie sie fremde Skills und Plugins sicher einsetzt.
competencies: [ki-skp-06]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill ai-engineering-advisor, references/skills-plugins.md (Maintaining a skill library, Capturing personal style, Deployment trap; geprüft 27.11.2026)
  - Skill evals-observability, references/skill-evals.md (Qualitäts-Evals, Learnings; geprüft 27.11.2026)
  - https://code.claude.com/docs/en/skills (Dynamic context injection, disableSkillShellExecution)
  - https://code.claude.com/docs/en/plugins/marketplace-reference (strictKnownMarketplaces, blockedMarketplaces)
  - Masterclass_Claude_Skills_Plugins.docx (Kapitel 12 – Team-Setup)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Skill-Bibliothek in Organisationen: Wissen sammeln (was wird Claude dreimal erklärt?), ein Eigentümer pro Thema statt Kopien, Katalog mit Name/Description/letzter Änderung/Nutzung, Nutzung zählen (90 Tage ungenutzt → schärfen, zusammenlegen, entfernen), Überschneidungen über Trigger-Evals, Review-Rhythmus mit Draft-PR statt Auto-Merge, Learnings-Datei; Stil erfassen als Regeln plus anonymisierte Beispiele; Skills synchronisieren nicht zwischen Oberflächen; Sicherheit fremder Skills und Plugins: Skripte, Hooks, MCP-Server und !`befehl` laufen mit deinen Rechten, Prompt Injection im Skill-Text, Quellen prüfen, Versionen fixieren, strictKnownMarketplaces, disableSkillShellExecution, revDSG"
---

:::tldr
Eine Skill-Bibliothek macht aus dem Wissen einzelner Personen **Wissen der Organisation**: Wie wir Offerten schreiben, Verträge prüfen, Berichte gestalten – einmal sauber festgehalten, für alle verfügbar und messbar verbessert. Damit sie nicht zum Wildwuchs wird, braucht sie **klare Zuständigkeiten** (ein Eigentümer pro Thema, keine Kopien), einen **Katalog**, **Nutzungsdaten** und einen **Review-Rhythmus**. Und weil Skills und Plugins Skripte, Hooks und MCP-Server mitbringen können, gilt für **fremde** Pakete: **wie fremden Code behandeln** – prüfen, Versionen fixieren, Quellen einschränken.
:::

:::bildlich Vom Zettelkasten zur Fachbibliothek
In vielen Firmen steckt das wichtigste Wissen in Köpfen und auf Zetteln: «Frag Anna, wie man das macht.» Eine Skill-Bibliothek ist die **Fachbibliothek** daraus – mit Bibliothekarin (Eigentümer), Katalog, Ausleihstatistik (Nutzung) und einer regelmässigen Durchsicht, bei der veraltete Bücher aussortiert werden. Und wie in jeder Bibliothek prüft man Schenkungen, bevor sie ins Regal kommen.
:::

## Wissen finden und erfassen

- **Lücken statt Wunschliste:** Ein guter Kandidat ist jede Aufgabe, die Claude **zum dritten Mal** von Grund auf erklärt wird. Vorher prüfen, ob ein bestehender Skill erweitert werden kann – ein neuer Skill ist die letzte Option.
- **Stil erfassen, nicht Dateien horten:** Ein Skill «lernt» den Firmenstil, indem man aus echten Dokumenten **Regeln** ableitet (Ton, Aufbau, Formulierungen, Sonderfälle) und sie mit 1–3 **anonymisierten** Musterbeispielen und festen Vorlagen in `assets/` ergänzt. Rohdateien gehören nicht hinein.
- **Dauerhaftes in den Skill, Einzelfall-Fakten in die Eingabe:** Der Skill weiss, wie eine Offerte aufgebaut ist; Mandant und Umfang kommen mit der Anfrage.

## Die Bibliothek pflegen

| Prinzip | Umsetzung |
|---|---|
| **Ein Eigentümer pro Thema** | Ein Skill ist für ein Thema zuständig; andere **verweisen** darauf («für MWST-Fragen Skill `mwst-pruefung` laden»), statt den Inhalt zu kopieren. Kopien laufen innert Wochen auseinander. |
| **Katalog** | Eine Übersicht aller Skills mit Name, Description, Eigentümer, letzter Änderung, offenen Learnings und Nutzung. |
| **Nutzung messen** | In Claude Code lassen sich Skill-Aufrufe per Hook zählen; in der Web-App gibt es keine Zahlen, die Werte sind also eine Untergrenze. **90 Tage ungenutzt** → Description zu eng, zusammenlegen oder entfernen. |
| **Überschneidungen** | Zwei Skills, deren Descriptions dieselben Anfragen beanspruchen, machen die Auswahl zufällig. Mit Trigger-Evals prüfen und abgrenzen. |
| **Learnings sammeln** | Jede Beobachtung («Skill hat X vergessen») landet in einer Learnings-Datei pro Skill und fliesst beim nächsten Review ein. |
| **Review-Rhythmus** | Regelmässig (z. B. alle zwei Wochen) Learnings, Nutzung und Neuigkeiten sichten. Ein automatischer Lauf darf **Vorschläge als Draft-PR** machen – **gemerged wird von einem Menschen**. |

:::falle Skills synchronisieren nicht überall
Ein Skill, der in Claude Code unter `~/.claude/skills/` liegt, ist in der Claude-App nicht vorhanden – und umgekehrt ist ein in claude.ai hochgeladener Einzel-Skill nicht automatisch im Projekt-Repo. Auch Verweise zwischen Skills funktionieren nur, wo **beide** installiert sind. Eine Bibliothek braucht darum **einen klaren Verteilweg pro Oberfläche** – am besten ein Plugin aus einem gemeinsamen Marketplace, das in der App am Konto hängt und in Claude Code über die Einstellungen aktiviert wird.
:::

## Fremde Skills und Plugins sicher einsetzen

Ein Skill ist nicht nur Text. Er und vor allem ein Plugin können Dinge mitbringen, die **mit deinen Rechten** laufen:

| Bestandteil | Risiko |
|---|---|
| Skripte in `scripts/` | werden ausgeführt, wenn die Anleitung es verlangt |
| `` !`befehl` `` im Skill | läuft **vor** dem Lesen, sobald der Skill ausgelöst wird (Berechtigungsregeln gelten) |
| Hooks im Plugin | laufen **automatisch** bei Ereignissen, ohne dass jemand fragt |
| MCP-Server im Plugin | verbinden zu externen Diensten, können Daten abfliessen lassen |
| Anweisungen im Skill-Text | können Claude gezielt fehlleiten ([[Prompt Injection]] aus der eigenen Bibliothek) |

**Regeln für die Organisation:**

1. **Quellen einschränken:** nur freigegebene Marketplaces zulassen (`strictKnownMarketplaces`), bekannte schlechte sperren (`blockedMarketplaces`) – über Managed Settings, damit es nicht abschaltbar ist.
2. **Vor der Aufnahme prüfen wie Code:** `SKILL.md`, alle Skripte, Hooks und MCP-Konfiguration lesen. Was ruft es auf, wohin sendet es Daten?
3. **Versionen fixieren:** fremde Plugins mit fester Version bzw. festem Commit übernehmen, Updates bewusst prüfen statt blind ziehen.
4. **Wo nötig abschalten:** Mit `"disableSkillShellExecution": true` in den Einstellungen werden `` !`befehl` ``-Einspielungen in Skills durch einen Hinweis ersetzt statt ausgeführt.
5. **Keine Personen- oder Kundendaten in Skills:** Beispiele anonymisieren. Ein Skill wird geteilt, kopiert und synchronisiert – unter dem revDSG und bei Berufsgeheimnissen ist eine Kundenadresse in einem Musterbeispiel ein Datenschutzvorfall in Zeitlupe.

:::gem Eigene Skills zuerst
Bevor ein fremdes Plugin mit 40 Skills installiert wird: Oft genügen **zwei, drei Ideen** daraus, sauber in einen **eigenen** Skill übernommen und geprüft. Das ist sicherer, passt besser zum eigenen Vorgehen und vermeidet Überschneidungen mit der bestehenden Bibliothek.
:::

:::berater Im Kundengespräch
Ein bewährter Einstieg für eine Organisation in vier Schritten: (1) **Zehn häufigste Aufgaben** sammeln, bei denen Claude heute jedes Mal neu instruiert wird. (2) Für die drei wichtigsten je einen **Skill mit Trigger- und Qualitäts-Eval** bauen, Eigentümer festlegen. (3) Als **Plugin in einem internen Marketplace** verteilen, Quellen per Managed Settings einschränken. (4) **Review-Rhythmus** mit Katalog, Nutzung und Learnings etablieren. Nach drei Monaten zeigt die Nutzung, wo sich der Ausbau lohnt. Typischer Einwand: «Das macht jeder für sich besser.» – Genau das ist das Problem: Das Wissen bleibt bei der Person und geht mit ihr.
:::

:::spickzettel
- Bibliothek = **Wissen der Organisation**, nicht einzelner Köpfe
- Kandidat: Aufgabe, die Claude **zum dritten Mal** erklärt wird; zuerst bestehenden Skill erweitern
- Stil als **Regeln + anonymisierte Beispiele + Vorlagen**, keine Rohdateien
- **Ein Eigentümer pro Thema**, verweisen statt kopieren; **Katalog**
- **Nutzung messen**; 90 Tage ungenutzt → schärfen, zusammenlegen, entfernen
- Review mit **Draft-PR**, Merge durch Menschen; **Learnings** pro Skill
- Skills **synchronisieren nicht** überall → klarer Verteilweg (Plugin)
- Fremde Pakete wie **Code**: prüfen, **Versionen fixieren**, `strictKnownMarketplaces`, ggf. `disableSkillShellExecution`
:::

:::selbstcheck 3
