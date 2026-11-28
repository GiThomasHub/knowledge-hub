# Wochen-Tasks

Zwei geplante Aufgaben pflegen den Knowledge Hub. Beide arbeiten nach den Leitplanken in `CLAUDE.md`: eigener Branch, **ein Draft-PR**, nie mergen.

| Task | Wann | Ziel |
|---|---|---|
| **Inhalts-Review** | Montag | Fehler, Updates, Neues, neue Themen |
| **Fragen und Abdeckung** | Donnerstag | Lücken der Kompetenzmatrix schliessen (Lektionen und Fragen) |

Prüfrhythmus je Volatilität (aus `scripts/build.py`): hoch 28 Tage, mittel 56 Tage, tief 112 Tage.

---

## Task 1 – Inhalts-Review (Montag)

```
Du pflegst den Knowledge Hub im Repo GiThomasHub/knowledge-hub.
1. Klone das Repo, lies CLAUDE.md und CONTRIBUTING.md und halte dich strikt an die Leitplanken.
2. Führe `pip install -r requirements.txt` und `python scripts/build.py --check --report` aus.
   Nimm aus «Inhalts-Review fällig» die bis zu 3 ältesten Lektionen (bei weniger als 3 fälligen: die mit Volatilität «hoch» und ältestem last_verified).
3. Prüfe jede dieser Lektionen mit Websuche gegen aktuelle offizielle Quellen (Doku, Changelogs, Behörden):
   a) FEHLER: Aussagen, die falsch sind.
   b) UPDATES: neue Versionen, geänderte Defaults, veraltete Befehle, geänderter Rechtsstatus.
   c) NEUES: wichtige neue Funktionen oder Best Practices zum Thema, die ein Senior Consultant kennen muss.
   Korrigiere a) und b) direkt in der Lektion (mit Quelle in sources und Stand-Datum im Text), ergänze c) knapp im passenden Abschnitt, setze last_verified auf heute.
4. NEUE THEMEN: Suche nach Entwicklungen der letzten Wochen im Bereich KI-Engineering, Agenten, Sicherheit und Regulierung (Schweiz/EU), die in der Kompetenzmatrix fehlen. Schlage höchstens 3 neue Kompetenzen oder Themen vor – NICHT einbauen, nur im PR-Text unter «Vorschläge» mit Begründung und Quelle.
5. Schreibe einen Changelog-Eintrag content/changelog/<heute>-review.md (kind: korrektur oder update).
6. Validiere erneut. Erstelle Branch weekly/review-<heute>, committe, pushe und eröffne einen DRAFT-PR mit:
   Zusammenfassung · Liste der Änderungen je Lektion mit Quelle · «zu prüfen» (unsichere Punkte) · «Vorschläge» (neue Themen/Kompetenzen).
7. Wenn nichts zu ändern ist: kein PR, sondern ein kurzer Bericht in der Ausgabe.
Grenzen: max. 3 Lektionen, keine Änderungen an src/, scripts/, schema/, .github/, supabase/. Nie mergen, nie auf main pushen.
```

## Task 2 – Fragen und Abdeckung (Donnerstag)

```
Du pflegst den Knowledge Hub im Repo GiThomasHub/knowledge-hub.
1. Klone das Repo, lies CLAUDE.md und CONTRIBUTING.md und halte dich strikt an die Leitplanken.
2. Führe `pip install -r requirements.txt` und `python scripts/build.py --check --report` aus und lies den Abdeckungsbericht.
3. Priorisiere Lücken: zuerst Themen, die in content/paths/ vorkommen, dann Kompetenzen der Stufen L1–L2 vor L3–L4, dann Themen mit den meisten Lücken.
4. Wenn eine priorisierte Kompetenz keine Lektion hat: Schreibe EINE neue Lektion (höchstens 1 pro Lauf) nach CONTRIBUTING.md. Quellen: offizielle Doku, die Skills des ai-pro-toolkit (falls verfügbar) und die Masterclass-Dokumente im claude.ai-Projekt «Knowledge Hub» (falls verfügbar). Jede Tatsache mit Quelle.
5. Schreibe bis zu 10 neue Fragen für die grössten Lücken (status: draft, author: claude-weekly), gemischte Typen passend zur Stufe, jede mit source auf eine existierende Lektion und Erklärung.
6. Ergänze neue Begriffe im Glossar. Changelog-Eintrag bei neuer Lektion.
7. Validiere. Erstelle Branch weekly/fragen-<heute>, committe, pushe und eröffne einen DRAFT-PR mit: welche Kompetenzen adressiert wurden, Liste der neuen Fragen (ID, Stufe, Typ), Abdeckung vorher/nachher.
Grenzen: max. 1 neue Lektion, max. 10 Fragen, keine Änderungen an src/, scripts/, schema/, .github/, supabase/. Nie mergen, nie auf main pushen.
```

## Review durch den Menschen

1. Draft-PR öffnen, Vorschau lokal: `python scripts/build.py && python -m http.server -d dist 8000`.
2. Fragen prüfen und bei guter Qualität `status: draft` → `reviewed` setzen (erst dann erscheinen sie in Daily 5 und Prüfung). Alternativ in einer interaktiven Sitzung Claude mit dem Review beauftragen; die Wochen-Tasks selbst setzen nie `reviewed`.
3. PR auf «Ready» stellen, CI grün abwarten, mergen. GitHub Pages veröffentlicht automatisch.
