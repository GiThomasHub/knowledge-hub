---
title: Die Anatomie eines guten Prompts
level: L1
summary: Warum ein Prompt ein Auftrag und kein Satz ist, die fünf Hebel Rolle, Kontext, Aufgabe, Einschränkungen und Format, wie du «weiss ich nicht» erlaubst und wie sich System- und User-Prompt unterscheiden.
competencies: [ki-prm-01]
volatility: tief
last_verified: 2026-11-27
sources:
  - KI-Engineering-Masterclass.docx (A.2 – Prompts wie ein Architekt strukturieren)
  - ai_agent_masterclass (2).docx (11.2 – Anatomie eines System Prompts)
  - AI_Masterclass.docx (Teil V – Prompting-Grundlagen)
  - Skill llm-engineering, references/prompting.md (Abschnitt 1 – Anatomy; geprüft 27.11.2026)
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Prompt-Anatomie: Rolle, Kontext (für wen, wozu), Aufgabe (ein Ergebnis), Einschränkungen (prüfbar), Format und Beispiele; Anweisungen wie an eine neue Kollegin; positive statt verbotene Formulierungen; «nicht gefunden» erlauben; System-Prompt vs. User-Prompt; Amateur- vs. Profi-Prompt"
---

:::tldr
Ein guter Prompt ist ein **Auftrag**, kein Satz. Er hat fünf Teile: **Rolle** (wer spricht), **Kontext** (für wen und wozu), **Aufgabe** (genau ein Ergebnis), **Einschränkungen** (prüfbare Grenzen) und **Format** (am besten mit Beispiel). Der am meisten unterschätzte Teil ist der **Kontext**: Ein Modell, das weiss, **warum** es etwas tut, trifft bessere Entscheidungen. Und: Erlaube ausdrücklich «nicht gefunden» – sonst erfindet das Modell lieber etwas.
:::

## Amateur und Profi

| Amateur-Prompt | Profi-Prompt |
|---|---|
| «Schreib was über unser Produkt, mach es gut.» | Rolle, Kontext, Aufgabe, Einschränkungen und Format getrennt |
| alles in einem Satz | klar abgegrenzte Abschnitte |
| keine Zielgruppe, kein Zweck | Leserin, Zweck und Verwendung genannt |
| Format «irgendwie» | Format vorgegeben, Beispiel gezeigt |
| Ergebnis ist Glückssache | Ergebnis ist reproduzierbar |

:::bildlich Briefing für eine neue Kollegin
Stell dir vor, du gibst einer **klugen neuen Kollegin** am ersten Tag einen Auftrag. Sie kennt weder Kunden noch Firma noch deine Vorlieben. Ein guter Auftrag sagt ihr: wer sie in dieser Aufgabe ist, für wen das Ergebnis ist und was damit passiert, was genau zu tun ist, was sie nicht tun soll, wie das Ergebnis aussehen muss – und was sie tun soll, wenn etwas fehlt. Genau das ist ein guter Prompt. Ein Sprachmodell nimmt Anweisungen dabei sogar **wörtlicher** als jede Kollegin.
:::

## Die fünf Hebel

| Hebel | Frage | Beispiel |
|---|---|---|
| **Rolle** | Wer spricht? | «Du bist Treuhänder mit Schwerpunkt KMU in der Schweiz.» |
| **Kontext** | Für wen, wozu, was passiert danach? | «Die Antwort geht an eine Kundin ohne Buchhaltungswissen; sie entscheidet danach, ob sie eine GmbH gründet.» |
| **Aufgabe** | Was genau, **ein** Ergebnis? | «Erkläre den Unterschied zwischen Einzelfirma und GmbH bei Haftung und Steuern.» |
| **Einschränkungen** | Welche prüfbaren Grenzen? | «Höchstens 150 Wörter. Keine Fachbegriffe ohne Erklärung. Keine Steuerberatung im Einzelfall.» |
| **Format** | Wie sieht das Ergebnis aus? | «Zwei kurze Absätze, dann eine Tabelle mit drei Zeilen: Haftung, Steuern, Gründungskosten.» |

```xml
<rolle>Du bist Treuhänder mit Schwerpunkt KMU in der Schweiz.</rolle>
<kontext>Die Antwort geht an eine Kundin ohne Buchhaltungswissen. Sie entscheidet
danach, ob sie ihre Einzelfirma in eine GmbH umwandelt.</kontext>
<aufgabe>Erkläre den Unterschied zwischen Einzelfirma und GmbH bei Haftung und Steuern.</aufgabe>
<einschraenkungen>
- Höchstens 150 Wörter, verständlich ohne Fachwissen
- Keine Empfehlung für ihren Einzelfall – verweise dafür auf ein Beratungsgespräch
- Wenn du einen Wert nicht sicher weisst, schreibe «bitte prüfen» statt einer Zahl
</einschraenkungen>
<format>Zwei kurze Absätze, dann eine Tabelle: Haftung | Steuern | Gründungskosten.</format>
```

:::gem Der Kontext ist der unterschätzte Hebel
Die meisten Prompts sagen, **was** zu tun ist, aber nicht **warum**. Dabei entscheidet der Zweck über unzählige Kleinigkeiten: Ton, Detailtiefe, was weggelassen werden darf. «Fasse den Vertrag zusammen» liefert etwas anderes als «Fasse den Vertrag zusammen; die Geschäftsleitung entscheidet morgen in fünf Minuten, ob wir kündigen» – und das zweite ist fast immer brauchbarer.
:::

## Was gute Anweisungen ausmacht

- **Prüfbar statt vage:** «höchstens 120 Wörter» statt «kurz»; «nur Fakten aus den Dokumenten» statt «sei genau».
- **Positiv statt Verbotsliste:** «Schreibe in zusammenhängenden Absätzen» wirkt besser als «Keine Aufzählungen, keine Überschriften, keine …». Das Modell weiss dann, was es tun soll, nicht nur, was nicht.
- **Eine Aufgabe pro Prompt:** «Fasse zusammen, übersetze und bewerte» ergibt drei halbe Ergebnisse. Besser drei Schritte nacheinander.
- **Unsicherheit erlauben:** «Wenn die Information nicht im Text steht, antworte ‹nicht gefunden›.» Ohne diesen Ausweg wählt das Modell oft die plausibelste Erfindung – eine [[Halluzination]].

:::falle Die Rolle überschätzen
«Du bist der weltbeste Experte für …» bringt messbar wenig. Die Rolle setzt Wortschatz und Massstab, sie ist kein Zaubertrick. Wer zehn Zeilen in die Rolle steckt und keine in den Kontext oder ein Beispiel, optimiert den falschen Hebel.
:::

## System-Prompt und User-Prompt

| | System-Prompt | User-Prompt |
|---|---|---|
| Zweck | dauerhafte Rolle, Regeln, Format, Wissen | die konkrete Aufgabe, die Eingabe, die Frage |
| Ändert sich | selten | bei jedem Aufruf |
| Typischer Inhalt | «Du beantwortest Fragen zu unseren AGB. Antworte auf Deutsch, höchstens 100 Wörter …» | «Kann ich mein Abo monatlich kündigen?» |
| Bei Claude Code | CLAUDE.md, Skills | dein Auftrag in der Session |

Faustregel: **Was für viele Anfragen gleich bleibt, gehört nach oben** (System-Prompt bzw. Anfang). **Was sich ändert, gehört nach unten** (User-Prompt bzw. Ende). Das macht Prompts übersichtlicher – und günstiger, weil der stabile Teil zwischengespeichert werden kann (Lektion [Kontext gestalten](#/l/prompting/kontext-gestalten)).

:::gem Erst schreiben, dann ausprobieren, dann schärfen
Kein Prompt ist beim ersten Mal perfekt. Profis testen ihn an **fünf bis zehn echten Eingaben**, schauen sich die schlechtesten Antworten an und fragen: Welche Information hat gefehlt? Meist ist die Antwort ein Satz Kontext oder ein Beispiel – selten ein lauteres «WICHTIG».
:::

:::berater Im Kundengespräch
Viele Teams halten Prompting für «Tricks». Die bessere Botschaft: «Ein Prompt ist ein Auftrag. Wer gute Aufträge an Menschen schreiben kann, kann auch gute Prompts schreiben – mit dem Unterschied, dass das Modell alles wörtlich nimmt und nichts nachfragt.» Typischer Einwand: «Die Modelle werden doch immer besser, dann braucht es das nicht mehr.» – Bessere Modelle verstehen schlechte Aufträge besser, aber sie können fehlenden Kontext nicht erraten.
:::

:::spickzettel
- Prompt = **Auftrag**: **Rolle · Kontext · Aufgabe · Einschränkungen · Format**
- **Kontext** (für wen, wozu) ist der unterschätzte Hebel
- Einschränkungen **prüfbar** formulieren, **positiv** statt Verbotslisten
- **Eine** Aufgabe pro Prompt
- «nicht gefunden» ausdrücklich **erlauben**
- Rolle kurz halten – Kontext und Beispiele wirken mehr
- **Stabiles oben** (System), **Veränderliches unten** (User)
- An 5–10 echten Eingaben testen und schärfen
:::

:::selbstcheck 3
