const STORAGE_WEIGHTS = 'gym-weight-tracker-weights';
const STORAGE_DONE = 'gym-weight-tracker-done';
const STORAGE_CUSTOM_EXERCISES = 'gym-weight-tracker-custom-exercises';
const STORAGE_ACCOUNT_NAME = 'gym-weight-tracker-account-name';
const STORAGE_NUTRITION_CAL = 'gym-weight-tracker-nutrition-cal';
const STORAGE_NUTRITION_GOAL = 'gym-weight-tracker-nutrition-goal';

const DEFAULT_EXERCISES = [
  { id: 'bench-press', name: 'Bench Press', defaultWeight: 60, custom: false },
  { id: 'squat', name: 'Barbell Squat', defaultWeight: 80, custom: false },
  { id: 'deadlift', name: 'Deadlift', defaultWeight: 100, custom: false },
  { id: 'overhead-press', name: 'Overhead Press', defaultWeight: 40, custom: false },
  { id: 'barbell-row', name: 'Barbell Row', defaultWeight: 60, custom: false },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', defaultWeight: 70, custom: false },
  { id: 'incline-bench', name: 'Incline Bench Press', defaultWeight: 50, custom: false },
  { id: 'front-squat', name: 'Front Squat', defaultWeight: 60, custom: false },
  { id: 'lat-pulldown', name: 'Lat Pulldown', defaultWeight: 45, custom: false },
  { id: 'leg-press', name: 'Leg Press', defaultWeight: 120, custom: false },
  { id: 'dumbbell-row', name: 'Dumbbell Row', defaultWeight: 25, custom: false },
  { id: 'dumbbell-press', name: 'Dumbbell Shoulder Press', defaultWeight: 20, custom: false },
  { id: 'goblet-squat', name: 'Goblet Squat', defaultWeight: 20, custom: false },
  { id: 'hip-thrust', name: 'Hip Thrust', defaultWeight: 80, custom: false },
  { id: 'cable-fly', name: 'Cable Fly', defaultWeight: 15, custom: false },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', defaultWeight: 25, custom: false },
  { id: 'bicep-curl', name: 'Barbell Bicep Curl', defaultWeight: 20, custom: false },
  { id: 'leg-curl', name: 'Leg Curl', defaultWeight: 35, custom: false },
  { id: 'calf-raise', name: 'Calf Raise', defaultWeight: 80, custom: false },
  { id: 'face-pull', name: 'Face Pull', defaultWeight: 25, custom: false },
];

function loadCustomExercises() {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_EXERCISES);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveCustomExercises(list) {
  try {
    localStorage.setItem(STORAGE_CUSTOM_EXERCISES, JSON.stringify(list));
  } catch (_) {}
}

function getAllExercises() {
  const custom = loadCustomExercises();
  return [...DEFAULT_EXERCISES, ...custom];
}

function loadWeights() {
  try {
    const raw = localStorage.getItem(STORAGE_WEIGHTS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function saveWeights(weights) {
  try {
    localStorage.setItem(STORAGE_WEIGHTS, JSON.stringify(weights));
  } catch (_) {}
}

function roundToHalf(value) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.round(n * 2) / 2);
}

function getWeight(exerciseId) {
  const weights = loadWeights();
  const exercises = getAllExercises();
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) return 0;
  const w = weights[exerciseId];
  return w != null ? roundToHalf(w) : roundToHalf(exercise.defaultWeight);
}

function setWeight(exerciseId, value) {
  const weight = roundToHalf(value);
  const weights = loadWeights();
  weights[exerciseId] = weight;
  saveWeights(weights);
  return weight;
}

function addWeight(exerciseId, amount) {
  const current = getWeight(exerciseId);
  return setWeight(exerciseId, current + amount);
}

function subtractWeight(exerciseId, amount) {
  const current = getWeight(exerciseId);
  return setWeight(exerciseId, current - amount);
}

function formatWeight(value) {
  const v = roundToHalf(value);
  return v % 1 === 0 ? v.toString() : v.toFixed(1);
}

// --- Panels & swipe ---
const PANEL_NAMES = { home: 'Home', training: 'Training', nutrition: 'Nutrition', account: 'Account' };
let currentPanelIndex = 1;

const panelsEl = document.getElementById('panels');
const panelsWrapEl = document.getElementById('panels-wrap');
const headerTitleEl = document.getElementById('header-title');

function getPanelIndex() {
  return currentPanelIndex;
}

function goToPanel(index) {
  index = Math.max(0, Math.min(3, index));
  currentPanelIndex = index;
  if (panelsEl) panelsEl.style.transform = `translateX(-${index * 25}%)`;
  const names = ['home', 'training', 'nutrition', 'account'];
  const name = names[index];
  if (headerTitleEl) headerTitleEl.textContent = PANEL_NAMES[name];
  document.querySelectorAll('.bottom-nav-item').forEach((el, i) => {
    el.classList.toggle('bottom-nav-item--active', i === index);
  });
}

function goToPanelByName(name) {
  const index = ['home', 'training', 'nutrition', 'account'].indexOf(name);
  if (index !== -1) goToPanel(index);
}

// Touch swipe
let touchStartX = 0;
let touchStartY = 0;

panelsWrapEl?.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

panelsWrapEl?.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
  if (dx > 0 && currentPanelIndex > 0) goToPanel(currentPanelIndex - 1);
  else if (dx < 0 && currentPanelIndex < 3) goToPanel(currentPanelIndex + 1);
}, { passive: true });

document.getElementById('bottom-nav')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.bottom-nav-item');
  if (!btn) return;
  const name = btn.dataset.panel;
  if (name) goToPanelByName(name);
});

document.querySelector('.daily-challenge-cta')?.addEventListener('click', (e) => {
  e.preventDefault();
  goToPanelByName('training');
});

// Header title per panel
document.querySelectorAll('[data-panel]').forEach((panel) => {
  const name = panel.dataset.panel;
  if (!name) return;
  const title = PANEL_NAMES[name];
  if (!title) return;
});

// --- Exercise cards ---
function createExerciseCard(exercise) {
  const card = document.createElement('article');
  card.className = 'exercise-card';
  card.dataset.exerciseId = exercise.id;

  const currentWeight = getWeight(exercise.id);

  card.innerHTML = `
    <div class="exercise-card-left">
      <div class="exercise-checkbox" role="button" tabindex="0" aria-label="Mark done"></div>
      <div class="exercise-info">
        <div class="exercise-name">${escapeHtml(exercise.name)}</div>
        <div class="exercise-weight-row">
          <div class="weight-input-wrap">
            <input type="text" class="weight-input" inputmode="decimal" placeholder="0" value="${formatWeight(currentWeight)}" data-exercise-id="${exercise.id}" aria-label="Weight in kg">
            <span class="weight-unit">kg</span>
          </div>
        </div>
      </div>
    </div>
    <div class="exercise-actions">
      <div class="exercise-increments">
        <button type="button" class="exercise-btn add-1-25" data-amount="1.25">+1.25</button>
        <button type="button" class="exercise-btn add-2-5" data-amount="2.5">+2.5</button>
        <button type="button" class="exercise-btn add-5" data-amount="5">+5</button>
        <button type="button" class="exercise-btn add-10" data-amount="10">+10</button>
        <button type="button" class="exercise-btn exercise-btn--decrease" data-amount="2.5">−2.5</button>
        ${exercise.custom ? '<button type="button" class="exercise-btn exercise-btn--delete" data-delete aria-label="Remove exercise">✕</button>' : ''}
      </div>
    </div>
  `;

  const inputEl = card.querySelector('.weight-input');
  const checkbox = card.querySelector('.exercise-checkbox');

  const updateInput = () => {
    inputEl.value = formatWeight(getWeight(exercise.id));
  };

  const commitWeight = () => {
    const raw = inputEl.value.trim().replace(',', '.');
    const num = parseFloat(raw);
    if (raw === '') return;
    const w = roundToHalf(num);
    setWeight(exercise.id, w);
    inputEl.value = formatWeight(w);
  };

  inputEl.addEventListener('blur', commitWeight);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      inputEl.blur();
    }
  });

  card.querySelectorAll('.exercise-btn[data-amount]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const amount = parseFloat(btn.dataset.amount);
      if (btn.classList.contains('exercise-btn--decrease')) {
        subtractWeight(exercise.id, amount);
      } else {
        addWeight(exercise.id, amount);
      }
      updateInput();
    });
  });

  const deleteBtn = card.querySelector('[data-delete]');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const custom = loadCustomExercises().filter((e) => e.id !== exercise.id);
      saveCustomExercises(custom);
      card.remove();
      updateHomeStats();
    });
  }

  checkbox.addEventListener('click', () => {
    card.classList.toggle('exercise-done');
    const done = JSON.parse(localStorage.getItem(STORAGE_DONE) || '{}');
    done[exercise.id] = card.classList.contains('exercise-done');
    localStorage.setItem(STORAGE_DONE, JSON.stringify(done));
    updateHomeStats();
  });

  const done = JSON.parse(localStorage.getItem(STORAGE_DONE) || '{}');
  if (done[exercise.id]) card.classList.add('exercise-done');

  return card;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderExercises() {
  const list = document.getElementById('exercise-list');
  if (!list) return;
  list.innerHTML = '';
  getAllExercises().forEach((exercise) => {
    list.appendChild(createExerciseCard(exercise));
  });
  updateHomeStats();
}

// Quick-add
let pendingIncrement = null;

document.querySelectorAll('.quick-add-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const amount = parseFloat(btn.dataset.increment);
    pendingIncrement = amount;
    document.querySelectorAll('.quick-add-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    setTimeout(() => {
      pendingIncrement = null;
      btn.classList.remove('active');
    }, 4000);
  });
});

document.getElementById('exercise-list')?.addEventListener('click', (e) => {
  const card = e.target.closest('.exercise-card');
  if (!card || !pendingIncrement) return;
  const id = card.dataset.exerciseId;
  const newWeight = addWeight(id, pendingIncrement);
  const input = card.querySelector('.weight-input');
  if (input) input.value = formatWeight(newWeight);
  pendingIncrement = null;
  document.querySelectorAll('.quick-add-btn').forEach((b) => b.classList.remove('active'));
});

// Add exercise modal
function slugify(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'custom';
}

function openAddExerciseModal() {
  const overlay = document.getElementById('modal-add-exercise');
  const nameInput = document.getElementById('modal-exercise-name');
  const weightInput = document.getElementById('modal-exercise-weight');
  if (!overlay || !nameInput || !weightInput) return;
  nameInput.value = '';
  weightInput.value = '';
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  nameInput.focus();
}

function closeAddExerciseModal() {
  const overlay = document.getElementById('modal-add-exercise');
  if (overlay) {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

document.getElementById('btn-add-exercise')?.addEventListener('click', openAddExerciseModal);

// Single delegated handler so Cancel/Save work even if DOM timing or touch targets differ
const modalOverlay = document.getElementById('modal-add-exercise');
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'modal-add-exercise') {
      closeAddExerciseModal();
      return;
    }
    if (e.target.closest('#modal-cancel')) {
      closeAddExerciseModal();
      return;
    }
    if (e.target.closest('#modal-save')) {
      const nameInput = document.getElementById('modal-exercise-name');
      const weightInput = document.getElementById('modal-exercise-weight');
      if (!nameInput || !weightInput) return;
      const name = nameInput.value.trim();
      if (!name) return;
      const weight = roundToHalf(parseFloat(weightInput.value) || 0);
      const custom = loadCustomExercises();
      const baseId = slugify(name);
      let id = baseId;
      let n = 0;
      while (getAllExercises().some((ex) => ex.id === id)) {
        n += 1;
        id = `${baseId}-${n}`;
      }
      custom.push({ id, name, defaultWeight: weight, custom: true });
      saveCustomExercises(custom);
      setWeight(id, weight);
      closeAddExerciseModal();
      renderExercises();
    }
  });
}

// Home stats
function updateHomeStats() {
  const exercises = getAllExercises();
  const done = JSON.parse(localStorage.getItem(STORAGE_DONE) || '{}');
  const doneCount = exercises.filter((e) => done[e.id]).length;
  const exerciseCountEl = document.getElementById('home-exercise-count');
  const doneCountEl = document.getElementById('home-done-count');
  if (exerciseCountEl) exerciseCountEl.textContent = exercises.length;
  if (doneCountEl) doneCountEl.textContent = doneCount;
}

// Home date
function updateHomeDate() {
  const el = document.getElementById('home-date');
  if (!el) return;
  const d = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  el.textContent = d.toLocaleDateString(undefined, options);
}

// Account name
function loadAccountName() {
  try {
    return localStorage.getItem(STORAGE_ACCOUNT_NAME) || 'Athlete';
  } catch (_) {
    return 'Athlete';
  }
}

document.getElementById('account-name')?.addEventListener('input', (e) => {
  const v = (e.target.value || '').trim().slice(0, 30);
  try {
    localStorage.setItem(STORAGE_ACCOUNT_NAME, v || 'Athlete');
  } catch (_) {}
  const greetingEl = document.getElementById('user-name');
  if (greetingEl) greetingEl.textContent = v || 'Athlete';
});

const accountNameInput = document.getElementById('account-name');
if (accountNameInput) {
  const saved = loadAccountName();
  accountNameInput.value = saved === 'Athlete' ? '' : saved;
}

const userNameEl = document.getElementById('user-name');
if (userNameEl) userNameEl.textContent = loadAccountName();

// Nutrition (simple placeholders)
function loadNutritionCal() {
  try {
    return parseInt(localStorage.getItem(STORAGE_NUTRITION_CAL) || '0', 10);
  } catch (_) {
    return 0;
  }
}

function loadNutritionGoal() {
  try {
    return parseInt(localStorage.getItem(STORAGE_NUTRITION_GOAL) || '2000', 10);
  } catch (_) {
    return 2000;
  }
}

const nutritionCalEl = document.getElementById('nutrition-calories');
const nutritionGoalEl = document.getElementById('nutrition-goal');
if (nutritionCalEl) nutritionCalEl.textContent = loadNutritionCal();
if (nutritionGoalEl) nutritionGoalEl.textContent = loadNutritionGoal();

// Date selector (training) - just "Today" style
function renderDateDots() {
  const container = document.getElementById('date-dots');
  if (!container) return;
  container.innerHTML = '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  for (let i = -2; i <= 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'date-dot' + (i === 0 ? ' active' : '');
    dot.innerHTML = `<span class="date-dot-day">${days[d.getDay()]}</span>${d.getDate()}`;
    dot.addEventListener('click', () => {
        container.querySelectorAll('.date-dot').forEach((x) => x.classList.remove('active'));
        dot.classList.add('active');
      });
    container.appendChild(dot);
  }
}

// Init
renderDateDots();
updateHomeDate();
renderExercises();
goToPanel(1);
