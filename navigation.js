// Shared navigation functionality
const API_BASE_URL = 'https://schs-fbla-backend.vercel.app/api';

// Function to check if user is logged in
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
        
        // Redirect to home page instead of login
        window.location.href = 'index.html';
    }
}

// Function to update navigation based on login status
async function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const isLoggedIn = await checkLoginStatus();
    const currentUser = getCurrentUser();

    // Clear existing navigation
    navLinks.innerHTML = '';

    // Add common navigation links
    const commonLinks = [
        { href: 'index.html', text: 'Home' },
        { href: 'about.html', text: 'About Us' },
        { href: 'mission.html', text: 'Our Mission' }
    ];

    // Add common links
    commonLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        
        // Mark current page as active
        if (window.location.pathname.includes(link.href)) {
            a.classList.add('active');
        }
        
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    // Add login/logout based on status
    if (isLoggedIn) {
        // User is logged in - show dashboard
        const dashboardLi = document.createElement('li');
        const dashboardLink = document.createElement('a');
        dashboardLink.href = 'dashboard.html';
        dashboardLink.textContent = 'Dashboard';
        if (window.location.pathname.includes('dashboard.html')) {
            dashboardLink.classList.add('active');
        }
        dashboardLi.appendChild(dashboardLink);
        navLinks.appendChild(dashboardLi);

        // Add logout link
        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.classList.add('logout-link');
        logoutLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        logoutLi.appendChild(logoutLink);
        navLinks.appendChild(logoutLi);
    } else {
        // User is not logged in - show login
        const loginLi = document.createElement('li');
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';
        if (window.location.pathname.includes('login.html')) {
            loginLink.classList.add('active');
        }
        loginLi.appendChild(loginLink);
        navLinks.appendChild(loginLi);
    }
}

// Initialize navigation when page loads
document.addEventListener('DOMContentLoaded', updateNavigation); 