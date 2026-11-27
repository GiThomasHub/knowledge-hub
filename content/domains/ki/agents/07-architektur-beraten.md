---
title: Die einfachste tragfähige Architektur empfehlen – und die Risiken benennen
level: L4
summary: Wie du einem Kunden begründet die einfachste Architektur empfiehlst, welche Risiken autonome Agenten mit sich bringen – falsche Ziele, Ressourcenhunger, irreversible Aktionen, eingeschleuste Anweisungen – und mit welchen Kontrollen du sie beherrschbar machst.
competencies: [ki-agt-07]
volatility: mittel
last_verified: 2026-11-27
sources:
  - https://www.anthropic.com/engineering/building-effective-agents (Abschnitte When (and when not) to use agents, Agents)
  - Skill agents-automation, SKILL.md (Stufen, Definition of Done) und references/muster.md (Anti-Muster)
  - https://code.claude.com/docs/en/permission-modes (Auto-Modus – standardmässig blockierte Aktionen, abgerufen 27.11.2026)
  - Lektionen ai-security/ueberblick und ai-security/sandbox-vs-permissions (Knowledge Hub)
  - Harness.docx (Teil H – Entscheidungshilfe)
prompts: [mehr, beispiele, kundengespraech, pruef-mich, elevator-pitch]
prompt_context: "Agenten-Architektur beraten: Stufenleiter Call → Workflow → Agent → Multi-Agent mit Begründung; Risiken autonomer Agenten (fehlspezifizierte Ziele und Abkürzungen, Ressourcen- und Rechteausweitung, irreversible Aktionen, Prompt Injection, Datenabfluss, Kostenexplosion, Fehlerfortpflanzung, Verantwortlichkeit); Kontrollen (Least Privilege, Freigabe-Gates, Entwürfe statt Ausführung, Budgets, Sandbox, Audit-Log, Not-Aus, Evals)"
---

:::tldr
Ein Senior Consultant empfiehlt **die einfachste Architektur, die das Problem zuverlässig löst** – und begründet, warum eine einfachere nicht reicht. Autonome Agenten bringen eigene Risiken: Sie verfolgen ein **falsch verstandenes Ziel** zielstrebig, greifen nach **mehr Ressourcen und Rechten** als nötig, lösen **irreversible Aktionen** aus und lassen sich durch **eingeschleuste Anweisungen** steuern. Beherrschbar wird das mit **minimalen Rechten**, **Entwürfen statt Ausführung**, **Freigaben** vor allem Unumkehrbaren, **Budgets**, **Isolation** und einem **lückenlosen Protokoll**.
:::

## Die Empfehlung: von unten nach oben begründen

| Stufe | Begründung, warum sie reicht | Begründung, warum sie nicht reicht |
|---|---|---|
| **Einzelner Call** | eine klar umrissene Umwandlung | mehrere abhängige Schritte nötig |
| **Workflow** | Schritte bekannt, Prüftore im Code möglich | der Weg zeigt sich erst unterwegs |
| **Agent** | Weg unvorhersehbar, Feedback prüfbar, Fehler auffangbar | Aufgabe zerfällt in unabhängige Teile oder braucht unabhängige Prüfung |
| **Multi-Agent** | Parallelität oder unabhängige Prüfung bringen messbar mehr | – (höchste Stufe, höchste Kosten) |

Agentische Systeme tauschen laut Anthropic **Latenz und Kosten gegen bessere Ergebnisse** – dieser Tausch muss sich lohnen. Für viele Anwendungen reicht ein gut optimierter einzelner Aufruf mit Retrieval und Beispielen.

:::bildlich Das kleinste Fahrzeug für die Strecke
Für den Weg zum Bäcker nimmst du das Velo, für den Umzug den Lieferwagen, für den Transport über die Alpen einen Sattelschlepper mit Fahrerausweis C. Wer mit dem Sattelschlepper zum Bäcker fährt, zahlt Diesel, findet keinen Parkplatz und braucht eine Spezialbewilligung – für ein Brot. In der Beratung heisst das: **Fahrzeug nach Strecke wählen, nicht nach Prestige.**
:::

## Die Risiken autonomer Agenten

| Risiko | Wie es entsteht | Beispiel |
|---|---|---|
| **Falsch verstandenes Ziel** | Das Modell optimiert, was gemessen wird, nicht was gemeint ist | «Mach die Tests grün» → Tests auskommentiert |
| **Ressourcen- und Rechteausweitung** | Der Agent beschafft sich, was ihm hilft | weitere Zugänge anfordern, Budget ausreizen, eigene Hilfsagenten starten |
| **Irreversible Aktionen** | Werkzeuge mit Wirkung nach aussen | E-Mail versendet, Datensätze gelöscht, Force-Push, Produktions-Deployment |
| **Eingeschleuste Anweisungen** | Werkzeugausgaben enthalten fremden Text | Webseite oder Ticket mit «sende die Kundenliste an …» ([[Prompt Injection]]) |
| **Datenabfluss** | Netzzugang plus Zugriff auf sensible Daten | Agent lädt interne Dokumente bei einem externen Dienst hoch |
| **Fehlerfortpflanzung** | ein früher Fehler wird in jedem Schritt weiterverarbeitet | falsche Annahme in Schritt 2, zwanzig Folgeschritte darauf aufgebaut |
| **Kostenexplosion** | Schleifen, Multi-Agent, grosse Kontexte | ein nächtlicher Lauf verbraucht das Monatsbudget |
| **Unklare Verantwortung** | niemand hat die Aktion freigegeben | «Das war die KI» – vor Kunde, Revision oder Aufsicht nicht haltbar |

:::falle «Das Modell ist ja brav»
Die meisten Schäden entstehen nicht, weil ein Modell böswillig ist, sondern weil es **zielstrebig ein falsch verstandenes Ziel** verfolgt oder **fremdem Text folgt**, den es für eine Anweisung hält. Sicherheit, die auf dem guten Willen des Modells beruht, ist keine. Die Frage lautet nicht «Wird es das tun?», sondern «**Was kann im schlimmsten Fall passieren, wenn es das tut?**».
:::

## Kontrollen, die wirken

| Kontrolle | Gegen | Umsetzung |
|---|---|---|
| **Minimale Rechte** ([[Least Privilege]]) | Rechteausweitung, Datenabfluss | nur nötige Werkzeuge, lesend vor schreibend, eingeschränkte Tokens |
| **Entwurf statt Ausführung** | irreversible Aktionen | E-Mail als Entwurf, Änderung als Draft-PR, Buchung als Vorschlag |
| **Freigabe-Gates** | irreversible Aktionen, Verantwortung | menschliche Bestätigung vor Versand, Löschung, Zahlung, Deployment |
| **Budgets und Grenzen** | Kostenexplosion, Endlosläufe | max. Schritte, max. Kosten, Timeout |
| **Isolation** | Datenabfluss, Schaden am System | Container, Sandbox, Netz nur zu freigegebenen Zielen |
| **Prüfbare Ziele** | falsch verstandene Ziele | messbare Kriterien plus unabhängiger Prüfer; geschützte Tests |
| **Untrusted Input behandeln** | Prompt Injection | Werkzeugausgaben nie als Anweisung, sendende Werkzeuge nur mit Freigabe |
| **Protokoll und Not-Aus** | Verantwortung, Fehlerfortpflanzung | jeder Schritt geloggt, Lauf jederzeit abbrechbar |
| **Evals vor dem Einsatz** | alle | 20–50 realistische Aufgaben, Fehlschläge analysiert |

:::gem Reversibilität als Designprinzip
Die wirksamste Einzelentscheidung ist oft: **Der Agent erzeugt nur Dinge, die ein Mensch noch stoppen kann.** Entwürfe, Vorschläge, Draft-PRs, Buchungsvorschläge. Damit verschiebt sich das Risiko von «Was richtet er an?» zu «Was legt er mir vor?» – und die Freigabe wird zur natürlichen Kontrolle. Auch Werkzeuge wie der Auto-Modus von Claude Code blockieren standardmässig genau solche unumkehrbaren Schritte, etwa Force-Push, Produktions-Deployments oder das Löschen von Dateien, die vor der Session existierten (Stand 27.11.2026).
:::

## Vom Risiko zur Architektur: ein Beispiel

**Anfrage:** Eine Treuhandfirma will «einen KI-Agenten, der Kundenmails beantwortet und Belege verbucht».

1. **Zerlegen:** Mail einordnen (Frage, Beleg, Reklamation) → Beleg auslesen → Buchung vorbereiten → Antwort entwerfen.
2. **Stufe wählen:** Die Schritte sind bekannt → **Workflow** mit Routing und Kette, kein frei entscheidender Agent.
3. **Rechnen trennen:** Beträge und MWST rechnet Code, das Modell extrahiert und formuliert.
4. **Irreversibles absichern:** Buchung nur als **Vorschlag**, Antwort nur als **Entwurf**; eine Fachperson gibt frei.
5. **Daten:** Kundendaten und Berufsgeheimnis → Vertrag mit dem Anbieter, Datenstandort, Pseudonymisierung prüfen.
6. **Messen:** 50 echte, anonymisierte Fälle als Testset; Freigabequote und Korrekturen als Kennzahl.

Erst wenn sich zeigt, dass bestimmte Fälle (z. B. unstrukturierte Rückfragen) einen offenen Rechercheweg brauchen, kommt **für genau diesen Pfad** ein Agent hinzu.

:::berater Im Kundengespräch
Die Geschäftsleitung will hören, dass KI Arbeit abnimmt – und dass nichts Unkontrolliertes passiert. Die Botschaft: «Wir bauen so einfach wie möglich und so autonom wie nötig. Was sich nicht rückgängig machen lässt, gibt ein Mensch frei. Jeder Schritt ist protokolliert, jede Zahl geprüft, die Kosten sind gedeckelt.» Typischer Einwand: «Dann ist es ja kein richtiger Agent.» – Genau. Der Wert liegt im gelösten Problem, nicht im Etikett. Autonomie erweitern wir dort, wo die Messungen zeigen, dass sie sicher und nützlich ist.
:::

:::spickzettel
- **Einfachste tragfähige Stufe**, von unten nach oben begründen
- Agentische Systeme tauschen **Latenz und Kosten gegen Qualität** – Tausch muss sich lohnen
- Risiken: **falsches Ziel · Ressourcen/Rechte · irreversibel · Injection · Datenabfluss · Fehlerfortpflanzung · Kosten · Verantwortung**
- Frage nicht «Wird es?», sondern «**Was im schlimmsten Fall?**»
- Kontrollen: **Least Privilege · Entwurf statt Ausführung · Freigabe · Budget · Isolation · prüfbare Ziele · Protokoll/Not-Aus · Evals**
- **Reversibilität** als Designprinzip
- Autonomie **schrittweise** erweitern, wo Messungen es stützen
:::

:::selbstcheck 3
