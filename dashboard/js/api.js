// Shared fetch helper for the Phase 3 dashboard. Same-origin by default
// since the dashboard is served by the same Express app as the API
// (see app.use('/dashboard', ...) in src/server.js); override by loading
// this page with ?api=https://your-api-host before login if the dashboard
// is ever split out to its own static host.
const API_BASE = new URLSearchParams(window.location.search).get('api') || '';

function getToken() {
  return localStorage.getItem('bigpush_token');
}

function getUser() {
  const raw = localStorage.getItem('bigpush_user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('bigpush_token', token);
  localStorage.setItem('bigpush_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('bigpush_token');
  localStorage.removeItem('bigpush_user');
}

// Redirects to the login page if there's no stored token. Call this at the
// top of any page that requires a logged-in officer/admin.
function requireSession() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}

// Wraps fetch with the Authorization header and JSON handling. On a 401
// from an authenticated call (a token was sent and rejected) it clears the
// session and bounces to login. The login call itself never has a token to
// expire, so its 401s (wrong password) are left for the caller to handle —
// otherwise a failed login would silently redirect back to the same page
// instead of showing "Invalid email or password".
async function apiFetch(path, options = {}) {
  const isLoginCall = path === '/api/auth/login';
  const headers = Object.assign({}, options.headers, {
    Authorization: `Bearer ${getToken()}`,
  });
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));

  if (res.status === 401 && !isLoginCall) {
    clearSession();
    window.location.href = 'index.html';
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function statusBadgeClass(status) {
  return `badge badge-${String(status).toLowerCase().replace(/_/g, '-')}`;
}

function statusLabel(status) {
  const labels = {
    ON_SCHEDULE: 'On schedule',
    DELAYED: 'Delayed',
    WORK_STOPPED: 'Work stopped',
    NOT_RECENTLY_VERIFIED: 'Not recently verified',
  };
  return labels[status] || status;
}
