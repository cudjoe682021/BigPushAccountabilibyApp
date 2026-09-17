import { API_BASE_URL } from '../config';

async function request(path, options = {}) {
const res = await fetch(`${API_BASE_URL}${path}`, {
headers: { 'Content-Type': 'application/json' },
...options,
});

if (!res.ok) {
const body = await res.json().catch(() => ({}));
throw new Error(body.error || `Request failed: ${res.status}`);
}

return res.json();
}

export function listProjects(filters = {}) {
const params = new URLSearchParams(filters).toString();
return request(`/api/projects${params ? `?${params}` : ''}`);
}

export function getProject(id) {
return request(`/api/projects/${id}`);
}

export function submitCommunityReport(payload) {
return request('/api/community-reports', {
method: 'POST',
body: JSON.stringify(payload),
});
}

export function getGroupedReports(projectId) {
return request(`/api/community-reports/grouped?projectId=${projectId}`);
}
