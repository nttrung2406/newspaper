
document.addEventListener('DOMContentLoaded', () => {
    const formSignup = document.getElementById('signup-form');
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
    
});
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('login-form');
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password}),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert('User login successfully!');
                //navigate to home page
                window.location.href = '/index';

            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('An error occurred while signing up.');
        }
    });
});
