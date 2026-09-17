requireSession();

const user = getUser();
if (user) {
  document.getElementById('whoami').textContent = `${user.name} (${user.role})`;
}

document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});

async function loadProjects() {
  const listEl = document.getElementById('project-list');
  try {
    const projects = await apiFetch('/api/projects');

    if (projects.length === 0) {
      listEl.textContent = 'No projects yet.';
      return;
    }

    listEl.innerHTML = '';
    for (const project of projects) {
      const row = document.createElement('a');
      row.className = 'project-row';
      row.href = `project.html?id=${project.id}`;

      const left = document.createElement('div');
      left.innerHTML = `<strong>${project.name}</strong><br><span class="muted">${project.location}${project.region ? ' · ' + project.region : ''}</span>`;

      const badge = document.createElement('span');
      badge.className = statusBadgeClass(project.status);
      badge.textContent = statusLabel(project.status);

      row.appendChild(left);
      row.appendChild(badge);
      listEl.appendChild(row);
    }
  } catch (err) {
    listEl.textContent = `Couldn't load projects: ${err.message}`;
  }
}

loadProjects();
