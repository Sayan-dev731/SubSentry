// ================================
// Configuration
// ================================
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'subsentry_token';
const USER_KEY = 'subsentry_user';

// ================================
// Utility Functions
// ================================
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showLoader(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'block';
    button.disabled = true;
}

function hideLoader(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    button.disabled = false;
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
}

function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
}

// ================================
// API Functions
// ================================
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// ================================
// Authentication Functions
// ================================
function initAuthHandlers() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    hideError('login-error');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    showLoader(submitBtn);

    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        setToken(response.data.token);
        setUser(response.data.user);
        window.location.href = '/dashboard';
    } catch (error) {
        showError('login-error', error.message || 'Login failed. Please check your credentials.');
    } finally {
        hideLoader(submitBtn);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    hideError('register-error');

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Client-side validation
    if (password !== passwordConfirm) {
        showError('register-error', 'Passwords do not match');
        return;
    }

    if (password.length < 8) {
        showError('register-error', 'Password must be at least 8 characters long');
        return;
    }

    showLoader(submitBtn);

    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        setToken(response.data.token);
        setUser(response.data.user);
        window.location.href = '/dashboard';
    } catch (error) {
        showError('register-error', error.message || 'Registration failed. Please try again.');
    } finally {
        hideLoader(submitBtn);
    }
}

function handleLogout() {
    removeToken();
    window.location.href = '/';
}

// ================================
// Dashboard Functions
// ================================
function initDashboard() {
    // Set user email
    const user = getUser();
    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl && user) {
        userEmailEl.textContent = user.email;
    }

    // Attach event listeners
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const addBtn = document.getElementById('add-subscription-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = '/subscription-form';
        });
    }

    const addFirstBtn = document.querySelector('.add-first-btn');
    if (addFirstBtn) {
        addFirstBtn.addEventListener('click', () => {
            window.location.href = '/subscription-form';
        });
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSubscriptions);
    }

    // Load data
    loadSubscriptions();
    loadStats();
}

async function loadSubscriptions() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.getElementById('table-container');
    const tbody = document.getElementById('subscriptions-tbody');

    // Show loading
    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'none';

    try {
        const response = await apiCall('/subscriptions');
        const subscriptions = response.data.subscriptions;

        if (loadingState) loadingState.style.display = 'none';

        if (subscriptions.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (tableContainer) tableContainer.style.display = 'block';
            renderSubscriptions(subscriptions);
        }
    } catch (error) {
        if (loadingState) loadingState.style.display = 'none';
        console.error('Failed to load subscriptions:', error);

        // Check if unauthorized
        if (error.message.includes('Unauthorized') || error.message.includes('token')) {
            removeToken();
            window.location.href = '/';
        }
    }
}

async function checkAndUpdateUserVerification() {
    try {
        const token = getToken();
        if (!token) return;

        const response = await apiCall('/auth/me');
        if (response && response.data && response.data.user) {
            const currentUser = getUser();
            const updatedUser = response.data.user;

            // Update local storage if verification status changed
            if (currentUser && currentUser.is_verified !== updatedUser.is_verified) {
                setUser(updatedUser);
            }
        }
    } catch (error) {
        console.error('Failed to check user verification:', error);
    }
}

function renderSubscriptions(subscriptions) {
    const tbody = document.getElementById('subscriptions-tbody');
    if (!tbody) return;

    tbody.innerHTML = subscriptions.map(sub => {
        // Get URL from subscription data
        let websiteUrl = sub.website_url || '';

        // If we have subscription-logos.js loaded, get the default URL
        if (typeof getSubscription === 'function' && sub.logo_id && sub.logo_id !== 'other') {
            const logoData = getSubscription(sub.logo_id);
            if (logoData && !websiteUrl) {
                websiteUrl = logoData.defaultUrl;
            }
        }

        // Create clickable name or plain text (without icons)
        const nameDisplay = websiteUrl
            ? `<a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" style="color: #0078D4; text-decoration: none;">
                <strong>${escapeHtml(sub.name)}</strong>
              </a>`
            : `<strong>${escapeHtml(sub.name)}</strong>`;

        return `
            <tr>
                <td data-label="Service">${nameDisplay}</td>
                <td data-label="Renewal Date">${formatDate(sub.renewal_date)}</td>
                <td data-label="Cost">${formatCurrency(sub.cost)}</td>
                <td data-label="Reminder">${sub.reminder_offset_days} days before</td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="btn btn-small btn-secondary" onclick="editSubscription('${sub.id}')">
                            Edit
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="deleteSubscription('${sub.id}', '${escapeHtml(sub.name)}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadStats() {
    try {
        const response = await apiCall('/subscriptions/stats/summary');
        const stats = response.data.stats;

        // Update stat cards
        document.getElementById('stat-total').textContent = stats.total_subscriptions || 0;
        document.getElementById('stat-cost').textContent = formatCurrency(stats.total_cost || 0);
        document.getElementById('stat-average').textContent = formatCurrency(stats.average_cost || 0);

        const nextRenewal = stats.next_renewal_date ? formatDate(stats.next_renewal_date) : '—';
        document.getElementById('stat-next').textContent = nextRenewal;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function editSubscription(id) {
    window.location.href = `/subscription-form?id=${id}`;
}

async function deleteSubscription(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        await apiCall(`/subscriptions/${id}`, { method: 'DELETE' });
        loadSubscriptions();
        loadStats();
    } catch (error) {
        alert('Failed to delete subscription: ' + error.message);
    }
}

// ================================
// Subscription Form Functions
// ================================
function initSubscriptionForm() {
    const form = document.getElementById('subscription-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('id');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => handleSubscriptionSubmit(e, subscriptionId));
    }

    // If editing, load subscription data
    if (subscriptionId) {
        loadSubscriptionForEdit(subscriptionId);
    }
}

async function loadSubscriptionForEdit(id) {
    const formTitle = document.getElementById('form-title');
    const submitText = document.getElementById('submit-text');

    try {
        const response = await apiCall(`/subscriptions/${id}`);
        const sub = response.data.subscription;

        // Update form title
        if (formTitle) formTitle.textContent = 'Edit Subscription';
        if (submitText) submitText.textContent = 'Update Subscription';

        // Populate form fields
        document.getElementById('name').value = sub.name;
        document.getElementById('cost').value = sub.cost;

        // Format date for input (YYYY-MM-DD)
        const date = new Date(sub.renewal_date);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('renewal_date').value = formattedDate;

        document.getElementById('reminder_offset_days').value = sub.reminder_offset_days;

        // Populate website URL if exists
        const websiteUrlInput = document.getElementById('website_url');
        if (websiteUrlInput && sub.website_url) {
            websiteUrlInput.value = sub.website_url;
        }
    } catch (error) {
        showError('form-error', 'Failed to load subscription data');
        console.error(error);
    }
}

async function handleSubscriptionSubmit(e, subscriptionId) {
    e.preventDefault();
    hideError('form-error');

    const name = document.getElementById('name').value;
    const cost = parseFloat(document.getElementById('cost').value);
    const renewal_date = document.getElementById('renewal_date').value;
    const reminder_offset_days = parseInt(document.getElementById('reminder_offset_days').value);
    const website_url = document.getElementById('website_url') ? document.getElementById('website_url').value : '';
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const data = {
        name,
        cost,
        renewal_date,
        reminder_offset_days,
        logo_id: 'other',
        website_url
    };

    showLoader(submitBtn);

    try {
        if (subscriptionId) {
            // Update existing
            await apiCall(`/subscriptions/${subscriptionId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showSuccess('form-success', 'Subscription updated successfully!');
        } else {
            // Create new
            await apiCall('/subscriptions', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showSuccess('form-success', 'Subscription created successfully!');
        }

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (error) {
        showError('form-error', error.message || 'Failed to save subscription');
    } finally {
        hideLoader(submitBtn);
    }
}

// ================================
// Utility: Escape HTML
// ================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
