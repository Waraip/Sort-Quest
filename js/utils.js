/* ============================================================
   utils.js
   Tiny helpers used by every other file.
   ============================================================ */

const $ = (id) => document.getElementById(id); // shortcut for getElementById
const rng = (lo, hi) => Array.from({ length: Math.max(0, hi - lo) }, (_, i) => lo + i); // rng(2,5) -> [2,3,4]
