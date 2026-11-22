/* ============================================================
   config.js
   Settings you are likely to change: images, colors, music, quips.
   ============================================================ */

/* ----- Characters ----- */
// Set USE_IMAGES = true and put char_1.png ... char_9.png in ./assets to replace the emoji.
const USE_IMAGES = false;
const IMG = (v) => "assets/char_" + v + ".png";

const E = ["🐰", "🐱", "🦊", "🐻", "🐼", "🐸", "🐯", "🐨", "🐷"]; // character for number 1..9
const P = ["#ff8fab", "#f2b632", "#5fb3f5", "#ff9a52", "#a78bf0", "#5fc88a", "#f06fa4", "#4cc2b8", "#e8a04a"]; // number-bubble color for 1..9

/* ----- Background music ----- */
// Put your file anywhere and change the path. Use "" for no music.
// Supported: mp3, wav, ogg, m4a. It loops, and starts after the player's first click.
const MUSIC_PATH = "assets/audio/music.mp3";
const MUSIC_VOLUME = 0.35; // 0 (silent) to 1 (full)

/* ----- Messages ----- */
const WRONG = [
  "Oof, not quite! 💥",
  "Bubbles pop at your mistake…",
  "Hoo… the owl is disappointed.",
  "Dee raises one eyebrow.",
  "The gnome scratches his head.",
];
