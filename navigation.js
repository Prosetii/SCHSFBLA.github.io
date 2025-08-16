// Shared navigation functionality
const API_BASE_URL = 'https://ourproject-yd1uwfyof-seth-durazos-projects.vercel.app/api';

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

    // Clear existing navigation completely
    navLinks.innerHTML = '';

    const isLoggedIn = await checkLoginStatus();

    // Create navigation HTML based on login status
    let navigationHTML = '';
    
    // Common links
    navigationHTML += '<li><a href="index.html">Home</a></li>';
    navigationHTML += '<li><a href="about.html">About Us</a></li>';
    navigationHTML += '<li><a href="mission.html">Our Mission</a></li>';
    
    if (isLoggedIn) {
        // User is logged in - show dashboard and logout
        navigationHTML += '<li><a href="dashboard.html">Dashboard</a></li>';
        navigationHTML += '<li><a href="#" class="logout-link" onclick="logout(); return false;">Logout</a></li>';
    } else {
        // User is not logged in - show login
        navigationHTML += '<li><a href="login.html">Login</a></li>';
    }
    
    // Set the navigation HTML
    navLinks.innerHTML = navigationHTML;
    
    // Mark current page as active
    const currentPath = window.location.pathname;
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// Initialize navigation when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
} 