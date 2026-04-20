const API_BASE = '/api';

// Utility for handling Auth token
const setToken = (token) => localStorage.setItem('token', token);
const getToken = () => localStorage.getItem('token');
const removeToken = () => localStorage.removeItem('token');

// Redirect helpers
const enforceAuth = () => {
    if(!getToken()) {
        window.location.href = 'login.html';
    }
}

const checkLoggedIn = () => {
    if(getToken() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Global Headers
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'x-auth-token': getToken()
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Logic - Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        checkLoggedIn();
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            errorDiv.classList.add('d-none');

            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Login Failed');
                
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    // Auth Logic - Register
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const errorDiv = document.getElementById('regError');
            errorDiv.classList.add('d-none');

            try {
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Registration Failed');
                
                setToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeToken();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});
