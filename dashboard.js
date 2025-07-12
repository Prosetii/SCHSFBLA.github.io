// Dashboard functionality for SCHS FBLA with backend integration
const API_BASE_URL = 'https://ourproject-indol.vercel.app/api';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Display user greeting
    const currentUser = getCurrentUser();
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting && currentUser) {
        userGreeting.textContent = `Hello, ${currentUser.username}! (${currentUser.role})`;
    }

    // Load user profile data
    await loadUserProfile();

    // Add click handlers for dashboard cards
    const dashboardButtons = document.querySelectorAll('.dashboard-card button');
    dashboardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardTitle = this.closest('.dashboard-card').querySelector('h3').textContent;
            alert(`You clicked on: ${cardTitle}\n\nThis feature is coming soon!`);
        });
    });
});

// Load user profile from backend
async function loadUserProfile() {
    try {
        const response = await apiRequest('/users/profile');
        if (response && response.ok) {
            const data = await response.json();
            console.log('User profile loaded:', data.user);
            
            // You can display additional user info here
            // For example, show email, last login, etc.
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Function to check if user is logged in (imported from login.js)
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

// Function to get current user (imported from login.js)
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Function to logout (imported from login.js)
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

// Function to make authenticated API requests (imported from login.js)
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