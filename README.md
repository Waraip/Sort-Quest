# Sort Quest - Developer Guide

A browser game that teaches 5 sorting algorithms (Bubble, Selection, Exchange, Pancake, Cycle), with an Auto helper and a built-in Python Lab.
No install, no server: double-click `index.html`.

## Project structure

```
sort_quest_web/
  index.html             page layout (tabs, stage, panels)
  style.css              all styling and animations
  assets/
    char_1.png ... 9     optional character images
    audio/music.mp3      optional background music
  js/                    (loaded in this order by index.html)
    utils.js             tiny helpers ($ and rng)
    config.js            SETTINGS YOU CHANGE: images, colors, music, quips
    audio.js             background music + mute button
    algorithms.js        the sorting algorithms (generators)
    levels.js            text, mascot, buttons, pseudocode for each algorithm
    python-templates.js  Python code for the Python Lab
    game.js              game engine: rounds, rendering, animations, scoring
    auto.js              Auto mode (arrow + 1 second delay)
    lab.js               Python Lab (Pyodide in a Web Worker)
    main.js              tabs + startup
```
Each file starts with a comment explaining what it does. After editing, save and refresh (Ctrl+Shift+R for a hard refresh).

---

## 1. Replace the emojis with your own images (`js/config.js`)

1. Make 9 PNGs named `char_1.png` ... `char_9.png` (transparent background works best) and put them in `assets/`.
2. In `js/config.js` set `const USE_IMAGES = true;`
3. Size: in `style.css` edit `.em img{height:clamp(44px,13vw,72px)}`.
4. Different names or formats (e.g. `.webp`): edit the `IMG` line in `js/config.js`.

Each number always uses the same character, so number 3 is always `char_3.png`.

## 2. Change the background to an image (`style.css`)

Put `bg.jpg` in `assets/`. In `style.css`, find the `body{...}` rule and replace
`background:linear-gradient(160deg,var(--bg1),var(--bg2)) fixed;` with:

```css
background: url("assets/bg.jpg") center/cover fixed no-repeat;
```
To keep the soft pink glow on top, also delete or lower the opacity of the `.blobs` rule. For a simple recolor, just edit `--bg1` and `--bg2` on the first line of `style.css`.

## 3. Background music (`js/config.js`)

```js
const MUSIC_PATH = "assets/audio/music.mp3"; // "" = no music
const MUSIC_VOLUME = 0.35;                   // 0 to 1
```
Change the path to any mp3/wav/ogg/m4a. The music loops and starts after the player's first click (browsers block sound before that). The 🔊 button in the top bar mutes it and remembers the choice. A missing file is skipped silently.

## 4. Other easy changes

| What | Where |
|------|-------|
| Characters (emoji) and number colors | `E` and `P` in `js/config.js` |
| Wrong-answer quips | `WRONG` in `js/config.js` |
| Level text, mascot, button labels, on-screen pseudocode | the entry in `js/levels.js` |
| How many buddies per round | `const N = 5 + Math.floor(Math.random() * 3)` in `start()` in `js/game.js` (5 to 7) |
| Starting hearts | `hearts` in `js/game.js` (state at the top) and the `3` in `start()` and `hud()` |
| Swap animation speed | `duration` in `mv()` in `js/game.js` |
| Auto delay (1 second) | the `1000` at the end of `autoStep()` in `js/auto.js` |
| Arrow look | the `.arrow` rules at the bottom of `style.css` |
| Theme colors | first lines of `style.css` (`--pink`, `--ok`, `--hi`, ...) |
| Fonts | the Google Fonts link in `index.html` and `font-family` in `style.css` |

## 5. Add a new algorithm

1. **`js/algorithms.js`**: write a generator. Each `yield` is one decision for the player.
```js
function* myAlgo() {
  for (let i = 0; i < a.length - 1; i++) {
    const need = a[i] > a[i + 1]; // should these two swap? (the correct answer)
    yield { p: [i, i + 1], need, info: "Step " + i };
  }
}
```
   Useful fields: `p` (pair), `need`, `key` (purple buddy), `dn` (indices shown green), `info` and `chip` (chip text), `ln` / `lnY` (pseudocode line to highlight).
   The engine swaps the pair for you when `need` is true.
2. **`js/levels.js`**: copy an entry and set `gen: myAlgo`, title, mascot, `anim` (`"hop"`, `"shrink"` or `"flip"`), `btn` labels, messages and `code` (the pseudocode lines).
3. **`js/python-templates.js`**: add the Python version to `PY_TEMPLATES` at the same position.

## 6. Python Lab

Pick a template, edit, then **Run** (Ctrl+Enter). **Test sort()** checks your `sort(a)` on about 15 cases and times it on 1500 numbers. **Stop** ends runaway code (it also auto-stops after 10 s). Python is loaded from a CDN the first time (about 10 MB), so you need internet once. Settings: `PYV` (Pyodide version) and the time limit in `js/lab.js`; test cases in `PY_TEST_HARNESS` in `js/python-templates.js`.

## 7. Auto mode

**💡 Auto** draws an arrow to show the move, waits 1 second, then plays it, and repeats until the level ends or you press **⏸ Stop Auto**. Auto never costs hearts and gives no points or finish bonus.

## 8. Share it

Zip the whole folder (keep `js/` and `assets/` next to `index.html`) or drop it on Netlify Drop / GitHub Pages.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Nothing changed | Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) |
| Images do not show | `USE_IMAGES = true`, exact lowercase file names, files inside `assets/` |
| No music | Check `MUSIC_PATH`, click the page once, and make sure 🔊 is not muted |
| Blank game / dead buttons | Open the console (F12). A typo (missing comma or quote) is the usual cause |
| Python Lab stuck on loading | Needs internet the first time |
