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
});
