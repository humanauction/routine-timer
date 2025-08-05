document.addEventListener('DOMContentLoaded', function () {
    console.log("TIMER JS LOADED");
    // Initialize timer variables
    const timerRoot = document.getElementById('timer-root');
    const routineId = timerRoot.dataset.routineId;
    const csrfToken = timerRoot.dataset.csrfToken;
    // Timer elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const taskNameEl = document.getElementById('task-name');
    const progressBar = document.getElementById('progress-bar');
    const totalTimeEl = document.getElementById('total-time');
    const taskCountEl = document.getElementById('task-count');
    const currentTaskNumberEl = document.getElementById('current-task-number');
    const upcomingTasksList = document.getElementById('upcoming-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');

    // Control buttons
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const skipBtn = document.getElementById('skip-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Sound effects
    const taskCompleteSound = document.getElementById('task-complete-sound');
    const timerFinishSound = document.getElementById('timer-finish-sound');

    // Timer state
    let timer;
    let isPaused = true;
    let totalSeconds = 0;
    let currentSeconds = 0;
    let tasks = [];
    let totalDuration = 0;
    let currentTaskIndex = -1;

    function loadTasks() {
        // Get the API endpoint URL from the hidden input
        const apiUrl = document.getElementById('get-tasks-url').value;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.tasks && data.tasks.length > 0) {
                    tasks = data.tasks;
                    totalDuration = data.total || 0;
                    updateTasksDisplay();
                    tasks = data.tasks;
                    totalDuration = data.total || 0;
                    updateTasksDisplay();
                } else {
                    // Example data if no tasks are found
                    tasks = [
                        { task: 'Wake up', duration: 3 },
                        { task: 'evacuate', duration: 2 },
                        { task: 'quick break', duration: 5 },
                        { task: 'Coolwater by Davidoff', duration: 2 }
                    ];
                    totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
                    updateTasksDisplay();
                }
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                // Use example data if fetch fails
                tasks = [
                    { task: 'Wake up', duration: 3 },
                    { task: 'evacuate', duration: 2 },
                    { task: 'quick break', duration: 5 },
                    { task: 'Coolwater by Davidoff', duration: 2 }
                ];
                totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
                updateTasksDisplay();
            });
    }

    // Update the tasks display
    function updateTasksDisplay() {
        // Update info panel
        totalTimeEl.textContent = `${totalDuration} minutes`;
        taskCountEl.textContent = `${tasks.length} tasks`;
        currentTaskNumberEl.textContent = currentTaskIndex >= 0 ? `${currentTaskIndex + 1}/${tasks.length}` : '0/0';

        // Update upcoming tasks list
        upcomingTasksList.innerHTML = '';
        if (currentTaskIndex < tasks.length - 1) {
            for (let i = currentTaskIndex + 1; i < tasks.length; i++) {
                const task = tasks[i];
                const li = document.createElement('li');
                li.className = 'task-item';
                li.innerHTML = `
                    <span class="task-name">${task.task}</span>
                    <span class="task-duration">${task.duration} min</span>
                `;
                upcomingTasksList.appendChild(li);
            }
        } else if (tasks.length > 0 && currentTaskIndex === -1) {
            // Show all tasks as upcoming when not started
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = 'task-item';
                li.innerHTML = `
                    <span class="task-name">${task.task}</span>
                    <span class="task-duration">${task.duration} min</span>
                `;
                upcomingTasksList.appendChild(li);
            });
        } else {
            upcomingTasksList.innerHTML = '<li class="empty-message">No tasks in queue</li>';
        }

        // Update completed tasks list
        completedTasksList.innerHTML = '';
        if (currentTaskIndex >= 0) {
            for (let i = 0; i < currentTaskIndex; i++) {
                const task = tasks[i];
                const li = document.createElement('li');
                li.className = 'task-item completed';
                li.innerHTML = `
                    <span class="task-name">${task.task}</span>
                    <span class="task-duration">${task.duration} min</span>
                    <span class="check-icon"><i class="fas fa-check-circle"></i></span>
                `;
                completedTasksList.appendChild(li);
            }
        }
        if (completedTasksList.children.length === 0) {
            completedTasksList.innerHTML = '<li class="empty-message">No tasks completed</li>';
        }
    }

    // Format time as MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            minutes: mins < 10 ? `0${mins}` : mins,
            seconds: secs < 10 ? `0${secs}` : secs
        };
    }

    // Update timer display
    function updateTimerDisplay() {
        const formatted = formatTime(currentSeconds);
        minutesEl.textContent = formatted.minutes;
        secondsEl.textContent = formatted.seconds;

        // Update progress bar
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            const taskDuration = tasks[currentTaskIndex].duration * 60;
            const progress = 100 - ((currentSeconds / taskDuration) * 100);
            progressBar.style.width = `${progress}%`;
        } else {
            progressBar.style.width = '100%';
        }
    }

    // Start next task
    function startNextTask() {
        if (currentTaskIndex < tasks.length - 1) {
            currentTaskIndex++;
            const task = tasks[currentTaskIndex];
            taskNameEl.textContent = task.task;
            currentSeconds = task.duration * 60;
            updateTimerDisplay();
            updateTasksDisplay();
        } else {
            finishRoutine();
        }
    }

    // Task complete
    function completeCurrentTask() {
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            try {
                taskCompleteSound.play();
            } catch (e) {
                console.log('Could not play sound', e);
            }
            startNextTask();
        }
    }

    // Finish all tasks
    function finishRoutine() {
        clearInterval(timer);
        taskNameEl.textContent = 'Complete!';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        progressBar.style.width = '100%';

        // Update controls
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        skipBtn.disabled = true;
        resetBtn.disabled = false;

        // Update display
        currentTaskIndex = tasks.length;
        updateTasksDisplay();

        try {
            timerFinishSound.play();
        } catch (e) {
            console.log('Could not play sound', e);
        }

        // Show completion message
        alert('Congratulations! You have completed all tasks.');
    }

    // Start timer
    function startTimer() {
        if (isPaused) {
            isPaused = false;

            if (currentTaskIndex === -1 && tasks.length > 0) {
                startNextTask();
            }

            timer = setInterval(() => {
                if (currentSeconds > 0) {
                    currentSeconds--;
                    updateTimerDisplay();
                    saveTimerState();
                }
            }, 1000);

            // Update controls
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            skipBtn.disabled = false;
            resetBtn.disabled = false;
        }
    }

    // Pause timer
    function pauseTimer() {
        if (!isPaused) {
            clearInterval(timer);
            isPaused = true;

            // Update controls
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            skipBtn.disabled = false;
            resetBtn.disabled = false;
            saveTimerState();
        }
    }

    // Skip current task
    function skipTask() {
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            completeCurrentTask();
            saveTimerState();
        }
    }

    // Reset timer
    function resetTimer() {
        clearInterval(timer);
        isPaused = true;
        currentTaskIndex = -1;
        taskNameEl.textContent = 'Get Ready...';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        progressBar.style.width = '100%';

        // Update controls
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        skipBtn.disabled = true;
        resetBtn.disabled = true;

        updateTasksDisplay();
        saveTimerState();
    }

    // Save timer state
    function saveTimerState() {
        fetch(`/routine/timer/${routineId}/state/save/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                current_task_index: currentTaskIndex,
                current_seconds: currentSeconds,
                is_paused: isPaused
            })
        });
    }

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    skipBtn.addEventListener('click', skipTask);
    resetBtn.addEventListener('click', resetTimer);

    // Initialize
    const routineTasksScript = document.getElementById('routine-tasks-data');
    if (routineTasksScript && routineTasksScript.textContent.trim()) {
        tasks = JSON.parse(routineTasksScript.textContent);
        console.log("Loaded tasks:", tasks);
        totalDuration = Number(timerRoot.dataset.routineTotal) || 0;
        resetTimer();
    } else {
        loadTasks();
    }

    // Fetch routine state
    //    fetch(`/routine/timer/${routineId}/state/`)
    //        .then(res => res.json())
    //        .then(state => {
    //            if (typeof state.current_task_index === 'number' && state.current_task_index >= 0)
    //            currentTaskIndex = state.current_task_index;
    //            currentSeconds = state.current_seconds;
    //            isPaused = state.is_paused;
    // Optionally, adjust for elapsed time using state.last_updated
    //            updateTimerDisplay();
    //            updateTasksDisplay();
    //        });
});
