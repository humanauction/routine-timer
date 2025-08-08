let timerInitialized = false;

function initRoutineTimer() {
    if (timerInitialized) {
        console.log('Timer already initialized, skipping...');
        return;
    }
    timerInitialized = true;
    // Debugging logs
    console.log("TIMER JS LOADED");
    console.log('Looking for timer-root...');
    // Initialize timer variables
    const timerRoot = document.getElementById('timer-root');
    console.log('timer-root found:', timerRoot);

    if (!timerRoot) {
        console.error('timer-root element not found!');
        return;
    }

    console.log('Initializing timer...');
    // // Prevent errors if not present

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
        const apiUrlInput = document.getElementById('get-tasks-url');
        const apiUrl = apiUrlInput ? apiUrlInput.value : null;
        if (!apiUrl) return;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.tasks && data.tasks.length > 0) {
                    tasks = data.tasks;
                    totalDuration = data.total || 0;
                    updateTasksDisplay();
                } else {
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

    function updateTasksDisplay() {
        totalTimeEl.textContent = `${totalDuration} minutes`;
        taskCountEl.textContent = `${tasks.length} tasks`;
        currentTaskNumberEl.textContent = currentTaskIndex >= 0 ? `${currentTaskIndex + 1}/${tasks.length}` : '0/0';

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

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            minutes: mins < 10 ? `0${mins}` : mins,
            seconds: secs < 10 ? `0${secs}` : secs
        };
    }

    function updateTimerDisplay() {
        const formatted = formatTime(currentSeconds);
        minutesEl.textContent = formatted.minutes;
        secondsEl.textContent = formatted.seconds;

        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            const taskDuration = tasks[currentTaskIndex].duration * 60;
            const progress = 100 - ((currentSeconds / taskDuration) * 100);
            progressBar.style.width = `${progress}%`;
        } else {
            progressBar.style.width = '100%';
        }
    }

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

    function completeCurrentTask() {
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            try { taskCompleteSound.play(); } catch (e) { }
            startNextTask();
        }
    }

    function finishRoutine() {
        clearInterval(timer);
        taskNameEl.textContent = 'Complete!';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        progressBar.style.width = '100%';

        startBtn.disabled = false;
        pauseBtn.disabled = true;
        skipBtn.disabled = true;
        resetBtn.disabled = false;

        currentTaskIndex = tasks.length;
        updateTasksDisplay();

        try { timerFinishSound.play(); } catch (e) { }
        alert('Congratulations! You have completed all tasks.');
    }

    function startTaskTimer() {
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            const task = tasks[currentTaskIndex];
            taskNameEl.textContent = task.task;
            currentSeconds = task.duration * 60;
            updateTimerDisplay();
            updateTasksDisplay();

            timer = setInterval(() => {
                if (currentSeconds > 0) {
                    currentSeconds--;
                    updateTimerDisplay();
                    saveTimerState();
                    if (currentSeconds === 0) {
                        completeCurrentTask();
                    }
                }
            }, 1000);
        }
    }

    function startTimer() {
        if (isPaused) {
            isPaused = false;

            // Enter fullscreen on mobile
            enterMobileFullscreen();

            // If we're at -1, start with "Get Ready" countdown
            if (currentTaskIndex === -1 && tasks.length > 0) {
                taskNameEl.textContent = 'Ready?';
                currentSeconds = 5; // 5 second countdown
                currentTaskNumberEl.textContent = `0/${tasks.length}`;

                timer = setInterval(() => {
                    if (currentSeconds > 0) {
                        currentSeconds--;
                        updateTimerDisplay();

                        if (currentSeconds === 0) {
                            // Clear interval and start first actual task
                            clearInterval(timer);
                            currentTaskIndex = 0;
                            startTaskTimer();
                        }
                    }
                }, 1000);
            } else if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
                startTaskTimer();
            }

            startBtn.disabled = true;
            pauseBtn.disabled = false;
            skipBtn.disabled = false;
            resetBtn.disabled = false;
        }
    }

    function pauseTimer() {
        if (!isPaused) {
            clearInterval(timer);
            isPaused = true;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            skipBtn.disabled = false;
            resetBtn.disabled = false;
            saveTimerState();
        }
    }

    function skipTask() {
        if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
            completeCurrentTask();
            saveTimerState();
        }
    }

    function resetTimer() {
        clearInterval(timer);
        isPaused = true;

        // Exit fullscreen on mobile
        exitMobileFullscreen();

        currentTaskIndex = -1;
        taskNameEl.textContent = 'Get Ready...';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        progressBar.style.width = '100%';

        startBtn.disabled = false;
        pauseBtn.disabled = true;
        skipBtn.disabled = true;
        resetBtn.disabled = true;

        updateTasksDisplay();
        // saveTimerState();
    }

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
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.error('Failed to save timer state');
                }
            })
            .catch(error => {
                console.error('Error saving timer state:', error);
            });
    }

    // Add this inside initRoutineTimer function, after defining variables

    function enterMobileFullscreen() {
        if (window.innerWidth < 768) {
            const timerContainer = document.querySelector('.timer-container');
            if (timerContainer) {
                timerContainer.classList.add('fullscreen');
                document.body.classList.add('timer-fullscreen');
            }
        }
    }

    function exitMobileFullscreen() {
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.classList.remove('fullscreen');
            document.body.classList.remove('timer-fullscreen');
        }
    }

    // Attach event listeners
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (skipBtn) skipBtn.addEventListener('click', skipTask);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    // Initialize tasks
    const routineTasksScript = document.getElementById('routine-tasks-data');
    if (routineTasksScript && routineTasksScript.textContent.trim()) {
        tasks = JSON.parse(routineTasksScript.textContent);
        totalDuration = Number(timerRoot.dataset.routineTotal) || 0;
        resetTimer();
    } else {
        loadTasks();
    }

    // Fetch routine state
    fetch(`/routine/timer/${routineId}/state/`)
        .then(res => res.json())
        .then(state => {
            if (typeof state.current_task_index === 'number' && state.current_task_index >= 0) {
                currentTaskIndex = state.current_task_index;
            }
            currentSeconds = state.current_seconds;
            isPaused = state.is_paused;
            updateTimerDisplay();
            updateTasksDisplay();
        });

    // Handle back button click on mobile
    document.addEventListener('click', function (e) {
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer && timerContainer.classList.contains('fullscreen')) {
            const rect = timerContainer.getBoundingClientRect();
            // Check if click is in the "back" area (top-left corner)
            if (e.clientX < 80 && e.clientY < 50) {
                exitMobileFullscreen();
            }
        }
    });

    // Exit fullscreen on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            exitMobileFullscreen();
        }
    });
}

// Simple, reliable initialization
function waitForTimerRoot() {
    const timerRoot = document.getElementById('timer-root');
    if (timerRoot && !timerInitialized) {
        console.log('timer-root found, initializing...');
        initRoutineTimer();
    } else if (!timerInitialized) {
        // Keep checking every 100ms
        setTimeout(waitForTimerRoot, 100);
    }
}

// Start checking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTimerRoot);
} else {
    // DOM already loaded
    waitForTimerRoot();
}

// Backup check when window fully loads
window.addEventListener('load', function () {
    if (!timerInitialized) {
        waitForTimerRoot();
    }
});