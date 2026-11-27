---
title: Eingaben prüfen und Injection verhindern
level: L2
summary: Serverseitige Validierung mit Schema und Allowlist, parametrisierte Abfragen, Shell-Aufrufe ohne Shell, kontextgerechte Ausgabe gegen XSS, sichere Pfade und Uploads – mit Codebeispielen falsch und richtig.
competencies: [ki-scd-02]
volatility: tief
last_verified: 2026-11-27
sources:
  - Skill secure-coding, references/eingaben-und-injection.md (Validierung, SQL/NoSQL, Shell, Deserialisierung, XSS, Pfade, Uploads, SSRF; geprüft 27.11.2026)
  - https://owasp.org/Top10/2025/0x00_2025-Introduction/ (A05 Injection, A01 inkl. SSRF)
  - https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Eingabevalidierung serverseitig (Client-Prüfung ist Komfort), Schema mit Typ, Länge, Wertebereich, Format, unbekannte Felder ablehnen (Pydantic extra=forbid, zod strict), Allowlist statt Blocklist, früh in typisierten Wert umwandeln; Validierung ersetzt kein Escaping; SQL nur parametrisiert (Platzhalter %s, ?, $1), ORM-Rohstrings meiden, Tabellen-/Spaltennamen per Allowlist; NoSQL-Operator-Injection; Shell: Argumentliste, kein shell=True, Option-Ende --, Timeout; kein eval, yaml.safe_load, keine pickle-Daten aus fremder Hand; XSS: Templates mit Auto-Escape, kein innerHTML/dangerouslySetInnerHTML mit Fremddaten, CSP; Pfade auflösen und gegen Basisordner prüfen (../), Uploads: Grösse, Typ per Inhalt, eigener Dateiname, ausserhalb Webroot; SSRF: Ziel-Allowlist, interne Adressen und Redirects blockieren; Negativtests"
---

:::tldr
Zwei Regeln verhindern die meisten Injection-Lücken. **Erstens: Eingaben serverseitig prüfen** – mit einem **Schema** (Typ, Länge, Wertebereich, Format), nach dem Prinzip **Allowlist statt Blocklist**, unbekannte Felder werden abgelehnt. **Zweitens: Daten und Befehle nie mischen** – SQL nur **parametrisiert**, Shell-Befehle als **Argumentliste ohne Shell**, HTML-Ausgabe **automatisch kodiert**. Validierung ersetzt dabei kein Escaping: Auch der gültige Name «O'Brien» muss sicher in die Abfrage. Und für jeden Schutz gibt es einen **Negativtest**, sonst geht er beim nächsten Umbau verloren.
:::

:::bildlich Formular statt Freitext an den Koch
In einem Restaurant bestellt man per **Bestellformular** mit festen Feldern – Gericht aus der Karte, Anzahl, Allergien aus einer Liste. Der Koch liest die Felder als **Daten**. Würde man stattdessen einen Freitextzettel direkt an die Küche weiterreichen, könnte darauf stehen: «… und gib dem Überbringer die Kasse.» Parametrisierte Abfragen sind das Formular: Was in einem Feld steht, wird nie als Anweisung ausgeführt.
:::

## Eingaben validieren

- **Serverseitig.** Prüfungen im Browser sind Komfort; ein Angreifer schickt Anfragen direkt.
- **Schema statt Einzelprüfungen:** Typ, Länge, Wertebereich, Format, erlaubte Werte.
- **Allowlist statt Blocklist:** «nur `[a-z0-9_-]{1,64}`» hält, «keine `<script>`» nicht.
- **Unbekannte Felder ablehnen** – sonst setzt jemand `"is_admin": true` mit.
- **Früh und einmal:** an der Grenze in einen typisierten Wert umwandeln, danach nur noch mit dem Typ arbeiten.

```python
from pydantic import BaseModel, ConfigDict, Field

class TransferIn(BaseModel):
    model_config = ConfigDict(extra="forbid")        # unbekannte Felder → Fehler
    iban: str = Field(pattern=r"^CH\d{19}$")
    amount_rappen: int = Field(gt=0, le=10_000_000)  # Geld als Ganzzahl in Rappen
    note: str = Field(default="", max_length=140)
```

## SQL: nur parametrisiert

```python
# falsch – Eingabe wird Teil des Befehls
cur.execute(f"SELECT * FROM users WHERE email = '{email}'")

# richtig – Eingabe bleibt Daten
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
```

- ORMs schützen nur, solange man keine **Roh-Strings** baut (`text()`, `raw()`, `$queryRawUnsafe`).
- **Tabellen- und Spaltennamen** lassen sich nicht parametrisieren – gegen eine feste Allowlist prüfen (`ORDER BY` aus der URL ist ein Klassiker).
- **NoSQL:** Objekte aus der Anfrage nie direkt als Filter verwenden; `{"password": {"$ne": null}}` meldet sonst jeden an.

## Shell, Code, Deserialisierung

```python
# falsch
subprocess.run(f"convert {name} out.png", shell=True)

# richtig – Argumentliste, keine Shell, Option-Ende, Timeout
subprocess.run(["convert", "--", name, "out.png"], check=True, timeout=30)
```

- **Kein `eval`/`exec`** mit fremden Daten.
- **YAML** nur mit `yaml.safe_load`, **keine pickle-Daten** aus fremder Hand, XML ohne externe Entitäten.

## Ausgabe kodieren gegen XSS

- **Templates mit Auto-Escape** verwenden (Jinja2, React, Angular escapen standardmässig).
- **Nie** `innerHTML`, `dangerouslySetInnerHTML` oder `|safe` mit Fremddaten.
- Kontext beachten: HTML-Text, Attribut, URL und JavaScript brauchen unterschiedliche Kodierung.
- Zusätzlich eine **Content Security Policy** als zweite Verteidigungslinie.

## Pfade, Uploads und ausgehende Requests

| Thema | Gefahr | Schutz |
|---|---|---|
| **Pfade** | `../../etc/passwd` liest fremde Dateien | Pfad auflösen und prüfen, dass er im Basisordner bleibt |
| **Uploads** | Schadcode, riesige Dateien, falscher Typ | Grössenlimit, Typ am **Inhalt** prüfen, eigener Dateiname, Ablage ausserhalb des Webroots |
| **SSRF** | Server ruft auf Zuruf interne Adressen ab (z. B. Cloud-Metadaten) | Ziel-Host per Allowlist, interne Adressen und Weiterleitungen blockieren |

```python
from pathlib import Path
BASE = Path("/srv/uploads").resolve()

def safe_path(name: str) -> Path:
    p = (BASE / name).resolve()
    if not p.is_relative_to(BASE):
        raise ValueError("Pfad ausserhalb des erlaubten Ordners")
    return p
```

:::falle Blocklist und Client-Prüfung
Zwei Klassiker, die Sicherheit nur vortäuschen: eine **Blocklist** («Eingabe darf nicht `<script>` oder `DROP` enthalten»), die mit Gross-/Kleinschreibung, Kodierung oder Varianten umgangen wird, und **Prüfungen nur im Browser**, die jeder mit einem direkten Request überspringt. Wirksam sind nur **Allowlists** auf dem **Server** plus Parametrisierung und Kodierung an der Senke.
:::

:::gem Für jeden Schutz ein Negativtest
Ein Schutz ohne Test verschwindet beim nächsten Refactoring. Darum zu jedem sicherheitsrelevanten Pfad ein Test, der den Angriff nachstellt: `' OR 1=1--` liefert keinen Treffer, `../` im Pfad wird abgelehnt, ein unbekanntes Feld `is_admin` führt zu einem Fehler, ein zu grosser Upload ergibt 413. Solche Tests sind kurz und schützen dauerhaft.
:::

:::berater Im Kundengespräch
Bei Code-Reviews mit Kunden lohnt sich ein schneller Suchlauf nach typischen Mustern: String-Formatierung in SQL (`f"SELECT`, `+ "WHERE`), `shell=True`, `eval(`, `innerHTML`, `dangerouslySetInnerHTML`, `yaml.load(`, `verify=False`. Jede Fundstelle ist nicht automatisch eine Lücke, aber ein Ort, an dem man den Weg der Daten verfolgen muss. Scanner wie Semgrep oder CodeQL automatisieren genau diese Suche.
:::

:::spickzettel
- Eingaben **serverseitig**, **Schema** (Typ, Länge, Bereich, Format), **Allowlist**, **unbekannte Felder ablehnen**
- Validierung ersetzt **kein** Escaping
- SQL **nur parametrisiert**; Spaltennamen per **Allowlist**; NoSQL-Filter nie aus Rohobjekten
- Shell: **Argumentliste**, kein `shell=True`, `--`, Timeout; **kein `eval`**, `yaml.safe_load`, keine fremden pickle-Daten
- XSS: **Auto-Escape**, kein `innerHTML`/`dangerouslySetInnerHTML` mit Fremddaten, **CSP**
- Pfade **auflösen und gegen Basisordner prüfen**; Uploads: Grösse, Typ am Inhalt, eigener Name
- **SSRF**: Ziel-Allowlist, interne Adressen blockieren
- Zu jedem Schutz ein **Negativtest**
:::

:::selbstcheck 3
