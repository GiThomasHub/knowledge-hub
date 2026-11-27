---
title: Mit Beispielen steuern – Few-Shot, Negativ- und Reasoning-Beispiele
level: L2
summary: Warum Beispiele der stärkste Hebel im Prompt sind, wie viele und welche du wählst, wie Negativ- und Reasoning-Beispiele Grenzen schärfen und warum Beispiele wie Code geprüft werden müssen.
competencies: [ki-prm-02]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Skill llm-engineering, references/prompting.md (Abschnitte 2–4; geprüft 27.11.2026)
  - KI-Engineering-Masterclass.docx (A.2 – Hidden Gem Reasoning-Beispiele)
  - ai_agent_masterclass (2).docx (Hidden Gem Few-Shot im System Prompt)
  - AI_Masterclass.docx (Zero-Shot vs. Few-Shot)
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (Abschnitt Use examples effectively)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Few-Shot-Prompting: Zero-, One-, Few-Shot; wenige, vielfältige Beispiele in <example>/<examples>; Reasoning-Beispiele (Eingabe → kurze Überlegung → Ausgabe); Negativbeispiele mit Begründung; Beispiele werden kopiert (Tippfehler, Floskeln); Beispiele ≠ Testfälle; Chain-of-Thought bei Modellen mit adaptivem Denken; Self-Consistency"
---

:::tldr
**Zeigen schlägt beschreiben.** Ein bis drei gut gewählte Beispiele steuern Format, Ton und Grenzfälle zuverlässiger als eine Seite Regeln. Wähle sie **wenige und verschieden**, nicht viele und ähnlich. **Reasoning-Beispiele** (Eingabe → kurze Überlegung → Ausgabe) zeigen, *wie* entschieden wird; **Negativbeispiele** («so nicht, weil …») schärfen eine Grenze. Und weil das Modell Beispiele eng nachahmt, gilt: **Jedes Beispiel wird geprüft wie Code.**
:::

## Zero-, One- und Few-Shot

| Variante | Beispiele | Gut für |
|---|---|---|
| **Zero-Shot** | keine | einfache, eindeutige Aufgaben |
| **One-Shot** | eines | Format zeigen («genau so soll es aussehen») |
| **Few-Shot** | zwei bis fünf | Klassifizieren, Stil treffen, Grenzfälle entscheiden |

:::bildlich Musterbrief statt Stilhandbuch
Eine neue Sachbearbeiterin bekommt entweder ein **20-seitiges Stilhandbuch** – oder **drei gute Musterbriefe**, einen davon mit Randnotiz «so bitte nicht, weil zu förmlich». Nach den Musterbriefen schreibt sie sofort im richtigen Ton. Beim Handbuch rätselt sie weiter. Sprachmodelle funktionieren genauso.
:::

## Wie gute Beispiele aussehen

```xml
<examples>
  <example>
    <eingabe>Die Lieferung kam zwei Wochen zu spät, aber der Support war freundlich.</eingabe>
    <ausgabe>{"stimmung": "gemischt", "thema": "lieferung"}</ausgabe>
  </example>
  <example>
    <eingabe>Rechnung doppelt belastet, niemand meldet sich. Ich kündige.</eingabe>
    <ausgabe>{"stimmung": "negativ", "thema": "abrechnung"}</ausgabe>
  </example>
  <example>
    <eingabe>Alles bestens, gerne wieder.</eingabe>
    <ausgabe>{"stimmung": "positiv", "thema": "allgemein"}</ausgabe>
  </example>
</examples>
```

- **Verschieden statt ähnlich:** unterschiedliche Länge, Themen und Schwierigkeit. Drei fast gleiche Beispiele lehren nur einen Fall.
- **Grenzfälle zeigen:** Das gemischte Beispiel oben ist wertvoller als ein weiteres eindeutig positives.
- **Klar abgegrenzt:** jedes Beispiel in `<example>`, alle in `<examples>`, damit das Modell Beispiel und echte Eingabe nicht verwechselt.

## Reasoning-Beispiele: das Wie zeigen

Normale Beispiele zeigen **was** herauskommt. Reasoning-Beispiele zeigen zusätzlich **wie** man dorthin kommt:

```xml
<example>
  <eingabe>Kunde fragt, ob er die Fahrtkosten zum Coworking-Space abziehen kann.</eingabe>
  <ueberlegung>Es geht um Berufskosten. Entscheidend ist, ob es der Arbeitsort ist
  und ob die Person angestellt oder selbständig ist – das ist unklar.</ueberlegung>
  <ausgabe>Rückfrage: Sind Sie angestellt oder selbständig, und ist der
  Coworking-Space Ihr regulärer Arbeitsort?</ausgabe>
</example>
```

Das Modell lernt dabei die **Entscheidungsregel** («bei fehlender Schlüsselinformation nachfragen»), nicht nur die Form.

:::gem Kurze Überlegungen bei Modellen, die selbst denken
Aktuelle Claude-Modelle überlegen mit **adaptivem Denken** ohnehin selbst, bevor sie antworten. Zusätzliche Gerüste wie «Denke Schritt für Schritt» bringen dann selten etwas und können sogar schaden. Reasoning-Beispiele bleiben nützlich, aber **kurz**: Sie zeigen die entscheidende Abwägung, nicht einen langen Rechenweg.
:::

## Negativbeispiele: Grenzen schärfen

```xml
<negativbeispiel>
  <ausgabe>Gerne helfe ich Ihnen weiter! Vielen Dank für Ihre Anfrage. Grundsätzlich
  gilt in solchen Fällen, dass …</ausgabe>
  <warum_nicht>Floskeln am Anfang, keine Antwort im ersten Satz.</warum_nicht>
</negativbeispiel>
```

Ein einziges Negativbeispiel mit Begründung trennt «gerade noch gut» von «schon zu viel» oft schärfer als zehn Regeln.

:::falle Beispiele werden kopiert
Das Modell ahmt Beispiele **eng** nach: einen Tippfehler, eine wiederkehrende Floskel, eine bestimmte Länge, sogar konkrete Zahlen. Steht in allen Beispielen «Sehr geehrte Damen und Herren», beginnt bald jede Antwort so – auch an eine Duzkundin. Darum Beispiele prüfen wie Code: korrekt, vielfältig, ohne Zufallsmuster. Und **Beispiele im Prompt nie gleich den Testfällen** wählen, sonst misst der Test nur, ob das Modell abschreiben kann.
:::

## Mehrfach fragen: Self-Consistency

Bei Aufgaben mit **überprüfbarer** Antwort (Kategorie, Zahl, kurze Fakten) lohnt sich ein einfacher Trick: dieselbe Frage drei- bis zehnmal stellen und die **Mehrheit** nehmen. Das ist oft eine der günstigsten Genauigkeitsverbesserungen.

- Nur für vergleichbare Antworten; bei freien Texten entscheidet stattdessen ein Prüfer.
- Kosten steigen linear mit der Zahl der Durchläufe – kleines Modell wählen, früh abbrechen, wenn die ersten Antworten übereinstimmen.
- Vielfalt kommt dabei nicht mehr über die Temperatur: In der Claude-API-Version 2026-10-21 führen `temperature`, `top_p` und `top_k` zu einem Fehler (Stand 27.11.2026). Vielfalt entsteht durch das Standard-Sampling oder unterschiedliche Beispielsätze.

:::berater Im Kundengespräch
Wenn ein Team klagt, die KI treffe «den Ton nicht» oder ordne «manche Fälle falsch ein», ist die erste Frage: «Zeigen Sie mir Ihre Beispiele im Prompt.» Oft gibt es keine – oder drei nahezu gleiche. Zwei verschiedenartige Beispiele plus ein Negativbeispiel lösen das Problem häufig schneller als jede Modellumstellung. Typischer Einwand: «Wir wollen den Prompt kurz halten.» – Ein Beispiel ersetzt oft zehn Zeilen Regeln und spart am Ende Platz.
:::

:::spickzettel
- **Zeigen schlägt beschreiben** – Beispiele sind der stärkste Hebel
- **1–3 Beispiele, verschieden**, inkl. Grenzfall; in `<example>`/`<examples>`
- **Reasoning-Beispiele**: Eingabe → kurze Überlegung → Ausgabe
- **Negativbeispiel** mit Begründung schärft Grenzen
- Beispiele werden **kopiert** → prüfen wie Code; **≠ Testfälle**
- «Denke Schritt für Schritt» bei Modellen mit adaptivem Denken meist überflüssig
- **Self-Consistency**: mehrfach fragen, Mehrheit nehmen (nur bei vergleichbaren Antworten)
- API 2026-10-21: **keine `temperature`/`top_p`/`top_k` mehr**
:::

:::selbstcheck 3
