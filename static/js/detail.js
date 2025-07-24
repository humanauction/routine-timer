document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.start-routine');
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            e.preventDefault();
            const routineId = this.dataset.routineId;
            
            // Send AJAX request to start the routine
            // Replace these URLs and CSRF token with actual values passed from your Django template
            const startUrl = window.startRoutineUrl; // e.g., set in template: <script>window.startRoutineUrl = "{% url 'routine:start' %}";</script>
            const timerUrl = window.timerRoutineUrl; // e.g., set in template: <script>window.timerRoutineUrl = "{% url 'routine:timer' %}";</script>
            const csrfToken = window.csrfToken; // e.g., set in template: <script>window.csrfToken = "{{ csrf_token }}";</script>

            fetch(startUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
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