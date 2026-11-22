/* ============================================================
   main.js
   Tabs and startup. Loaded last.
   ============================================================ */

/** Switches between the Play and Python Lab tabs. */
function tab(t) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.t === t));
  $("play").hidden = t !== "play";
  $("lab").hidden = t !== "lab";
  if (t === "lab") {
    boot();
    if (!$("code").value) loadTpl();
  }
}
document.querySelectorAll(".tab").forEach((b) => (b.onclick = () => tab(b.dataset.t)));
/** Opens the Python Lab with the current algorithm's code. */
function openLab() {
  tpl.value = ALG;
  loadTpl();
  tab("lab");
}
$("tolab").onclick = openLab;
intro();
