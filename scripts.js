import { initialTasks } from "./initialData.js";
/**
 * Creates a single task DOM element.
 * @param {Object} task - Task data object.
 * @param {string} task.title - Title of the task.
 * @param {number} task.id - Unique task ID.
 * @param {string} task.status - Status column: 'todo', 'doing', or 'done'.
 * @returns {HTMLElement} The created task div element.
 */
function createTaskElement(task) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-div";
  taskDiv.textContent = task.title;
  taskDiv.dataset.taskId = task.id;

  taskDiv.addEventListener("click", () => {
    openTaskModal(task);
  });

  return taskDiv;
}

/**
 * Finds the task container element based on task status.
 * @param {string} status - The task status ('todo', 'doing', or 'done').
 * @returns {HTMLElement|null} The container element, or null if not found.
 */
function getTaskContainerByStatus(status) {
  const column = document.querySelector(`.column-div[data-status="${status}"]`);
  return column ? column.querySelector(".tasks-container") : null;
}

/**
 * Clears all existing task-divs from all task containers.
 */
function clearExistingTasks() {
  document.querySelectorAll(".tasks-container").forEach((container) => {
    container.innerHTML = "";
  });
}

/**
 * Renders all tasks from initial data to the UI.
 * Groups tasks by status and appends them to their respective columns.
 * @param {Array<Object>} tasks - Array of task objects.
 */
function renderTasks(tasks) {
  tasks.forEach((task) => {
    const container = getTaskContainerByStatus(task.status);
    if (container) {
      const taskElement = createTaskElement(task);
      container.appendChild(taskElement);
    }
  });
}

/**
 * Opens the modal dialog with pre-filled task details.
 * @param {Object} task - The task object to display in the modal.
 */
function openTaskModal(task) {
  const modal = document.getElementById("task-modal");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const statusSelect = document.getElementById("task-status");

  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  modal.showModal();
}

/**
 * Sets up modal close behavior.
 */
function setupModalCloseHandler() {
  const modal = document.getElementById("task-modal");
  const closeBtn = document.getElementById("close-modal-btn");

  closeBtn.addEventListener("click", () => {
    modal.close();
  });
}

/**
 * Initializes the task board and modal handlers.
 */
function initTaskBoard() {
  clearExistingTasks();
  const tasks = safeGetTasks();  // <-- load tasks from localStorage
  renderTasks(tasks);
  setupModalCloseHandler();

  // Handle Add Task button to clear modal before opening
  const addTaskBtn = document.querySelector(".add-task-btn");
  const modal = document.getElementById("task-modal");
  const form = document.getElementById("task-form");

  addTaskBtn.addEventListener("click", () => {
    form.reset();      // clear old values
    modal.showModal(); // open fresh modal
  });
}

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", initTaskBoard);

// Get the dialog modal element by its ID
const modal = document.getElementById("task-modal");

// Get the "Add New Task" button 
const addTaskBtn = document.querySelector(".add-task-btn");

// Get the "×" close button inside the modal
const closeBtn = document.getElementById("close-modal-btn");

// --- Error handling for localStorage --
function safeGetTasks() {
  try {
    return JSON.parse(localStorage.getItem("tasks")) || initialTasks;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return initialTasks;
  }
}

function safeSaveTasks(tasks) {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks:", error);
  }
}

// Form submit handler
const form = document.getElementById("task-form"); 
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: Date.now(),
    title: form.title.value,
    description: form.description.value,
    status: form.status.value,
  };

  // 1. Get current tasks safely
  let tasks = safeGetTasks();

  // 2. Add new task
  tasks.push(newTask);

  // 3. Save updated tasks to localStorage
  safeSaveTasks(tasks);

  // 4. Re-render board
  clearExistingTasks();
  renderTasks(tasks);

  // 5. Reset form and close modal
  form.reset();
  modal.close();
});