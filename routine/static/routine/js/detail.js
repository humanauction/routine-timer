function initRoutineDetail() {
    // Start routine button
    const startButton = document.querySelector('.start-routine');
    if (startButton) {
        startButton.addEventListener('click', function (e) {
            e.preventDefault();
            const routineId = this.dataset.routineId;
            const startUrl = window.startRoutineUrl;
            const timerUrl = window.timerRoutineUrl;
            const csrfToken = window.csrfToken;

            fetch(startUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ routine_id: routineId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = timerUrl;
                    } else {
                        alert('Error starting routine: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while starting the routine.');
                });
        });
    }

    const routineId = window.routineId;

    // Setup delete task functionality
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function () {
            const taskItem = this.closest('.task-item');
            const itemId = taskItem.dataset.itemId;

            if (confirm('Are you sure you want to remove this task?')) {
                fetch(`/routines/item/${itemId}/remove/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': window.csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            taskItem.remove();
                            document.getElementById('total-duration').textContent = data.total;
                        } else {
                            alert('Error removing task: ' + data.error);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        });
    });

    // Setup drag and drop reordering with Sortable.js
    const taskList = document.getElementById('routine-tasks');
    if (taskList && window.Sortable) {
        new Sortable(taskList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                const items = taskList.querySelectorAll('.task-item');
                const newOrder = Array.from(items).map(item => item.dataset.itemId);

                fetch(`/routines/${routineId}/reorder/`, {
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
                        if (!data.success) {
                            console.error('Error:', data.error);
                            window.location.reload();
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        window.location.reload();
                    });
            }
        });
    }
}

// Auto-init on full page load
document.addEventListener('DOMContentLoaded', function () {
    initRoutineDetail();
});

// Export for AJAX loading
window.initRoutineDetail = initRoutineDetail;

function loadDetailScripts() {
    // Load detail.js if it's not already loaded
    if (!document.querySelector('script[src*="detail.js"]')) {
        const script = document.createElement('script');
        script.src = '/static/routine/js/detail.js';
        script.defer = true;
        script.onload = function () {
            // Initialize detail functionality after script loads
            if (window.initRoutineDetail) {
                window.initRoutineDetail();
            }
        };
        document.head.appendChild(script);
    } else {
        // Script already loaded, just initialize
        if (window.initRoutineDetail) {
            window.initRoutineDetail();
        }
    }
}