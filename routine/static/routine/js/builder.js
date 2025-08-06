// This script is for the routine builder page
// Set global variables for AJAX requests
function initRoutineBuilder() {
    // Get elements
    const routineNameInput = document.getElementById('routine-name');
    const taskInput = document.getElementById('id_task');
    const durationInput = document.getElementById('id_duration');
    const previewName = document.getElementById('preview-routine-name');
    const previewTasks = document.getElementById('preview-tasks');
    const previewTotalTime = document.getElementById('preview-total-time');
    let totalDuration = parseInt(previewTotalTime?.textContent) || 0;

    // Update preview name when typing
    if (routineNameInput && previewName) {
        routineNameInput.addEventListener('input', function () {
            previewName.textContent = this.value || 'Unnamed Routine';
        });
    }

    // Handle routine name form submission with fetch
    const routineNameForm = document.getElementById('routine-name-form');
    if (routineNameForm) {
        routineNameForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.querySelector('input[name="name"]').value = data.routine_name;
                        const message = document.createElement('div');
                        message.className = 'success-message';
                        message.textContent = 'Routine name saved!';
                        this.appendChild(message);
                        setTimeout(() => { message.remove(); }, 3000);
                    } else {
                        console.error('Error:', data.error);
                    }
                })
                .catch(error => { console.error('Error:', error); });
        });
    }

    // Add task preview feature
    function updateTaskPreview() {
        const taskName = taskInput?.value.trim();
        const duration = parseInt(durationInput?.value) || 0;
        if (taskName && duration > 0 && previewTasks && previewTotalTime) {
            const previewItem = document.createElement('li');
            previewItem.className = 'task-item preview-only';
            previewItem.innerHTML = `
                <span class="task-name">${taskName}</span>
                <span class="task-duration">${duration} minutes</span>
            `;
            document.querySelectorAll('.preview-only').forEach(item => item.remove());
            previewTasks.appendChild(previewItem);
            previewTotalTime.textContent = totalDuration + duration;
        }
    }
    if (taskInput) taskInput.addEventListener('input', updateTaskPreview);
    if (durationInput) durationInput.addEventListener('input', updateTaskPreview);

    // Handle add task form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success && previewTasks && previewTotalTime) {
                        const taskItem = document.createElement('li');
                        taskItem.className = 'task-item';
                        taskItem.dataset.index = document.querySelectorAll('.task-item:not(.preview-only)').length;
                        taskItem.innerHTML = `
                            <span class="task-name">${data.task.task}</span>
                            <span class="task-duration">${data.task.duration} minutes</span>
                            <button type="button" class="btn-delete" aria-label="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                            <span class="drag-handle" aria-label="Drag to reorder">
                                <i class="fas fa-grip-lines"></i>
                            </span>
                        `;
                        // Add delete event handler
                        const deleteBtn = taskItem.querySelector('.btn-delete');
                        if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteTask);
                        document.querySelectorAll('.preview-only').forEach(item => item.remove());
                        previewTasks.appendChild(taskItem);
                        totalDuration += data.task.duration;
                        previewTotalTime.textContent = totalDuration;
                        if (taskInput) taskInput.value = '';
                        if (durationInput) durationInput.value = '';
                    } else {
                        console.error('Error:', data.error);
                    }
                })
                .catch(error => { console.error('Error:', error); });
        });
    }

    // Delete task handler
    function handleDeleteTask() {
        const taskItem = this.closest('.task-item');
        const index = parseInt(taskItem.dataset.index);
        if (confirm('Are you sure you want to remove this task?')) {
            fetch('/routine/remove_task/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ index: index })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        taskItem.remove();
                        if (previewTotalTime) previewTotalTime.textContent = data.total;
                        totalDuration = data.total;
                        document.querySelectorAll('.task-item').forEach((item, idx) => {
                            item.dataset.index = idx;
                        });
                    } else {
                        alert('Error removing task: ' + data.error);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }
    // Attach delete handlers to existing buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', handleDeleteTask);
    });

    // Start routine button (AJAX inject timer panel)
    const startButton = document.querySelector('.btn.btn-success');
    if (startButton) {
        startButton.addEventListener('click', function (e) {
            e.preventDefault();
            fetch(window.startRoutineUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': window.csrfToken,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    routine_name: routineNameInput.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.routine_id) {
                        // AJAX inject timer panel instead of redirect
                        const timerNavItem = document.querySelector('.nav-item[data-panel="timer"]');
                        const timerPanel = document.getElementById('panel-timer');
                        if (timerNavItem && timerPanel) {
                            const timerUrl = `/routine/timer/${data.routine_id}/`;
                            timerNavItem.dataset.reload = "true";
                            fetch(timerUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                                .then(res => res.text())
                                .then(html => {
                                    const tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = html;
                                    const content =
                                        tempDiv.querySelector('.standalone-timer') ||
                                        tempDiv.querySelector('.panel-content') ||
                                        tempDiv.querySelector('.timer-container') ||
                                        tempDiv.querySelector('main > div');
                                    timerPanel.innerHTML = content ? content.outerHTML : html;
                                    timerPanel.classList.add('active');
                                    timerPanel.dataset.loaded = "true";
                                    if (typeof initRoutineTimer === "function") {
                                        initRoutineTimer();
                                    }
                                })
                                .catch(error => {
                                    console.error("Fetch error:", error);
                                    timerPanel.dataset.loaded = "true";
                                });
                        }
                    } else {
                        alert('Error starting routine: ' + (data.error || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while starting the routine.');
                });
        });
    }

    // Setup drag and drop reordering with Sortable.js
    const taskList = document.getElementById('preview-tasks');
    if (taskList) {
        new Sortable(taskList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                const items = Array.from(taskList.querySelectorAll('.task-item'));
                const newOrder = items.map(item => parseInt(item.dataset.index));
                fetch('/routine/reorder_tasks/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': window.csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ order: newOrder })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            items.forEach((item, idx) => {
                                item.dataset.index = idx;
                            });
                        } else {
                            console.error('Error:', data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });
    }
}

// Full page load
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.routine-builder')) {
        initRoutineBuilder();
    }
});

// After AJAX inject, call initRoutineBuilder() again for new content