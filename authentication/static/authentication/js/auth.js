// code to handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Form will still submit normally, add enhancements here
            console.log('Login form submitted');
            console.log('Username:', this.username.value);
        });
    }


// Add signup form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            console.log('Signup form submitted');
            // Let the form submit normally
        });
    }
});