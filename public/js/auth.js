document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    loginBtn.addEventListener("click", function () {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
    });

    signupBtn.addEventListener("click", function () {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        signupBtn.classList.add("active");
        loginBtn.classList.remove("active");
    });
});


