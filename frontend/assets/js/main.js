/* ==========================================================================
   MAIN.JS — homepage-specific logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTypedHero();
  initThreeSceneLazy();
  renderSkills();
  renderSkillsPreview();
  loadProjects();
  loadFeaturedProjects();
  initProjectFilters();
  initContactForm();
  animateCounters();
  loadPublicProfile();
});

/* ---------- Profile avatar ---------- */
async function loadPublicProfile() {
  const wraps = document.querySelectorAll('#profile-avatar-wrap');
  if (!wraps.length) return;
  try {
    const res = await api.getPublicProfile();
    const avatar = res.profile && res.profile.avatar;
    if (!avatar) return;
    const fullUrl = resolveImageUrl(avatar);
    wraps.forEach((wrap) => {
      wrap.innerHTML = `<img src="${fullUrl}" alt="Masud Rana Nayeem">`;
    });
  } catch (err) {
    // Silently keep placeholder
  }
}

/* ---------- Typed.js hero ---------- */
function initTypedHero() {
  const el = document.getElementById('typed-role');
  if (!el || typeof Typed === 'undefined') return;
  new Typed('#typed-role', {
    strings: ['Frontend Developer', 'Programmer', 'Tech Enthusiast', 'Aspiring Full Stack Developer'],
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 1200,
    loop: true,
  });
}

/* ---------- Three.js Lazy Loaded ---------- */
function initThreeSceneLazy() {
  const container = document.getElementById('three-hero');
  if (!container || typeof THREE === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      initThreeSceneActual(container);
    }
  }, { threshold: 0.1 });
  observer.observe(container);
}

function initThreeSceneActual(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  const colors = [0x1E8EB3, 0x16407a, 0x4fb3d1];

  for (let i = 0; i < 8; i++) {
    const size = Math.random() * 0.8 + 0.3;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
    cube.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.008,
      rotSpeedY: (Math.random() - 0.5) * 0.008,
      floatOffset: Math.random() * Math.PI * 2,
    };
    group.add(cube);
  }
  scene.add(group);

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  let clock = new THREE.Clock();
  let animFrameId;

  function animate() {
    animFrameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    group.children.forEach((cube) => {
      cube.rotation.x += cube.userData.rotSpeedX + 0.0015;
      cube.rotation.y += cube.userData.rotSpeedY + 0.0015;
      cube.position.y += Math.sin(t + cube.userData.floatOffset) * 0.001;
    });

    group.rotation.y += (mouseX * 0.3 - group.rotation.y) * 0.02;
    group.rotation.x += (-mouseY * 0.3 - group.rotation.x) * 0.02;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* ---------- Skills data ---------- */
const SKILLS = {
  Frontend: ['HTML5/CSS3', 'JavaScript (ES6+)', 'React.js', 'Tailwind CSS'],
  Backend: ['Node.js', 'Express.js', 'REST APIs'],
  Database: ['MongoDB'],
  Tools: ['Git/GitHub', 'Figma'],
};

const CURRENTLY_LEARNING = ['React Mastery', 'JavaScript Deep Dive', 'Backend (Node.js)', 'MongoDB & APIs'];

function renderSkills() {
  const wrap = document.getElementById('skills-grid');
  if (wrap) {
    Object.entries(SKILLS).forEach(([category, list]) => {
      const col = document.createElement('div');
      col.className = 'reveal-up';
      col.innerHTML = `
        <h3 class="font-display text-lg text-white mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>${category}
        </h3>
        <div class="flex flex-wrap gap-3">
          ${list.map((s) => `<span class="skill-card px-4 py-2 text-sm text-gray-200 cursor-hoverable inline-block">${s}</span>`).join('')}
        </div>
      `;
      wrap.appendChild(col);
    });
  }

  const learningWrap = document.getElementById('learning-list');
  if (learningWrap) {
    learningWrap.innerHTML = CURRENTLY_LEARNING.map((c) => `<span class="skill-card px-4 py-2 text-sm text-gray-300 cursor-hoverable inline-block">${c}</span>`).join('');
  }

  if (typeof initGsapReveals === 'function') initGsapReveals();
}

/* ---------- Skills preview ---------- */
function renderSkillsPreview() {
  const wrap = document.getElementById('skills-preview');
  if (!wrap) return;
  const flat = Object.values(SKILLS).flat();
  wrap.innerHTML = flat.map((s) => `<span class="skill-card px-4 py-2 text-sm text-gray-200 cursor-hoverable inline-block">${s}</span>`).join('');
}

/* ---------- Featured projects ---------- */
async function loadFeaturedProjects() {
  const grid = document.getElementById('featured-projects-grid');
  if (!grid) return;
  grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">Loading projects…</p>`;
  try {
    const res = await api.getProjects('?featured=true&limit=3');
    const list = res.data && res.data.length ? res.data : (await api.getProjects('?limit=3')).data;
    if (!list.length) {
      grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">No projects yet.</p>`;
      return;
    }
    grid.innerHTML = list.map((p) => {
      // Fix image URL
      const imageUrl = resolveImageUrl(p.image);

      // Fix: Ensure slug exists
      const slug = p.slug || p._id;

      return `
      <a href="project-details.html?slug=${slug}" class="glass-card gradient-border overflow-hidden block group cursor-hoverable reveal-up">
        <div class="h-48 overflow-hidden">
          <img src="${imageUrl || 'https://placehold.co/600x400/111827/1E8EB3?text=No+Image'}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.src='https://placehold.co/600x400/111827/1E8EB3?text=${encodeURIComponent(p.title)}'">
        </div>
        <div class="p-5">
          <span class="text-xs text-cyan-300 font-mono">${p.category || 'General'}</span>
          <h3 class="text-lg font-semibold text-white mt-1">${p.title || 'Untitled'}</h3>
          <p class="text-sm text-gray-400 mt-2 line-clamp-2">${p.description || 'No description available.'}</p>
        </div>
      </a>
    `}).join('');
    setTimeout(() => {
      document.querySelectorAll('.reveal-up').forEach(el => {
        if (!el.dataset.revealed) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, 500);
    if (typeof initGsapReveals === 'function') initGsapReveals();
  } catch (err) {
    console.error('Error loading featured projects:', err);
    grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">Couldn't load projects.</p>`;
  }
}

/* ---------- Counters ---------- */
function animateCounters() {
  document.querySelectorAll('.counter').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur;
      if (cur < target) requestAnimationFrame(tick);
    };
    tick();
  });
}

/* ---------- Projects ---------- */
let currentFilter = 'All';
let currentSearch = '';

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">Loading projects…</p>`;

  try {
    const params = new URLSearchParams();
    if (currentFilter !== 'All') params.set('category', currentFilter);
    if (currentSearch) params.set('search', currentSearch);
    const res = await api.getProjects(`?${params.toString()}`);
    console.log('📥 Projects loaded:', res.data);
    renderProjects(res.data);
  } catch (err) {
    console.error('Error loading projects:', err);
    grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">Couldn't load projects. Make sure backend is running.</p>`;
  }
}

function renderProjects(projects) {
  const grid = document.getElementById("projects-grid");

  if (!projects || !projects.length) {
    grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-16">No projects found.</p>`;
    return;
  }

  console.log('📊 Rendering projects count:', projects.length);

  grid.innerHTML = projects.map((p) => {
    // Use slug or _id - make sure slug exists
    const slug = p.slug || p._id;
    console.log('🔗 Project:', p.title, '→ Slug:', slug);

    // Fix image URL
    const imageUrl = resolveImageUrl(p.image);

    // Create the detail link with slug - IMPORTANT: use encodeURIComponent for safety
    const detailLink = `project-details.html?slug=${encodeURIComponent(slug)}`;

    return `
    <a href="${detailLink}" class="project-card group reveal-up">
      <div class="project-image">
        <img src="${imageUrl || 'https://placehold.co/900x700/111827/1E8EB3?text=No+Image'}" alt="${p.title || 'Project'}" loading="lazy" onerror="this.src='https://placehold.co/900x700/111827/1E8EB3?text=${encodeURIComponent(p.title || 'Project')}'">
        <div class="project-overlay"><span>View Project</span></div>
      </div>
      <div class="project-content">
        <span class="project-category">${p.category || 'General'}</span>
        <h3>${p.title || 'Untitled'}</h3>
        <p>${p.description || 'No description available.'}</p>
        <div class="project-tech">
          ${(p.techStack || []).slice(0,5).map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    </a>
  `}).join("");

  // Force show all project cards
  setTimeout(() => {
    document.querySelectorAll('.project-card.reveal-up').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 100);

  if (typeof initGsapReveals === "function") {
    initGsapReveals();
  }
}

function initProjectFilters() {
  const filterBar = document.getElementById('project-filters');
  const searchInput = document.getElementById('project-search');
  if (filterBar) {
    filterBar.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('glow-btn'));
        btn.classList.add('glow-btn');
        currentFilter = btn.dataset.filter;
        loadProjects();
      });
    });
  }
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadProjects();
      }, 300);
    });
  }
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      await api.sendMessage(payload);
      showToast('Message sent successfully!');
      form.reset();
    } catch (err) {
      showToast(err.message || 'Something went wrong.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}