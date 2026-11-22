/* ============================================================
   lab.js
   Python Lab. Python (Pyodide) runs in a Web Worker so Stop can end runaway code.
   ============================================================ */

// ---------------- PYTHON LAB (Pyodide runs in a Web Worker so Stop works) ----------------
const PYV = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const WSRC = `importScripts("${PYV}pyodide.js");
const R=loadPyodide({indexURL:"${PYV}"}).then(p=>{p.setStdout({batched:m=>postMessage({t:"out",m})});p.setStderr({batched:m=>postMessage({t:"err",m})});postMessage({t:"ready"});return p});
onmessage=async e=>{const p=await R;const g=p.globals.get("dict")();try{await p.runPythonAsync(e.data,{globals:g})}catch(err){postMessage({t:"err",m:String(err.message||err).trim().split("\\n").slice(-4).join("\\n")})}g.destroy();postMessage({t:"done"})}`;
let W = null,
  ready = false,
  tm = 0;
const stat = (t) => ($("pstat").textContent = t);
/** Enable/disable the Run and Test buttons. */
function lock(on) {
  $("run").disabled = on;
  $("test").disabled = on;
}
/** Adds a line to the output console. */
function log(m, c) {
  const d = document.createElement("div");
  if (c) d.className = c;
  d.textContent = m;
  $("out").appendChild(d);
  $("out").scrollTop = 1e9;
}
/** Starts the Python worker (downloads Pyodide the first time). */
function boot() {
  if (W) return;
  ready = false;
  lock(true);
  stat("⏳ Loading Python… (first time downloads ~10 MB)");
  W = new Worker(URL.createObjectURL(new Blob([WSRC], { type: "text/javascript" })));
  W.onmessage = (e) => {
    const d = e.data;
    if (d.t === "ready") {
      ready = true;
      lock(false);
      stat("🟢 Python ready  ·  Ctrl+Enter to run");
    } else if (d.t === "out") log(d.m);
    else if (d.t === "err") log(d.m, "bad");
    else if (d.t === "done") {
      clearTimeout(tm);
      lock(false);
      stat("🟢 Python ready  ·  Ctrl+Enter to run");
    }
  };
  W.onerror = () => stat("🔴 Couldn’t load Python. Check your internet connection and reload.");
}
/** Sends your code (plus optional extra code) to Python. */
function runPy(extra) {
  if (!ready) return;
  lock(true);
  stat("▶ Running…");
  $("out").innerHTML = "";
  W.postMessage($("code").value + (extra || ""));
  tm = setTimeout(() => stopPy("Stopped: ran longer than 10 seconds (infinite loop?)"), 10000);
}
/** Stops runaway code by restarting the worker. */
function stopPy(m) {
  if (!W) return;
  clearTimeout(tm);
  W.terminate();
  W = null;
  log("■ " + (m || "Stopped."), "bad");
  boot();
}
const tpl = $("tpl");
tpl.innerHTML =
  ALGS.map((v, i) => '<option value="' + i + '">' + v.t + "</option>").join("") +
  '<option value="-1">Blank – write your own</option>';
/** Loads the selected template into the editor. */
function loadTpl() {
  const i = +tpl.value;
  $("code").value = (i < 0 ? PY_BLANK : PY_TEMPLATES[i]) + "\nprint(sort([5, 2, 9, 1, 7, 3]))\n";
}
tpl.onchange = loadTpl;
$("run").onclick = () => runPy();
$("test").onclick = () => runPy(PY_TEST_HARNESS);
$("stop").onclick = () => stopPy();
$("code").onkeydown = (e) => {
  const t = e.target;
  if (e.key === "Tab") {
    e.preventDefault();
    const s = t.selectionStart;
    t.value = t.value.slice(0, s) + "    " + t.value.slice(t.selectionEnd);
    t.selectionStart = t.selectionEnd = s + 4;
  }
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runPy();
  }
};
