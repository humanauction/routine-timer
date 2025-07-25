/* Login and Registration Form Switching */
document.addEventListener('DOMContentLoaded', function() {
    // Get tab elements
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // tab switching
    loginTab.addEventListener('click', function() {
        loginTab.setAttribute('aria-selected', 'true');
        registerTab.setAttribute('aria-selected', 'false');
        
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', function() {
        registerTab.setAttribute('aria-selected', 'true');
        loginTab.setAttribute('aria-selected', 'false');
        
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Ensure forms submit to the right place
    loginForm.addEventListener('submit', function(e) {
        // Regular form submission
    });
    
    registerForm.addEventListener('submit', function(e) {
        // Regular form submission to signup URL
    });
});