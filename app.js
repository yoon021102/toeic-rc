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
  const saveKnown = () => store.set("known", [...known]);
  const saveSolved = () => store.set("solved", solved);

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const days = [...new Set(VOCAB.map(v => v.day))].sort((a, b) => a - b);
  const quizTotal = GRAMMAR.reduce((n, g) => n + g.quiz.length, 0);
  const correctCount = () => Object.values(solved).filter(Boolean).length;

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
    const nextDay = days.find(d => VOCAB.filter(v => v.day === d).some(v => !known.has(v.word))) || days[0];
    const nextTopic = GRAMMAR.find(g => g.quiz.some((_, i) => !solved[g.id + ":" + i])) || GRAMMAR[0];
    $view.innerHTML = `
      <div class="stats">
        <div class="stat"><span class="muted">외운 단어</span><b>${known.size} / ${VOCAB.length}</b><div class="bar"><i style="width:${kPct}%"></i></div></div>
        <div class="stat"><span class="muted">문법 퀴즈 정답</span><b>${correctCount()} / ${quizTotal}</b><div class="bar"><i style="width:${qPct}%"></i></div></div>
      </div>
      <div class="section-title">오늘 이어서 하기</div>
      <a class="card" href="#/vocab/${nextDay}/cards">
        <span class="tag">단어</span><h2>Day ${nextDay} 플래시카드</h2>
        <div class="muted">아직 못 외운 단어 ${VOCAB.filter(v => v.day === nextDay && !known.has(v.word)).length}개</div>
      </a>
      <a class="card" href="#/grammar/${nextTopic.id}">
        <span class="tag">문법</span><h2>${esc(nextTopic.title)}</h2>
        <div class="muted">${esc(nextTopic.summary)}</div>
      </a>
      <a class="card" href="#/tips">
        <span class="tag">팁</span><h2>파트별 시간 배분</h2>
        <div class="muted">Part 5·6은 20분, Part 7은 55분이 목표예요.</div>
      </a>`;
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
    day = day ? +day : days[0];
    setHeader("빈출 단어"); setTab("vocab");
    $view.innerHTML = `
      <div class="chips">${days.map(d => `<a class="chip ${d === day ? "on" : ""}" href="#/vocab/${d}">Day ${d}</a>`).join("")}</div>
      <input class="search" type="search" placeholder="전체 단어 검색 (영어 또는 뜻)" value="${esc(vocabQuery)}">
      <div class="btns" style="margin-bottom:12px">
        <a class="btn" href="#/vocab/${day}/cards">플래시카드</a>
        <a class="btn ghost" href="#/vocab/${day}/cards/unknown">못 외운 것만</a>
      </div>
      <div id="words"></div>`;
    const $words = document.getElementById("words");
    const $search = $view.querySelector(".search");

    function render() {
      const q = vocabQuery.trim().toLowerCase();
      const list = q ? VOCAB.filter(v => v.word.toLowerCase().includes(q) || v.meaning.includes(q))
                     : VOCAB.filter(v => v.day === day);
      $words.innerHTML = list.length ? list.map(v => `
        <div class="card word">
          <button class="check ${known.has(v.word) ? "on" : ""}" data-w="${esc(v.word)}" aria-label="외움 표시">✓</button>
          <div><div><span class="w">${esc(v.word)}</span><span class="pos">${esc(v.pos)}</span></div>
          <div>${esc(v.meaning)}</div><div class="ex-s">${esc(v.ex)}</div></div>
        </div>`).join("") : `<div class="empty">검색 결과가 없어요.</div>`;
      $words.querySelectorAll(".check").forEach(b => b.addEventListener("click", () => {
        const w = b.dataset.w;
        known.has(w) ? known.delete(w) : known.add(w);
        saveKnown(); b.classList.toggle("on");
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

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
