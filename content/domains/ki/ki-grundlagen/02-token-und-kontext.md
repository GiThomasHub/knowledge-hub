---
title: Token, Kontextfenster und Temperatur
level: L1
summary: Wie Sprachmodelle Text in Token zerlegen, wie viel in ein Kontextfenster passt, warum Tokens Geld kosten und was Temperatur bedeutet – inklusive der Änderung in der Claude-API 2026.
competencies: [ki-kig-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://platform.claude.com/docs/en/models/opus-5-5/overview (Kontextfenster, Wörter pro Token, Knowledge Cutoff)
  - https://platform.claude.com/docs/en/models/sonnet-5-5
  - https://platform.claude.com/docs/en/api/migration-2026-10-21 (temperature, top_p, top_k entfernt)
  - AI_Masterclass.docx (VI.B – Token, Context Window, Temperature)
  - Skill llm-engineering, references/prompting.md (Abschnitt 7 – Was nicht mehr gilt; geprüft 27.11.2026)
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Token als Texteinheit (Wortteile), Tokenizer modellabhängig; Faustregeln: aktuelle Claude-Tokenizer 1 Mio. Tokens ≈ 555 000 englische Wörter bzw. 2,5 Mio. Zeichen, ältere ca. 750 000 Wörter; Deutsch braucht tendenziell mehr Tokens; exakt zählen mit Token-Zählung der API; Kontextfenster = Arbeitsspeicher pro Anfrage (Eingabe + Ausgabe), aktuelle Claude-Modelle 1 Mio. Tokens, max. Ausgabe 128K; Kosten pro Million Eingabe-/Ausgabe-Tokens, Ausgabe teurer; Temperatur als Zufallsregler bei der Token-Auswahl; Claude-API 2026-10-21: temperature/top_p/top_k führen zu Fehler; Determinismus über Schema und Tests"
---

:::tldr
Sprachmodelle lesen und schreiben nicht in Wörtern, sondern in **Token** – Wortteilen, Satzzeichen, Leerzeichen. Abgerechnet wird pro Token, und auch die Grenzen sind in Token angegeben. Das **Kontextfenster** ist alles, was das Modell bei **einer** Anfrage sieht: Anweisungen, Dokumente, Verlauf **und** die Antwort. Aktuelle Claude-Modelle haben ein Fenster von **1 Million Tokens** – grob ein halbe Million englischer Wörter (Stand 27.11.2026). Die **Temperatur** regelte früher, wie zufällig das Modell das nächste Token wählt. In der Claude-API ist sie seit Oktober 2026 nicht mehr einstellbar.
:::

## Token: die Währung der Sprachmodelle

Ein **Tokenizer** zerlegt Text in Stücke, die das Modell kennt. Häufige Wörter sind oft ein Token, seltene oder zusammengesetzte Wörter werden in mehrere zerlegt:

| Text | Mögliche Zerlegung (vereinfacht) |
|---|---|
| «Haus» | `Haus` |
| «Mehrwertsteuerabrechnung» | `Mehr` · `wert` · `steuer` · `ab` · `rechnung` |
| «CHF 1'250.–» | `CHF` · ` 1` · `'` · `250` · `.–` |

Die Zerlegung hängt vom **Modell** ab. Darum gibt es keine exakte Umrechnung, nur Faustregeln:

- Mit dem aktuellen Claude-Tokenizer entsprechen **1 Million Tokens etwa 555 000 englischen Wörtern** bzw. 2,5 Millionen Zeichen; bei älteren Modellen waren es etwa 750 000 Wörter (Stand 27.11.2026).
- **Deutsch** braucht tendenziell mehr Tokens pro Wort als Englisch – lange Komposita, Umlaute, Schweizer Zahlenformate.
- Wer es genau wissen muss (Kosten, Grenzen), **zählt** mit der Token-Zählung der API, statt zu schätzen.

:::bildlich Silben statt Wörter
Ein Kind, das lesen lernt, liest bekannte Wörter am Stück und zerlegt unbekannte in Silben: «Mehr-wert-steu-er». Ein Tokenizer macht dasselbe – nur dass seine «Silben» aus der Statistik der Trainingstexte stammen, nicht aus der Grammatik.
:::

## Das Kontextfenster

Das Kontextfenster ist der **Arbeitsspeicher pro Anfrage**. Alles, was das Modell berücksichtigen soll, muss darin Platz haben – und die Antwort auch.

| Modell (Stand 27.11.2026) | Kontextfenster | Max. Ausgabe |
|---|---|---|
| Claude Opus 5.5 | 1 Mio. Tokens | 128 000 Tokens |
| Claude Sonnet 5.5 | 1 Mio. Tokens | 128 000 Tokens |
| Claude Haiku 5.5 | 1 Mio. Tokens | 128 000 Tokens |
| Claude Haiku 4.5 (älter) | 200 000 Tokens | 64 000 Tokens |

**Grob abschätzen**, ob etwas passt: Eine A4-Seite Fliesstext hat etwa 400–500 Wörter. Ein Buch mit 300 Seiten hat also rund 120 000–150 000 Wörter – auf Deutsch grob 250 000–350 000 Tokens. Das passt in ein 1-Mio.-Fenster, aber nicht in eines mit 200 000.

:::falle «Passt rein» heisst nicht «wird gut genutzt»
Ein grosses Fenster ist kein Freipass. Jeder Token wird **bei jedem Aufruf** wieder bezahlt, und je voller das Fenster, desto schlechter findet das Modell einzelne Details – besonders in der Mitte (Lektion [Typische Fehler](#/l/ki-grundlagen/typische-fehler)). Ältere Unterlagen nennen oft «Claude: 200 000 Tokens» – das stimmt für aktuelle Modelle nicht mehr, ändert aber nichts an der Regel: nur hineinlegen, was gebraucht wird.
:::

## Tokens kosten Geld

Anbieter rechnen **pro Million Tokens** ab, getrennt nach Eingabe und Ausgabe. **Ausgabe-Tokens sind deutlich teurer** als Eingabe-Tokens – bei Claude Sonnet 5.5 etwa 2 USD pro Million Eingabe- und 10 USD pro Million Ausgabe-Tokens (Stand 27.11.2026). Wer Kosten senken will, kürzt zuerst überflüssigen Kontext und unnötig lange Antworten. Mehr dazu im Thema [Modelle und Kosten](#/t/modelle-kosten).

## Temperatur

Bei jedem Schritt berechnet das Modell für viele mögliche nächste Tokens eine Wahrscheinlichkeit und **zieht** dann eines. Die **Temperatur** regelte, wie stark der Zufall dabei mitspielt:

| Temperatur | Wirkung |
|---|---|
| niedrig (gegen 0) | fast immer das wahrscheinlichste Token → gleichförmiger, vorhersehbarer |
| hoch (um 1 und mehr) | auch weniger wahrscheinliche Tokens → abwechslungsreicher, aber fehleranfälliger |

:::gem Temperatur ist bei Claude Geschichte
In der **Claude-API-Version 2026-10-21** führen `temperature`, `top_p` und `top_k` zu einem Fehler – auch mit ihren früheren Standardwerten; die neuen Software-Bibliotheken senden diese Version standardmässig (Stand 27.11.2026). Das Konzept bleibt wichtig, weil andere Anbieter und lokale Modelle es weiter nutzen. Aber die alte Regel «Temperatur 0 für verlässliche Ergebnisse» trägt nicht mehr: Verlässlichkeit kommt aus **klaren Prompts, erzwungenen Schemas, Validierung und Tests**, nicht aus einem Regler.
:::

:::berater Im Kundengespräch
Die Frage «Wie viele Seiten kann Claude lesen?» beantwortest du mit einer Faustregel und einem Vorbehalt: «Mehrere hundert Seiten pro Anfrage – aber jede Seite kostet bei jeder Anfrage, und die Treffsicherheit sinkt, je mehr drinsteht. Für grosse Dokumentensammlungen sucht man darum gezielt die relevanten Stellen heraus, statt alles mitzuschicken.» Damit bist du beim Thema RAG (Lektion [Prompting, RAG oder Fine-Tuning](#/l/ki-grundlagen/prompting-rag-finetuning)).
:::

:::spickzettel
- **Token** = Wortteil; Zerlegung **modellabhängig**; abgerechnet wird pro Token
- Aktueller Claude-Tokenizer: **1 Mio. Tokens ≈ 555 000 engl. Wörter ≈ 2,5 Mio. Zeichen**; Deutsch braucht mehr
- Genau **zählen** statt schätzen, wenn es um Kosten oder Grenzen geht
- **Kontextfenster** = alles einer Anfrage (Eingabe **und** Ausgabe); aktuelle Claude-Modelle **1 Mio.**, Ausgabe bis **128 000**
- A4-Seite ≈ 400–500 Wörter; 300-Seiten-Buch ≈ 250 000–350 000 Tokens auf Deutsch
- **Ausgabe teurer** als Eingabe
- **Temperatur** = Zufallsregler; in Claude-API **2026-10-21 entfernt** → Verlässlichkeit über Schema und Tests
:::

:::selbstcheck 3
