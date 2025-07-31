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
            localStorage.setItem("navCollapsed", isCollapsed);
        });
    }

    // Restore collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem("navCollapsed");
    if (savedCollapsedState === "true") {
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
    });

    // Message close buttons
    const messageCloseButtons = document.querySelectorAll(".message-close");
    messageCloseButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const message = this.parentElement;
            message.style.opacity = "0";
            setTimeout(() => {
                message.style.display = "none";
            }, 300);
        });
    });

    document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
        item.addEventListener('click', function(e) {
            // Only apply on mobile
            if (window.innerWidth > 768) return;

            e.preventDefault();
            
            // Get the panel associated with this item
            const target = this.getAttribute('data-panel');
            const panel = document.getElementById('panel-' + target);
            
            // If the panel is already active, just follow the link
            if (panel && panel.classList.contains('active')) {
                window.location.href = this.getAttribute('href');
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
                
                // Load content if not already loaded
                if (!panel.dataset.loaded) {
                    // Map panel names to URLs
                    let url = "#";
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
                            url = "/routine/list/";
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
                            url = "/contact/";
                            break;
                        case "home":
                            url = "/"; // Home page
                            break;
                        default:
                            url = "#";
                    }
                    
                    if (url !== "#") {
                        fetch(url)
                            .then(res => res.text())
                            .then(html => {
                                // Extract content from the full HTML
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = html;
                                // Find the content block
                                const content = tempDiv.querySelector('.routine-builder') || 
                                                tempDiv.querySelector('.timer-container') ||
                                                tempDiv.querySelector('main > div');
                                
                                if (content) {
                                    panel.innerHTML = content.outerHTML;
                                } else {
                                    // Fallback if specific content block isn't found
                                    panel.innerHTML = html;
                                }
                                panel.dataset.loaded = "true";
                            });
                    }
                }
            }
        });
    });
});
