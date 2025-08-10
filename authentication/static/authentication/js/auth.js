// code to handle login form submission
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tabs button');
    const forms = document.querySelectorAll('.form');

    console.log('Found tab buttons:', tabButtons.length);
    console.log('Found forms:', forms.length);

    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Use aria-controls instead of data-tab
            const targetForm = this.getAttribute('aria-controls');
            console.log('Clicked tab with aria-controls:', targetForm);

            // Remove active class from all tabs and forms
            tabButtons.forEach(btn => {
                btn.setAttribute('aria-selected', 'false');
            });
            forms.forEach(form => form.classList.remove('active'));

            // Add active class to clicked tab
            this.setAttribute('aria-selected', 'true');

            // Show corresponding form
            const form = document.getElementById(targetForm);
            console.log('Found form element:', form);

            if (form) {
                form.classList.add('active');
                console.log('Added active class to form:', targetForm);
            } else {
                console.error('Form not found with ID:', targetForm);
            }
        });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            // Form will still submit normally, add enhancements here
            console.log('Login form submitted');
            console.log('Username:', this.username.value);
        });
    }

    // Signup form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            console.log('Signup form submitted');
            // Let the form submit normally
        });
    }
});