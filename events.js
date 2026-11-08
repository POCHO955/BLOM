// events.js — Motor de diálogos + menú + memoria (BLOM 2D)

const dialogueContainer = document.querySelector(".dialogue-text");
const dialogueParagraph = dialogueContainer
  ? dialogueContainer.querySelector("p")
  : null;

const FADE_DURATION = 800;

let dialogueSkipTimeout = null;
let dialogueSkippable = false;
let advanceDialogue = null;
let petCooldownUntil = 0;
let menuOpen = false;

// ─── Helpers visuales ───────────────────────────────────────────

function getBlomEl() {
  return document.getElementById("blom");
}

function setBlomMood(moodValue) {
  const el = getBlomEl();
  if (!el) return;
  let label = "happy";
  if (moodValue < 25) label = "sad";
  else if (moodValue < 45) label = "nostalgic";
  else if (moodValue < 70) label = "normal";
  else label = "happy";
  el.dataset.mood = label;
}

function waveBlom() {
  const arm = document.getElementById("blom-arm-right");
  if (!arm) return;
  arm.classList.remove("waving");
  void arm.offsetWidth;
  arm.classList.add("waving");
  setTimeout(() => arm.classList.remove("waving"), 1800);
}

function playPetAnim() {
  const el = getBlomEl();
  if (!el) return;
  el.classList.remove("petting");
  void el.offsetWidth;
  el.classList.add("petting");
  setTimeout(() => el.classList.remove("petting"), 500);
}

function startBlinking() {
  const el = getBlomEl();
  if (!el) return;
  function blink() {
    el.classList.add("blink");
    setTimeout(() => el.classList.remove("blink"), 140);
    setTimeout(blink, 2000 + Math.random() * 3000);
  }
  setTimeout(blink, 1500);
}

// ─── Clic global ────────────────────────────────────────────────

document.addEventListener("click", (e) => {
  if (menuOpen) return;
  if (e.target.closest && e.target.closest("#blom-container")) return;
  if (e.target.closest && e.target.closest("#choice-menu")) return;
  if (e.target.closest && e.target.closest("#name-ui")) return;

  if (dialogueSkippable && advanceDialogue) {
    clearTimeout(dialogueSkipTimeout);
    advanceDialogue();
  }
});

// ─── Diálogo ────────────────────────────────────────────────────

function showDialogue(lines, onComplete) {
  if (!dialogueContainer || !dialogueParagraph) {
    console.warn("Contenedor o párrafo de diálogo no encontrado.");
    if (onComplete) onComplete();
    return;
  }

  let i = 0;

  function advance() {
    dialogueSkippable = false;
    dialogueContainer.style.opacity = 0;
    setTimeout(showNext, FADE_DURATION);
  }

  function showNext() {
    if (i >= lines.length) {
      dialogueSkippable = false;
      advanceDialogue = null;
      if (onComplete) onComplete();
      return;
    }
    const line = lines[i];
    dialogueParagraph.textContent = line.text;
    dialogueContainer.style.opacity = 1;
    i++;
    advanceDialogue = advance;
    dialogueSkippable = true;
    dialogueSkipTimeout = setTimeout(advance, line.pause);
  }

  setTimeout(showNext, 600);
}

function hideDialogue() {
  if (dialogueContainer) dialogueContainer.style.opacity = 0;
  dialogueSkippable = false;
  advanceDialogue = null;
  if (dialogueSkipTimeout) clearTimeout(dialogueSkipTimeout);
}

// ─── Nombre + edad (tarjeta) ────────────────────────────────────

function askForName(onDone) {
  const nameUi = document.getElementById("name-ui");
  const nameInput = document.getElementById("name-input");
  const ageInput = document.getElementById("age-input");
  const nameButton = document.getElementById("name-button");

  if (!nameUi || !nameInput || !nameButton) {
    if (onDone) onDone(null);
    return;
  }

  nameInput.value = "";
  if (ageInput) ageInput.value = "";

  nameUi.classList.remove("hidden");
  void nameUi.offsetWidth;
  nameUi.classList.add("is-open");
  nameInput.focus();

  function closeCard(cb) {
    nameUi.classList.remove("is-open");
    setTimeout(() => {
      nameUi.classList.add("hidden");
      if (cb) cb();
    }, 320);
  }

  function finish() {
    const name = nameInput.value.trim();
    const age = ageInput ? ageInput.value.trim() : "";
    nameButton.removeEventListener("click", onClick);
    nameInput.removeEventListener("keydown", onKey);
    if (ageInput) ageInput.removeEventListener("keydown", onKey);

    if (window.BLOMStorage) {
      if (typeof BLOMStorage.setProfile === "function") {
        BLOMStorage.setProfile(name, age);
      } else if (name) {
        BLOMStorage.setName(name);
      }
    }

    closeCard(() => {
      if (onDone) onDone(name || null);
    });
  }

  function onClick() { finish(); }
  function onKey(e) { if (e.key === "Enter") finish(); }

  nameButton.addEventListener("click", onClick);
  nameInput.addEventListener("keydown", onKey);
  if (ageInput) ageInput.addEventListener("keydown", onKey);
}

// ─── Menú Charlar / Despedirse ──────────────────────────────────

function showChoiceMenu() {
  let menu = document.getElementById("choice-menu");

  if (!menu) {
    menu = document.createElement("div");
    menu.id = "choice-menu";
    menu.className = "choice-menu hidden";
    menu.innerHTML = `
      <p class="choice-menu-label">¿Qué quieres hacer?</p>
      <div class="choice-menu-buttons">
        <button type="button" class="choice-btn" data-action="chat">Charlar</button>
        <button type="button" class="choice-btn choice-btn-ghost" data-action="bye">Despedirse</button>
      </div>
    `;
    const main = document.querySelector("main");
    if (main) main.appendChild(menu);
    else document.body.appendChild(menu);

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      hideChoiceMenu(() => {
        if (action === "chat") startChat();
        else if (action === "bye") startGoodbye();
      });
    });
  }

  hideDialogue();
  menuOpen = true;
  menu.classList.remove("hidden", "is-closing");
  void menu.offsetWidth;
  menu.classList.add("is-open");
}

function hideChoiceMenu(onDone) {
  const menu = document.getElementById("choice-menu");
  if (!menu) {
    menuOpen = false;
    if (onDone) onDone();
    return;
  }

  menu.classList.remove("is-open");
  menu.classList.add("is-closing");
  menuOpen = false;

  setTimeout(() => {
    menu.classList.add("hidden");
    menu.classList.remove("is-closing");
    if (onDone) onDone();
  }, 320);
}

function startChat() {
  const state = window.BLOMStorage
    ? BLOMStorage.getState()
    : { name: null, mood: 70, visits: 1 };

  if (window.BLOMStorage) {
    let s = BLOMStorage.loadState();
    s = BLOMStorage.changeMood(s, 3);
    BLOMStorage.saveState(s);
    setBlomMood(s.mood);
  }

  const lines = buildChatDialogue(state);
  showDialogue(lines, () => {
    showChoiceMenu();
  });
}

function startGoodbye() {
  const state = window.BLOMStorage
    ? BLOMStorage.getState()
    : { name: null, mood: 70 };

  if (window.BLOMStorage) setBlomMood(state.mood);
  waveBlom();
  showDialogue(buildOutroDialogue(state));
}

// ─── Acariciar ──────────────────────────────────────────────────

function setupPetting() {
  const container = document.getElementById("blom-container");
  if (!container || !window.BLOMStorage) return;

  container.addEventListener("click", (e) => {
    e.stopPropagation();
    if (Date.now() < petCooldownUntil) return;
    petCooldownUntil = Date.now() + 1200;
    if (dialogueSkippable || menuOpen) return;

    const state = BLOMStorage.petBlom();
    setBlomMood(state.mood);
    playPetAnim();
    waveBlom();
    showDialogue(buildPetReaction(state));
  });
}

// ─── Flujo principal ────────────────────────────────────────────

function startBlomFlow() {
  if (!window.BLOMStorage) {
    showDialogue(introDialogue, () => showDialogue(outroDialogue));
    return;
  }

  const state = BLOMStorage.onVisit();
  console.log("BLOM state:", state, "mood:", BLOMStorage.getMoodLabel(state.mood));

  setBlomMood(state.mood);
  startBlinking();
  setTimeout(waveBlom, 800);

  const intro = buildIntroDialogue(state);
  const needsName = !state.name || !state.age;

  showDialogue(intro, () => {
    if (needsName) {
      askForName((name) => {
        const afterName = name
          ? [
              { text: `${name}... qué bonito nombre^^`, pause: 2000 },
              { text: "Lo recordaré para la próxima.", pause: 1800 }
            ]
          : [{ text: "Está bien, no pasa nada.", pause: 1500 }];

        showDialogue(afterName, () => {
          showChoiceMenu();
        });
      });
    } else {
      showChoiceMenu();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupPetting();
    startBlomFlow();
  });
} else {
  setupPetting();
  startBlomFlow();
}