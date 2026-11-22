/* ============================================================
   auto.js
   Auto mode: draws an arrow, waits 1 second, then plays the correct move.
   ============================================================ */

/** Removes the Auto arrow. */
function clearArrow() {
  document.querySelectorAll(".arrow").forEach((e) => e.remove());
}
/** Turns Auto mode off. */
function stopAuto() {
  auto = false;
  clearTimeout(at);
  clearArrow();
  if (autoBtn) autoBtn.textContent = "💡 Auto";
}
/** Auto button handler. */
function toggleAuto() {
  if (auto) {
    stopAuto();
    return;
  }
  auto = true;
  autoBtn.textContent = "⏸ Stop Auto";
  autoStep();
}
/** Draws an arrow from buddy x to buddy y with a label (noPath = label only). */
function arrow(x, y, label, noPath) {
  clearArrow();
  const st = $("stage"),
    r = st.getBoundingClientRect(),
    cx = (i) => {
      const b = $("b" + i).getBoundingClientRect();
      return b.left + b.width / 2 - r.left;
    };
  const x1 = cx(x),
    x2 = cx(y),
    y0 = 122,
    mid = (x1 + x2) / 2,
    s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("class", "arrow");
  s.setAttribute("width", r.width);
  s.setAttribute("height", 140);
  let h = "";
  if (noPath) h = '<text x="' + mid + '" y="100" text-anchor="middle">' + label + "</text>";
  else {
    const cy = Math.max(10, y0 - 45 - Math.abs(x2 - x1) * 0.4),
      ang = (Math.atan2(y0 - cy, x2 - mid) * 180) / Math.PI,
      top = (y0 + cy) / 2;
    h =
      '<path pathLength="1" d="M' +
      x1 +
      " " +
      y0 +
      " Q" +
      mid +
      " " +
      cy +
      " " +
      x2 +
      " " +
      y0 +
      '"/><polygon class="head" points="0,0 -14,-8 -14,8" transform="translate(' +
      x2 +
      "," +
      y0 +
      ") rotate(" +
      ang +
      ')"/><text x="' +
      mid +
      '" y="' +
      (top - 8) +
      '" text-anchor="middle">' +
      label +
      "</text>";
  }
  s.innerHTML = h;
  st.appendChild(s);
}
/** Shows the arrow, waits 1 second (the 1000 below), then plays the correct move. */
function autoStep() {
  if (!auto || S.done || busy) return;
  S.usedAuto = 1;
  const A = ALGS[ALG],
    tag = (t) => t.replace(/[^\x00-\x7F]/g, "").trim();
  if (step.pick) {
    const f = step.from,
      m = a.indexOf(Math.min(...a.slice(f)));
    if (m === f) arrow(f, f, "Already the smallest!", 1);
    else arrow(m, f, "Smallest → front");
  } else {
    const [x, y] = step.p;
    if (step.need && x !== y) arrow(x, y, tag(A.btn[0]));
    else arrow(x, y, step.need ? "Already home" : tag(A.btn[1]), 1);
  }
  $("msg").textContent = "🤖 Auto: watch the arrow…";
  clearTimeout(at);
  at = setTimeout(() => {
    clearArrow();
    if (!auto) return;
    if (step.pick) pickSel(a.indexOf(Math.min(...a.slice(step.from))), 1);
    else ans(step.need, 1);
  }, 1000);
}
