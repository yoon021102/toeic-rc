// 토익 RC 노트: 화면 라우팅과 학습 기록
(function () {
  const $view = document.getElementById("view");
  const $title = document.getElementById("title");
  const $back = document.getElementById("back");

  // ---- 학습 기록 (기기 안 localStorage에 저장) ----
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("rc:" + key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("rc:" + key, JSON.stringify(value)); } catch (e) {}
    }
  };
  const known = new Set(store.get("known", []));        // 외운 단어
  const solved = store.get("solved", {});               // 문법 퀴즈: { "topicId:idx": true/false }
  let updatedAt = store.get("updatedAt", 0);
  const snapshot = () => ({ known: [...known], solved: Object.assign({}, solved), updatedAt });
  function persist() {
    updatedAt = Date.now();
    store.set("known", [...known]); store.set("solved", solved); store.set("updatedAt", updatedAt);
    if (typeof RC.onChange === "function") RC.onChange(snapshot());
  }
  const saveKnown = persist;
  const saveSolved = persist;
  function applyState(s, opts) {
    if (!s || !Array.isArray(s.known) || typeof s.solved !== "object") return false;
    known.clear(); s.known.forEach(w => known.add(w));
    Object.keys(solved).forEach(k => delete solved[k]); Object.assign(solved, s.solved);
    updatedAt = +s.updatedAt || Date.now();
    store.set("known", [...known]); store.set("solved", solved); store.set("updatedAt", updatedAt);
    if (!opts || opts.rerender !== false) route();
    return true;
  }
  // 외부 저장소(Claude 페이지의 계정 저장)와 연결하기 위한 고리
  const RC = window.RC = { snapshot, applyState, onChange: null };

  // 백업 코드: 기록을 문자열 하나로 만들어 다른 기기로 옮기거나 보관
  const toCode = () => "RC1:" + btoa(unescape(encodeURIComponent(JSON.stringify(snapshot()))));
  function fromCode(code) {
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^RC1:/, "")))));
      s.updatedAt = Date.now();
      return applyState(s) ? s : null;
    } catch (e) { return null; }
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // ---- 발음 듣기 (기기에 내장된 영어 음성 사용) ----
  const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let enVoice = null;
  function pickVoice() {
    if (!canSpeak) return;
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google|Alex|Ava|Allison/i.test(v.name))
      || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, rate) {
    if (!canSpeak) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = enVoice ? enVoice.lang : "en-US";
      if (enVoice) u.voice = enVoice;
      u.rate = rate || 0.9;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const spk = (text, label) => canSpeak
    ? `<button class="spk" data-say="${esc(text)}" aria-label="${label || "발음 듣기"}">${SPK_ICON}</button>` : "";
  const SPK_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  document.addEventListener("click", e => {
    const b = e.target.closest(".spk");
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    speak(b.dataset.say, b.dataset.rate ? +b.dataset.rate : 0.9);
  }, true);

  const days = [...new Set(VOCAB.map(v => v.day))].sort((a, b) => a - b);
  const quizTotal = GRAMMAR.reduce((n, g) => n + g.quiz.length, 0);
  const correctCount = () => Object.values(solved).filter(Boolean).length;

  // ---- 시험 일정: 시작일부터 하루에 Day 하나씩 ----
  const DAY_MS = 86400000;
  const localDate = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  const examDate = localDate(window.EXAM_DATE || "2026-11-22");
  const startDate = localDate(window.STUDY_START || "2026-11-09");
  const dDay = () => Math.round((examDate - today0()) / DAY_MS);
  const todayDay = () => Math.min(days[days.length - 1], Math.max(days[0], Math.floor((today0() - startDate) / DAY_MS) + 1));
  const dayDate = d => { const t = new Date(startDate.getTime() + (d - 1) * DAY_MS); return `${t.getMonth() + 1}/${t.getDate()}`; };
  const theme = d => (window.DAY_THEMES || {})[d] || "";
  const knownIn = d => VOCAB.filter(v => v.day === d && known.has(v.word)).length;
  const countIn = d => VOCAB.filter(v => v.day === d).length;

  function setHeader(title, backTo) {
    $title.textContent = title;
    $back.hidden = !backTo;
    $back.onclick = () => { location.hash = backTo; };
  }
  function setTab(tab) {
    document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
  }

  // ---- 홈 ----
  function home() {
    setHeader("토익 RC 노트"); setTab("home");
    const kPct = Math.round(known.size / VOCAB.length * 100);
    const qPct = Math.round(correctCount() / quizTotal * 100);
    const td = todayDay();
    const behind = days.filter(d => d < td && knownIn(d) < countIn(d));
    const nextTopic = GRAMMAR.find(g => g.quiz.some((_, i) => !solved[g.id + ":" + i])) || GRAMMAR[0];
    const dd = dDay();
    const ddText = dd > 0 ? `D-${dd}` : dd === 0 ? "D-DAY" : "시험 끝!";
    $view.innerHTML = `
      <div class="card dday">
        <div><div class="muted">토익 시험 11월 22일</div><div class="dd">${ddText}</div></div>
        <div class="muted" style="text-align:right">오늘 목표<br><b style="color:var(--text)">Day ${td} 단어 100개</b></div>
      </div>
      <div class="stats">
        <div class="stat"><span class="muted">외운 단어</span><b>${known.size} / ${VOCAB.length}</b><div class="bar"><i style="width:${kPct}%"></i></div></div>
        <div class="stat"><span class="muted">문법 퀴즈 정답</span><b>${correctCount()} / ${quizTotal}</b><div class="bar"><i style="width:${qPct}%"></i></div></div>
      </div>
      <div class="section-title">오늘 이어서 하기</div>
      <a class="card" href="#/vocab/${td}/cards/unknown">
        <div class="row"><span class="tag">오늘의 단어 · ${dayDate(td)}</span><span class="muted">${knownIn(td)} / ${countIn(td)}</span></div>
        <h2>Day ${td} · ${esc(theme(td))}</h2>
        <div class="bar"><i style="width:${Math.round(knownIn(td) / countIn(td) * 100)}%"></i></div>
      </a>
      ${behind.length ? `<a class="card" href="#/vocab/${behind[0]}/cards/unknown">
        <span class="tag">밀린 단어</span><h2>Day ${behind.map(d => d).join(", ")}</h2>
        <div class="muted">못 외운 단어 ${behind.reduce((n, d) => n + countIn(d) - knownIn(d), 0)}개가 남아 있어요. Day ${behind[0]}부터 이어서 하세요.</div>
      </a>` : ""}
      <a class="card" href="#/grammar/${nextTopic.id}">
        <span class="tag">문법</span><h2>${esc(nextTopic.title)}</h2>
        <div class="muted">${esc(nextTopic.summary)}</div>
      </a>
      <a class="card" href="#/tips">
        <span class="tag">팁</span><h2>파트별 시간 배분</h2>
        <div class="muted">Part 5·6은 20분, Part 7은 55분이 목표예요.</div>
      </a>
      <div class="section-title">기록 백업</div>
      <div class="card">
        <div class="muted" id="sync-note" style="margin-bottom:10px">${RC.syncNote || "공부 기록은 이 기기에 저장돼요. 다른 기기로 옮기거나 혹시 몰라 보관하려면 백업 코드를 복사해 두세요."}</div>
        <div class="btns">
          <button class="btn ghost" id="bk-copy">백업 코드 복사</button>
          <button class="btn ghost" id="bk-open">백업 코드로 복원</button>
        </div>
        <div id="bk-area" hidden style="margin-top:10px">
          <textarea id="bk-text" class="search" rows="3" placeholder="RC1:로 시작하는 백업 코드를 붙여넣으세요"></textarea>
          <button class="btn" id="bk-apply">복원하기</button>
        </div>
        <div class="muted" id="bk-msg" style="margin-top:8px" hidden></div>
      </div>`;
    const $area = document.getElementById("bk-area"), $text = document.getElementById("bk-text"), $msg = document.getElementById("bk-msg");
    const say = t => { $msg.hidden = false; $msg.textContent = t; };
    document.getElementById("bk-copy").onclick = () => {
      const code = toCode();
      const fallback = () => { $area.hidden = false; $text.value = code; $text.select(); say("코드를 길게 눌러 복사해 주세요."); };
      try {
        navigator.clipboard.writeText(code).then(() => say(`복사했어요. 메모 앱 등에 붙여넣어 보관하세요. (외운 단어 ${known.size}개)`), fallback);
      } catch (e) { fallback(); }
    };
    document.getElementById("bk-open").onclick = () => { $area.hidden = false; $text.value = ""; $text.focus(); $msg.hidden = true; };
    document.getElementById("bk-apply").onclick = () => {
      const s = fromCode($text.value);
      if (s) { home(); document.getElementById("bk-msg").hidden = false; document.getElementById("bk-msg").textContent = `복원했어요. 외운 단어 ${s.known.length}개를 불러왔어요.`; }
      else say("코드를 읽지 못했어요. RC1:로 시작하는 코드 전체를 붙여넣었는지 확인해 주세요.");
    };
  }

  // ---- 문법 ----
  function grammarList() {
    setHeader("문법"); setTab("grammar");
    $view.innerHTML = GRAMMAR.map(g => {
      const done = g.quiz.filter((_, i) => solved[g.id + ":" + i]).length;
      return `<a class="card" href="#/grammar/${g.id}">
        <div class="row"><span class="tag">${esc(g.part)}</span><span class="muted">퀴즈 ${done}/${g.quiz.length}</span></div>
        <h2>${esc(g.title)}</h2><div class="muted">${esc(g.summary)}</div></a>`;
    }).join("");
  }

  function grammarDetail(id) {
    const g = GRAMMAR.find(x => x.id === id);
    if (!g) return grammarList();
    setHeader(g.title, "#/grammar"); setTab("grammar");
    $view.innerHTML = `
      <div class="card"><span class="tag">${esc(g.part)}</span><div>${esc(g.summary)}</div></div>
      <div class="section-title">핵심 포인트</div>
      <div class="card"><ul class="points">${g.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>
      <div class="section-title">예문</div>
      <div class="card">${g.examples.map(e => `<div class="ex"><div class="en">${e.en}</div><div class="muted">${esc(e.ko)}</div></div>`).join("")}</div>
      <div class="section-title">확인 퀴즈</div>
      ${g.quiz.map((q, i) => `
        <div class="card" data-q="${i}">
          <div class="q">${i + 1}. ${esc(q.q)}</div>
          <div class="choices">${q.choices.map((c, j) => `<button class="choice" data-j="${j}">(${"ABCD"[j]}) ${esc(c)}</button>`).join("")}</div>
          <div class="why" hidden></div>
        </div>`).join("")}`;

    $view.querySelectorAll("[data-q]").forEach(box => {
      const i = +box.dataset.q, q = g.quiz[i];
      box.querySelectorAll(".choice").forEach(btn => btn.addEventListener("click", () => {
        if (box.dataset.done) return;
        box.dataset.done = "1";
        const j = +btn.dataset.j, ok = j === q.answer;
        btn.classList.add(ok ? "right" : "wrong");
        box.querySelector(`[data-j="${q.answer}"]`).classList.add("right");
        const why = box.querySelector(".why");
        why.hidden = false;
        why.textContent = (ok ? "정답! " : `정답은 (${"ABCD"[q.answer]}) ${q.choices[q.answer]}. `) + q.why;
        // 한 번이라도 맞히면 정답으로 기록
        solved[g.id + ":" + i] = ok || !!solved[g.id + ":" + i];
        saveSolved();
      }));
    });
  }

  // ---- 단어 ----
  let vocabQuery = "";
  function vocabList(day) {
    day = day ? +day : todayDay();
    setHeader("빈출 단어"); setTab("vocab");
    $view.innerHTML = `
      <div class="chips">${days.map(d => `<a class="chip ${d === day ? "on" : ""}${knownIn(d) === countIn(d) ? " done" : ""}" href="#/vocab/${d}">Day ${d}</a>`).join("")}</div>
      <div class="row" style="margin:0 4px 10px"><div><b>${esc(theme(day))}</b> <span class="muted">· ${dayDate(day)}</span></div><span class="muted">외움 ${knownIn(day)} / ${countIn(day)}</span></div>
      <input class="search" type="search" placeholder="전체 단어 검색 (영어 또는 뜻)" value="${esc(vocabQuery)}">
      <div class="btns" style="margin-bottom:12px">
        <a class="btn" href="#/vocab/${day}/cards">플래시카드</a>
        <a class="btn ghost" href="#/vocab/${day}/cards/unknown">못 외운 것만</a>
      </div>
      <div id="words"></div>`;
    const $chips = $view.querySelector(".chips"), $on = $chips.querySelector(".chip.on");
    if ($on) $chips.scrollLeft = $on.offsetLeft - ($chips.clientWidth - $on.offsetWidth) / 2;
    const $words = document.getElementById("words");
    const $search = $view.querySelector(".search");

    function render() {
      const q = vocabQuery.trim().toLowerCase();
      const list = q ? VOCAB.filter(v => v.word.toLowerCase().includes(q) || v.meaning.includes(q))
                     : VOCAB.filter(v => v.day === day);
      $words.innerHTML = list.length ? list.map(v => `
        <div class="card word">
          <button class="check ${known.has(v.word) ? "on" : ""}" data-w="${esc(v.word)}" aria-label="외움 표시">✓</button>
          <div><div><span class="w">${esc(v.word)}</span><span class="pos">${esc(v.pos)}</span>${spk(v.word)}</div>
          <div>${esc(v.meaning)}</div><div class="ex-s">${esc(v.ex)}</div></div>
        </div>`).join("") : `<div class="empty">검색 결과가 없어요.</div>`;
      $words.querySelectorAll(".check").forEach(b => b.addEventListener("click", () => {
        const w = b.dataset.w;
        known.has(w) ? known.delete(w) : known.add(w);
        saveKnown(); b.classList.toggle("on");
        const c = $view.querySelector(".row .muted:last-child");
        if (c && !vocabQuery.trim()) c.textContent = `외움 ${knownIn(day)} / ${countIn(day)}`;
      }));
    }
    $search.addEventListener("input", () => { vocabQuery = $search.value; render(); });
    render();
  }

  function flashcards(day, mode) {
    day = +day;
    let deck = VOCAB.filter(v => v.day === day && (mode !== "unknown" || !known.has(v.word)));
    deck = deck.sort(() => Math.random() - 0.5);
    setHeader(`Day ${day} 플래시카드`, `#/vocab/${day}`); setTab("vocab");
    if (!deck.length) {
      $view.innerHTML = `<div class="empty">Day ${day} 단어를 모두 외웠어요! 🎉</div>
        <a class="btn ghost" href="#/vocab/${day}/cards">전체 다시 보기</a>`;
      return;
    }
    let i = 0, flipped = false;
    function render() {
      const v = deck[i];
      $view.innerHTML = `
        <div class="muted" style="text-align:center;margin-bottom:8px">${i + 1} / ${deck.length}</div>
        <div class="card flash" id="card">
          <div class="big">${esc(v.word)}</div><div class="muted">${esc(v.pos)}</div>
          ${canSpeak ? `<div class="say-row"><button class="spk pill" data-say="${esc(v.word)}">${SPK_ICON} 단어</button><button class="spk pill" data-say="${esc(v.ex)}" data-rate="0.85">${SPK_ICON} 예문</button></div>` : ""}
          ${flipped ? `<div class="meaning">${esc(v.meaning)}</div><div class="muted" style="margin-top:8px">${esc(v.ex)}</div>`
                    : `<div class="muted" style="margin-top:16px">탭해서 뜻 보기</div>`}
        </div>
        <div class="btns">
          <button class="btn ghost" id="again">다시 볼래요</button>
          <button class="btn" id="got">외웠어요</button>
        </div>`;
      document.getElementById("card").onclick = () => { flipped = !flipped; render(); };
      document.getElementById("again").onclick = () => { known.delete(v.word); saveKnown(); next(); };
      document.getElementById("got").onclick = () => { known.add(v.word); saveKnown(); next(); };
    }
    function next() {
      flipped = false; i++;
      if (i >= deck.length) {
        $view.innerHTML = `<div class="empty">한 바퀴 끝! 외운 단어 ${deck.filter(v => known.has(v.word)).length} / ${deck.length}</div>
          <div class="btns"><a class="btn ghost" href="#/vocab/${day}">목록으로</a>
          <a class="btn" href="#/vocab/${day}/cards/unknown?r=${Date.now()}">못 외운 것 다시</a></div>`;
        return;
      }
      render();
    }
    render();
  }

  // ---- 팁 ----
  function tips() {
    setHeader("파트별 팁"); setTab("tips");
    $view.innerHTML = TIPS.map(t => `
      <div class="card"><span class="tag">${esc(t.part)}</span><h2>${esc(t.title)}</h2>
      <div class="muted" style="margin-bottom:10px">${esc(t.time)}</div>
      <ul class="points">${t.tips.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("");
  }

  // ---- 라우터 ----
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
    window.scrollTo(0, 0);
    if (parts[0] === "grammar") parts[1] ? grammarDetail(parts[1]) : grammarList();
    else if (parts[0] === "vocab") parts[2] === "cards" ? flashcards(parts[1], parts[3]) : vocabList(parts[1]);
    else if (parts[0] === "tips") tips();
    else home();
  }
  window.addEventListener("hashchange", route);
  route();

  // 브라우저가 저장 공간을 임의로 비우지 않도록 요청 (지원하는 경우)
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
