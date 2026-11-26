#!/usr/bin/env python3
"""Knowledge Hub – Build, Validierung und Abdeckungsbericht.

Aufruf:
    python scripts/build.py              # validieren + dist/ bauen
    python scripts/build.py --check      # nur validieren (CI bei PRs)
    python scripts/build.py --report     # zusätzlich Abdeckung + Prüf-Warteschlange ausgeben

Exit-Code 1 bei Fehlern (Schema, doppelte IDs, tote Verweise).
Abdeckungslücken sind keine Fehler, sondern die Arbeitsliste der Wochen-Tasks.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

import markdown
import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SCHEMA = ROOT / "schema"
SRC = ROOT / "src"

REVIEW_DAYS = {"hoch": 28, "mittel": 56, "tief": 112}
CALLOUTS = {
    "tldr": ("In einem Satz", "⚡"),
    "bildlich": ("Bildlich", "🖼️"),
    "gem": ("Hidden Gem", "💎"),
    "falle": ("Stolperfalle", "⚠️"),
    "berater": ("Beraterblick", "🎯"),
    "merke": ("Merke", "📌"),
    "praxis": ("Praxis", "🛠️"),
    "spickzettel": ("Spickzettel", "🧾"),
}

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def slugify(text: str) -> str:
    t = text.lower()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        t = t.replace(a, b)
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t or "x"


def validator(name: str) -> Draft202012Validator:
    return Draft202012Validator(json.loads((SCHEMA / f"{name}.schema.json").read_text()))


def check(schema: Draft202012Validator, data, where: str) -> bool:
    ok = True
    for e in schema.iter_errors(data):
        path = "/".join(str(p) for p in e.path) or "(root)"
        err(f"{where}: {path}: {e.message}")
        ok = False
    return ok


def norm(x):
    """Datumswerte aus YAML als ISO-Text, damit Schema und JSON einheitlich sind."""
    if isinstance(x, (dt.date, dt.datetime)):
        return x.isoformat()[:10]
    if isinstance(x, dict):
        return {k: norm(v) for k, v in x.items()}
    if isinstance(x, list):
        return [norm(v) for v in x]
    return x


def load_yaml(p: Path):
    try:
        return norm(yaml.safe_load(p.read_text(encoding="utf-8")))
    except yaml.YAMLError as e:
        err(f"{p.relative_to(ROOT)}: YAML-Fehler: {e}")
        return None


def split_frontmatter(text: str, where: str):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        err(f"{where}: Frontmatter fehlt (--- ... ---)")
        return None, text
    try:
        return norm(yaml.safe_load(m.group(1))), m.group(2)
    except yaml.YAMLError as e:
        err(f"{where}: Frontmatter-YAML: {e}")
        return None, m.group(2)


# ---------------------------------------------------------------- Markdown
def md_instance():
    return markdown.Markdown(
        extensions=["fenced_code", "tables", "sane_lists", "attr_list", "toc"],
        extension_configs={"toc": {"slugify": lambda v, s: slugify(v), "toc_depth": "2-3"}},
    )


def render_markdown(body: str, glossary_ids: set[str], where: str):
    store: dict[str, str] = {}

    def keep(fragment: str) -> str:
        key = f"KHBLOCK{len(store)}X"
        store[key] = fragment
        return f"\n\n{key}\n\n"

    # Mermaid-Diagramme
    body = re.sub(
        r"^```mermaid\n(.*?)\n```[ \t]*$",
        lambda m: keep(f'<pre class="mermaid">{html.escape(m.group(1))}</pre>'),
        body, flags=re.S | re.M,
    )

    # Selbstcheck-Platzhalter
    body = re.sub(
        r"^:::selbstcheck(?:[ \t]+(\d+))?[ \t]*$",
        lambda m: keep(f'<div class="selfcheck" data-count="{m.group(1) or 3}"></div>'),
        body, flags=re.M,
    )

    # Callouts :::typ [Titel] ... :::
    def callout(m):
        kind, title, inner = m.group(1), (m.group(2) or "").strip(), m.group(3)
        if kind not in CALLOUTS:
            err(f"{where}: unbekannter Baustein :::{kind}")
            return m.group(0)
        label, icon = CALLOUTS[kind]
        inner_html = md_instance().convert(link_terms(inner, glossary_ids, where))
        head = f'<div class="callout-head"><span class="callout-icon">{icon}</span> {html.escape(label)}'
        if title:
            head += f' <span class="callout-title">· {html.escape(title)}</span>'
        head += "</div>"
        return keep(f'<div class="callout callout-{kind}">{head}<div class="callout-body">{inner_html}</div></div>')

    body = re.sub(r"^:::([a-z]+)(?:[ \t]+(.*?))?[ \t]*\n(.*?)\n:::[ \t]*$", callout, body, flags=re.S | re.M)

    m = md_instance()
    out = m.convert(link_terms(body, glossary_ids, where))
    for key, frag in store.items():
        out = out.replace(f"<p>{key}</p>", frag).replace(key, frag)
    headings = []
    for tok in getattr(m, "toc_tokens", []):
        headings.append({"id": tok["id"], "text": tok["name"], "level": tok["level"]})
        for ch in tok.get("children", []):
            headings.append({"id": ch["id"], "text": ch["name"], "level": ch["level"]})
    return out, headings


def link_terms(text: str, glossary_ids: set[str], where: str) -> str:
    def rep(m):
        term, label = m.group(1), m.group(2) or m.group(1)
        tid = slugify(term)
        if tid not in glossary_ids:
            warn(f"{where}: Glossarbegriff [[{term}]] fehlt in glossary.yaml")
        return f'<a class="term" href="#/glossar/{tid}" data-term="{tid}">{html.escape(label)}</a>'

    return re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", rep, text)


def plain(html_text: str) -> str:
    t = re.sub(r"<[^>]+>", " ", html_text)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


# ---------------------------------------------------------------- Laden
def load_all():
    v = {k: validator(k) for k in ("topic", "lesson", "question", "competency", "prompt", "glossary", "path")}
    data = {"domains": [], "topics": {}, "lessons": {}, "competencies": {}, "questions": [],
            "prompts": [], "glossary": [], "paths": [], "changelog": []}

    # Glossar zuerst (für Verlinkung)
    gl = load_yaml(CONTENT / "glossary.yaml") or []
    seen = set()
    for i, g in enumerate(gl):
        if check(v["glossary"], g, f"glossary.yaml[{i}]"):
            gid = slugify(g["term"])
            if gid in seen:
                err(f"glossary.yaml: doppelter Begriff {g['term']}")
            seen.add(gid)
            g["id"] = gid
            data["glossary"].append(g)
    glossary_ids = {g["id"] for g in data["glossary"]}
    for g in data["glossary"]:
        for a in g.get("aliases", []):
            glossary_ids.add(slugify(a))

    pr = load_yaml(CONTENT / "prompts.yaml") or []
    for i, p in enumerate(pr):
        if check(v["prompt"], p, f"prompts.yaml[{i}]"):
            data["prompts"].append(p)
    prompt_ids = {p["id"] for p in data["prompts"]}

    for ddir in sorted((CONTENT / "domains").iterdir()):
        if not ddir.is_dir():
            continue
        dom = load_yaml(ddir / "_domain.yaml")
        if not dom:
            continue
        data["domains"].append(dom)
        comps = load_yaml(ddir / "competencies.yaml") or []
        for i, c in enumerate(comps):
            if check(v["competency"], c, f"{ddir.name}/competencies.yaml[{i}]"):
                if c["id"] in data["competencies"]:
                    err(f"Kompetenz doppelt: {c['id']}")
                c["domain"] = dom["id"]
                data["competencies"][c["id"]] = c
        for tid in dom["topics"]:
            tdir = ddir / tid
            tf = tdir / "_topic.yaml"
            if not tf.exists():
                err(f"{dom['id']}: Thema {tid} hat kein _topic.yaml")
                continue
            t = load_yaml(tf)
            if not t or not check(v["topic"], t, str(tf.relative_to(ROOT))):
                continue
            if t["id"] != tid:
                err(f"{tf.relative_to(ROOT)}: id {t['id']} passt nicht zum Ordner {tid}")
            t["domain"] = dom["id"]
            t["lessons"] = []
            data["topics"][tid] = t
            for lf in sorted(tdir.glob("*.md")):
                where = str(lf.relative_to(ROOT))
                fm, body = split_frontmatter(lf.read_text(encoding="utf-8"), where)
                if fm is None or not check(v["lesson"], fm, where):
                    continue
                slug = re.sub(r"^\d+-", "", lf.stem)
                lid = f"{tid}/{slug}"
                for p in fm.get("prompts", []):
                    if p not in prompt_ids:
                        err(f"{where}: Prompt-Button '{p}' existiert nicht in prompts.yaml")
                html_body, heads = render_markdown(body, glossary_ids, where)
                lesson = {**fm, "id": lid, "topic": tid, "domain": dom["id"], "slug": slug,
                          "order": lf.stem, "volatility": fm.get("volatility", t["volatility"]),
                          "html": html_body, "headings": heads,
                          "minutes": max(1, round(len(plain(html_body).split()) / 180))}
                data["lessons"][lid] = lesson
                t["lessons"].append(lid)

    qv = v["question"]
    seen_q = set()
    for qf in sorted((CONTENT / "questions").rglob("*.yaml")):
        q = load_yaml(qf)
        where = str(qf.relative_to(ROOT))
        if not q or not check(qv, q, where):
            continue
        if q["id"] in seen_q:
            err(f"{where}: doppelte Frage-ID {q['id']}")
        seen_q.add(q["id"])
        if qf.stem != q["id"]:
            err(f"{where}: Dateiname muss der ID entsprechen ({q['id']}.yaml)")
        check_question_logic(q, where)
        data["questions"].append(q)

    for pf in sorted((CONTENT / "paths").glob("*.yaml")):
        p = load_yaml(pf)
        if p and check(v["path"], p, str(pf.relative_to(ROOT))):
            data["paths"].append(p)

    for cf in sorted((CONTENT / "changelog").glob("*.md"), reverse=True):
        fm, body = split_frontmatter(cf.read_text(encoding="utf-8"), str(cf.relative_to(ROOT)))
        if fm:
            h, _ = render_markdown(body, glossary_ids, str(cf.relative_to(ROOT)))
            data["changelog"].append({"date": str(fm.get("date", cf.stem[:10])), "title": fm.get("title", cf.stem),
                                      "kind": fm.get("kind", "update"), "html": h})
    return data


def check_question_logic(q, where):
    t = q["type"]
    opts = q.get("options", [])
    ans = q.get("answer", [])
    if t in ("single", "multi", "scenario", "order") and len(opts) < 2:
        err(f"{where}: Typ {t} braucht options")
    if t in ("single", "scenario") and len(ans) != 1:
        err(f"{where}: Typ {t} braucht genau eine Antwort")
    if t == "multi" and len(ans) < 1:
        err(f"{where}: Typ multi braucht mindestens eine Antwort")
    if t == "true_false" and (len(ans) != 1 or ans[0] not in (0, 1)):
        err(f"{where}: true_false braucht answer [0] (richtig) oder [1] (falsch)")
    if t == "case" and (not q.get("model_answer") or not q.get("rubric")):
        err(f"{where}: case braucht model_answer und rubric")
    if t == "scenario" and not q.get("situation"):
        warn(f"{where}: scenario ohne situation")
    for a in ans:
        if t not in ("true_false", "case") and a >= len(opts):
            err(f"{where}: Antwortindex {a} ausserhalb der Optionen")


def cross_check(data):
    comps, lessons, topics = data["competencies"], data["lessons"], data["topics"]
    for lid, l in lessons.items():
        for c in l["competencies"]:
            if c not in comps:
                err(f"Lektion {lid}: unbekannte Kompetenz {c}")
    for t in topics.values():
        for p in t.get("prerequisites", []):
            if p not in topics:
                err(f"Thema {t['id']}: Voraussetzung {p} unbekannt")
    for q in data["questions"]:
        where = f"Frage {q['id']}"
        if q["topic"] not in topics:
            err(f"{where}: Thema {q['topic']} unbekannt")
        for c in q["competencies"]:
            if c not in comps:
                err(f"{where}: unbekannte Kompetenz {c}")
        lid, _, anchor = q["source"].partition("#")
        if lid not in lessons:
            err(f"{where}: Quelle {q['source']} zeigt auf keine Lektion")
        elif anchor and anchor not in {h["id"] for h in lessons[lid]["headings"]}:
            err(f"{where}: Anker #{anchor} existiert nicht in {lid}")
    for g in data["glossary"]:
        if g.get("lesson") and g["lesson"].split("#")[0] not in lessons:
            warn(f"Glossar {g['term']}: Lektion {g['lesson']} existiert (noch) nicht")
    for p in data["paths"]:
        for s in p["steps"]:
            if s not in lessons and s not in topics:
                warn(f"Lernpfad {p['id']}: Schritt {s} existiert (noch) nicht")


def coverage(data):
    today = dt.date.today()
    rows = []
    for cid, c in data["competencies"].items():
        les = [lid for lid, l in data["lessons"].items() if cid in l["competencies"]]
        qs = [q for q in data["questions"] if cid in q["competencies"]]
        rev = sum(1 for q in qs if q["status"] == "reviewed")
        dra = sum(1 for q in qs if q["status"] == "draft")
        need = c.get("min_questions", 3)
        status = "ok" if les and rev >= need else ("keine_lektion" if not les else "zu_wenig_fragen")
        rows.append({"id": cid, "topic": c["topic"], "level": c["level"], "can_do": c["can_do"],
                     "lessons": les, "reviewed": rev, "draft": dra, "needed": need, "status": status})
    queue = []
    for lid, l in data["lessons"].items():
        last = dt.date.fromisoformat(str(l["last_verified"]))
        due = last + dt.timedelta(days=REVIEW_DAYS[l["volatility"]])
        queue.append({"lesson": lid, "volatility": l["volatility"], "last_verified": str(last),
                      "due": str(due), "overdue": due <= today})
    queue.sort(key=lambda x: x["due"])
    return rows, queue


def report(rows, queue) -> str:
    total = len(rows)
    ok = sum(r["status"] == "ok" for r in rows)
    nolesson = sum(r["status"] == "keine_lektion" for r in rows)
    lines = [f"## Abdeckung Kompetenzmatrix: {ok}/{total} erfüllt ({round(100 * ok / max(total, 1))} %)",
             f"- ohne Lektion: {nolesson}", f"- mit Lektion, aber zu wenig geprüfte Fragen: {total - ok - nolesson}", "",
             "| Thema | Kompetenzen | ok | ohne Lektion | Fragen fehlen |", "|---|---|---|---|---|"]
    by = {}
    for r in rows:
        b = by.setdefault(r["topic"], [0, 0, 0, 0])
        b[0] += 1
        b[1] += r["status"] == "ok"
        b[2] += r["status"] == "keine_lektion"
        b[3] += max(0, r["needed"] - r["reviewed"])
    for t, b in by.items():
        lines.append(f"| {t} | {b[0]} | {b[1]} | {b[2]} | {b[3]} |")
    due = [q for q in queue if q["overdue"]]
    lines += ["", f"## Inhalts-Review fällig: {len(due)} Lektion(en)"]
    lines += [f"- {q['lesson']} (Volatilität {q['volatility']}, zuletzt geprüft {q['last_verified']})" for q in due[:30]]
    return "\n".join(lines)


def search_index(data):
    idx = []
    for t in data["topics"].values():
        idx.append({"kind": "Thema", "title": t["title"], "url": f"#/t/{t['id']}", "text": t["summary"]})
    for l in data["lessons"].values():
        idx.append({"kind": "Lektion", "title": l["title"], "url": f"#/l/{l['id']}",
                    "text": l["summary"] + " " + plain(l["html"])[:4000],
                    "heads": [h["text"] for h in l["headings"]]})
        for h in l["headings"]:
            idx.append({"kind": "Abschnitt", "title": f"{h['text']} – {l['title']}",
                        "url": f"#/l/{l['id']}/{h['id']}", "text": ""})
    for g in data["glossary"]:
        idx.append({"kind": "Begriff", "title": g["term"], "url": f"#/glossar/{g['id']}",
                    "text": g["definition"] + " " + " ".join(g.get("aliases", []))})
    return idx


def write_dist(data, rows, queue, out: Path):
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(SRC, out)
    (out / "data" / "lessons").mkdir(parents=True)
    for lid, l in data["lessons"].items():
        (out / "data" / "lessons" / (lid.replace("/", "__") + ".json")).write_text(
            json.dumps(l, ensure_ascii=False), encoding="utf-8")
    lesson_meta = {lid: {k: l[k] for k in ("id", "topic", "title", "level", "summary", "competencies",
                                          "minutes", "last_verified", "volatility", "order")}
                   for lid, l in data["lessons"].items()}
    site = {
        "built": dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes"),
        "domains": data["domains"], "topics": data["topics"], "lessons": lesson_meta,
        "competencies": data["competencies"], "prompts": data["prompts"],
        "glossary": data["glossary"], "paths": data["paths"], "changelog": data["changelog"],
        "coverage": rows, "review_queue": queue,
    }
    (out / "data" / "site.json").write_text(json.dumps(site, ensure_ascii=False), encoding="utf-8")
    qs = [q for q in data["questions"] if q["status"] != "retired"]
    (out / "data" / "questions.json").write_text(json.dumps(qs, ensure_ascii=False), encoding="utf-8")
    (out / "data" / "search.json").write_text(json.dumps(search_index(data), ensure_ascii=False), encoding="utf-8")
    (out / ".nojekyll").write_text("")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="nur validieren")
    ap.add_argument("--report", action="store_true", help="Abdeckung und Review-Warteschlange ausgeben")
    ap.add_argument("--out", default=str(ROOT / "dist"))
    a = ap.parse_args()

    data = load_all()
    cross_check(data)
    rows, queue = coverage(data)
    rep = report(rows, queue)

    for w in warnings:
        print(f"WARNUNG: {w}")
    for e in errors:
        print(f"FEHLER:  {e}")
    print(f"\n{len(data['topics'])} Themen · {len(data['lessons'])} Lektionen · "
          f"{len(data['questions'])} Fragen · {len(data['competencies'])} Kompetenzen · "
          f"{len(errors)} Fehler · {len(warnings)} Warnungen")
    if a.report:
        print("\n" + rep)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as fh:
            fh.write(rep + "\n")
    if errors:
        sys.exit(1)
    if not a.check:
        write_dist(data, rows, queue, Path(a.out))
        print(f"dist geschrieben: {a.out}")


if __name__ == "__main__":
    main()
