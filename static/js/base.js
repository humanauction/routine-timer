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
    const navLinks = document.querySelectorAll(".nav-item");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove("active");
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove("active");
                }
            }
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

        const navElement = document.querySelector('.main-nav');
        if (navElement) {
            navElement.querySelectorAll('.nav-item[data-panel]').forEach(item => {
                item.addEventListener('click', function (e) {
                    // Only apply on mobile
                    if (window.innerWidth > 768) return;
                    e.preventDefault();
                    e.stopImmediatePropagation();


                    // Get the panel associated with this item
                    const target = this.getAttribute('data-panel');
                    const panel = document.getElementById('panel-' + target);

                    // If the panel is already active, just follow the link
                    if (panel && panel.classList.contains('active')) {
                        const href = this.getAttribute('href');
                        if (href) {
                            window.location.href = href;
                        }
                        return;
                    }

                    // Collapse all panels
                    document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('active'));

                    // Remove active state from all nav-items
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

                    // Expand the clicked one
                    this.classList.add('active');

                    if (panel) {
                        panel.classList.add('active');
                        // Map panel names to URLs
                        let url = null;
                        switch (target) {
                            case "standalone-timer":
                                url = "/timer/standalone/";
                                break;
                            case "builder":
                                url = "/routine/builder/";
                                break;
                            case "timer":
                                url = "/routine/timer/";
                                break;
                            case "list":
                                url = "/routine/";
                                break;
                            case "signup":
                                url = "/accounts/signup/";
                                break;
                            case "logout":
                                url = "/accounts/logout/";
                                break;
                            case "login":
                                url = "/accounts/login/";
                                break;
                            case "contact":
                                url = "/home/contact/";
                                break;
                            case "home":
                                url = "/"; // Home page
                                break;
                            default:
                                url = null;
                        }
                        if (url) {
                            fetch(url)
                                .then(res => res.text())
                                .then(html => {
                                    // Extract content from the full HTML
                                    const tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = html;
                                    // Find the content block
                                    // Try each possible panel root class in order of specificity
                                    const content =
                                        // Standalone timer panel (timer app)
                                        tempDiv.querySelector('.standalone-timer-panel') ||
                                        // Generic panel content (used by some AJAX partials)
                                        tempDiv.querySelector('.panel-content') ||
                                        // Routine builder panel (routine app)
                                        tempDiv.querySelector('.routine-builder') ||
                                        // Timer container (routine app)
                                        tempDiv.querySelector('.timer-container') ||
                                        // Fallback: first div inside main
                                        tempDiv.querySelector('main > div');

                                    if (content) {
                                        panel.innerHTML = content.outerHTML;
                                        // Re-initialize standalone timer JS if this is the standalone-timer panel
                                        if (target === "standalone-timer" && typeof initStandaloneTimer === "function") {
                                            initStandaloneTimer();
                                        }
                                    } else {
                                        panel.innerHTML = html;
                                        // Fallback: also try to initialize if standalone-timer
                                        if (target === "standalone-timer" && typeof initStandaloneTimer === "function") {
                                            initStandaloneTimer();
                                        }
                                    }
                                    panel.dataset.loaded = "true";
                                })
                                .catch(error => {
                                    console.error("Fetch error:", error);
                                    panel.dataset.loaded = "true";
                                });
                        }
                    }
                });
            });
        }
    });

    // Only run on mobile
    if (window.innerWidth > 768) return;

    document.querySelectorAll('.nav-item[data-panel]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            // Remove .active from all nav-panels and nav-items
            document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

            // Add .active to clicked nav-item
            this.classList.add('active');

            // Find the corresponding panel
            const panelId = 'panel-' + this.getAttribute('data-panel');
            const panel = document.getElementById(panelId);

            if (panel) {
                panel.classList.add('active');
                // Only fetch if not already loaded
                if (!panel.dataset.loaded) {
                    fetch(this.href, {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    })
                        .then(res => res.text())
                        .then(html => {
                            // Try to extract main content from AJAX response
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            // Try to find a main content block (customize as needed)
                            const content = tempDiv.querySelector('.standalone-timer, .routine-builder, .panel-content, main > div');
                            panel.innerHTML = content ? content.outerHTML : html;
                            panel.dataset.loaded = "true";
                            // Optionally, re-init any JS for loaded content
                            if (panelId === "panel-standalone-timer" && typeof initStandaloneTimer === "function") {
                                initStandaloneTimer();
                            }
                        });
                }
            }
        });
    });
});
