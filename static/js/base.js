document.addEventListener("DOMContentLoaded", function () {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const mainNav = document.querySelector(".main-nav");

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("active");
            this.classList.toggle("active");
        });
    }

    // Desktop nav collapse/expand
    const navToggle = document.getElementById("navToggle");
    const gridContainer = document.querySelector(".grid-container");

    if (navToggle) {
        navToggle.addEventListener("click", function () {
            gridContainer.classList.toggle("nav-collapsed");
            // Store preference in localStorage
            const isCollapsed =
                gridContainer.classList.contains("nav-collapsed");
            localStorage.setItem("navCollapsed", String(isCollapsed));
        });
    }

    // Restore collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem("navCollapsed");
    if (savedCollapsedState === "true" && gridContainer) {
        gridContainer.classList.add("nav-collapsed");
    }

    // Close menu when clicking on a link (mobile)
    const navLinks = document.querySelectorAll(".nav-item:not([data-panel])");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove("active");
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove("active");
                }
            }
        });
    });

    // Message close buttons
    const messageCloseButtons = document.querySelectorAll(".message-close");
    messageCloseButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const message = this.parentElement;
            message.style.opacity = "0";
            const computedStyle = window.getComputedStyle(message);
            let duration = computedStyle.transitionDuration || "0s";
            // Convert duration to milliseconds
            let ms = 0;
            if (duration.endsWith("ms")) {
                ms = parseFloat(duration);
            } else if (duration.endsWith("s")) {
                ms = parseFloat(duration) * 1000;
            }
            setTimeout(() => {
                message.style.display = "none";
            }, ms);
        });
    });

    // AJAX nav-panel handler for mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                // Remove .active from all nav-panels and nav-items
                document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

                // Add .active to clicked nav-item
                this.classList.add('active');

                // Find the corresponding panel
                const target = this.getAttribute('data-panel');
                const panel = document.getElementById('panel-' + target);

                // Use href for URL (recommended)
                let url = this.getAttribute('href');
                if (panel && url && (!panel.dataset.loaded || this.dataset.reload === 'true')) {
                    panel.classList.add('active');
                    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                        .then(res => res.text())
                        .then(html => {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            const content =
                                tempDiv.querySelector('.standalone-timer') ||
                                tempDiv.querySelector('.panel-content') ||
                                tempDiv.querySelector('.routine-builder') ||
                                tempDiv.querySelector('.timer-container') ||
                                tempDiv.querySelector('main > div');
                            panel.innerHTML = content ? content.outerHTML : html;
                            panel.dataset.loaded = "true";
                            // Re-initialize standalone timer JS if this is the standalone-timer panel
                            if (target === "standalone-timer" && typeof initStandaloneTimer === "function") {
                                initStandaloneTimer();
                            }
                            if (target === "builder" && typeof initRoutineBuilder === "function") {
                                initRoutineBuilder();
                            }
                            if (target === "timer" && typeof initRoutineTimer === "function") {
                                initRoutineTimer();
                            }
                            if (target === "detail" && typeof initRoutineDetail === "function") {
                                initRoutineDetail();
                            }

                        })
                        .catch(error => {
                            console.error("Fetch error:", error);
                            panel.dataset.loaded = "true";
                        });
                }
            });
        });
    }

    // Routine name input handler
    const routineNameInput = document.getElementById('routineName');
    if (routineNameInput) {
        routineNameInput.addEventListener('input', function () {
            const value = this.value.trim();
            const submitButton = document.getElementById('submitRoutine');
            if (submitButton) {
                // Enable or disable the button based on input
                submitButton.disabled = value.length === 0;
            }
        });
    }

    // Submit routine form
    const routineForm = document.getElementById('routineForm');
    if (routineForm) {
        routineForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const routineName = formData.get('routine_name');

            // Basic validation
            if (!routineName) {
                alert('Routine name is required');
                return;
            }

            // AJAX request to save the routine
            fetch(this.action, {
                method: this.method,
                body: JSON.stringify({
                    routine_name: routineNameInput.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Optionally, update the UI or redirect
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });
    }
});
