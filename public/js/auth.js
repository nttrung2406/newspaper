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


document.getElementById("passwordToggle").addEventListener("mousedown", function () {
  document.getElementById("loginPassword").type = "text";
});

document.getElementById("passwordToggle").addEventListener("mouseup", function () {
  document.getElementById("loginPassword").type = "password";
});

document.getElementById("signupLink").addEventListener("click", function () {
  console.log("clicked");
  document.getElementById("formTitle").textContent = "Sign Up";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("forgotPasswordForm").style.display = "none";
});

document.getElementById("loginLink").addEventListener("click", function () {
  document.getElementById("formTitle").textContent = "Log In";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "none";
});

document.getElementById("forgotPasswordLink").addEventListener("click", function () {
  document.getElementById("formTitle").textContent = "Forgot Password";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "block";
});

document.getElementById("backToLoginLink").addEventListener("click", function () {
  document.getElementById("formTitle").textContent = "Log In";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "none";
});


