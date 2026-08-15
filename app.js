const board = document.querySelector('.kanban-board');
const modal = document.querySelector('#task-modal');
const form = document.querySelector('#task-form');
const statusInput = document.querySelector('#task-status');
const statusSelect = document.querySelector('#task-status-select');
const titleInput = document.querySelector('#task-title');
const descriptionInput = document.querySelector('#task-description');
const toast = document.querySelector('#toast');
const search = document.querySelector('#task-search');
let toastTimer;

function labelForStatus(status) {
  return { backlog: 'Backlog', progress: 'In progress', review: 'In review', done: 'Done' }[status];
}

function updateCounts() {
  document.querySelectorAll('.board-column').forEach((column) => {
    column.querySelector('.task-count').textContent = column.querySelectorAll('.task-card').length;
  });
  document.querySelector('#total-count').textContent = document.querySelectorAll('.task-card').length;
  document.querySelector('#progress-count').textContent = document.querySelectorAll('[data-status="progress"] .task-card').length;
  document.querySelector('#done-count').textContent = document.querySelectorAll('[data-status="done"] .task-card').length;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function openTaskModal(status = 'backlog') {
  statusInput.value = status;
  statusSelect.value = status;
  modal.hidden = false;
  window.setTimeout(() => titleInput.focus(), 0);
}

function closeTaskModal() {
  modal.hidden = true;
  form.reset();
}

function makeTaskCard(title, description, status) {
  const card = document.createElement('article');
  const issue = document.querySelectorAll('.task-card').length + 1;
  const tagClass = { backlog: 'tag-blue', progress: 'tag-violet', review: 'tag-pink', done: 'tag-mint' }[status];
  const tagLabel = { backlog: 'Planning', progress: 'Active', review: 'Review', done: 'Complete' }[status];
  card.className = `task-card${status === 'done' ? ' completed' : ''}`;
  card.dataset.search = `${title} ${description}`.toLowerCase();
  card.innerHTML = `
    <div class="task-card-top"><span class="tag ${tagClass}">${tagLabel}</span><button type="button" aria-label="Task options">•••</button></div>
    <h4></h4><p></p>
    <div class="task-meta"><span>#${String(issue + 15).padStart(2, '0')}</span><div><span class="member-avatar avatar-sky">AM</span><span class="calendar">Just now</span></div></div>`;
  card.querySelector('h4').textContent = title;
  card.querySelector('p').textContent = description || 'New task added to the project board.';
  return card;
}

document.querySelectorAll('#new-task, #hero-new-task').forEach((button) => button.addEventListener('click', () => openTaskModal()));
document.querySelectorAll('.column-add').forEach((button) => button.addEventListener('click', (event) => openTaskModal(event.currentTarget.closest('.board-column').dataset.status)));
document.querySelector('#close-modal').addEventListener('click', closeTaskModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeTaskModal(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeTaskModal();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
});

statusSelect.addEventListener('change', () => { statusInput.value = statusSelect.value; });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = statusSelect.value;
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title) return;
  document.querySelector(`[data-status="${status}"] .task-list`).prepend(makeTaskCard(title, description, status));
  updateCounts();
  closeTaskModal();
  showToast(`Task added to ${labelForStatus(status)}.`);
  localStorage.setItem('flowboard-created-task', title);
});

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  document.querySelectorAll('.task-card').forEach((card) => card.classList.toggle('hidden-by-search', query && !card.dataset.search.includes(query)));
});

const themeToggle = document.querySelector('#theme-toggle');
const savedTheme = localStorage.getItem('flowboard-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('flowboard-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  showToast(`${document.body.classList.contains('dark') ? 'Dark' : 'Light'} theme enabled.`);
});

document.querySelector('#share-button').addEventListener('click', () => showToast('Share link copied to clipboard.'));
document.querySelector('#filter-button').addEventListener('click', () => showToast('Showing all project tasks.'));
document.querySelector('#board-settings').addEventListener('click', () => showToast('Board settings are ready for your next feature.'));
updateCounts();
