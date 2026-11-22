/* ============================================================
   algorithms.js
   The sorting algorithms, written as generators.
   Each `yield` is ONE decision for the player:
     p    = the pair of indices to compare/swap      need = should they swap? (the correct answer)
     key  = highlighted purple buddy (cycle start, biggest pancake, spot being fixed)
     dn   = indices shown green (already placed)     info/chip = text shown in the chips
     ln/lnY = pseudocode line to highlight (decision / after swapping)
   The engine swaps p[0] and p[1] when need is true, then resumes the generator.
   A step with p = [x, x] and need = false is a "nothing to do here" step.
   To add an algorithm: write a generator here, then add it to levels.js.
   ============================================================ */

let a = []; // the numbers on screen (shared with game.js)

/** Compare neighbours; the biggest floats to the end each pass. */
function* bubble() {
  const n = a.length;
  for (let p = 0; p < n - 1; p++) {
    let s = 0;
    for (let j = 0; j < n - 1 - p; j++) {
      const need = a[j] > a[j + 1];
      yield { p: [j, j + 1], need, info: "Pass " + (p + 1), dn: rng(n - p, n) };
      if (need) s++;
    }
    if (!s) return;
  }
}
/** Player picks the smallest of the unsorted part; it swaps to the front. */
function* selection() {
  const n = a.length;
  for (let i = 0; i < n - 1; i++)
    yield { pick: 1, from: i, info: "Round " + (i + 1), chip: "min = ?", dn: rng(0, i) };
}
/** Fix one spot at a time: compare it with EVERY later buddy and swap whenever it is bigger. */
function* exchange() {
  const n = a.length;
  for (let i = 0; i < n - 1; i++)
    for (let j = i + 1; j < n; j++) {
      const need = a[i] > a[j];
      yield {
        p: [i, j],
        need,
        key: i,
        info: "Spot " + (i + 1),
        chip: "a[" + (i + 1) + "] = " + a[i],
        dn: rng(0, i),
      };
    }
}
/** Flip the biggest pancake to the top, then flip it down to the bottom of the unsorted stack.
    A flip of the first k+1 buddies is played as a series of swaps (0,k), (1,k-1), ... */
function* pancake() {
  const n = a.length;
  for (let size = n; size > 1; size--) {
    const mx = Math.max(...a.slice(0, size)),
      m = a.indexOf(mx),
      dn = rng(size, n);
    if (m === size - 1) {
      yield { p: [m, m], need: false, key: m, ln: 1, info: "Stack of " + size, chip: "max " + mx + " is home", dn };
      continue;
    }
    if (m > 0)
      for (let i = 0; i < m - i; i++)
        yield {
          p: [i, m - i],
          need: true,
          key: a.indexOf(mx),
          ln: 2,
          info: "Flip to top",
          chip: "flip first " + (m + 1),
          dn,
        };
    for (let i = 0; i < size - 1 - i; i++)
      yield {
        p: [i, size - 1 - i],
        need: true,
        key: a.indexOf(mx),
        ln: 3,
        info: "Flip to bottom",
        chip: "flip first " + size,
        dn,
      };
  }
}
/** Find where the buddy at the cycle start belongs (count the smaller ones), swap it home, repeat until the cycle closes. */
function* cycle() {
  const n = a.length;
  const home = (s) => {
    let c = 0;
    for (let k = s + 1; k < n; k++) if (a[k] < a[s]) c++;
    return s + c;
  };
  for (let s = 0; s < n - 1; s++) {
    let pos = home(s);
    if (pos === s) {
      yield {
        p: [s, s],
        need: false,
        key: s,
        info: "Cycle start " + (s + 1),
        chip: "item " + a[s] + " is home",
        dn: rng(0, s),
      };
      continue;
    }
    while (pos !== s) {
      yield {
        p: [s, pos],
        need: true,
        key: s,
        info: "Cycle start " + (s + 1),
        chip: "item " + a[s] + " → slot " + (pos + 1),
        dn: rng(0, s),
      };
      pos = home(s);
    }
  }
}
