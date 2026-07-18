/* ==========================================================================
   DASHBOARD.JS — admin dashboard logic (auth-protected)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const me = await api.getMe();
    document.getElementById('welcome-msg').textContent = `Welcome back, ${me.admin.name}`;
  } catch (err) {
    clearToken();
    window.location.href = 'login.html';
    return;
  }

  initTabs();
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearToken();
    window.location.href = 'login.html';
  });

  loadOverview();
  document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
  document.getElementById('add-cert-btn').addEventListener('click', () => openCertModal());
  document.getElementById('add-blog-btn').addEventListener('click', () => openBlogModal());
});

/* ---------- Tabs ---------- */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const mobileSelect = document.getElementById('mobile-tab-select');

  const activate = (tab) => {
    buttons.forEach((b) => b.classList.toggle('bg-white/5', b.dataset.tab === tab) && b.classList.toggle('text-white', b.dataset.tab === tab));
    buttons.forEach((b) => {
      const isActive = b.dataset.tab === tab;
      b.classList.toggle('bg-white/5', isActive);
      b.classList.toggle('text-white', isActive);
      b.classList.toggle('text-gray-400', !isActive);
    });
    panels.forEach((p) => p.classList.toggle('hidden', p.id !== `tab-${tab}`));
    if (mobileSelect) mobileSelect.value = tab;

    if (tab === 'projects') loadProjectsTable();
    if (tab === 'certificates') loadCertsTable();
    if (tab === 'blogs') loadBlogsTable();
    if (tab === 'messages') loadMessages();
  };

  buttons.forEach((b) => b.addEventListener('click', () => activate(b.dataset.tab)));
  if (mobileSelect) mobileSelect.addEventListener('change', (e) => activate(e.target.value));
}

/* ---------- Overview / Stats ---------- */
async function loadOverview() {
  try {
    const res = await api.getSummary();
    const s = res.data;
    document.getElementById('stats-cards').innerHTML = [
      { label: 'Visitors', value: s.visitors, icon: 'fa-eye' },
      { label: 'Projects', value: s.projects, icon: 'fa-diagram-project' },
      { label: 'Blog Posts', value: s.blogs, icon: 'fa-blog' },
      { label: 'Certificates', value: s.certificates, icon: 'fa-award' },
      { label: 'Unread Messages', value: s.unreadMessages, icon: 'fa-envelope' },
    ].map((c) => `
      <div class="glass-card p-6">
        <i class="fas ${c.icon} text-cyan-300 text-xl mb-3"></i>
        <p class="font-display text-3xl text-white">${c.value}</p>
        <p class="text-gray-500 text-xs mt-1">${c.label}</p>
      </div>
    `).join('');

    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('visitors-chart');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: s.dailyVisits.map((d) => d._id),
          datasets: [{
            label: 'Visits',
            data: s.dailyVisits.map((d) => d.count),
            borderColor: '#00f5ff',
            backgroundColor: 'rgba(0,245,255,0.1)',
            tension: 0.4,
            fill: true,
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          },
        },
      });
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- Projects CRUD ---------- */
async function loadProjectsTable() {
  const table = document.getElementById('projects-table');
  table.innerHTML = '<p class="text-gray-500 text-sm">Loading…</p>';
  const res = await api.getProjects('?limit=100');
  if (!res.data.length) {
    table.innerHTML = '<p class="text-gray-500 text-sm">No projects yet. Click "Add Project" to create one.</p>';
    return;
  }
  table.innerHTML = `
    <table class="w-full text-sm">
      <thead><tr class="text-left text-gray-500 border-b border-white/10">
        <th class="py-3 pr-4">Title</th><th class="py-3 pr-4">Category</th><th class="py-3 pr-4">Featured</th><th class="py-3">Actions</th>
      </tr></thead>
      <tbody>
        ${res.data.map((p) => `
          <tr class="border-b border-white/5">
            <td class="py-3 pr-4 text-white">${p.title}</td>
            <td class="py-3 pr-4 text-gray-400">${p.category}</td>
            <td class="py-3 pr-4">${p.featured ? '<i class="fas fa-star text-yellow-400"></i>' : '-'}</td>
            <td class="py-3 flex gap-3">
              <button onclick='openProjectModal(${JSON.stringify(p).replace(/'/g, "&apos;")})' class="text-cyan-300 hover:underline">Edit</button>
              <button onclick="deleteProject('${p._id}')" class="text-red-400 hover:underline">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openProjectModal(project = null) {
  const isEdit = !!project;
  showModal(`
    <h3 class="font-display text-xl text-white mb-5">${isEdit ? 'Edit' : 'Add'} Project</h3>
    <form id="project-form" class="space-y-3">
      <input name="title" required placeholder="Title" value="${project?.title || ''}" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <textarea name="description" required placeholder="Short description" rows="2" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">${project?.description || ''}</textarea>
      <input name="image" required placeholder="Image URL" value="${project?.image || ''}" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="techStack" required placeholder="Tech stack (comma separated)" value="${project?.techStack?.join(', ') || ''}" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <select name="category" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none bg-transparent">
        ${['Full Stack','Frontend','Backend','Mobile','AI/ML','Other'].map(c => `<option value="${c}" ${project?.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <input name="githubLink" placeholder="GitHub URL" value="${project?.githubLink || ''}" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="liveLink" placeholder="Live URL" value="${project?.liveLink || ''}" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <label class="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" name="featured" ${project?.featured?'checked':''}> Featured project</label>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="glow-btn px-6 py-2.5 rounded-full text-sm">${isEdit ? 'Update' : 'Create'}</button>
        <button type="button" onclick="closeModal()" class="outline-btn px-6 py-2.5 rounded-full text-sm">Cancel</button>
      </div>
    </form>
  `);

  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      title: f.title.value,
      description: f.description.value,
      image: f.image.value,
      techStack: f.techStack.value.split(',').map((t) => t.trim()).filter(Boolean),
      category: f.category.value,
      githubLink: f.githubLink.value,
      liveLink: f.liveLink.value,
      featured: f.featured.checked,
    };
    try {
      if (isEdit) await api.updateProject(project._id, payload);
      else await api.createProject(payload);
      showToast(`Project ${isEdit ? 'updated' : 'created'}!`);
      closeModal();
      loadProjectsTable();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function deleteProject(id) {
  if (!confirm('Delete this project permanently?')) return;
  try {
    await api.deleteProject(id);
    showToast('Project deleted');
    loadProjectsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- Certificates CRUD ---------- */
async function loadCertsTable() {
  const table = document.getElementById('certs-table');
  table.innerHTML = '<p class="text-gray-500 text-sm">Loading…</p>';
  const res = await api.getCertificates();
  if (!res.data.length) {
    table.innerHTML = '<p class="text-gray-500 text-sm">No certificates yet.</p>';
    return;
  }
  table.innerHTML = `
    <table class="w-full text-sm">
      <thead><tr class="text-left text-gray-500 border-b border-white/10"><th class="py-3 pr-4">Title</th><th class="py-3 pr-4">Issuer</th><th class="py-3">Actions</th></tr></thead>
      <tbody>
        ${res.data.map((c) => `
          <tr class="border-b border-white/5">
            <td class="py-3 pr-4 text-white">${c.title}</td>
            <td class="py-3 pr-4 text-gray-400">${c.issuer}</td>
            <td class="py-3"><button onclick="deleteCert('${c._id}')" class="text-red-400 hover:underline">Delete</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openCertModal() {
  showModal(`
    <h3 class="font-display text-xl text-white mb-5">Add Certificate</h3>
    <form id="cert-form" class="space-y-3">
      <input name="title" required placeholder="Certificate title" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="issuer" required placeholder="Issued by" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="image" required placeholder="Image URL" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="issueDate" required type="date" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="verifyLink" placeholder="Verification URL" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <div class="flex gap-3 pt-2">
        <button type="submit" class="glow-btn px-6 py-2.5 rounded-full text-sm">Create</button>
        <button type="button" onclick="closeModal()" class="outline-btn px-6 py-2.5 rounded-full text-sm">Cancel</button>
      </div>
    </form>
  `);
  document.getElementById('cert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api.createCertificate({ title: f.title.value, issuer: f.issuer.value, image: f.image.value, issueDate: f.issueDate.value, verifyLink: f.verifyLink.value });
      showToast('Certificate added!');
      closeModal();
      loadCertsTable();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function deleteCert(id) {
  if (!confirm('Delete this certificate?')) return;
  try {
    await api.deleteCertificate(id);
    showToast('Certificate deleted');
    loadCertsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- Blogs CRUD ---------- */
async function loadBlogsTable() {
  const table = document.getElementById('blogs-table');
  table.innerHTML = '<p class="text-gray-500 text-sm">Loading…</p>';
  const res = await api.getBlogs('?limit=100');
  if (!res.data.length) {
    table.innerHTML = '<p class="text-gray-500 text-sm">No blog posts yet.</p>';
    return;
  }
  table.innerHTML = `
    <table class="w-full text-sm">
      <thead><tr class="text-left text-gray-500 border-b border-white/10"><th class="py-3 pr-4">Title</th><th class="py-3 pr-4">Category</th><th class="py-3 pr-4">Views</th><th class="py-3">Actions</th></tr></thead>
      <tbody>
        ${res.data.map((b) => `
          <tr class="border-b border-white/5">
            <td class="py-3 pr-4 text-white">${b.title}</td>
            <td class="py-3 pr-4 text-gray-400">${b.category}</td>
            <td class="py-3 pr-4 text-gray-400">${b.views}</td>
            <td class="py-3"><button onclick="deleteBlog('${b._id}')" class="text-red-400 hover:underline">Delete</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openBlogModal() {
  showModal(`
    <h3 class="font-display text-xl text-white mb-5">New Blog Post</h3>
    <form id="blog-form" class="space-y-3">
      <input name="title" required placeholder="Title" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="coverImage" placeholder="Cover image URL" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <input name="category" placeholder="Category" value="General" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none">
      <textarea name="excerpt" required placeholder="Short excerpt" rows="2" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none"></textarea>
      <textarea name="content" required placeholder="Full content (Markdown supported)" rows="6" class="w-full glass-card px-4 py-2.5 text-sm text-white outline-none"></textarea>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="glow-btn px-6 py-2.5 rounded-full text-sm">Publish</button>
        <button type="button" onclick="closeModal()" class="outline-btn px-6 py-2.5 rounded-full text-sm">Cancel</button>
      </div>
    </form>
  `);
  document.getElementById('blog-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api.createBlog({ title: f.title.value, coverImage: f.coverImage.value, category: f.category.value, excerpt: f.excerpt.value, content: f.content.value });
      showToast('Blog post published!');
      closeModal();
      loadBlogsTable();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function deleteBlog(id) {
  if (!confirm('Delete this blog post?')) return;
  try {
    await api.deleteBlog(id);
    showToast('Blog post deleted');
    loadBlogsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- Messages ---------- */
async function loadMessages() {
  const list = document.getElementById('messages-list');
  list.innerHTML = '<p class="text-gray-500 text-sm">Loading…</p>';
  const res = await api.getMessages();
  if (!res.data.length) {
    list.innerHTML = '<p class="text-gray-500 text-sm">No messages yet.</p>';
    return;
  }
  list.innerHTML = res.data.map((m) => `
    <div class="glass-card p-5 ${m.read ? 'opacity-60' : ''}">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-white font-medium">${m.subject}</p>
          <p class="text-xs text-gray-500">${m.name} · ${m.email} · ${new Date(m.createdAt).toLocaleString()}</p>
        </div>
        <button onclick="deleteMessage('${m._id}')" class="text-red-400 text-sm hover:underline">Delete</button>
      </div>
      <p class="text-gray-400 text-sm mt-3">${m.message}</p>
    </div>
  `).join('');
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await api.deleteMessage(id);
    showToast('Message deleted');
    loadMessages();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ---------- Modal helper ---------- */
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.remove('hidden');
  backdrop.classList.add('flex');
}
function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.add('hidden');
  backdrop.classList.remove('flex');
}

/* ---------- Toast (standalone, since animations.js isn't loaded here) ---------- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `glass-card px-5 py-3 text-sm font-medium ${type === 'error' ? 'border-red-500/50 text-red-300' : 'text-cyan-200'} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
