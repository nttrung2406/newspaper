document.addEventListener('DOMContentLoaded', () => {
    // Signup form submission
    const formSignup = document.getElementById('signup-form');
    if (formSignup) {
        formSignup.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const role = document.getElementById('signup-role').value;

            try {
                const response = await fetch('/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, role }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('User created successfully!');
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (err) {
                console.error('Signup error:', err);
                alert('An error occurred while signing up.');
            }
        });
    }

    // Login form submission
    const formLogin = document.getElementById('login-form');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                let data;
                if (response.headers.get('Content-Type')?.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = { message: await response.text() };
                }

                if (response.ok) {
                    window.location.href = '/index'; // Navigate to home page
                } else {
                    alert(`Error: ${data.message || 'An unknown error occurred'}`);
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An error occurred while logging in.');
            }
        });
    }

    // forgot password
    const formForgot = document.getElementById('forgot-password-form');
    if (formForgot) {
        formForgot.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('forgot-password-email').value;
            console.log(email);
            try {
                const response = await fetch('/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Password reset link sent to your email.');
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (err) {
                console.error('Error sending forgot password request:', err);
            }
        });
    }



    // Reset password form submission
    const formReset = document.getElementById('reset-password-form');
    if (formReset) {
        formReset.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
        });
    }
});
