/* Login and Registration Form Switching */
document.addEventListener('DOMContentLoaded', function() {
    // Get tab elements
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Make sure we found all elements
    console.log("Elements found:", {
        loginTab: !!loginTab,
        signupTab: !!signupTab, 
        loginForm: !!loginForm, 
        signupForm: !!signupForm
    });
    
    // Only set up listeners if all elements are found
    if (loginTab && signupTab && loginForm && signupForm) {
        // tab switching
        loginTab.addEventListener('click', function() {
            loginTab.setAttribute('aria-selected', 'true');
            signupTab.setAttribute('aria-selected', 'false');
            
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });
        
        signupTab.addEventListener('click', function() {
            signupTab.setAttribute('aria-selected', 'true');
            loginTab.setAttribute('aria-selected', 'false');
            
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    } else {
        console.error("Some tab/form elements not found");
    }
    
    // Check if there are form errors and show the appropriate tab
    const hasLoginErrors = document.querySelector('#loginForm .error-message');
    const hasSignupErrors = document.querySelector('#signupForm .error-message');
    
    if (hasSignupErrors && signupTab && signupForm) {
        // Show signup tab if there are signup form errors
        signupTab.setAttribute('aria-selected', 'true');
        loginTab.setAttribute('aria-selected', 'false');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
});