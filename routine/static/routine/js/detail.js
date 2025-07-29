document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.start-routine');
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            e.preventDefault();
            const routineId = this.dataset.routineId;
            
            // Get values from window variables set in the template
            const startUrl = window.startRoutineUrl;
            const timerUrl = window.timerRoutineUrl;
            const csrfToken = window.csrfToken;  // Make sure this is set in your template

            fetch(startUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken,  // Use the variable, not template syntax
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
});

document.addEventListener('DOMContentLoaded', function() {
    const routineId = window.routineId;
    
    // Setup delete task functionality
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const taskItem = this.closest('.task-item');
            const itemId = taskItem.dataset.itemId;
            
            if (confirm('Are you sure you want to remove this task?')) {
                fetch(`/routines/item/${itemId}/remove/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the task from DOM
                        taskItem.remove();
                        
                        // Update total time
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
    if (taskList) {
        new Sortable(taskList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            onEnd: function(evt) {
                // Get the new order as array of item IDs
                const items = taskList.querySelectorAll('.task-item');
                const newOrder = Array.from(items).map(item => 
                    item.dataset.itemId);
                
                // Send the new order to the server
                fetch(`/routines/${routineId}/reorder/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': '{{ csrf_token }}',
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
});