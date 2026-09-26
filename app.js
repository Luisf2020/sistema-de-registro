const STORAGE_KEY = 'game-registry-v2';

const form = document.getElementById('gameForm');
const list = document.getElementById('gameList');
const emptyState = document.getElementById('emptyState');
const search = document.getElementById('search');
const totalGames = document.getElementById('totalGames');
const completedGames = document.getElementById('completedGames');
const pendingGames = document.getElementById('pendingGames');
const submitBtn = document.getElementById('submitBtn');

let editingId = null;
let games = loadGames();

function loadGames() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function updateStats() {
  totalGames.textContent = games.length;
  completedGames.textContent = games.filter(game => game.status === 'Completado').length;
  pendingGames.textContent = games.filter(game => game.status !== 'Completado').length;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const filtered = games.filter(game =>
    game.title.toLowerCase().includes(term) || game.platform.toLowerCase().includes(term)
  );

  list.innerHTML = filtered.map(game => `
    <article class="game-card">
      <div class="game-main">
        <div class="game-topline">
          <h3>${escapeHtml(game.title)}</h3>
          <span class="pill ${game.status.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(game.status)}</span>
        </div>
        <p>${escapeHtml(game.platform)}${game.score ? ` · ${escapeHtml(String(game.score))}/10` : ''}</p>
      </div>
      <div class="actions">
        <button class="ghost" data-action="edit" data-id="${game.id}">Editar</button>
        <button class="danger" data-action="delete" data-id="${game.id}">Eliminar</button>
      </div>
    </article>
  `).join('');

  emptyState.hidden = filtered.length > 0;
  updateStats();
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const game = {
    id: editingId || crypto.randomUUID(),
    title: document.getElementById('title').value.trim(),
    platform: document.getElementById('platform').value.trim(),
    status: document.getElementById('status').value,
    score: document.getElementById('score').value.trim()
  };

  if (!game.title || !game.platform) return;

  if (editingId) {
    games = games.map(item => item.id === editingId ? game : item);
  } else {
    games.unshift(game);
  }

  saveGames();
  form.reset();
  editingId = null;
  submitBtn.textContent = 'Agregar juego';
  render();
});

list.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  const game = games.find(item => item.id === id);

  if (action === 'delete') {
    games = games.filter(item => item.id !== id);
    saveGames();
    render();
  }

  if (action === 'edit' && game) {
    document.getElementById('title').value = game.title;
    document.getElementById('platform').value = game.platform;
    document.getElementById('status').value = game.status;
    document.getElementById('score').value = game.score;
    editingId = id;
    submitBtn.textContent = 'Guardar cambios';
    document.getElementById('title').focus();
  }
});

search.addEventListener('input', render);
render();
