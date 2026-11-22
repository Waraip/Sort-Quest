/* ============================================================
   python-templates.js
   Python code for the Python Lab.
   ============================================================ */

/* Python code shown in the Python Lab. Same order as ALGS in levels.js. */
const PY_TEMPLATES = [
  `def sort(a):
    n = len(a)
    for p in range(n - 1):
        swapped = False
        for j in range(n - 1 - p):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a
`,

  `def sort(a):
    n = len(a)
    for i in range(n - 1):
        m = min(range(i, n), key=lambda k: a[k])
        a[i], a[m] = a[m], a[i]
    return a
`,

  `def sort(a):
    n = len(a)
    for i in range(n - 1):
        for j in range(i + 1, n):
            if a[i] > a[j]:
                a[i], a[j] = a[j], a[i]
    return a
`,

  `def sort(a):
    def flip(k):
        a[:k + 1] = a[:k + 1][::-1]   # reverse the first k+1 items

    for size in range(len(a), 1, -1):
        m = max(range(size), key=lambda k: a[k])
        if m != size - 1:
            if m != 0:
                flip(m)          # biggest to the front
            flip(size - 1)       # biggest to the bottom
    return a
`,

  `def sort(a):
    n = len(a)
    for start in range(n - 1):
        item = a[start]
        pos = start + sum(1 for k in range(start + 1, n) if a[k] < item)
        if pos == start:
            continue                      # already home
        while item == a[pos]:             # skip duplicates
            pos += 1
        a[pos], item = item, a[pos]
        while pos != start:               # rest of the cycle
            pos = start + sum(1 for k in range(start + 1, n) if a[k] < item)
            while item == a[pos]:
                pos += 1
            a[pos], item = item, a[pos]
    return a
`,
];

/* Starting code for the "Blank" option. */
const PY_BLANK = `def sort(a):
    # write your own sorting algorithm here!
    return a
`;

/* Appended to your code when you press "Test sort()". Python runs it inside the lab. */
const PY_TEST_HARNESS = `
import random as _r, time as _t
def _check():
    if "sort" not in globals():
        print("Define a function named sort(a) first!"); return
    cases=[[],[7],[2,1],[1,2,3,4,5],[5,4,3,2,1],[3,1,3,2,2,1]]+[_r.sample(range(100),_r.randint(5,12)) for _ in range(6)]+[[_r.randint(0,9) for _ in range(20)] for _ in range(3)]
    for c in cases:
        w=sorted(c); x=list(c); r=sort(x); g=x if r is None else list(r)
        if g!=w:
            print("✘ Failed on", c); print("  you got:  ", g); print("  expected: ", w); return
    print("✔ All", len(cases), "test cases passed!")
    big=_r.sample(range(100000),1500); t=_t.time(); sort(list(big))
    print("⏱ Sorted 1500 numbers in", round((_t.time()-t)*1000), "ms")
_check()
`;
