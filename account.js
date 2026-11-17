// 회원 가입 / 로그인 (이메일, 구글) 과 학습 기록 클라우드 동기화.
// firebase-config.js 에 설정이 있을 때만 켜집니다.
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const cfg = window.FIREBASE_CONFIG;
const $btn = document.getElementById("account");

if (!cfg || !cfg.apiKey) {
  $btn.hidden = true;
} else {
  start().catch(err => {
    console.error(err);
    $btn.hidden = true;
  });
}

async function start() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + "firebase-app.js"),
    import(SDK + "firebase-auth.js"),
    import(SDK + "firebase-firestore.js"),
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  // 로그인 상태를 기기에 저장 → 다음에 열면 자동 로그인
  await A.setPersistence(auth, A.indexedDBLocalPersistence).catch(() => A.setPersistence(auth, A.browserLocalPersistence));
  const db = F.getFirestore(app);
  const RC = window.RC;

  let user = null, unsub = null, writeTimer = null, lastWritten = 0;
  const sheet = buildSheet();

  $btn.hidden = false;
  $btn.onclick = () => sheet.open();

  // 구글 리디렉션 로그인에서 돌아온 경우 처리
  A.getRedirectResult(auth).catch(e => sheet.error(e));

  A.onAuthStateChanged(auth, async u => {
    user = u;
    if (unsub) { unsub(); unsub = null; }
    RC.onChange = null;
    $btn.textContent = u ? (u.displayName || u.email || "내 계정").slice(0, 1).toUpperCase() : "로그인";
    $btn.classList.toggle("on", !!u);
    sheet.render();
    if (!u) return;

    const ref = F.doc(db, "users", u.uid);
    // 처음 로그인: 서버 기록과 이 기기 기록 중 더 최근 것을 사용
    const snap = await F.getDoc(ref);
    const local = RC.snapshot();
    const remote = snap.exists() ? snap.data() : null;
    if (remote && (remote.updatedAt || 0) > (local.updatedAt || 0)) {
      RC.applyState(remote);
    } else {
      await save(ref, local);
    }
    // 기록이 바뀌면 서버에 저장 (1초 모아서)
    RC.onChange = s => {
      clearTimeout(writeTimer);
      writeTimer = setTimeout(() => save(ref, s), 1000);
    };
    // 다른 기기에서 바뀐 기록 받아오기
    unsub = F.onSnapshot(ref, d => {
      const r = d.data();
      if (r && r.updatedAt > lastWritten && r.updatedAt > (RC.snapshot().updatedAt || 0)) RC.applyState(r);
    });
    sheet.render();
  });

  async function save(ref, s) {
    lastWritten = s.updatedAt;
    try {
      await F.setDoc(ref, { known: s.known, solved: s.solved, updatedAt: s.updatedAt });
      sheet.synced(true);
    } catch (e) { console.error(e); sheet.synced(false); }
  }

  function buildSheet() {
    const el = document.createElement("div");
    el.className = "sheet-bg";
    el.hidden = true;
    el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="계정"><div id="acc-body"></div></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el) close(); });
    const $body = el.querySelector("#acc-body");
    let mode = "login", msg = "", syncOk = null;

    function open() { el.hidden = false; msg = ""; render(); }
    function close() { el.hidden = true; }
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    function render() {
      if (el.hidden) return;
      if (user) {
        $body.innerHTML = `
          <h2>내 계정</h2>
          <div class="muted">${esc(user.displayName ? user.displayName + " · " : "")}${esc(user.email || "")}</div>
          <div class="card" style="margin-top:14px">
            <b>학습 기록이 계정에 저장돼요</b>
            <div class="muted" style="margin-top:4px">외운 단어와 퀴즈 기록이 자동으로 저장되고, 다른 기기에서 로그인해도 이어서 볼 수 있어요.
            ${syncOk === false ? "<br><span style='color:var(--bad)'>방금 저장에 실패했어요. 인터넷 연결을 확인해 주세요.</span>" : ""}</div>
          </div>
          <div class="btns"><button class="btn ghost" id="acc-close">닫기</button><button class="btn ghost" id="acc-out">로그아웃</button></div>`;
        $body.querySelector("#acc-close").onclick = close;
        $body.querySelector("#acc-out").onclick = async () => { await A.signOut(auth); close(); };
        return;
      }
      const signup = mode === "signup";
      $body.innerHTML = `
        <h2>${signup ? "회원 가입" : "로그인"}</h2>
        <div class="muted" style="margin-bottom:14px">로그인하면 학습 기록이 계정에 저장되고, 다음부터는 자동으로 로그인돼요.</div>
        <button class="btn google" id="acc-google"><svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Google 계정으로 계속하기</button>
        <div class="or"><span>또는 이메일</span></div>
        <form id="acc-form">
          <input class="search" id="acc-email" type="email" autocomplete="email" placeholder="이메일" required>
          <input class="search" id="acc-pw" type="password" autocomplete="${signup ? "new-password" : "current-password"}" placeholder="비밀번호 (6자 이상)" minlength="6" required>
          ${signup ? `<input class="search" id="acc-pw2" type="password" autocomplete="new-password" placeholder="비밀번호 확인" minlength="6" required>` : ""}
          <button class="btn" type="submit">${signup ? "가입하기" : "로그인"}</button>
        </form>
        <div class="muted" id="acc-msg" style="margin-top:10px;${msg ? "" : "display:none"}">${esc(msg)}</div>
        <div class="row" style="margin-top:14px">
          <button class="link" id="acc-switch">${signup ? "이미 계정이 있어요 → 로그인" : "처음이에요 → 회원 가입"}</button>
          ${signup ? "" : `<button class="link" id="acc-reset">비밀번호 찾기</button>`}
        </div>
        <button class="btn ghost" id="acc-close" style="margin-top:14px;width:100%">로그인 없이 쓰기</button>`;
      $body.querySelector("#acc-close").onclick = close;
      $body.querySelector("#acc-switch").onclick = () => { mode = signup ? "login" : "signup"; msg = ""; render(); };
      const $email = $body.querySelector("#acc-email"), $pw = $body.querySelector("#acc-pw");
      if (!signup) $body.querySelector("#acc-reset").onclick = async () => {
        if (!$email.value) return say("이메일을 먼저 입력해 주세요.");
        try { await A.sendPasswordResetEmail(auth, $email.value.trim()); say("비밀번호 재설정 메일을 보냈어요. 메일함을 확인해 주세요."); }
        catch (e) { error(e); }
      };
      $body.querySelector("#acc-google").onclick = async () => {
        const provider = new A.GoogleAuthProvider();
        try { await A.signInWithPopup(auth, provider); close(); }
        catch (e) {
          if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) {
            A.signInWithRedirect(auth, provider);
          } else error(e);
        }
      };
      $body.querySelector("#acc-form").onsubmit = async e => {
        e.preventDefault();
        const email = $email.value.trim(), pw = $pw.value;
        try {
          if (signup) {
            if (pw !== $body.querySelector("#acc-pw2").value) return say("비밀번호 확인이 일치하지 않아요.");
            await A.createUserWithEmailAndPassword(auth, email, pw);
          } else {
            await A.signInWithEmailAndPassword(auth, email, pw);
          }
          close();
        } catch (err) { error(err); }
      };
    }
    function say(t) { msg = t; const m = $body.querySelector("#acc-msg"); if (m) { m.style.display = ""; m.textContent = t; } }
    function error(e) {
      const M = {
        "auth/email-already-in-use": "이미 가입된 이메일이에요. 로그인해 주세요.",
        "auth/invalid-email": "이메일 형식이 올바르지 않아요.",
        "auth/weak-password": "비밀번호는 6자 이상이어야 해요.",
        "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않아요.",
        "auth/wrong-password": "이메일 또는 비밀번호가 맞지 않아요.",
        "auth/user-not-found": "가입되지 않은 이메일이에요.",
        "auth/too-many-requests": "시도가 너무 많아요. 잠시 뒤 다시 해 주세요.",
        "auth/popup-closed-by-user": "구글 로그인 창이 닫혔어요.",
        "auth/network-request-failed": "인터넷 연결을 확인해 주세요.",
        "auth/unauthorized-domain": "이 주소가 Firebase 승인 도메인에 없어요. 설정을 확인해 주세요.",
      };
      say(M[e && e.code] || "문제가 생겼어요: " + ((e && e.code) || e));
      if (el.hidden) open();
    }
    function synced(ok) { syncOk = ok; render(); }
    return { open, render, error, synced };
  }
}
