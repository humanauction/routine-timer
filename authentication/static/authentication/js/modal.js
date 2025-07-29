// modal login signup
document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.getElementById("openAuthModal");
    const closeBtn = document.getElementById("closeAuthModal");
    const overlay = document.getElementById("authModalOverlay");

    openBtn.addEventListener("click", () => {
        overlay.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    // Optional: close modal when clicking outside
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.style.display = "none";
        }
    });
});
