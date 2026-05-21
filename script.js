// Initialize variables
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = [];
let currentFilter = 'all';

const STORAGE_KEY = 'todos';

// Initialize application
function init() {
    loadTodos();
    renderTodos();
    attachEventListeners();
}

// Load todos from local storage
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    todos = stored ? JSON.parse(stored) : [];
}

// Save todos to local storage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Attach event listeners
function attachEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearBtn.addEventListener('click', clearCompleted);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (!text) {
        showNotification('Please enter a task!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

// Toggle todo completion status
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Clear all completed todos
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;

    if (completedCount === 0) {
        showNotification('No completed tasks to clear!');
        return;
    }

    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

// Filter todos based on current filter
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos to the DOM
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <p>${currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : `No ${currentFilter} tasks.`}</p>
            </div>
        `;
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input
                    type="checkbox"
                    class="checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            `;
            todoList.appendChild(li);
        });
    }

    updateTaskCount();
}

// Update task count display
function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const total = todos.length;
    const completed = total - activeCount;

    taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining • ${completed} completed`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Show notification
function showNotification(message) {
    // Simple alert for now, can be enhanced with a custom notification system
    console.log(message);
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}