// Dashboard functionality for SCHS FBLA with backend integration

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== DASHBOARD.JS LOADED ===');
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
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('localStorage authToken:', localStorage.getItem('authToken'));
    
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        if (currentUser && currentUser.username) {
            console.log('Setting greeting with username:', currentUser.username);
            userGreeting.textContent = `Hello, ${currentUser.username}! (${currentUser.role || 'User'})`;
        } else {
            console.log('No currentUser or username, trying fallback...');
            // Fallback: try to get user from localStorage directly
            const userStr = localStorage.getItem('currentUser');
            console.log('Direct localStorage userStr:', userStr);
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    console.log('Parsed user from localStorage:', user);
                    userGreeting.textContent = `Hello, ${user.username || 'User'}! (${user.role || 'User'})`;
                } catch (e) {
                    console.error('Error parsing user from localStorage:', e);
                    userGreeting.textContent = 'Hello, User!';
                }
            } else {
                console.log('No user data in localStorage');
                userGreeting.textContent = 'Hello, User!';
            }
        }
    }

    // Show admin section if user is admin
    const adminSection = document.getElementById('adminSection');
    if (adminSection && currentUser && currentUser.role === 'admin') {
        adminSection.style.display = 'block';
        console.log('Admin section shown for user:', currentUser.username);
    }

    // Add click handlers for admin buttons
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            showAddUserModal();
        });
    }

    const viewUsersBtn = document.getElementById('viewUsersBtn');
    if (viewUsersBtn) {
        viewUsersBtn.addEventListener('click', function() {
            showUsersList();
        });
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

// Admin Functions
function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New User</h3>
                <span class="close">&times;</span>
            </div>
            <form id="addUserForm">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="role">Role:</label>
                    <select id="role" name="role" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add User</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = closeModal;
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Handle form submission
    const form = document.getElementById('addUserForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        await addNewUser(form);
    };
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

async function addNewUser(form) {
    const formData = new FormData(form);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    try {
        const response = await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response && response.ok) {
            alert('User created successfully!');
            closeModal();
        } else {
            const error = await response.json();
            alert('Error creating user: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error creating user. Please try again.');
    }
}

async function showUsersList() {
    try {
        const response = await apiRequest('/users');
        if (response && response.ok) {
            const data = await response.json();
            displayUsersList(data.users);
        } else {
            alert('Error loading users list');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users list');
    }
}

function displayUsersList(users) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Users List</h3>
                <span class="close">&times;</span>
            </div>
            <div class="users-list">
                ${users.map(user => `
                    <div class="user-item">
                        <div class="user-info">
                            <strong>${user.username}</strong>
                            <span class="user-email">${user.email}</span>
                            <span class="user-role">${user.role}</span>
                        </div>
                        <div class="user-actions">
                            <button onclick="editUser(${user.id})" class="btn-small">Edit</button>
                            <button onclick="deleteUser(${user.id})" class="btn-small btn-danger">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = closeModal;
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    };
} 