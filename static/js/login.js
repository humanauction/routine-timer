/* Login and Registration Form Switching */
document.addEventListener('DOMContentLoaded', function () {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        loginTab.addEventListener('click', function () {
            loginTab.setAttribute('aria-selected', 'true');
            registerTab.setAttribute('aria-selected', 'false');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        registerTab.addEventListener('click', function () {
            loginTab.setAttribute('aria-selected', 'false');
            registerTab.setAttribute('aria-selected', 'true');
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    });