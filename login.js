// Backend API connection for SCHS FBLA
const API_BASE_URL = 'https://myproject-1vypt4c7v-seth-durazos-projects.vercel.app/api';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        showMessage('Logging in...', 'info');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
        
        try {
            // Send login request to backend
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store JWT token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                // Show error message from backend
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please check your connection or ensure the backend is deployed.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });

    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = `login-message ${type}`;
        
        // Clear message after 5 seconds (except for success messages)
        if (type !== 'success') {
            setTimeout(() => {
                loginMessage.textContent = '';
                loginMessage.className = 'login-message';
            }, 5000);
        }
    }
});

// Function to check if user is logged in (can be used on other pages)
async function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            return true;
        } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            return false;
        }
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// Function to get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Function to logout
async function logout() {
    const token = localStorage.getItem('authToken');
    
    try {
        // Call logout endpoint (optional)
        if (token) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Function to make authenticated API requests
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options
    });

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
        return null;
    }

    return response;
} 