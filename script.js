(() => {

  // Automatically log a visit through the server-side Vercel function.
  // IP and geo data stay on the server/database, never in public page HTML.
  fetch('/api/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    .catch(() => { /* Local preview or an unconfigured backend: keep the portfolio usable. */ });

  const progress = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Add a quiet scrolled state to the glass navigation.
  const topbar = document.querySelector('.topbar');
  const updateTopbar = () => topbar?.classList.toggle('scrolled', window.scrollY > 18);
  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  // Give repeated cards a natural cascade rather than revealing everything at once.
  document.querySelectorAll('.project-grid, .achievement-grid, .certificate-grid, .gallery-grid, .skills-groups').forEach(group => {
    [...group.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 75, 420)}ms`);
    });
  });

  // Lightweight pointer-following cursor on mouse/trackpad devices only.
  const motionOkay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerOkay = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (motionOkay && pointerOkay) {
    const aura = document.createElement('span');
    const core = document.createElement('span');
    aura.className = 'cursor-aura'; core.className = 'cursor-core';
    aura.setAttribute('aria-hidden', 'true'); core.setAttribute('aria-hidden', 'true');
    document.body.append(aura, core);
    let pointerFrame = 0;
    window.addEventListener('pointermove', event => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        aura.style.left = `${event.clientX}px`; aura.style.top = `${event.clientY}px`;
        core.style.left = `${event.clientX}px`; core.style.top = `${event.clientY}px`;
        aura.classList.add('cursor-visible'); core.classList.add('cursor-visible');
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { aura.classList.remove('cursor-visible'); core.classList.remove('cursor-visible'); });
    document.querySelectorAll('a,button,.project-card,.achievement-card,.certificate-card,.gallery-item,.photo-frame').forEach(el => {
      el.addEventListener('pointerenter', () => aura.classList.add('cursor-hover'));
      el.addEventListener('pointerleave', () => aura.classList.remove('cursor-hover'));
    });
  }

  // Subtle tilt on cards, limited to desktop pointer devices; reset cleanly on exit.
  if (motionOkay && pointerOkay) {
    document.querySelectorAll('.project-card, .achievement-card, .certificate-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle?.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

  const roles = ['AI & Machine Learning Student', 'Full-Stack Developer in Progress', 'IoT & Robotics Enthusiast'];
  const typing = document.getElementById('typing');
  let roleIndex = 0, charIndex = roles[0].length, deleting = false;
  function typeRole() {
    if (!typing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const role = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      typing.textContent = role.slice(0, charIndex);
      if (charIndex >= role.length) { deleting = true; setTimeout(typeRole, 1500); return; }
      setTimeout(typeRole, 55);
    } else {
      charIndex--;
      typing.textContent = role.slice(0, charIndex);
      if (charIndex <= 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; setTimeout(typeRole, 300); return; }
      setTimeout(typeRole, 28);
    }
  }
  setTimeout(() => { roleIndex = 0; charIndex = roles[0].length; deleting = true; typeRole(); }, 2500);

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('p');
    const close = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      image.src = '';
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.gallery-item img').forEach(img => {
      img.addEventListener('click', () => {
        image.src = img.src;
        image.alt = img.alt;
        caption.textContent = img.closest('figure')?.querySelector('figcaption b')?.textContent || img.alt;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Optional visitor note: stored locally on this device only. A backend is required for a shared owner-visible log.
  const visitorForm = document.getElementById('visitorForm');
  const visitorMessage = document.getElementById('visitorMessage');
  visitorForm?.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(visitorForm);
    const note = {
      name: String(formData.get('visitorName') || '').trim(),
      reason: String(formData.get('visitorReason') || ''),
      date: new Date().toISOString()
    };
    if (!note.name) return;
    try {
      const notes = JSON.parse(localStorage.getItem('parinitaPortfolioVisitorNotes') || '[]');
      notes.push(note);
      localStorage.setItem('parinitaPortfolioVisitorNotes', JSON.stringify(notes));
      visitorMessage.textContent = 'Thank you for stopping by! Your note is saved in this browser only.';
      visitorForm.reset();
    } catch {
      visitorMessage.textContent = 'Thanks for visiting! This browser could not save the note.';
    }
  });
})();
// Display only the aggregate count publicly; no IP or location is exposed here.
fetch('/api/visit', { method: 'GET', cache: 'no-store' })
  .then(r => r.ok ? r.json() : null)
  .then(data => {
    const node = document.getElementById('publicVisitCount');
    if (node && data && Number.isFinite(data.count)) node.textContent = `VISITS · ${data.count.toLocaleString()}`;
  }).catch(() => {});
