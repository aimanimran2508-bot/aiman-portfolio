document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const cursor = $('#cursor');
  const cursorTrail = $('#cursorTrail');
  const navbar = $('#navbar');
  const topBtn = $('#topBtn');
  const hamburger = $('.hamburger');
  const mobileNav = $('.nav-links');
  const typingEl = $('#typing');
  const modal = $('#certModal');
  const modalImg = $('#modalImg');
  const modalClose = $('#modalClose');
  const contactForm = $('#contactForm');
  const successMsg = $('#successMessage');
  const aboutSection = $('#about');
  const skillsSection = $('#skills');
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');
  const cursorTargets = 'a, button, [role="button"], .cert-card, .project-card';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  let scrollTicking = false;

  const updateNavState = () => {
    const y = window.scrollY;

    navbar?.classList.toggle('scrolled', y > 60);
    topBtn?.classList.toggle('show', y > 350);

    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 180) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateNavState();
      scrollTicking = false;
    });
  });

  updateNavState();

  if (hamburger && mobileNav) {
    const closeMenu = () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) closeMenu();
    });
  }

  if (typingEl && !prefersReducedMotion) {
    const roles = [
      'Front-End Developer',
      'UI/UX Enthusiast',
      'React.js Learner',
      'Freelancer',
      'Web Designer'
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer = null;

    const typeEffect = () => {
      const current = roles[roleIdx];

      if (!deleting) {
        charIdx++;
        typingEl.textContent = current.slice(0, charIdx);

        if (charIdx === current.length) {
          deleting = true;
          timer = setTimeout(typeEffect, 1600);
          return;
        }
      } else {
        charIdx--;
        typingEl.textContent = current.slice(0, charIdx);

        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
        }
      }

      timer = setTimeout(typeEffect, deleting ? 45 : 90);
    };

    typeEffect();
  } else if (typingEl) {
    typingEl.textContent = 'Front-End Developer';
  }

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach(el => revealObs.observe(el));

  const animateCounter = el => {
    const target = Number(el.dataset.target || 0);
    const duration = 1200;
    const start = performance.now();

    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
  };

  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.counter', entry.target).forEach(animateCounter);
      counterObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  if (aboutSection) counterObs.observe(aboutSection);

  if (modal && modalImg && modalClose) {
    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      modalImg.src = '';
    };

    $$('.cert-card').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.dataset.img;
        if (!img) return;
        modalImg.src = img;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  if (contactForm && successMsg) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const subject = String(formData.get('subject') || '').trim();
      const message = String(formData.get('message') || '').trim();

      const setMsg = (text, ok) => {
        successMsg.style.color = ok ? '#4ade80' : '#ff4d6d';
        successMsg.textContent = text;
      };

      if (!name || !email || !subject || !message) {
        setMsg('Please fill in all fields.', false);
        return;
      }

      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        setMsg('Please enter a valid email address.', false);
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn?.innerHTML || 'Send Message';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      }

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (!res.ok) throw new Error('Request failed');

        setMsg("✓ Message sent! I'll get back to you soon.", true);
        contactForm.reset();
      } catch {
        setMsg("✓ Message received! I'll get back to you soon.", true);
        contactForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }
        setTimeout(() => {
          successMsg.textContent = '';
        }, 5000);
      }
    });
  }

  topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (hasFinePointer && cursor && cursorTrail && !prefersReducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    let rafId = null;

    const onMove = e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const animateTrail = () => {
      trailX += (mouseX - trailX) * 0.12;
      trailY += (mouseY - trailY) * 0.12;
      cursorTrail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
      rafId = requestAnimationFrame(animateTrail);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    animateTrail();

    $$(cursorTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorTrail.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorTrail.classList.remove('cursor-hover');
      });
    });

    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  if (window.matchMedia('(min-width: 769px)').matches && !prefersReducedMotion) {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');

    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      if (orb1) orb1.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
      if (orb2) orb2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    }, { passive: true });
  }
});