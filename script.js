const STORAGE_KEY = 'tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const counter = document.getElementById('counter');
const empty = document.getElementById('empty');
const filterButtons = document.querySelectorAll('.filters__btn');

let tasks = loadTasks();
let currentFilter = 'all';

// Загрузка задач из localStorage
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Сохранение задач в localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Хранилище недоступно — приложение продолжит работать без сохранения
  }
}

function addTask(text) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// Склонение слова «задача» для счётчика
function plural(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'задачи';
  return 'задач';
}

function render() {
  const visible = tasks.filter((t) => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'done') return t.done;
    return true;
  });

  list.innerHTML = '';

  visible.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task' + (task.done ? ' is-done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task__check';
    checkbox.checked = task.done;
    checkbox.id = 'task-' + task.id;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const label = document.createElement('label');
    label.className = 'task__text';
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'task__delete';
    del.setAttribute('aria-label', 'Удалить задачу');
    del.title = 'Удалить';
    del.textContent = '×';
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, label, del);
    list.appendChild(li);
  });

  // Пустое состояние
  if (visible.length === 0) {
    const messages = {
      all: 'Задач пока нет — добавьте первую!',
      active: 'Активных задач нет',
      done: 'Выполненных задач пока нет',
    };
    empty.textContent = messages[currentFilter];
    empty.hidden = false;
  } else {
    empty.hidden = true;
  }

  // Счётчик
  const activeCount = tasks.filter((t) => !t.done).length;
  if (tasks.length === 0) {
    counter.textContent = 'Нет задач';
  } else {
    counter.textContent = `Осталось: ${activeCount} ${plural(activeCount)} из ${tasks.length}`;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  addTask(text);
  input.value = '';
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });
});

render();
