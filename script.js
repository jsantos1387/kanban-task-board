const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const todoColumn = document.getElementById("todo");
const progressColumn = document.getElementById("progress");
const doneColumn = document.getElementById("done");

const todoCount = document.getElementById("todoCount");
const progressCount = document.getElementById("progressCount");
const doneCount = document.getElementById("doneCount");

let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

function saveTasks() {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function renderTasks() {
    todoColumn.innerHTML = "";
    progressColumn.innerHTML = "";
    doneColumn.innerHTML = "";

    let todoTotal = 0;
    let progressTotal = 0;
    let doneTotal = 0;

    tasks.forEach(function (task, index) {
        if (!task.priority) {
            task.priority = "Low";
        }

        if (!task.status) {
            task.status = "todo";
        }

        if (!task.dueDate) {
            task.dueDate = "No due date";
        }

        const card = document.createElement("div");
        card.classList.add("task-card");
        card.setAttribute("draggable", "true");
        card.setAttribute("data-index", index);

        card.innerHTML = `
            <p>${task.text}</p>

            <span class="priority ${task.priority.toLowerCase()}">
                ${task.priority}
            </span>

            <p class="due-date">
                <strong>Due:</strong> ${task.dueDate}
            </p>

            <div class="task-buttons">
                ${getButtons(task.status, index)}
            </div>
        `;

        card.addEventListener("dragstart", function () {
            card.classList.add("dragging");
            localStorage.setItem("draggedTaskIndex", index);
        });

        card.addEventListener("dragend", function () {
            card.classList.remove("dragging");
        });

        if (task.status === "todo") {
            todoColumn.appendChild(card);
            todoTotal++;
        } else if (task.status === "progress") {
            progressColumn.appendChild(card);
            progressTotal++;
        } else if (task.status === "done") {
            doneColumn.appendChild(card);
            doneTotal++;
        }
    });

    todoCount.textContent = todoTotal;
    progressCount.textContent = progressTotal;
    doneCount.textContent = doneTotal;

    saveTasks();
}

function getButtons(status, index) {
    if (status === "todo") {
        return `
            <button onclick="moveTask(${index}, 'progress')">Move →</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
    }

    if (status === "progress") {
        return `
            <button onclick="moveTask(${index}, 'todo')">← Back</button>
            <button onclick="moveTask(${index}, 'done')">Move →</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
    }

    if (status === "done") {
        return `
            <button onclick="moveTask(${index}, 'progress')">← Back</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
    }
}

function setupDragAndDrop() {
    const columns = [
        { element: todoColumn, status: "todo" },
        { element: progressColumn, status: "progress" },
        { element: doneColumn, status: "done" }
    ];

    columns.forEach(function (column) {
        column.element.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        column.element.addEventListener("drop", function () {
            const draggedTaskIndex = localStorage.getItem("draggedTaskIndex");

            if (draggedTaskIndex !== null) {
                tasks[draggedTaskIndex].status = column.status;
                saveTasks();
                renderTasks();
            }
        });
    });
}

addTaskBtn.addEventListener("click", function () {
    const text = taskInput.value.trim();
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        text: text,
        priority: priority,
        dueDate: dueDate || "No due date",
        status: "todo"
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = "";
    priorityInput.value = "Low";
    dueDateInput.value = "";
});

function moveTask(index, newStatus) {
    tasks[index].status = newStatus;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

setupDragAndDrop();
renderTasks();