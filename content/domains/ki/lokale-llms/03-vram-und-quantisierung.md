---
title: VRAM und Quantisierung – welches Modell passt auf welche Hardware?
level: L3
summary: Die VRAM-Faustregel, was Quantisierung bewirkt und welche Stufe sich lohnt, wie viel Speicher das Kontextfenster zusätzlich braucht und warum ein Modell, das nicht ganz in den Grafikspeicher passt, drastisch langsamer wird.
competencies: [ki-lok-03]
volatility: mittel
last_verified: 2026-11-27
sources:
  - Harness.docx (Teil C – Anforderungen, die VRAM-Mathematik, Faustregel Q4_K_M, Stolperfallen)
  - https://docs.ollama.com/context-length (Speicherbedarf grösserer Kontextlängen)
  - https://ollama.com/library/llama3.1 (llama3.1:8b rund 4,9 GB in Q4)
  - https://github.com/ggml-org/llama.cpp (GGUF, Quantisierungsstufen)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "VRAM-Faustregel: Gewichte ≈ Parameter (Mrd.) × Bits pro Gewicht / 8 in GB; FP16 ≈ 2 GB pro Mrd. Parameter, Q8 halbiert, Q4 viertelt; Q4_K_M als Sweet-Spot (~4,8 Bit, ~75 % Speicher gespart, geringer Qualitätsverlust), Q3/Q2 spürbar schlechter bei Reasoning/Code, Q6/Q8 viel VRAM für wenig Gewinn; Beispiele 8B Q4 ≈ 5 GB, 14B ≈ 8,5 GB, 32B ≈ 19–20 GB, 70B ≈ 42 GB; dazu KV-Cache für das Kontextfenster (bei Llama 3.1 8B ≈ 128 KiB pro Token: 4k ≈ 0,5 GiB, 32k ≈ 4 GiB, 128k ≈ 16 GiB) und Reserve; Hardware-Tabelle 8/12/24/48–64/128 GB; Spill in System-RAM 5–30× langsamer, lieber kleineres Modell ganz im VRAM; Apple Silicon Unified Memory, nicht alles für GPU nutzbar; MoE braucht Speicher für alle Gewichte; GGUF-Format; Modell mit eigenem Testset prüfen"
---

:::tldr
Ob ein Modell auf eine Maschine passt, entscheidet vor allem **eine Zahl: der Grafikspeicher ([[VRAM]])** – bei Apple Silicon der gemeinsame Arbeitsspeicher. Die Faustregel: **Gewichte ≈ Milliarden Parameter × Bits pro Gewicht ÷ 8 in GB**. In voller Präzision (FP16) sind das rund **2 GB pro Milliarde Parameter**; [[Quantisierung]] senkt die Bits pro Gewicht – **Q8** halbiert, **Q4** viertelt den Bedarf. **`Q4_K_M`** gilt als Sweet-Spot: rund drei Viertel weniger Speicher bei geringem Qualitätsverlust. Dazu kommt Speicher für das **Kontextfenster** (KV-Cache) und eine Reserve. Und die wichtigste Regel: **Lieber ein kleineres Modell ganz im VRAM** als ein grösseres, das in den normalen Arbeitsspeicher ausweicht – das wird **5- bis 30-mal langsamer**.
:::

:::bildlich Das Foto in kleinerer Auflösung
Quantisierung ist wie ein Foto in **kleinerer Auflösung** zu speichern. Ein 24-Megapixel-Bild auf ein Viertel verkleinert sieht auf dem Bildschirm fast gleich aus – erst beim starken Vergrössern fehlen Details. Verkleinert man zu stark, wird es pixelig. Genauso verliert ein Modell bei Q4 wenig, bei Q2 aber spürbar – besonders bei Aufgaben, die «genaues Hinsehen» brauchen wie Rechnen, Logik und Code.
:::

## Die Rechnung

```
Speicher für Gewichte (GB) ≈ Parameter (Mrd.) × Bits pro Gewicht ÷ 8
```

| Modellgrösse | FP16 (16 Bit) | Q8 (≈ 8,5 Bit) | Q4_K_M (≈ 4,8 Bit) |
|---|---|---|---|
| 8 Mrd. | 16 GB | ≈ 8,5 GB | **≈ 5 GB** |
| 14 Mrd. | 28 GB | ≈ 15 GB | **≈ 8,5 GB** |
| 32 Mrd. | 64 GB | ≈ 34 GB | **≈ 19–20 GB** |
| 70 Mrd. | 140 GB | ≈ 74 GB | **≈ 42 GB** |

Zum Vergleich: In der Ollama-Bibliothek ist Llama 3.1 8B in der Standard-Quantisierung mit rund 4,9 GB angegeben – die Faustregel trifft das gut.

## Quantisierungsstufen

| Stufe | Speicher | Qualität | Empfehlung |
|---|---|---|---|
| FP16 / BF16 | 100 % | Referenz | nur mit viel VRAM oder für Feinabstimmung |
| Q8 | ≈ 50 % | kaum Unterschied | wenn genug Platz da ist |
| Q6, Q5 | ≈ 35–40 % | sehr nah an Q8 | guter Kompromiss mit etwas Reserve |
| **Q4_K_M** | **≈ 30 %** | **geringer Verlust** | **Standard-Empfehlung** |
| Q3, Q2 | ≈ 20–25 % | spürbar schlechter bei Reasoning und Code | nur, wenn sonst gar nichts passt |

Lokale Modelle liegen meist im [[GGUF]]-Format vor, das llama.cpp und Ollama verwenden; die Stufe steht im Namen bzw. Tag (z. B. `q4_K_M`).

## Das Kontextfenster kostet zusätzlich

Für jedes Token im Kontext speichert das Modell Zwischenwerte im sogenannten [[KV-Cache]]. Bei Llama 3.1 8B sind das in voller Präzision rund **128 KiB pro Token**:

| Kontextlänge | KV-Cache (Llama 3.1 8B) |
|---|---|
| 4 000 Tokens | ≈ 0,5 GiB |
| 32 000 Tokens | ≈ 4 GiB |
| 64 000 Tokens | ≈ 8 GiB |
| 128 000 Tokens | ≈ 16 GiB |

Ein 8-Mrd.-Modell in Q4 (≈ 5 GB) mit 64 000 Tokens Kontext braucht also schon **rund 13 GB** plus Reserve – mehr als eine 12-GB-Karte hat. Wer lange Dokumente oder Agenten betreiben will, rechnet den Kontext **immer** mit.

## Was läuft auf welcher Hardware (Q4_K_M, moderater Kontext)

| VRAM bzw. Unified Memory | Realistisch | Beispiel-Hardware |
|---|---|---|
| 8 GB | 7–8 Mrd. | Einstiegs-Grafikkarte, Mac mit 16 GB |
| 12 GB | bis ≈ 14 Mrd. mit Reserve | Mittelklasse-Grafikkarte |
| 24 GB | ≈ 26–32 Mrd. | High-End-Grafikkarte |
| 48–64 GB | 70 Mrd., grössere MoE-Modelle | Mac mit viel Unified Memory, zwei Grafikkarten |
| 128 GB und mehr | über 100 Mrd. | Workstations, Spezialsysteme |

:::falle Der Ausweich-Effekt
Passt ein Modell samt Kontext nicht ganz in den VRAM, lagert die Runtime Teile in den normalen Arbeitsspeicher aus. Das funktioniert – aber die Generierung wird **5- bis 30-mal langsamer**, weil die Daten über den vergleichsweise langsamen Bus wandern. `ollama ps` zeigt das als Aufteilung CPU/GPU. Die Lösung ist fast immer: **eine Modellgrösse kleiner** oder **weniger Kontext**, dafür ganz im VRAM. Bei Apple Silicon gilt zudem: Nicht der ganze gemeinsame Speicher steht der Grafikeinheit zur Verfügung, das System behält einen Teil.
:::

:::gem MoE spart Rechenzeit, nicht Speicher
Ein Mixture-of-Experts-Modell aktiviert pro Token nur einen Teil seiner Parameter und ist darum **schneller**, als die Gesamtgrösse vermuten lässt. Im Speicher liegen aber **alle** Gewichte. Ein MoE-Modell mit 100 Mrd. Parametern braucht in Q4 also trotzdem rund 60 GB – auch wenn es pro Token nur einen Bruchteil davon rechnet.
:::

## Auswahl in vier Schritten

1. **Aufgabe festlegen** und ein kleines **Testset** mit echten Fällen bauen.
2. **Speicher rechnen:** Gewichte (Faustregel) + KV-Cache für den benötigten Kontext + 10–20 % Reserve.
3. **Grösstes Modell wählen, das ganz in den VRAM passt**, in **Q4_K_M**; bei Platz Q5/Q6 testen.
4. **Messen:** Qualität am Testset, Tokens pro Sekunde, `ollama ps` – und mit einem Cloud-Modell als Referenz vergleichen.

:::berater Im Kundengespräch
Bei Hardware-Fragen hilft eine einfache Rechnung auf einem Blatt: «Sie wollen ein 32-Mrd.-Modell mit 32 000 Tokens Kontext? Das sind rund 20 GB für die Gewichte plus einige GB für den Kontext – eine 24-GB-Karte ist knapp, aber machbar. Ein 70-Mrd.-Modell braucht 48 GB oder mehr.» So lassen sich Investitionen begründen und unrealistische Erwartungen früh korrigieren. Wichtig dazu: **Ein grösseres lokales Modell ist nicht automatisch gut genug** – erst das Testset zeigt es.
:::

:::spickzettel
- Gewichte ≈ **Parameter (Mrd.) × Bits ÷ 8** GB; FP16 ≈ **2 GB pro Mrd.**
- **Q8 halbiert**, **Q4 viertelt**; **`Q4_K_M` = Sweet-Spot**; Q3/Q2 schlecht bei Reasoning/Code
- Beispiele Q4: **8B ≈ 5 GB**, 14B ≈ 8,5 GB, **32B ≈ 20 GB**, **70B ≈ 42 GB**
- **KV-Cache** für Kontext dazurechnen (Llama 3.1 8B: 64k ≈ 8 GiB) + **10–20 % Reserve**
- Nicht ganz im VRAM → **5–30× langsamer** → **kleineres Modell ganz im VRAM**
- Apple Silicon: nicht der ganze Speicher für die GPU
- **MoE** spart Rechenzeit, **nicht Speicher**
- Format **GGUF**; Auswahl immer mit **Testset** bestätigen
:::

:::selbstcheck 3
