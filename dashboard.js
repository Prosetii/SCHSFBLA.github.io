// Dashboard functionality for SCHS FBLA with backend integration
const API_BASE_URL = 'https://ourproject-indol.vercel.app/api';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard loaded, checking authentication...');
    
    // Check if user is logged in (function from navigation.js)
    const isLoggedIn = await checkLoginStatus();
    console.log('Login status result:', isLoggedIn);
    
    if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login page');
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    console.log('User is logged in, loading dashboard...');

    // Display user greeting
    const currentUser = getCurrentUser();
    console.log('Current user data:', currentUser);
    
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        if (currentUser && currentUser.username) {
            userGreeting.textContent = `Hello, ${currentUser.username}! (${currentUser.role || 'User'})`;
        } else {
            // Fallback: try to get user from localStorage directly
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userGreeting.textContent = `Hello, ${user.username || 'User'}! (${user.role || 'User'})`;
                } catch (e) {
                    userGreeting.textContent = 'Hello, User!';
                }
            } else {
                userGreeting.textContent = 'Hello, User!';
            }
        }
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