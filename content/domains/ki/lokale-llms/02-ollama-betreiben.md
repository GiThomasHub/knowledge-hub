---
title: Ein Modell mit Ollama betreiben und anbinden
level: L2
summary: Ollama installieren, Modelle ziehen und starten, das Kontextfenster richtig setzen, die OpenAI- und Anthropic-kompatiblen Schnittstellen nutzen und den Server sicher betreiben.
competencies: [ki-lok-02]
volatility: hoch
last_verified: 2026-11-27
sources:
  - https://docs.ollama.com/context-length
  - https://docs.ollama.com/api/anthropic-compatibility
  - https://docs.ollama.com/integrations/claude-code
  - https://ollama.com/blog/claude (Anthropic-Kompatibilität ab v0.14.0, 16.01.2026)
  - https://docs.ollama.com/cloud (Cloud-Modelle, nur lokale Modelle nutzen)
  - https://docs.ollama.com/faq (Bindung an 127.0.0.1 Port 11434, OLLAMA_HOST, Prozessor-Spalte von ollama ps)
  - Harness.docx (Teil C – Wie funktioniert es?, OpenAI-kompatible API auf localhost:11434)
prompts: [mehr, beispiele, finde-den-fehler, pruef-mich]
prompt_context: "Ollama: ollama pull <modell>, ollama run, ollama list, ollama ps (zeigt GPU/CPU-Anteil und Kontext); Server auf localhost:11434; OpenAI-kompatible API unter /v1 (base_url tauschen, api_key Platzhalter); Anthropic-kompatible Messages-API seit v0.14.0 (Januar 2026), Claude Code per ANTHROPIC_BASE_URL=http://localhost:11434 und ANTHROPIC_AUTH_TOKEN=ollama oder ollama launch claude (ab v0.15); Kontextlänge: Standard je nach VRAM (unter 24 GiB 4k, 24–48 GiB 32k, ab 48 GiB 256k), für Agenten/Coding mindestens 64 000 empfohlen, setzen mit OLLAMA_CONTEXT_LENGTH oder num_ctx; zu kleiner Kontext schneidet still ab; grösserer Kontext braucht mehr Speicher; Cloud-Modelle (Tag cloud) laufen auf ollama.com, Cloud-Funktionen abschaltbar; Sicherheit: Server standardmässig nur lokal, ohne Authentifizierung – nicht ungeschützt ins Netz (OLLAMA_HOST=0.0.0.0), Modelle aus vertrauenswürdigen Quellen"
---

:::tldr
Mit [[Ollama]] läuft ein lokales Modell in wenigen Minuten: `ollama pull` lädt es, `ollama run` startet es, und im Hintergrund stellt ein Server auf **`localhost:11434`** zwei Schnittstellen bereit – eine **OpenAI-kompatible** (`/v1`) und seit Januar 2026 eine **Anthropic-kompatible**. Damit lässt sich bestehender Code mit einer geänderten **Basis-URL** auf das lokale Modell umlenken, sogar Claude Code. Zwei Dinge musst du dabei bewusst einstellen: das **Kontextfenster** (der Standard ist je nach Grafikspeicher klein, zu lange Eingaben werden still gekürzt) und die **Sicherheit** (der Server hat keine Anmeldung und gehört nicht offen ins Netz).
:::

:::bildlich Der Adapter
Ollama ist wie ein **Reiseadapter**: Deine Geräte (Programme, die die OpenAI- oder Anthropic-Schnittstelle sprechen) passen plötzlich in eine ganz andere Steckdose (das lokale Modell) – ohne dass du die Geräte umbauen musst. Du steckst nur den Adapter dazwischen und änderst die Adresse.
:::

## In drei Befehlen zum lokalen Modell

```bash
ollama pull qwen3:8b        # Modell herunterladen
ollama run qwen3:8b         # im Terminal chatten
ollama ps                   # läuft es auf GPU oder CPU, mit welchem Kontext?
```

`ollama list` zeigt die installierten Modelle, `ollama ps` die geladenen – inklusive **Anteil GPU/CPU** und **Kontextlänge**. Steht dort eine Aufteilung wie «30%/70% CPU/GPU», passt das Modell nicht ganz in den Grafikspeicher.

## Die Schnittstellen nutzen

**OpenAI-kompatibel** – fast jede Bibliothek, die die OpenAI-API spricht, funktioniert, wenn man die Basis-URL tauscht:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Schlüssel wird ignoriert
resp = client.chat.completions.create(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Fasse diese Notiz in zwei Sätzen zusammen: …"}],
)
print(resp.choices[0].message.content)
```

**Anthropic-kompatibel** – seit Ollama **v0.14.0** (Januar 2026) wird ein Teil der Anthropic Messages API unterstützt. Damit kann auch **Claude Code** gegen ein lokales Modell laufen:

```bash
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_AUTH_TOKEN=ollama      # wird verlangt, aber nicht geprüft
claude --model qwen3-coder
# oder seit v0.15 geführt: ollama launch claude
```

:::falle Das stille Abschneiden
Ollama wählt die **Kontextlänge** ([[Kontextfenster]]) standardmässig nach dem verfügbaren Grafikspeicher: unter 24 GiB nur **4 000 Tokens**, von 24 bis 48 GiB 32 000, ab 48 GiB 256 000 (Stand 27.11.2026). Viele Modelle könnten viel mehr – aber was über die eingestellte Länge hinausgeht, wird **still abgeschnitten**. Die Zusammenfassung eines langen Dokuments wirkt dann einfach schwach. Für Agenten und Coding empfiehlt Ollama **mindestens 64 000 Tokens**:

```bash
OLLAMA_CONTEXT_LENGTH=64000 ollama serve
```

Aber: Mehr Kontext braucht **mehr Speicher**. Passt es danach nicht mehr in den Grafikspeicher, wird es langsam. Ältere Anleitungen nennen noch 2 048 Tokens als Standard – das hat sich mehrfach geändert, darum mit `ollama ps` nachsehen.
:::

## Lokal oder doch Cloud?

Ollama bietet neben lokalen Modellen auch **Cloud-Modelle** an. Sie haben `cloud` im Namen (z. B. `…-cloud` oder `…:cloud`), verlangen eine Anmeldung bei ollama.com und rechnen auf den Servern von Ollama – über **dieselbe** lokale Oberfläche und Schnittstelle. Laut Ollama werden Cloud-Prompts nicht für Training verwendet; lokal sind sie trotzdem nicht. Wer **nur lokal** arbeiten will, schaltet die Cloud-Funktionen ab und prüft mit `ollama list`, ob ein Modell lokal Platz belegt.

## Sicher betreiben

- **Nur lokal erreichbar lassen:** Der Server hört standardmässig nur auf dem eigenen Rechner. Wer ihn mit `OLLAMA_HOST=0.0.0.0` im Netz freigibt, öffnet eine Schnittstelle **ohne Anmeldung** – jeder im Netz kann Modelle nutzen, laden und löschen. Für den Teambetrieb gehört ein Reverse Proxy mit Anmeldung und TLS davor.
- **Modelle aus vertrauenswürdigen Quellen:** offizielle Bibliothek oder bekannte Herausgeber.
- **Version festhalten:** Für reproduzierbare Ergebnisse Modell-Tag und Ollama-Version notieren.

:::gem Erst lokal testen, dann entscheiden
Weil die Schnittstellen kompatibel sind, lässt sich eine bestehende Anwendung mit **einer** geänderten Zeile gegen ein lokales Modell testen – mit demselben Testset wie für das Cloud-Modell (Thema [Evals](#/t/evals)). So zeigt sich in einer Stunde, ob das lokale Modell für **diese** Aufgabe reicht, statt monatelang darüber zu diskutieren.
:::

:::berater Im Kundengespräch
«Wir lassen Claude Code einfach lokal laufen» ist technisch möglich, aber die Erwartung muss stimmen: Der Harness (Claude Code) bleibt gleich, das **Modell** dahinter ist ein viel kleineres. Erfahrungsberichte zeigen, dass kleine lokale Modelle mit den langen Werkzeug-Abläufen eines Coding-Agenten oft überfordert sind. Für einfache, klar umrissene Aufgaben (Texte umformulieren, Daten herausziehen, Klassifizieren) sind lokale Modelle dagegen eine starke, günstige Option.
:::

:::spickzettel
- `ollama pull` · `ollama run` · `ollama list` · **`ollama ps`** (GPU/CPU-Anteil, Kontext)
- Server auf **`localhost:11434`**: **OpenAI-kompatibel** unter `/v1` (Basis-URL tauschen)
- **Anthropic-kompatibel** seit **v0.14.0** (Jan. 2026): `ANTHROPIC_BASE_URL=http://localhost:11434`, `ANTHROPIC_AUTH_TOKEN=ollama`; `ollama launch claude` ab v0.15
- Kontext-Standard je nach VRAM: **< 24 GiB 4k**, 24–48 GiB 32k, ≥ 48 GiB 256k; Agenten/Coding **≥ 64 000**
- Zu kleiner Kontext → **still abgeschnitten**; mehr Kontext → mehr Speicher
- **Cloud-Modelle** (`cloud` im Namen) laufen bei ollama.com
- Server **nicht offen ins Netz** (keine Anmeldung); Proxy mit Auth und TLS für Teams
:::

:::selbstcheck 3
