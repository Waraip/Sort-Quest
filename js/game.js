/* ============================================================
   game.js
   The game engine: rounds, rendering, animations, scoring.
   ============================================================ */

/* ===== GAME STATE ===== */
let ALG = 0; // index of the selected algorithm in ALGS
let hearts = 3;
let score = 0;
let gen = null; // the running algorithm generator
let step = null; // the current decision {p, need, key, dn, ...}
let S = {}; // this round: {cmp, mv, done, ln, usedAuto}
let busy = false; // true while a swap animation plays
let rt = 0; // restart timer (after losing all hearts)
let auto = false; // Auto mode on/off
let at = 0; // Auto mode timer
let autoBtn = null; // the Auto button element

/** Builds the row of algorithm buttons at the top. */
function chips() {
  $("algs").innerHTML = ALGS.map(
    (v, i) =>
      '<button class="alg' +
      (i === ALG ? " on" : "") +
      '" data-i="' +
      i +
      '"><span>' +
      v.face +
      "</span>" +
      v.t.replace(" Sort", "") +
      "</button>",
  ).join("");
}
$("algs").onclick = (e) => {
  const b = e.target.closest(".alg");
  if (b) {
    ALG = +b.dataset.i;
    clearTimeout(rt);
    hearts = 3;
    intro();
  }
};
/** Updates the header (episode, title), hearts and score. */
function hud() {
  const v = ALGS[ALG];
  $("ep").textContent = "ALGORITHM · " + v.ep;
  $("ttl").textContent = v.t;
  $("sub").textContent = v.sub;
  $("lvl").textContent = "Algorithm " + (ALG + 1) + "/" + ALGS.length;
  $("hearts").textContent = "❤️".repeat(hearts) + "🖤".repeat(3 - hearts);
  $("score").textContent = "⭐ " + score;
}
/** Shows the mascot intro card for the selected algorithm. */
function intro() {
  const v = ALGS[ALG];
  stopAuto();
  chips();
  hud();
  busy = false;
  $("game").hidden = true;
  $("intro").hidden = false;
  $("intro").innerHTML =
    '<div class="say"><div class="face">' +
    v.face +
    "</div><div><b>" +
    v.who +
    ":</b> " +
    v.intro +
    '</div></div><div class="chips" style="margin:10px 0">' +
    v.facts.map((f) => '<span class="chip">' + f + "</span>").join("") +
    "</div><p>" +
    v.rule +
    '</p><div style="text-align:center"><button id="go">Start!</button></div>';
  $("go").onclick = start;
}
/** Starts a round: random numbers (never pre-sorted), fresh generator, first step. */
function start() {
  hearts = 3;
  busy = false;
  const N = 5 + Math.floor(Math.random() * 3);
  do {
    a = [];
    while (a.length < N) {
      const n = 1 + Math.floor(Math.random() * 9);
      if (!a.includes(n)) a.push(n);
    }
  } while (a.every((v, i) => !i || a[i - 1] < v));
  S = { cmp: 0, mv: 0, done: false, ln: 0 };
  gen = ALGS[ALG].gen();
  hud();
  $("intro").hidden = true;
  $("game").hidden = false;
  $("msg").textContent = ALGS[ALG].rule;
  advance();
}
/** Asks the algorithm for its next decision, or finishes the level. */
function advance() {
  const r = gen.next();
  if (r.done) {
    finish();
    return;
  }
  step = r.value;
  render();
}
/** Draws the pseudocode panel (highlights line S.ln). */
function codeR() {
  $("pcode").innerHTML = ALGS[ALG].code
    .map(
      (t, i) =>
        '<div class="ln' +
        (i === S.ln ? " on" : "") +
        '">' +
        t.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
        "</div>",
    )
    .join("");
}
/** Highlights one pseudocode line. */
function hl(n) {
  S.ln = n;
  codeR();
}
/** Redraws the stage, mini chart, chips, pseudocode and buttons for the current step. */
function render() {
  const A = ALGS[ALG],
    st = $("stage");
  st.innerHTML = "";
  $("mini").innerHTML = "";
  const dn = new Set(S.done ? rng(0, a.length) : step.dn || []),
    pr = S.done ? [] : step.p || [];
  a.forEach((v, x) => {
    const d = document.createElement("div");
    d.className = "ch";
    d.id = "b" + x;
    d.style.setProperty("--c", P[v - 1]);
    d.innerHTML =
      '<i class="bub">' +
      v +
      '</i><b class="em">' +
      (USE_IMAGES ? '<img src="' + IMG(v) + '" alt="' + v + '">' : E[v - 1]) +
      '</b><u class="ped"></u>';
    if (S.done) {
      d.classList.add("done", "dance");
      d.style.animationDelay = x * 90 + "ms";
    } else if (step.pick && x >= step.from) {
      d.classList.add("pick");
      d.onclick = () => pickSel(x);
    } else if (step.key === x) d.classList.add("key");
    else if (pr.includes(x)) d.classList.add("hi");
    else if (dn.has(x)) d.classList.add("done");
    st.appendChild(d);
    const m = document.createElement("div");
    m.className = "mb";
    m.style.height = v * 9 + 14 + "px";
    m.style.background = P[v - 1];
    m.textContent = v;
    $("mini").appendChild(m);
  });
  S.ln = S.done ? -1 : step.ln !== undefined ? step.ln : A.ln;
  $("s1").textContent = S.done ? "Finished" : step.info;
  $("s2").textContent = "Compares " + S.cmp;
  $("s3").textContent = "Swaps " + S.mv;
  $("s4").textContent = S.done ? "sorted! ✓" : step.chip || "pair = " + a[step.p[0]] + ", " + a[step.p[1]];
  const c = $("ctl");
  c.innerHTML = "";
  if (S.done) {
    btn("Next algorithm ▶", () => {
      ALG = (ALG + 1) % ALGS.length;
      intro();
    });
    btn("Replay ↻", start, 1);
    btn("🐍 Python Lab", openLab, 2);
  } else {
    if (!step.pick) {
      btn(A.btn[0], () => ans(true));
      btn(A.btn[1], () => ans(false), 1);
    }
    autoBtn = btn(auto ? "⏸ Stop Auto" : "💡 Auto", toggleAuto, 2);
  }
  codeR();
  if (auto && !S.done) autoStep();
}
/** Adds a button to the controls row. alt: 1 = yellow, 2 = ghost. */
function btn(t, f, alt) {
  const b = document.createElement("button");
  b.textContent = t;
  if (alt) b.className = alt === 2 ? "ghost" : "alt";
  b.onclick = f;
  $("ctl").appendChild(b);
  return b;
}
/** Animates two buddies swapping (kind: hop | shrink | flip), then swaps them in the array and calls cb. */
function mv(x, y, t, cb) {
  busy = true;
  S.mv++;
  const A = $("b" + x),
    B = $("b" + y),
    dx = B.getBoundingClientRect().left - A.getBoundingClientRect().left;
  const o = { duration: t === "shrink" ? 900 : 650, easing: "ease-in-out", fill: "forwards" };
  const F = (px, py, r, s, f) => ({
    transform: "translate(" + px + "px," + py + "px) rotate(" + r + "deg) scale(" + s + ")",
    offset: f,
  });
  let ka, kb;
  if (t === "hop") {
    ka = [F(0, 0, 0, 1), F(dx / 2, -120, -14, 1.1), F(dx, 0, 0, 1)];
    kb = [F(0, 0, 0, 1), F(-dx / 2, 20, 0, 0.85), F(-dx, 0, 0, 1)];
  } else if (t === "shrink") {
    A.style.transformOrigin = B.style.transformOrigin = "bottom";
    ka = [F(0, 0, 0, 1, 0), F(0, 0, 0, 0.2, 0.3), F(dx, 0, 0, 0.2, 0.7), F(dx, 0, 0, 1, 1)];
    kb = [F(0, 0, 0, 1, 0), F(0, 0, 0, 0.2, 0.3), F(-dx, 0, 0, 0.2, 0.7), F(-dx, 0, 0, 1, 1)];
  } else {
    ka = [F(0, 0, 0, 1), F(dx / 2, -70, 180, 1.15), F(dx, 0, 360, 1)];
    kb = [F(0, 0, 0, 1), F(-dx / 2, 0, 0, 0.85), F(-dx, 0, 0, 1)];
  }
  A.style.zIndex = 3;
  A.animate(ka, o);
  B.animate(kb, o).onfinish = () => {
    [a[x], a[y]] = [a[y], a[x]];
    busy = false;
    cb();
  };
}
/** Wrong answer: lose a heart, shake the buddy, restart if out of hearts. */
function wrong(x) {
  hearts--;
  hud();
  $("msg").textContent = WRONG[Math.floor(Math.random() * WRONG.length)];
  const e = $("b" + x);
  if (e) {
    e.classList.add("shake");
    setTimeout(() => e.classList.remove("shake"), 300);
  }
  if (hearts <= 0) {
    $("msg").textContent = "Out of hearts! Let’s try again.";
    busy = true;
    rt = setTimeout(start, 1400);
  }
}
/** Right answer: show a message and add points (no points in Auto mode). */
function good(m) {
  score += auto ? 0 : 10;
  hud();
  $("msg").textContent = m;
}
/** Level cleared. */
function finish() {
  stopAuto();
  S.done = true;
  if (!S.usedAuto) score += hearts * 20;
  hud();
  render();
  $("msg").textContent =
    (S.usedAuto ? "🤖 Auto-solved! Try it yourself next time for bonus points. " : "🎉 ") + ALGS[ALG].win;
}
/** Player answered a Swap/Skip step. yes = what they chose, fa = true when Auto is playing. */
function ans(yes, fa) {
  if (busy || S.done || step.pick || (auto && !fa)) return;
  const A = ALGS[ALG],
    [x, y] = step.p;
  if (yes !== step.need) {
    wrong(x);
    return;
  }
  S.cmp++;
  if (!yes) {
    if (A.lnN !== undefined) hl(A.lnN);
    good(A.no);
    advance();
    return;
  }
  hl(step.lnY !== undefined ? step.lnY : step.ln !== undefined ? step.ln : A.lnY);
  if (x === y) {
    good("Already in the right place. Nothing to move!");
    advance();
    return;
  }
  good(A.yes);
  mv(x, y, A.anim, advance);
}
/** Player clicked a buddy in a selection-sort step. */
function pickSel(x, fa) {
  if (busy || S.done || !step.pick || x < step.from || (auto && !fa)) return;
  const f = step.from,
    A = ALGS[ALG];
  if (a[x] !== Math.min(...a.slice(f))) {
    wrong(x);
    return;
  }
  S.cmp += a.length - f - 1;
  hl(A.lnY);
  $("s4").textContent = "min = " + a[x];
  good(A.yes);
  if (x === f) advance();
  else mv(f, x, A.anim, advance);
}
