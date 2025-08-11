// --- fullscreen auth panel helper funct ---
function enterAuthFullscreen() {
    const panel = document.querySelector('.nav-panel.active');
    if (panel && window.innerWidth <= 768) {
        panel.classList.add('auth-fullscreen');
        // back btn support
        if (!panel.querySelector('.back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
            backBtn.setAttribute('aria-label', 'Back');
            backBtn.onclick = function () {
                panel.classList.remove('auth-fullscreen');
                panel.classList.remove('active');
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            };
            panel.prepend(backBtn);
        }
    }
}

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

    // Ensure navbar login button navigates on click
    const loginBtn = document.querySelector('.nav-item.login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            if (this.getAttribute('data-panel') === 'login') {
                window.location.href = this.getAttribute('href');
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        });
    }
    function handleAuthPanelLoad(target) {
        if (target === 'login' || target === 'signup') {
            enterAuthFullscreen();
        }
    }
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
                            if (target === "login" || target === "signup") {
                                handleAuthPanelLoad(target);
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

    // Handle direct navigation
    handleDirectNavigation();

    // Also handle browser back/forward buttons
    window.addEventListener('popstate', function (event) {
        if (window.innerWidth <= 768) {
            handleDirectNavigation();
        }
    });
});

// replace the direct navigation handler

function handleDirectNavigation() {
    if (window.innerWidth <= 768) {
        const path = window.location.pathname;

        // Handle detail pages via AJAX
        if (path.startsWith('/routine/detail/')) {
            handleDetailPageAjax(path);
        } else if (path.startsWith('/routine/timer/')) {
            handleTimerPageAjax(path);
        } else if (path === '/routine/') {
            // Handle direct navigation to routine list
            const listNavItem = document.querySelector('[data-panel="list"]');
            if (listNavItem) {
                // Simulate clicking the nav item to load list content
                listNavItem.click();
            }
        }
        // Add other direct navigation cases as needed
    }
}

function handleDetailPageAjax(path) {
    const listNavItem = document.querySelector('[data-panel="list"]');
    const listPanel = document.getElementById('panel-list');

    if (!listNavItem || !listPanel) {
        console.error('List nav item or panel not found');
        window.location.href = path;
        return;
    }

    // Activate the list nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    listNavItem.classList.add('active');

    // Hide main content and show panel
    const main = document.querySelector('main');
    if (main) main.style.display = 'none';

    // Hide all panels first
    document.querySelectorAll('.nav-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Show loading state
    listPanel.innerHTML = '<div class="loading">Loading...</div>';
    listPanel.classList.add('active');

    console.log('Fetching detail page:', path); // Debug

    // Load detail content via AJAX
    fetch(path, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('Raw HTML response:', html.substring(0, 500)); // Debug - see first 500 chars

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Debug: Log what elements are available
            console.log('Available elements:', {
                detailContent: !!doc.querySelector('#detail-content'),
                detailContentClass: !!doc.querySelector('.detail-content'),
                mainContent: !!doc.querySelector('.main-content'),
                main: !!doc.querySelector('main'),
                routineDetail: !!doc.querySelector('.routine-detail'),
                container: !!doc.querySelector('.container'),
                body: !!doc.body
            });

            // Try multiple selectors to find content
            let content =
                doc.querySelector('.routine-detail') ||
                doc.querySelector('#detail-content') ||
                doc.querySelector('.detail-content') ||
                doc.querySelector('.main-content') ||
                doc.querySelector('main') ||
                doc.querySelector('.container') ||
                doc.body; // Fallback

            if (content) {
                console.log('Found content with:', content.className || content.tagName);
                listPanel.innerHTML = content.innerHTML;
                // Load detail-specific JS
                loadDetailScripts();
            } else {
                console.error('Could not find any content in response');
                console.log('Full HTML:', html); // Debug - see full response
                listPanel.innerHTML = '<p>Error loading content</p>';
            }
        })
        .catch(error => {
            console.error('Error loading detail page:', error);
            listPanel.innerHTML = '<p>Error loading page. Please try again.</p>';
        });
}

function handleTimerPageAjax(path) {
    // Similar to detail, but for timer pages
    const timerPanel = document.getElementById('panel-timer');

    if (timerPanel) {
        // Your timer AJAX loading logic here
        fetch(path, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Parse the response and extract content
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Look for timer_content specifically
                let content = doc.querySelector('#timer-content, .timer-content, .main-content, main');

                if (content) {
                    timerPanel.innerHTML = content.innerHTML;
                    timerPanel.classList.add('active');

                    // Hide other panels
                    document.querySelectorAll('.nav-panel').forEach(panel => {
                        if (panel !== timerPanel) {
                            panel.classList.remove('active');
                        }
                    });

                    // Load timer-specific JS if needed
                    loadTimerScripts();
                } else {
                    console.error('Could not find content in response');
                    timerPanel.innerHTML = '<p>Error loading content</p>';
                    timerPanel.classList.add('active');
                }
            })
            .catch(error => {
                console.error('Error loading timer page:', error);
                timerPanel.innerHTML = '<p>Error loading page. Please try again.</p>';
                timerPanel.classList.add('active');
            });
    }
}

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

function loadTimerScripts() {
    // Load timer.js if it's not already loaded
    if (!document.querySelector('script[src*="timer.js"]')) {
        const script = document.createElement('script');
        script.src = '/static/routine/js/timer.js';
        script.defer = true;
        script.onload = function () {
            // Initialize timer functionality after script loads
            if (window.initRoutineTimer) {
                window.initRoutineTimer();
            }
        };
        document.head.appendChild(script);
    } else {
        // Script already loaded, just initialize
        if (window.initRoutineTimer) {
            window.initRoutineTimer();
        }
    }
}

