/* ============================================================
   AWS NHU — AWS Student Builder Community
   script.js — vanilla JS only (no libraries, no dependencies)

   Modules:
   1.  Footer year
   2.  Scroll effects (navbar state, progress bar, back-to-top)
   3.  Mobile navigation
   4.  Active section highlighting
   5.  Scroll-reveal animations
   6.  Card spotlight hover
   7.  Hero parallax
   8.  Starfield canvas (stars + drifting particles)
   9.  Placeholder CTA links (data-editable) → toast
   ============================================================ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => prefersReducedMotion.matches;

  /* ---------------- 1. Footer year (dynamic) ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- 2. Scroll effects ----------------
     One rAF-throttled scroll listener drives the navbar
     background, the top progress bar and the back-to-top. */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      navbar.classList.toggle('scrolled', y > 24);
      toTop.classList.toggle('show', y > 620);
      if (progressBar) {
        progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- 3. Mobile navigation ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const setMenu = (open) => {
    document.body.classList.toggle('nav-open', open);
    document.body.classList.toggle('no-scroll', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      setMenu(!document.body.classList.contains('nav-open'));
    });

    // Close after choosing a section / CTA inside the panel
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when tapping outside the panel
    document.addEventListener('click', (e) => {
      if (
        document.body.classList.contains('nav-open') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        setMenu(false);
      }
    });

    // Reset state if resized back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMenu(false);
    }, { passive: true });
  }

  /* ---------------- 4. Active section highlighting ---------------- */
  const sectionIds = ['home', 'about', 'learning', 'events', 'registration', 'team', 'community'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = [...document.querySelectorAll('.nav-link')];

  if ('IntersectionObserver' in window && sections.length) {
    const linkFor = (id) => navLinks.find((l) => l.getAttribute('href') === `#${id}`);
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' } // section counts as "current" near viewport centre
    );
    sections.forEach((s) => activeObserver.observe(s));
  }

  /* ---------------- 5. Scroll-reveal animations ---------------- */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];

  if (reduced() || !('IntersectionObserver' in window)) {
    // No motion requested / supported: everything is simply visible
    revealEls.forEach((el) => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // reveal once, keep DOM light
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- 6. Card spotlight hover ----------------
     Delegated pointermove writes --mx/--my custom properties;
     the glow itself is pure CSS (.glass-card::before). */
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.glass-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, { passive: true });

  /* ---------------- 7. Hero parallax ----------------
     Subtle planet tilt following the pointer (desktop, fine
     pointers, motion allowed only). */
  const scene = document.getElementById('planetScene');
  const hero = document.getElementById('home');
  if (scene && hero && !reduced() && window.matchMedia('(pointer: fine)').matches) {
    let raf = null;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const dx = (e.clientX / window.innerWidth - 0.5);
        const dy = (e.clientY / window.innerHeight - 0.5);
        scene.style.transform =
          `translate(${dx * 14}px, ${dy * 10}px) rotateX(${-dy * 4}deg) rotateY(${dx * 6}deg)`;
        raf = null;
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      scene.style.transform = '';
    });
  }

  /* ---------------- 8. Starfield canvas ----------------
     Twinkling stars + a few coloured "dust" particles with
     faint constellation lines. Pauses when the tab is hidden,
     adapts to resize, renders a single static frame when the
     user prefers reduced motion. */
  const canvas = document.getElementById('starCanvas');

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const DUST_COLORS = ['#FF9900', '#A78BFA', '#60A5FA', '#FFFFFF'];
    let stars = [];
    let dust = [];
    let rafId = null;
    let running = false;
    let dpr = 1;

    const rand = (min, max) => Math.random() * (max - min) + min;

    const buildParticles = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const starCount = Math.min(170, Math.max(50, Math.floor(area / 11000)));
      const dustCount = Math.min(34, Math.max(14, Math.floor(area / 55000)));

      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.4, 1.5),
        a: rand(0.25, 0.9),
        tw: rand(0.4, 1.6),   // twinkle speed
        ph: rand(0, Math.PI * 2),
        vy: rand(0.015, 0.05) // slow upward drift
      }));

      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1.2, 2.4),
        c: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
        a: rand(0.25, 0.5),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.18, -0.05)
      }));
    };

    const drawFrame = (t) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const alpha = s.a * (0.55 + 0.45 * Math.sin(t * 0.001 * s.tw + s.ph));
        s.y -= s.vy;
        if (s.y < -4) s.y = h + 4;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // constellation lines between nearby dust particles
      for (let i = 0; i < dust.length; i++) {
        const p = dust[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) p.y = h + 6;
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < dust.length; j++) {
          const q = dust[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100) { // 110px
            ctx.globalAlpha = (1 - Math.sqrt(d2) / 110) * 0.12;
            ctx.strokeStyle = '#A78BFA';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t) => {
      if (!running) return;
      drawFrame(t);
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    };

    buildParticles();

    if (reduced()) {
      drawFrame(0); // one calm static frame — no animation
    } else {
      start();
      document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
      });

      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          buildParticles();
          if (reduced()) drawFrame(0);
        }, 180);
      }, { passive: true });

      // If the preference flips mid-session, adapt without reload
      prefersReducedMotion.addEventListener?.('change', (e) => {
        if (e.matches) { stop(); drawFrame(0); } else { start(); }
      });
    }
  }

  /* ---------------- 9. Student event registration ---------------- */
  const registrationForm = document.getElementById('registrationForm');
  const registrationStatus = document.getElementById('registrationStatus');
  const registrationStatusMessage = document.getElementById('registrationStatusMessage');
  const registrationError = document.getElementById('registrationError');
  const downloadRegistrationPdf = document.getElementById('downloadRegistrationPdf');
  const whatsappRegistrationLink = document.getElementById('whatsappRegistrationLink');
  let registrationPdfUrl = null;
  const whatsappMessage = 'Assalam-o-Alaikum! I have completed my registration for the AWS NHU event. Please find my registration details attached as a PDF.';
  const whatsappUrl = `https://wa.me/923132017397?text=${encodeURIComponent(whatsappMessage)}`;

  document.querySelectorAll('.event-register').forEach((link) => {
    link.addEventListener('click', () => {
      const eventTitle = link.closest('.event-card')?.querySelector('h3')?.textContent.trim();
      const eventSelect = registrationForm?.elements.namedItem('eventName');
      if (eventTitle && eventSelect) eventSelect.value = eventTitle;
    });
  });

  if (registrationForm) {
    registrationForm.addEventListener('input', (event) => {
      event.target.setCustomValidity('');
      registrationError.hidden = true;
      registrationStatus.hidden = true;
    });

    registrationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      registrationError.hidden = true;
      registrationStatus.hidden = true;

      const requiredFields = [...registrationForm.querySelectorAll('[required]')];
      requiredFields.forEach((field) => {
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
      });

      const whatsappField = registrationForm.elements.namedItem('whatsapp');
      const phoneDigits = whatsappField.value.replace(/\D/g, '');
      const phoneFormatIsValid = /^[+0-9\s()-]{10,20}$/.test(whatsappField.value);
      whatsappField.setCustomValidity(
        phoneFormatIsValid && phoneDigits.length >= 10 && phoneDigits.length <= 15
          ? ''
          : 'Enter a valid phone number with 10 to 15 digits, using only common phone-number characters.'
      );

      if (!registrationForm.reportValidity()) return;

      const pdfLibrary = window.jspdf;
      if (!pdfLibrary || !pdfLibrary.jsPDF) {
        registrationError.textContent = 'The PDF generator could not be loaded. Check your internet connection and try again.';
        registrationError.hidden = false;
        return;
      }

      const whatsappWindow = window.open('about:blank', '_blank');
      const formValues = new FormData(registrationForm);
      const student = {
        fullName: formValues.get('fullName').trim(),
        university: formValues.get('university').trim(),
        department: formValues.get('department').trim(),
        degreeProgram: formValues.get('degreeProgram').trim(),
        semester: formValues.get('semester').trim(),
        studentId: formValues.get('studentId').trim(),
        email: formValues.get('email').trim(),
        whatsapp: formValues.get('whatsapp').trim(),
        eventName: formValues.get('eventName').trim(),
        reason: formValues.get('reason').trim()
      };

      try {
        const { jsPDF } = pdfLibrary;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 17;
        const now = new Date();
        const submittedAt = new Intl.DateTimeFormat('en-PK', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Asia/Karachi'
        }).format(now) + ' PKT';
        const logo = document.getElementById('registrationLogo');

        if (!logo || !logo.complete || !logo.naturalWidth) {
          throw new Error('The AWS NHU logo could not be loaded.');
        }

        const logoCanvas = document.createElement('canvas');
        const logoScale = Math.min(1, 480 / Math.max(logo.naturalWidth, logo.naturalHeight));
        logoCanvas.width = Math.max(1, Math.round(logo.naturalWidth * logoScale));
        logoCanvas.height = Math.max(1, Math.round(logo.naturalHeight * logoScale));
        const logoContext = logoCanvas.getContext('2d');
        if (!logoContext) throw new Error('The AWS NHU logo could not be prepared for the PDF.');
        logoContext.drawImage(logo, 0, 0, logoCanvas.width, logoCanvas.height);

        pdf.setFillColor(8, 10, 24);
        pdf.rect(0, 0, pageWidth, 47, 'F');
        pdf.setFillColor(255, 153, 0);
        pdf.rect(0, 45, pageWidth, 2, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(margin, 9, 27, 27, 3, 3, 'F');
        pdf.addImage(logoCanvas.toDataURL('image/png'), 'PNG', margin + 2, 11, 23, 23);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(19);
        pdf.text('AWS NHU', margin + 35, 18);
        pdf.setFontSize(11);
        pdf.setTextColor(255, 153, 0);
        pdf.text('STUDENT EVENT REGISTRATION', margin + 35, 26);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(205, 210, 225);
        pdf.text(`Registration received: ${submittedAt}`, margin + 35, 34);

        const drawField = (label, value, x, y, width, height) => {
          pdf.setFillColor(246, 247, 250);
          pdf.setDrawColor(225, 228, 235);
          pdf.roundedRect(x, y, width, height, 2, 2, 'FD');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.setTextColor(102, 110, 125);
          pdf.text(label.toUpperCase(), x + 4, y + 6);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(25, 30, 43);
          const lines = pdf.splitTextToSize(value || '-', width - 8);
          pdf.text(lines.slice(0, 2), x + 4, y + 12);
        };

        const halfWidth = (pageWidth - margin * 2 - 5) / 2;
        const profileFields = [
          ['Full Name', student.fullName],
          ['University / Institute', student.university],
          ['Department', student.department],
          ['Degree Program', student.degreeProgram],
          ['Semester', student.semester],
          ['Student ID / Roll Number', student.studentId],
          ['Email Address', student.email],
          ['WhatsApp Number', student.whatsapp]
        ];
        profileFields.forEach(([label, value], index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          drawField(label, value, margin + col * (halfWidth + 5), 56 + row * 23, halfWidth, 20);
        });

        drawField('Event Name', student.eventName, margin, 150, pageWidth - margin * 2, 20);
        pdf.setFillColor(246, 247, 250);
        pdf.setDrawColor(225, 228, 235);
        pdf.roundedRect(margin, 179, pageWidth - margin * 2, 59, 2, 2, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(102, 110, 125);
        pdf.text('WHY I WANT TO JOIN', margin + 4, 186);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(25, 30, 43);
        pdf.text(pdf.splitTextToSize(student.reason, pageWidth - margin * 2 - 8).slice(0, 7), margin + 4, 193);

        pdf.setDrawColor(225, 228, 235);
        pdf.line(margin, 278, pageWidth - margin, 278);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(110, 117, 130);
        pdf.text('AWS NHU | Nazeer Hussain University, Karachi, Pakistan', margin, 284);
        pdf.text('Thank you for registering.', pageWidth - margin, 284, { align: 'right' });

        const filename = 'AWS-NHU-Student-Registration.pdf';
        const pdfBlob = pdf.output('blob');
        const nextPdfUrl = URL.createObjectURL(pdfBlob);
        pdf.save(filename);

        if (registrationPdfUrl) URL.revokeObjectURL(registrationPdfUrl);
        registrationPdfUrl = nextPdfUrl;
        downloadRegistrationPdf.href = registrationPdfUrl;
        whatsappRegistrationLink.href = whatsappUrl;
        registrationStatusMessage.textContent = whatsappWindow
          ? `Your registration for ${student.eventName} has been saved as ${filename}. WhatsApp is opening with a prepared message; attach the downloaded PDF before sending.`
          : `Your registration for ${student.eventName} has been saved as ${filename}. Use the Open WhatsApp button below, then attach the downloaded PDF before sending.`;
        registrationStatus.hidden = false;

        if (whatsappWindow) {
          whatsappWindow.location.href = whatsappUrl;
        }
      } catch (error) {
        if (whatsappWindow) whatsappWindow.close();
        console.error('Unable to generate the AWS NHU registration PDF:', error);
        registrationError.textContent = error instanceof Error
          ? `We could not generate your PDF: ${error.message}`
          : 'We could not generate your PDF. Please try again.';
        registrationError.hidden = false;
      }
    });
  }

  /* ---------------- 10. Placeholder CTA links ----------------
     Links marked data-editable (socials / community) still have
     no destination yet, so show the existing friendly toast. */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-editable]');
    if (!link) return;
    e.preventDefault();
    const kind = link.dataset.editable;
    const msg =
      kind === 'registration'
        ? 'Registration opens soon — event details will be announced. ✨'
        : kind === 'social-link'
          ? 'Social link coming soon — add the real URL in index.html.'
          : 'Join link coming soon — the community is getting ready! ✨';
    showToast(msg);
  });
})();
