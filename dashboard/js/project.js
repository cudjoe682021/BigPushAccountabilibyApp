requireSession();

const user = getUser();
if (user) {
  document.getElementById('whoami').textContent = `${user.name} (${user.role})`;
}

document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});

const projectId = new URLSearchParams(window.location.search).get('id');
if (!projectId) {
  window.location.href = 'projects.html';
}

const CATEGORY_LABELS = {
  WORK_STOPPED: 'Work stopped',
  NO_WORKERS: 'No workers on site',
  ROAD_DAMAGED: 'Road damaged',
  CONTRACTOR_WORKING: 'Contractor working',
  OTHER: 'Other',
};

async function loadProject() {
  const project = await apiFetch(`/api/projects/${projectId}`);

  document.getElementById('project-name').textContent = project.name;
  document.getElementById('project-meta').textContent =
    `${project.location}${project.region ? ' · ' + project.region : ''} · ${project.contractor ? project.contractor.name : 'Unknown contractor'}`;

  const badge = document.getElementById('project-status-badge');
  badge.className = statusBadgeClass(project.status);
  badge.textContent = statusLabel(project.status);

  renderInspectionHistory(project.inspections || []);
}

function renderInspectionHistory(inspections) {
  const el = document.getElementById('inspection-history');
  if (inspections.length === 0) {
    el.textContent = 'No inspections logged yet.';
    return;
  }

  el.innerHTML = '';
  for (const inspection of inspections) {
    const item = document.createElement('div');
    item.className = 'inspection-item';
    const date = new Date(inspection.inspectionDate).toLocaleDateString();
    item.innerHTML = `<strong>${inspection.percentComplete}% complete</strong> — ${date} by ${inspection.officerName}` +
      (inspection.delays ? `<br><span class="muted">Delays: ${escapeHtml(inspection.delays)}</span>` : '') +
      (inspection.notes ? `<br><span class="muted">${escapeHtml(inspection.notes)}</span>` : '');
    el.appendChild(item);
  }
}

async function loadReportQueue() {
  const el = document.getElementById('report-queue');
  try {
    const reports = await apiFetch(`/api/community-reports?projectId=${projectId}&reviewStatus=UNREVIEWED`);

    if (reports.length === 0) {
      el.textContent = 'Nothing to review — all caught up.';
      return;
    }

    el.innerHTML = '';
    for (const report of reports) {
      el.appendChild(renderReportItem(report));
    }
  } catch (err) {
    el.textContent = `Couldn't load reports: ${err.message}`;
  }
}

function renderReportItem(report) {
  const item = document.createElement('div');
  item.className = 'report-item';

  const date = new Date(report.submittedAt).toLocaleString();
  const who = report.reporterName ? escapeHtml(report.reporterName) : 'Anonymous';

  item.innerHTML = `
    <strong>${CATEGORY_LABELS[report.category] || report.category}</strong>
    <span class="muted"> — ${date} — reported by ${who}</span>
  `;

  const actions = document.createElement('div');
  actions.className = 'report-actions';

  const verifyBtn = document.createElement('button');
  verifyBtn.textContent = 'Verify';
  verifyBtn.addEventListener('click', () => reviewReport(report.id, 'VERIFIED', item));

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'secondary';
  dismissBtn.textContent = 'Dismiss';
  dismissBtn.addEventListener('click', () => reviewReport(report.id, 'DISMISSED', item));

  actions.appendChild(verifyBtn);
  actions.appendChild(dismissBtn);
  item.appendChild(actions);

  return item;
}

async function reviewReport(reportId, reviewStatus, itemEl) {
  try {
    await apiFetch(`/api/community-reports/${reportId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewStatus }),
    });
    itemEl.remove();
  } catch (err) {
    alert(`Couldn't update report: ${err.message}`);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('inspection-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('inspection-error');
  errorEl.style.display = 'none';

  const percentComplete = Number(document.getElementById('percentComplete').value);
  const projectStatus = document.getElementById('projectStatus').value || undefined;
  const delays = document.getElementById('delays').value || undefined;
  const notes = document.getElementById('notes').value || undefined;

  try {
    await apiFetch('/api/inspections', {
      method: 'POST',
      body: JSON.stringify({ projectId, percentComplete, projectStatus, delays, notes }),
    });
    document.getElementById('inspection-form').reset();
    loadProject();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
});

loadProject();
loadReportQueue();
