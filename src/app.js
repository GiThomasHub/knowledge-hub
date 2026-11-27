// Knowledge Hub – App ohne Framework. Daten kommen aus data/*.json (von scripts/build.py erzeugt).
const CFG = window.KH_CONFIG || {};
const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");
const LEVELS = { L1: "L1 Grundlagen", L2: "L2 Anwender", L3: "L3 Professional", L4: "L4 Senior Consultant" };
const TYPES = { single: "Single Choice", multi: "Mehrfachauswahl", true_false: "Richtig/Falsch", order: "Reihenfolge", scenario: "Szenario", case: "Fallstudie" };
const BOX_DAYS = [0, 1, 2, 4, 8, 16]; // Leitner: Fach 1..5
const MASTERED_BOX = 3;
const S = { site: null, questions: [], search: null, lessons: {} };

// ---------------------------------------------------------------- Hilfen
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
const fold = (s) => String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const lvlPill = (l) => `<span class="pill lvl lvl-${l}">${esc(l)}</span>`;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600); }
function dialog(html) { $("#dialogBody").innerHTML = html; $("#dialog").showModal(); }
async function getJSON(path) { const r = await fetch(path, { cache: "no-cache" }); if (!r.ok) throw new Error(path + ": " + r.status); return r.json(); }

// ---------------------------------------------------------------- Fortschritt (lokal + optional Sync)
const PKEY = "kh.progress.v1";
function loadProgress() { try { return JSON.parse(localStorage.getItem(PKEY)) || { v: 1, q: {}, lessons: {} }; } catch { return { v: 1, q: {}, lessons: {} }; } }
let P = loadProgress();
function saveProgress() { P.updated = new Date().toISOString(); try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch {} scheduleSync(); }
function recordAnswer(qid, ok) {
  const e = P.q[qid] || { box: 0, seen: 0, ok: 0, bad: 0 };
  e.seen++; ok ? e.ok++ : e.bad++;
  e.box = ok ? Math.min(5, (e.box || 0) + 1) : 1;
  e.due = addDays(today(), BOX_DAYS[e.box]);
  e.last = new Date().toISOString();
  P.q[qid] = e; saveProgress();
}
function markRead(lid) { P.lessons[lid] = { read: new Date().toISOString() }; saveProgress(); }
function mergeProgress(a, b) {
  if (!b) return a; const out = { v: 1, q: { ...a.q }, lessons: { ...a.lessons } };
  for (const [k, v] of Object.entries(b.q || {})) if (!out.q[k] || (v.last || "") > (out.q[k].last || "")) out.q[k] = v;
  for (const [k, v] of Object.entries(b.lessons || {})) if (!out.lessons[k] || (v.read || "") > (out.lessons[k].read || "")) out.lessons[k] = v;
  return out;
}

// Supabase (optional)
let sb = null, syncTimer = null;
async function sbClient() {
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return null;
  if (sb) return sb;
  const m = await import("https://esm.sh/@supabase/supabase-js@2");
  sb = m.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, detectSessionInUrl: true } });
  return sb;
}
async function sbUser() { const c = await sbClient(); if (!c) return null; const { data } = await c.auth.getSession(); return data.session?.user || null; }
function scheduleSync() { if (!CFG.supabaseUrl) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(true), 4000); }
async function syncNow(silent) {
  try {
    const c = await sbClient(); const u = await sbUser(); if (!c || !u) return false;
    const { data, error } = await c.from("progress").select("data").eq("user_id", u.id).maybeSingle();
    if (error) throw error;
    P = mergeProgress(P, data?.data); localStorage.setItem(PKEY, JSON.stringify(P));
    const up = await c.from("progress").upsert({ user_id: u.id, data: P, updated_at: new Date().toISOString() });
    if (up.error) throw up.error;
    if (!silent) toast("Fortschritt synchronisiert ✓");
    return true;
  } catch (e) { if (!silent) toast("Sync fehlgeschlagen: " + (e.message || e)); return false; }
}

// ---------------------------------------------------------------- Auswertung
const reviewed = () => S.questions.filter((q) => q.status === "reviewed");
const mastered = (q) => (P.q[q.id]?.box || 0) >= MASTERED_BOX;
function topicMastery(tid) {
  const res = {};
  for (const l of Object.keys(LEVELS)) {
    const qs = reviewed().filter((q) => q.topic === tid && q.level === l);
    res[l] = qs.length ? qs.filter(mastered).length / qs.length : null;
  }
  return res;
}
function topicScore(tid) { // 0..4: kumulativ, Stufe zählt ab 80 % gemeistert
  const m = topicMastery(tid); let s = 0;
  for (const l of Object.keys(LEVELS)) { if (m[l] === null) break; s += m[l]; if (m[l] < 0.8) break; }
  return s;
}
function readCount(tid) { const t = S.site.topics[tid]; return t.lessons.filter((l) => P.lessons[l]).length; }

// ---------------------------------------------------------------- Prompts
function fillPrompt(tpl, ctx) { return tpl.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? ""); }
function promptContext(lesson, topic) {
  const comps = (lesson?.competencies || []).map((c) => "- " + (S.site.competencies[c]?.can_do || c)).join("\n");
  const goals = Object.entries(topic.goals).map(([l, g]) => `- ${LEVELS[l]}: ${g}`).join("\n");
  return {
    thema: topic.title, lektion: lesson ? lesson.title : topic.title,
    stufe: lesson ? LEVELS[lesson.level] : "L1 bis L4",
    kontext: lesson?.prompt_context || topic.summary,
    abschnitte: lesson ? (lesson.headings || []).filter((h) => h.level === 2).map((h) => h.text).join(", ") : topic.summary,
    kompetenzen: comps || goals,
  };
}
function promptBar(ids, ctx) {
  const ps = S.site.prompts.filter((p) => !ids || ids.includes(p.id));
  if (!ps.length) return "";
  return `<div class="ai-bar"><span class="label">🤖 Mit KI weiterlernen – Prompt kopieren, im LLM deiner Wahl einfügen</span>
    <div class="row">${ps.map((p) => `<span><button data-prompt="${p.id}" title="${esc(p.hint || "")}">${p.icon} ${esc(p.label)}</button><button class="peek" data-peek="${p.id}" title="Prompt ansehen">ansehen</button></span>`).join("")}</div></div>`;
}
function wirePrompts(root, ctx) {
  root.querySelectorAll("[data-prompt]").forEach((b) => b.addEventListener("click", async () => {
    const p = S.site.prompts.find((x) => x.id === b.dataset.prompt);
    const text = fillPrompt(p.template, ctx);
    try { await navigator.clipboard.writeText(text); toast(`${p.icon} Prompt «${p.label}» kopiert – jetzt im LLM einfügen`); }
    catch { dialog(`<h3>${p.icon} ${esc(p.label)}</h3><p class="muted">Kopieren nicht erlaubt – bitte manuell markieren:</p><pre>${esc(text)}</pre>`); }
  }));
  root.querySelectorAll("[data-peek]").forEach((b) => b.addEventListener("click", () => {
    const p = S.site.prompts.find((x) => x.id === b.dataset.peek);
    dialog(`<h3>${p.icon} ${esc(p.label)}</h3><pre>${esc(fillPrompt(p.template, ctx))}</pre>`);
  }));
}

// ---------------------------------------------------------------- Fragen-Karte
function questionCard(q, { onDone, exam = false } = {}) {
  const el = document.createElement("div"); el.className = "qcard";
  const topic = S.site.topics[q.topic];
  const order = q.type === "order" ? shuffle(q.options.map((t, i) => ({ t, i }))) : null;
  const opts = q.type === "true_false" ? ["Richtig", "Falsch"] : q.options || [];
  const optIdx = q.type === "order" ? null : shuffle(opts.map((_, i) => i));
  let sel = new Set(), done = false;
  el.innerHTML = `
    <div class="qhead">${lvlPill(q.level)}<span class="pill">${esc(TYPES[q.type])}</span><span class="pill">${esc(topic?.icon || "")} ${esc(topic?.title || q.topic)}</span>${q.status === "draft" ? '<span class="pill draft">Entwurf</span>' : ""}</div>
    ${q.situation ? `<div class="situation">${inline(q.situation)}</div>` : ""}
    <div class="qtext">${inline(q.question)}</div>
    <div class="opts"></div>
    <div class="row" style="margin-top:14px"><button class="primary check">${q.type === "case" ? "Musterlösung zeigen" : "Prüfen"}</button></div>
    <div class="fb"></div>`;
  const box = $(".opts", el);
  if (q.type === "order") {
    const draw = () => {
      box.innerHTML = order.map((o, k) => `<div class="order-item" data-k="${k}"><strong>${k + 1}.</strong><span>${inline(o.t)}</span><button data-up="${k}" ${k === 0 || done ? "disabled" : ""}>↑</button><button data-down="${k}" ${k === order.length - 1 || done ? "disabled" : ""}>↓</button></div>`).join("");
      box.querySelectorAll("[data-up]").forEach((b) => b.onclick = () => { const k = +b.dataset.up; [order[k - 1], order[k]] = [order[k], order[k - 1]]; draw(); });
      box.querySelectorAll("[data-down]").forEach((b) => b.onclick = () => { const k = +b.dataset.down; [order[k + 1], order[k]] = [order[k], order[k + 1]]; draw(); });
    };
    draw();
  } else if (q.type === "case") {
    box.innerHTML = `<textarea placeholder="Deine Antwort in Stichworten (wird nicht gespeichert) …"></textarea>`;
  } else {
    const multi = q.type === "multi";
    box.innerHTML = optIdx.map((i) => `<button class="opt ${multi ? "multi" : ""}" data-i="${i}"><span class="mark"></span><span>${inline(opts[i])}</span></button>`).join("");
    box.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      if (done) return; const i = +b.dataset.i;
      if (multi) { sel.has(i) ? sel.delete(i) : sel.add(i); } else { sel = new Set([i]); }
      box.querySelectorAll(".opt").forEach((x) => { const on = sel.has(+x.dataset.i); x.classList.toggle("sel", on); $(".mark", x).textContent = on ? "✓" : ""; });
    }));
  }
  const source = () => { const [lid, anchor] = q.source.split("#"); return `<a href="#/l/${lid}${anchor ? "/" + anchor : ""}">→ Zur Lektion</a>`; };
  const finish = (ok, neutral) => {
    done = true; $(".check", el).remove();
    const fb = $(".fb", el);
    if (!exam) {
      fb.innerHTML = `<div class="feedback ${neutral ? "neutral" : ok ? "ok" : "bad"}"><h4>${neutral ? "Selbsteinschätzung gespeichert" : ok ? "✓ Richtig" : "✗ Nicht ganz"}</h4><div>${inline(q.explanation)}</div><p class="small" style="margin-bottom:0">${source()}</p></div>`;
    }
    const next = document.createElement("button"); next.className = "primary"; next.textContent = "Weiter →"; next.style.marginTop = "12px";
    next.onclick = () => onDone && onDone(ok); fb.appendChild(next); next.focus();
  };
  $(".check", el).addEventListener("click", () => {
    if (q.type === "case") {
      $(".check", el).remove();
      $(".fb", el).innerHTML = `<div class="feedback neutral"><h4>Musterlösung</h4><div>${inline(q.model_answer)}</div><h4 style="margin-top:12px">Bewertungsraster</h4><ul>${q.rubric.map((r) => `<li>${inline(r)}</li>`).join("")}</ul><p>${inline(q.explanation)}</p><p class="small">${source()}</p>
        <div class="row"><strong>Wie gut war deine Antwort?</strong><button data-s="2">Alles abgedeckt</button><button data-s="1">Teilweise</button><button data-s="0">Kaum</button></div></div>`;
      el.querySelectorAll("[data-s]").forEach((b) => b.onclick = () => { const ok = b.dataset.s === "2"; recordAnswer(q.id, ok); el.querySelectorAll("[data-s]").forEach((x) => x.disabled = true); done = true;
        const next = document.createElement("button"); next.className = "primary"; next.textContent = "Weiter →"; next.style.marginTop = "12px"; next.onclick = () => onDone && onDone(ok); $(".fb", el).appendChild(next); });
      return;
    }
    let ok;
    if (q.type === "order") ok = order.every((o, k) => o.i === k);
    else {
      if (!sel.size) { toast("Bitte zuerst eine Antwort wählen"); return; }
      const ans = new Set(q.answer);
      ok = ans.size === sel.size && [...ans].every((a) => sel.has(a));
      if (!exam) box.querySelectorAll(".opt").forEach((x) => { const i = +x.dataset.i; if (ans.has(i)) x.classList.add("right"); else if (sel.has(i)) x.classList.add("wrong"); });
    }
    if (q.type === "order" && !exam) box.querySelectorAll(".order-item").forEach((x, k) => x.style.borderColor = order[k].i === k ? "var(--ok)" : "var(--bad)");
    recordAnswer(q.id, ok); finish(ok);
  });
  return el;
}

function runQuiz(container, list, { title = "Quiz", exam = false, after } = {}) {
  let i = 0, score = 0; const wrong = [];
  const step = () => {
    container.innerHTML = "";
    if (i >= list.length) {
      const pct = list.length ? Math.round((100 * score) / list.length) : 0;
      container.innerHTML = `<div class="qcard"><h2 style="border:0;margin-top:0">${esc(title)}: ${score}/${list.length} (${pct} %)</h2>
        ${exam ? `<p>${pct >= 80 ? "🎉 Bestanden (≥ 80 %)." : "Noch nicht bestanden – die Lücken unten wiederholen."}</p>` : ""}
        ${wrong.length ? `<h3>Wiederholen</h3><ul>${wrong.map((q) => `<li>${inline(q.question)}<br><span class="small muted">${inline(q.explanation)}</span> <a class="small" href="#/l/${q.source.split("#")[0]}">Lektion</a></li>`).join("")}</ul>` : "<p>Alles richtig – stark!</p>"}
        <div class="row"><a class="btn primary" href="#/">Zur Startseite</a><a class="btn" href="#/fortschritt">Fortschritt</a></div></div>`;
      after && after(score, list.length); return;
    }
    const pl = document.createElement("div"); pl.className = "progressline";
    pl.innerHTML = `<span class="small muted">${i + 1}/${list.length}</span><div class="bar"><span style="width:${(100 * i) / list.length}%"></span></div>`;
    container.appendChild(pl);
    container.appendChild(questionCard(list[i], { exam, onDone: (ok) => { if (ok) score++; else wrong.push(list[i]); i++; step(); window.scrollTo({ top: 0 }); } }));
  };
  step();
}

// ---------------------------------------------------------------- Radar
function radar(tids) {
  const n = tids.length, R = 120, cx = 170, cy = 160;
  const pt = (k, r) => { const a = -Math.PI / 2 + (2 * Math.PI * k) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  let g = "";
  for (let ring = 1; ring <= 4; ring++) g += `<polygon points="${tids.map((_, k) => pt(k, (R * ring) / 4).join(",")).join(" ")}" fill="none" stroke="var(--border)"/>`;
  tids.forEach((t, k) => { const [x, y] = pt(k, R); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--border)"/>`; const [lx, ly] = pt(k, R + 16); g += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${esc(S.site.topics[t].icon)}</text>`; });
  const poly = tids.map((t, k) => pt(k, (R * topicScore(t)) / 4).join(",")).join(" ");
  g += `<polygon points="${poly}" fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" stroke-width="2"/>`;
  return `<svg class="radar" viewBox="0 0 340 320" width="340" role="img" aria-label="Kompetenz-Radar">${g}</svg>`;
}

// ---------------------------------------------------------------- Views
function topicCard(tid) {
  const t = S.site.topics[tid]; const sc = topicScore(tid);
  return `<a class="card" href="#/t/${tid}"><div class="row" style="justify-content:space-between"><span class="topic-icon">${t.icon}</span><span class="pill">${t.lessons.length} Lektion${t.lessons.length === 1 ? "" : "en"}</span></div>
    <h3 style="margin-top:8px">${esc(t.title)}</h3><p class="small muted" style="margin:0 0 10px">${esc(t.summary)}</p>
    <div class="bar" title="Fortschritt ${sc.toFixed(1)} von 4 Stufen"><span style="width:${(sc / 4) * 100}%"></span></div></a>`;
}
function dueList() {
  const d = today();
  return reviewed().filter((q) => P.q[q.id] && P.q[q.id].due <= d).sort((a, b) => P.q[a.id].due.localeCompare(P.q[b.id].due));
}
function dailyFive() {
  const due = dueList();
  const started = new Set(Object.keys(P.lessons).map((l) => l.split("/")[0]));
  const fresh = shuffle(reviewed().filter((q) => !P.q[q.id])).sort((a, b) => (started.has(b.topic) - started.has(a.topic)) || a.level.localeCompare(b.level));
  return [...due, ...fresh].slice(0, 5);
}

const views = {
  home() {
    const dom = S.site.domains;
    const due = dueList().length;
    const last = Object.entries(P.lessons).sort((a, b) => b[1].read.localeCompare(a[1].read))[0];
    const allT = dom.flatMap((d) => d.topics);
    app.innerHTML = `
      <section class="hero"><h1>Vom Anfänger zum Senior Consultant</h1>
        <p class="summary">Lektionen mit Bildern und Hidden Gems, ein Fragekatalog mit Karteikasten und Prompts, mit denen du in jedem LLM tiefer gehst. Was ein Senior Consultant wissen muss, steht in der Kompetenzmatrix.</p>
        <div class="row"><a class="btn primary" href="#/daily">▶ Daily 5 ${due ? `(${due} fällig)` : ""}</a>${last ? `<a class="btn" href="#/l/${last[0]}">Weiterlesen: ${esc(S.site.lessons[last[0]]?.title || "")}</a>` : `<a class="btn" href="#/pfade">Lernpfad wählen</a>`}<a class="btn" href="#/pruefung">Prüfung</a></div></section>
      <div class="home-grid">
        <div>${dom.map((d) => `<div class="section-title"><h2>${d.icon} ${esc(d.title)}</h2><a class="small" href="#/abdeckung">Abdeckung</a></div><div class="grid">${d.topics.map(topicCard).join("")}</div>`).join("")}</div>
        <aside><div class="card"><h3>Kompetenz-Radar</h3><p class="small muted">Je Thema 0–4 Stufen, gemessen an gemeisterten Fragen (Fach ≥ ${MASTERED_BOX}).</p><div class="radar-wrap">${radar(allT)}</div></div>
          <div class="card" style="margin-top:16px"><h3>Was ist neu</h3>${S.site.changelog.slice(0, 3).map((c) => `<p class="small"><strong>${esc(c.date)}</strong> · ${esc(c.title)}</p>`).join("") || '<p class="small muted">Noch keine Einträge.</p>'}<a class="small" href="#/neu">Alle Einträge</a></div>
          <div class="card" style="margin-top:16px"><h3>Lernpfade</h3>${S.site.paths.map((p) => `<p class="small"><a href="#/pfade/${p.id}">${esc(p.title)}</a><br><span class="muted">${esc(p.duration || "")}</span></p>`).join("")}</div></aside></div>`;
  },
  themen() {
    app.innerHTML = S.site.domains.map((d) => `<h1>${d.icon} ${esc(d.title)}</h1><p class="summary">${esc(d.description)}</p><div class="grid">${d.topics.map(topicCard).join("")}</div>`).join("");
  },
  topic(tid) {
    const t = S.site.topics[tid]; if (!t) return views.notfound();
    const m = topicMastery(tid);
    const comps = Object.values(S.site.competencies).filter((c) => c.topic === tid);
    const cov = Object.fromEntries(S.site.coverage.map((r) => [r.id, r]));
    const byLevel = Object.keys(LEVELS).map((l) => [l, t.lessons.filter((lid) => S.site.lessons[lid].level === l)]);
    const ctx = promptContext(null, t);
    app.innerHTML = `<div class="crumbs"><a href="#/themen">Themen</a> › ${esc(t.title)}</div>
      <h1><span class="topic-icon">${t.icon}</span> ${esc(t.title)}</h1><p class="summary">${esc(t.summary)}</p>
      <div class="row"><a class="btn primary" href="#/quiz/${tid}">Quiz zu diesem Thema</a><a class="btn" href="#/pruefung/${tid}">Prüfung</a>${t.prerequisites?.length ? `<span class="small muted">Voraussetzungen: ${t.prerequisites.map((p) => `<a href="#/t/${p}">${esc(S.site.topics[p]?.title || p)}</a>`).join(", ")}</span>` : ""}</div>
      ${promptBar(["mehr", "einfach", "beispiele", "kundengespraech", "was-ist-neu"], ctx)}
      <h2>Lernziele je Stufe</h2>${Object.entries(LEVELS).map(([l, name]) => `<div class="goal ${l}"><div class="row" style="justify-content:space-between"><strong>${name}</strong><span class="small muted">${m[l] === null ? "noch keine Fragen" : Math.round(m[l] * 100) + " % gemeistert"}</span></div><div>${esc(t.goals[l])}</div></div>`).join("")}
      <h2>Lektionen</h2>${t.lessons.length ? `<div class="lesson-list">${byLevel.filter(([, ls]) => ls.length).map(([l, ls]) => ls.map((lid) => { const L = S.site.lessons[lid]; return `<a href="#/l/${lid}">${lvlPill(l)}<span style="flex:1">${esc(L.title)}<br><span class="small muted">${esc(L.summary)}</span></span><span class="small muted">${L.minutes} min</span>${P.lessons[lid] ? '<span class="done">✓</span>' : ""}</a>`; }).join("")).join("")}</div>` : `<div class="card"><p><strong>Inhalte folgen.</strong> Der wöchentliche Task baut dieses Thema entlang der Kompetenzen unten auf. Bis dahin: Nutze die Prompt-Buttons oben, um dir das Thema von einem LLM erklären zu lassen.</p></div>`}
      <h2>Kompetenzen (das muss ein Senior Consultant können)</h2>
      <table><tr><th>Stufe</th><th>Kann …</th><th>Lektion</th><th>Fragen</th></tr>${comps.map((c) => { const r = cov[c.id]; return `<tr><td>${lvlPill(c.level)}</td><td>${esc(c.can_do)}</td><td>${r.lessons.length ? '<span class="cov-ok">✓</span>' : '<span class="cov-bad">–</span>'}</td><td class="${r.reviewed >= r.needed ? "cov-ok" : r.reviewed ? "cov-mid" : "cov-bad"}">${r.reviewed}/${r.needed}${r.draft ? ` <span class="small muted">(+${r.draft} Entwurf)</span>` : ""}</td></tr>`; }).join("")}</table>`;
    wirePrompts(app, ctx);
  },
  async lesson(lid, anchor) {
    const meta = S.site.lessons[lid]; if (!meta) return views.notfound();
    const L = S.lessons[lid] || (S.lessons[lid] = await getJSON(`data/lessons/${lid.replace("/", "__")}.json`));
    const t = S.site.topics[L.topic]; const ctx = promptContext(L, t);
    const idx = t.lessons.indexOf(lid); const prev = t.lessons[idx - 1], next = t.lessons[idx + 1];
    app.innerHTML = `<div class="crumbs"><a href="#/themen">Themen</a> › <a href="#/t/${t.id}">${esc(t.title)}</a> › ${esc(L.title)}</div>
      <div class="lesson-layout"><article class="lesson-body">
        <h1>${esc(L.title)}</h1>
        <div class="meta">${lvlPill(L.level)}<span class="pill">${L.minutes} min</span><span class="pill" title="Wie schnell sich das Thema ändert">Volatilität ${esc(L.volatility)}</span><span class="pill">geprüft ${esc(L.last_verified)}</span></div>
        <p class="summary">${esc(L.summary)}</p>
        ${promptBar(L.prompts, ctx)}
        <div class="content">${L.html}</div>
        ${promptBar(L.prompts, ctx)}
        <div class="card check-read"><div class="row" style="justify-content:space-between"><div><strong>Diese Lektion vermittelt</strong><ul class="small">${L.competencies.map((c) => `<li>${esc(S.site.competencies[c]?.can_do || c)}</li>`).join("")}</ul></div>
          <button class="${P.lessons[lid] ? "" : "primary"}" id="readBtn">${P.lessons[lid] ? "✓ Gelesen" : "Als gelesen markieren"}</button></div></div>
        <details class="small muted" style="margin-top:14px"><summary>Quellen</summary><ul>${L.sources.map((s) => `<li>${/^https?:/.test(s) ? `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(s)}</a>` : esc(s)}</li>`).join("")}</ul></details>
        <div class="nav-lessons">${prev ? `<a class="btn" href="#/l/${prev}">← ${esc(S.site.lessons[prev].title)}</a>` : "<span></span>"}${next ? `<a class="btn primary" href="#/l/${next}">${esc(S.site.lessons[next].title)} →</a>` : `<a class="btn primary" href="#/quiz/${t.id}">Quiz zum Thema →</a>`}</div>
      </article>
      <nav class="toc"><strong>Inhalt</strong>${L.headings.map((h) => `<a class="l${h.level}" href="#/l/${lid}/${h.id}">${esc(h.text)}</a>`).join("")}</nav></div>`;
    wirePrompts(app, ctx);
    $("#readBtn").onclick = (e) => { markRead(lid); e.target.textContent = "✓ Gelesen"; e.target.classList.remove("primary"); toast("Lektion als gelesen markiert"); };
    const gl = Object.fromEntries(S.site.glossary.map((g) => [g.id, g]));
    app.querySelectorAll("a.term").forEach((a) => { const g = gl[a.dataset.term]; if (g) a.title = g.definition; });
    app.querySelectorAll(".selfcheck").forEach((box) => {
      const qs = shuffle(S.questions.filter((q) => q.source.split("#")[0] === lid && q.type !== "case")).slice(0, +box.dataset.count || 3);
      if (!qs.length) { box.remove(); return; }
      box.innerHTML = `<h3 style="margin-top:0">✅ Selbstcheck</h3>`; const c = document.createElement("div"); box.appendChild(c);
      runQuiz(c, qs, { title: "Selbstcheck" });
    });
    if (app.querySelector(".mermaid")) renderMermaid();
    if (anchor) document.getElementById(anchor)?.scrollIntoView(); else window.scrollTo({ top: 0 });
  },
  quiz(tid) {
    const t = tid && S.site.topics[tid];
    app.innerHTML = `<div class="crumbs"><a href="#/themen">Themen</a>${t ? ` › <a href="#/t/${tid}">${esc(t.title)}</a>` : ""} › Quiz</div><h1>Quiz${t ? ": " + esc(t.title) : ""}</h1>
      <div class="row card" style="margin-bottom:18px"><label>Stufe <select id="lv"><option value="">alle</option>${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      <label><input type="checkbox" id="dr"> Entwürfe einbeziehen</label><label>Anzahl <input id="n" type="number" min="3" max="40" value="10" style="width:80px"></label><button class="primary" id="go">Starten</button></div><div id="qz"></div>`;
    $("#go").onclick = () => {
      const lv = $("#lv").value, dr = $("#dr").checked, n = +$("#n").value || 10;
      const pool = S.questions.filter((q) => (!tid || q.topic === tid) && (!lv || q.level === lv) && (dr || q.status === "reviewed"));
      if (!pool.length) { toast("Keine passenden Fragen – Filter anpassen"); return; }
      runQuiz($("#qz"), shuffle(pool).slice(0, n), { title: "Quiz" });
    };
  },
  pruefung(tid) {
    const topics = S.site.domains.flatMap((d) => d.topics);
    app.innerHTML = `<h1>Prüfungsmodus</h1><p class="summary">Nur geprüfte Fragen, Auflösung erst am Schluss. Bestanden ab 80 %.</p>
      <div class="card row" style="margin-bottom:18px"><label>Thema <select id="tp"><option value="">alle Themen</option>${topics.map((t) => `<option value="${t}" ${t === tid ? "selected" : ""}>${esc(S.site.topics[t].title)}</option>`).join("")}</select></label>
      <label>Stufe bis <select id="lv">${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${k === "L4" ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label>Fragen <input id="n" type="number" min="5" max="40" value="15" style="width:80px"></label><button class="primary" id="go">Prüfung starten</button></div><div id="qz"></div>`;
    $("#go").onclick = () => {
      const tp = $("#tp").value, lv = $("#lv").value, n = +$("#n").value || 15;
      const pool = reviewed().filter((q) => (!tp || q.topic === tp) && q.level <= lv && q.type !== "case");
      if (pool.length < 3) { toast("Zu wenige geprüfte Fragen für eine Prüfung"); return; }
      runQuiz($("#qz"), shuffle(pool).slice(0, n), { title: "Prüfung", exam: true });
    };
  },
  daily() {
    const list = dailyFive();
    app.innerHTML = `<h1>Daily 5</h1><p class="summary">Fünf Fragen pro Tag: zuerst die fälligen aus deinem Karteikasten, dann neue. Richtig = ein Fach weiter (seltener), falsch = zurück in Fach 1.</p><div id="qz"></div>`;
    if (!list.length) { $("#qz").innerHTML = `<div class="card">Keine geprüften Fragen verfügbar.</div>`; return; }
    runQuiz($("#qz"), list, { title: "Daily 5" });
  },
  pfade(pid) {
    const one = pid && S.site.paths.find((p) => p.id === pid);
    const step = (s) => { const l = S.site.lessons[s], t = S.site.topics[s]; if (l) return `<a href="#/l/${s}">${lvlPill(l.level)}<span style="flex:1">${esc(l.title)}<br><span class="small muted">${esc(S.site.topics[l.topic].title)}</span></span>${P.lessons[s] ? '<span class="done">✓</span>' : ""}</a>`; if (t) return `<a href="#/t/${s}"><span class="topic-icon">${t.icon}</span><span style="flex:1">${esc(t.title)} <span class="small muted">(ganzes Thema)</span></span>${t.lessons.length && t.lessons.every((x) => P.lessons[x]) ? '<span class="done">✓</span>' : ""}</a>`; return `<a><span class="muted">${esc(s)} – folgt</span></a>`; };
    const list = one ? [one] : S.site.paths;
    app.innerHTML = `<h1>Lernpfade</h1>${list.map((p) => `<div class="card" style="margin-bottom:16px"><h3>${esc(p.title)}</h3><p class="muted">${esc(p.description)} ${p.duration ? "· " + esc(p.duration) : ""}</p><div class="lesson-list">${p.steps.map(step).join("")}</div></div>`).join("")}`;
  },
  glossar(gid) {
    const g = [...S.site.glossary].sort((a, b) => a.term.localeCompare(b.term, "de"));
    app.innerHTML = `<h1>Glossar</h1><p class="summary">${g.length} Begriffe. Tipp: Die Suche oben findet auch Synonyme.</p><dl class="gloss">${g.map((x) => `<div id="g-${x.id}" class="${x.id === gid ? "hl" : ""}"><dt>${esc(x.term)}${x.aliases?.length ? ` <span class="small muted">(${x.aliases.map(esc).join(", ")})</span>` : ""}</dt><dd>${esc(x.definition)} ${x.lesson && S.site.lessons[x.lesson.split("#")[0]] ? `<a class="small" href="#/l/${x.lesson.replace("#", "/")}">→ Lektion</a>` : ""}</dd></div>`).join("")}</dl>`;
    if (gid) document.getElementById("g-" + gid)?.scrollIntoView({ block: "center" });
  },
  async suche(q) {
    S.search = S.search || (await getJSON("data/search.json"));
    const terms = fold(q).split(/\s+/).filter(Boolean);
    const scored = S.search.map((e) => { const ti = fold(e.title), tx = fold(e.text), he = fold((e.heads || []).join(" ")); let s = 0;
      for (const w of terms) { if (ti.includes(w)) s += 6; if (he.includes(w)) s += 3; if (tx.includes(w)) s += 1; else if (!ti.includes(w) && !he.includes(w)) return null; }
      if (e.kind === "Begriff" && ti === fold(q)) s += 10; return { e, s }; }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 40);
    const snip = (txt) => { const f = fold(txt); const p = Math.max(0, f.indexOf(terms[0] || "") - 60); return esc(txt.slice(p, p + 200)) + (txt.length > p + 200 ? " …" : ""); };
    app.innerHTML = `<h1>Suche: «${esc(q)}»</h1><p class="muted">${scored.length} Treffer</p>${scored.map(({ e }) => `<div class="result-item"><span class="pill">${esc(e.kind)}</span> <a href="${e.url}">${esc(e.title)}</a>${e.text ? `<div class="small muted">${snip(e.text)}</div>` : ""}</div>`).join("") || `<p>Nichts gefunden. Versuch es mit einem anderen Begriff – oder kopiere einen «Mehr»-Prompt auf einer Themenseite.</p>`}`;
  },
  neu() {
    app.innerHTML = `<h1>Was ist neu</h1><p class="summary">Änderungen aus den wöchentlichen Inhalts-Reviews: Korrekturen, Updates und neue Themen.</p>${S.site.changelog.map((c) => `<div class="card news-item"><span class="pill">${esc(c.kind)}</span> <strong>${esc(c.date)}</strong><h3>${esc(c.title)}</h3>${c.html}</div>`).join("")}`;
  },
  abdeckung() {
    const rows = S.site.coverage; const ok = rows.filter((r) => r.status === "ok").length;
    const topics = S.site.domains.flatMap((d) => d.topics);
    const due = S.site.review_queue.filter((r) => r.overdue);
    app.innerHTML = `<h1>Abdeckung der Kompetenzmatrix</h1><p class="summary">Das Credo messbar gemacht: Eine Kompetenz gilt als abgedeckt, wenn eine Lektion sie lehrt und genügend geprüfte Fragen sie abfragen.</p>
      <div class="grid"><div class="card"><div class="stat">${ok}/${rows.length}</div><div class="muted">Kompetenzen abgedeckt</div><div class="bar" style="margin-top:8px"><span style="width:${(100 * ok) / rows.length}%"></span></div></div>
      <div class="card"><div class="stat">${rows.filter((r) => !r.lessons.length).length}</div><div class="muted">ohne Lektion</div></div><div class="card"><div class="stat">${due.length}</div><div class="muted">Lektionen mit fälligem Inhalts-Review</div></div></div>
      <h2>Je Thema</h2><table><tr><th>Thema</th><th>Kompetenzen</th><th>abgedeckt</th><th>ohne Lektion</th><th>fehlende Fragen</th></tr>${topics.map((t) => { const r = rows.filter((x) => x.topic === t); return `<tr><td><a href="#/t/${t}">${S.site.topics[t].icon} ${esc(S.site.topics[t].title)}</a></td><td>${r.length}</td><td>${r.filter((x) => x.status === "ok").length}</td><td>${r.filter((x) => !x.lessons.length).length}</td><td>${r.reduce((s, x) => s + Math.max(0, x.needed - x.reviewed), 0)}</td></tr>`; }).join("")}</table>
      ${due.length ? `<h2>Inhalts-Review fällig</h2><ul>${due.map((d) => `<li><a href="#/l/${d.lesson}">${esc(S.site.lessons[d.lesson]?.title || d.lesson)}</a> <span class="small muted">· Volatilität ${d.volatility} · zuletzt ${d.last_verified}</span></li>`).join("")}</ul>` : ""}`;
  },
  async fortschritt() {
    const answered = Object.keys(P.q).length; const boxes = [1, 2, 3, 4, 5].map((b) => Object.values(P.q).filter((e) => e.box === b).length);
    const user = await sbUser().catch(() => null);
    const allT = S.site.domains.flatMap((d) => d.topics);
    app.innerHTML = `<h1>Dein Fortschritt</h1>
      <div class="grid"><div class="card"><div class="stat">${Object.keys(P.lessons).length}</div><div class="muted">Lektionen gelesen</div></div><div class="card"><div class="stat">${answered}</div><div class="muted">Fragen beantwortet</div></div><div class="card"><div class="stat">${reviewed().filter(mastered).length}/${reviewed().length}</div><div class="muted">Fragen gemeistert (Fach ≥ ${MASTERED_BOX})</div></div><div class="card"><div class="stat">${dueList().length}</div><div class="muted">heute fällig</div></div></div>
      <div class="grid" style="margin-top:16px"><div class="card"><h3>Kompetenz-Radar</h3><div class="radar-wrap">${radar(allT)}</div></div>
        <div class="card"><h3>Karteikasten</h3>${boxes.map((n, i) => `<div class="row small"><span style="width:60px">Fach ${i + 1}</span><div class="bar" style="flex:1"><span style="width:${answered ? (100 * n) / answered : 0}%"></span></div><span style="width:30px;text-align:right">${n}</span></div>`).join("")}<p class="small muted">Intervalle: ${BOX_DAYS.slice(1).join(", ")} Tage.</p></div>
        <div class="card"><h3>Geräte synchronisieren</h3>${!CFG.supabaseUrl ? `<p class="small muted">Sync ist nicht konfiguriert (config.js). Dein Fortschritt liegt nur in diesem Browser.</p>` : user ? `<p class="small">Angemeldet als <strong>${esc(user.email)}</strong></p><div class="row"><button class="primary" id="syncBtn">Jetzt synchronisieren</button><button id="logoutBtn">Abmelden</button></div>` : `<p class="small">Melde dich per E-Mail-Link an. Dann ist dein Fortschritt auf allen Geräten gleich.</p><div class="row"><input type="email" id="email" placeholder="name@firma.ch" style="flex:1"><button class="primary" id="loginBtn">Link senden</button></div>`}
          <hr style="border:0;border-top:1px solid var(--border);margin:16px 0"><div class="row"><button id="exportBtn">Export (JSON)</button><label class="btn">Import<input type="file" id="importFile" accept="application/json" hidden></label><button id="resetBtn">Zurücksetzen</button></div></div></div>`;
    $("#syncBtn")?.addEventListener("click", () => syncNow(false));
    $("#logoutBtn")?.addEventListener("click", async () => { (await sbClient()).auth.signOut(); toast("Abgemeldet"); views.fortschritt(); });
    $("#loginBtn")?.addEventListener("click", async () => { const email = $("#email").value.trim(); if (!email) return; const c = await sbClient();
      const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } }); toast(error ? "Fehler: " + error.message : "Link gesendet – E-Mail öffnen"); });
    $("#exportBtn").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: "application/json" })); a.download = `knowledge-hub-fortschritt-${today()}.json`; a.click(); };
    $("#importFile").onchange = async (e) => { try { const d = JSON.parse(await e.target.files[0].text()); P = mergeProgress(P, d); saveProgress(); toast("Import zusammengeführt"); views.fortschritt(); } catch { toast("Datei ungültig"); } };
    $("#resetBtn").onclick = () => { if (confirm("Gesamten lokalen Fortschritt löschen?")) { P = { v: 1, q: {}, lessons: {} }; saveProgress(); views.fortschritt(); } };
  },
  notfound() { app.innerHTML = `<h1>Nicht gefunden</h1><p><a href="#/">Zur Startseite</a></p>`; },
};

// ---------------------------------------------------------------- Mermaid (nur laden, wenn gebraucht)
let mermaidMod = null;
async function renderMermaid() {
  try {
    mermaidMod = mermaidMod || (await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")).default;
    const dark = matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme !== "light" || document.documentElement.dataset.theme === "dark";
    mermaidMod.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", securityLevel: "strict" });
    await mermaidMod.run({ querySelector: ".mermaid" });
  } catch (e) { console.warn("Mermaid nicht geladen", e); }
}

// ---------------------------------------------------------------- Router
async function route() {
  const h = location.hash;
  if (/access_token=|error_description=/.test(h)) { await sbClient(); await syncNow(false); location.hash = "#/fortschritt"; return; }
  const [path, query] = h.replace(/^#\/?/, "").split("?");
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  document.querySelectorAll(".mainnav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#/" + (parts[0] || "")));
  $("#mainnav").classList.remove("open");
  const [v, a, b, c] = parts;
  try {
    if (!v) views.home();
    else if (v === "t") views.topic(a);
    else if (v === "l") await views.lesson(`${a}/${b}`, c);
    else if (v === "suche") await views.suche(new URLSearchParams(query).get("q") || "");
    else if (views[v]) await views[v](a);
    else views.notfound();
  } catch (e) { console.error(e); app.innerHTML = `<h1>Fehler</h1><pre>${esc(e.message)}</pre>`; }
  if (v !== "l") window.scrollTo({ top: 0 });
}

async function boot() {
  const theme = localStorage.getItem("kh.theme"); if (theme) document.documentElement.dataset.theme = theme;
  $("#themeToggle").onclick = () => { const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); const n = cur === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = n; localStorage.setItem("kh.theme", n); };
  $("#menuToggle").onclick = () => $("#mainnav").classList.toggle("open");
  $("#searchForm").onsubmit = (e) => { e.preventDefault(); const q = $("#searchInput").value.trim(); if (q) location.hash = "#/suche?q=" + encodeURIComponent(q); };
  $("#repoLink").href = CFG.repoUrl || "#";
  [S.site, S.questions] = await Promise.all([getJSON("data/site.json"), getJSON("data/questions.json")]);
  $("#buildInfo").textContent = `Stand ${S.site.built.slice(0, 10)} · ${Object.keys(S.site.lessons).length} Lektionen · ${S.questions.length} Fragen`;
  window.addEventListener("hashchange", route);
  await route();
  if (CFG.supabaseUrl) sbUser().then((u) => u && syncNow(true)).catch(() => {});
}
boot().catch((e) => { app.innerHTML = `<h1>Daten konnten nicht geladen werden</h1><pre>${esc(e.message)}</pre><p>Lokal testen: <code>python scripts/build.py && python -m http.server -d dist</code></p>`; });
