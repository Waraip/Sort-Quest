/* ============================================================
   audio.js
   Background music + the 🔊 mute button. (Settings are in config.js.)
   ============================================================ */

let muted = false; // remembered between visits
try {
  muted = localStorage.getItem("sq_mute") === "1";
} catch (e) {}
let bgm = null; // the Audio object, created on the first click

/** Starts the looping music (browsers only allow sound after a click). */
function startMusic() {
  if (!MUSIC_PATH || bgm) return;
  try {
    bgm = new Audio(MUSIC_PATH);
    bgm.loop = true;
    bgm.volume = MUSIC_VOLUME;
    if (!muted) bgm.play().catch(() => {});
  } catch (e) {}
}

/** Mutes/unmutes the music and updates the button icon. */
function setMute(m) {
  muted = m;
  try {
    localStorage.setItem("sq_mute", m ? "1" : "0");
  } catch (e) {}
  if (bgm) m ? bgm.pause() : bgm.play().catch(() => {});
  $("mute").textContent = m ? "🔇" : "🔊";
}

document.addEventListener("pointerdown", startMusic, { once: true });
$("mute").onclick = () => setMute(!muted);
$("mute").textContent = muted ? "🔇" : "🔊";
