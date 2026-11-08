// storage.js — Memoria y ánimo de BLOM

const BLOM_STORAGE_KEY = "blom_state_v1";

const DEFAULT_STATE = {
  name: null,
  age: null,
  visits: 0,
  lastVisit: null,
  mood: 75,
  totalPetClicks: 0,
  gamesPlayed: 0,
  createdAt: null
};

function loadState() {
  try {
    const raw = localStorage.getItem(BLOM_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, createdAt: Date.now() };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE, createdAt: Date.now() };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(BLOM_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("BLOM: no se pudo guardar el estado", e);
  }
}

function applyLoneliness(state) {
  if (!state.lastVisit) return state;
  const hoursAlone = (Date.now() - state.lastVisit) / (1000 * 60 * 60);
  if (hoursAlone < 2) return state;
  const drop = Math.min(45, Math.floor(hoursAlone * 3));
  state.mood = Math.max(5, state.mood - drop);
  return state;
}

function changeMood(state, delta) {
  state.mood = Math.max(0, Math.min(100, state.mood + delta));
  return state;
}

function getMoodLabel(mood) {
  if (mood >= 80) return "muy feliz";
  if (mood >= 60) return "contento";
  if (mood >= 40) return "normal";
  if (mood >= 20) return "nostálgico";
  return "triste";
}

function hoursAlone(state) {
  if (!state.lastVisit) return 0;
  return (Date.now() - state.lastVisit) / (1000 * 60 * 60);
}

function onVisit() {
  let state = loadState();
  state = applyLoneliness(state);
  state.visits += 1;
  state.lastVisit = Date.now();
  state = changeMood(state, 4);
  saveState(state);
  return state;
}

function setName(name) {
  const state = loadState();
  state.name = (name || "").trim().slice(0, 24) || null;
  saveState(state);
  return state;
}

function setProfile(name, age) {
  const state = loadState();
  state.name = (name || "").trim().slice(0, 24) || null;
  const n = parseInt(age, 10);
  state.age = Number.isFinite(n) && n > 0 && n <= 120 ? n : null;
  saveState(state);
  return state;
}

function petBlom() {
  let state = loadState();
  state.totalPetClicks += 1;
  state = changeMood(state, 6);
  saveState(state);
  return state;
}

function playedGame() {
  let state = loadState();
  state.gamesPlayed += 1;
  state = changeMood(state, 10);
  saveState(state);
  return state;
}

function getState() {
  return loadState();
}

function resetBlom() {
  localStorage.removeItem(BLOM_STORAGE_KEY);
  return loadState();
}

window.BLOMStorage = {
  onVisit,
  setName,
  setProfile,
  petBlom,
  playedGame,
  getState,
  resetBlom,
  getMoodLabel,
  hoursAlone,
  changeMood,
  saveState,
  loadState
};