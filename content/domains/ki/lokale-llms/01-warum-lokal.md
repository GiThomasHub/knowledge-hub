---
title: Warum lokale Modelle – und wann nicht
level: L1
summary: Was ein lokales Sprachmodell ist, welche Gründe dafür sprechen (Datenschutz, Kosten, Offline, Kontrolle), welche dagegen (Qualität, Hardware, Betrieb) und welche Modellfamilien es gibt.
competencies: [ki-lok-01]
volatility: hoch
last_verified: 2026-11-27
sources:
  - Harness.docx (Teil C – Lokale LLMs, Warum lokal und Welche Modelle)
  - ai_agent_masterclass (2).docx (Weg 5 – lokale Modelle)
  - https://docs.ollama.com/cloud (Cloud-Modelle, nur lokale Modelle nutzen)
  - https://ollama.com/library
prompts: [mehr, einfach, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Lokales LLM = Open-Weight-Modell, das auf eigener Hardware läuft (Laptop, Workstation, eigener Server); Gründe: Datenschutz (Daten verlassen das Gerät nicht), Kosten (keine Token-Gebühren nach Hardware-Investition, Strom), Offline und Latenz, Kontrolle (feste Version, keine Änderungen durch Anbieter), Unabhängigkeit; Gegengründe: Qualität kleiner Modelle unter Frontier-Modellen besonders bei Agenten, Coding, langem Kontext; Hardware-Kosten; Betrieb (Updates, Sicherheit, Überwachung); Modellfamilien Llama, Qwen, Gemma, gpt-oss, DeepSeek, Mistral (Stand prüfen); Lizenzen unterschiedlich; Mixture-of-Experts; Runtimes Ollama, LM Studio, llama.cpp, vLLM; Achtung Ollama-Cloud-Modelle (Tag -cloud/:cloud) laufen nicht lokal"
---

:::tldr
Ein **lokales Sprachmodell** ist ein Modell mit frei verfügbaren Gewichten ([[Open-Weight-Modell|Open-Weight]]), das auf **eigener Hardware** läuft – auf dem Laptop, einer Workstation oder einem eigenen Server. Die Gründe dafür: **Datenschutz** (Daten verlassen das Gerät nicht), **Kosten** (nach der Hardware keine Gebühren pro Token), **Offline-Betrieb** und **Kontrolle** (eine feste Modellversion, die sich nicht über Nacht ändert). Die Gründe dagegen: Lokale Modelle sind meist **kleiner und schwächer** als die grossen Cloud-Modelle, besonders bei Agenten, Coding und langen Texten – und Hardware und **Betrieb** kosten Geld und Zeit. Lokal ist darum eine **bewusste Abwägung**, kein Automatismus.
:::

:::bildlich Eigene Küche oder Restaurant
Ein **Restaurant** (Cloud-Modell) kocht auf Spitzenniveau, aber du gibst deine Zutaten aus der Hand und zahlst jedes Gericht. Eine **eigene Küche** (lokales Modell) kostet in der Anschaffung, du kochst vielleicht etwas einfacher – aber niemand sieht, was du kochst, und jedes weitere Gericht kostet nur noch die Zutaten. Für ein Festessen geht man ins Restaurant, für den Alltag mit sensiblen Rezepten kocht man zu Hause.
:::

## Gründe für lokal

| Grund | Was es bedeutet | Typischer Fall |
|---|---|---|
| **Datenschutz** | Prompts und Dokumente verlassen das Gerät nicht | Patientendaten, Mandantenakten, unveröffentlichter Code |
| **Kosten** | keine Gebühren pro Token, nur Hardware und Strom | sehr hohe Mengen einfacher Aufgaben (Klassifikation, Extraktion) |
| **Offline** | funktioniert ohne Internet | Aussendienst, abgeschottete Netze, Produktion |
| **Latenz** | kein Netzweg | schnelle, kurze Aufgaben im lokalen Ablauf |
| **Kontrolle** | feste Modellversion, kein Verhaltenswechsel durch den Anbieter | reproduzierbare Pipelines, regulierte Umgebungen |

## Gründe dagegen

- **Qualität:** Ein Modell, das auf einen Laptop passt, ist deutlich kleiner als die grossen Cloud-Modelle. Für einfache, klar umrissene Aufgaben reicht es oft; bei **mehrstufigen Agenten-Aufgaben**, anspruchsvollem **Coding** und **langem Kontext** liegen die grossen Cloud-Modelle meist deutlich vorn.
- **Hardware:** Gute Ergebnisse brauchen viel Grafikspeicher (VRAM) bzw. Unified Memory – Lektion [VRAM und Quantisierung](#/l/lokale-llms/vram-und-quantisierung).
- **Betrieb:** Updates, Überwachung, Absicherung, Ausfallsicherheit – das erledigt sonst der Anbieter.
- **Funktionen:** Werkzeuge wie Websuche, strukturierte Ausgaben oder Caching sind lokal oft eingeschränkter.

## Modellfamilien (Stand 27.11.2026, ändert sich schnell)

| Familie | Herkunft | Bekannt für |
|---|---|---|
| **Llama** | Meta | sehr verbreitet, viele Grössen |
| **Qwen** | Alibaba | stark mehrsprachig, gute Coding-Varianten |
| **Gemma** | Google | kompakt, teils multimodal |
| **gpt-oss** | OpenAI | offene Gewichte, Reasoning |
| **DeepSeek, Mistral** | DeepSeek, Mistral AI | Reasoning, effiziente MoE-Modelle |

Viele neuere Modelle sind [[Mixture of Experts]] (**MoE**): Sie haben sehr viele Parameter, aktivieren pro Token aber nur einen kleinen Teil – sie rechnen dadurch schneller, als ihre Gesamtgrösse vermuten lässt, brauchen aber trotzdem Speicher für alle Gewichte. Welche Modelle aktuell gut sind, zeigt die [Ollama-Bibliothek](https://ollama.com/library) – und vor allem ein **eigener Test** mit eigenen Aufgaben.

:::falle Lizenz und «lokal» genau prüfen
Zwei Annahmen gehen oft schief. **Erstens:** «Open-Weight» heisst nicht «frei für alles» – Llama, Qwen, Gemma und andere haben **unterschiedliche Lizenzen**, manche mit Einschränkungen für bestimmte Nutzungen. Vor dem Produktiveinsatz prüfen. **Zweitens:** Nicht alles, was in einem lokalen Werkzeug läuft, läuft lokal. Ollama bietet zum Beispiel auch **Cloud-Modelle** an (Tag mit `cloud`), die auf den Servern von Ollama rechnen, obwohl sie über dieselbe lokale Oberfläche aufgerufen werden.
:::

:::gem Das Werkzeug macht den Einstieg leicht
Lokale Modelle brauchen eine **Runtime**, die Modell lädt, auf die Grafikkarte verteilt und eine Schnittstelle anbietet. [[Ollama]] ist dafür der verbreitete Standard (Befehle wie bei Docker: `ollama pull`, `ollama run`), **LM Studio** bietet eine grafische Oberfläche, **llama.cpp** maximale Kontrolle und **vLLM** hohen Durchsatz für viele gleichzeitige Nutzer. Der Einstieg dauert Minuten (Lektion [Ollama betreiben](#/l/lokale-llms/ollama-betreiben)).
:::

:::berater Im Kundengespräch
Wenn ein Kunde sagt «Wir wollen lokal, wegen Datenschutz», ist das ein legitimer Ausgangspunkt – aber die Folgefragen entscheiden: **Welche Aufgabe genau?** (Einfache Klassifikation geht lokal gut, ein autonomer Coding-Agent selten.) **Welche Daten?** (Nicht alles ist gleich sensibel.) **Wer betreibt es?** (Ohne IT, die einen Server pflegt, ist «lokal» schnell unsicherer als ein seriöser Cloud-Anbieter mit Vertrag.) Oft ist die Antwort eine **Mischung**: Sensibles lokal, Anspruchsvolles in der Cloud.
:::

:::spickzettel
- Lokal = **Open-Weight-Modell auf eigener Hardware**
- Dafür: **Datenschutz**, **Kosten** bei hohen Mengen, **Offline**, **Latenz**, **Kontrolle** (feste Version)
- Dagegen: **Qualität** kleiner Modelle (Agenten, Coding, langer Kontext), **Hardware**, **Betrieb**, weniger Funktionen
- Familien: **Llama, Qwen, Gemma, gpt-oss, DeepSeek, Mistral** – Stand ändert sich schnell, selbst testen
- **MoE**: viele Parameter, wenige aktiv pro Token
- **Lizenzen** unterscheiden sich; Ollama-**Cloud-Modelle** laufen **nicht** lokal
- Runtimes: **Ollama**, LM Studio, llama.cpp, vLLM
:::

:::selbstcheck 3
