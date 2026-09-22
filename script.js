/* ==========================================================================
   Portfolio — script.js
   Plain vanilla JavaScript only. No frameworks, no external libraries.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------------
     0. Footer year
  --------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     1. Theme toggle (dark / light) with localStorage persistence
  --------------------------------------------------------------------- */
  (function themeModule() {
    var root = document.documentElement;
    var toggleBtn = document.getElementById('themeToggle');
    var STORAGE_KEY = 'portfolio-theme';

    function applyTheme(theme) {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        toggleBtn.setAttribute('aria-label', 'Switch to dark theme');
        toggleBtn.setAttribute('aria-pressed', 'true');
      } else {
        root.removeAttribute('data-theme');
        toggleBtn.setAttribute('aria-label', 'Switch to light theme');
        toggleBtn.setAttribute('aria-pressed', 'false');
      }
    }

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      saved = null;
    }

    if (saved) {
      applyTheme(saved);
    } else {
      var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var isLight = root.getAttribute('data-theme') === 'light';
        var next = isLight ? 'dark' : 'light';
        applyTheme(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          /* localStorage unavailable — theme still applies for this session */
        }
      });
    }
  })();

  /* ---------------------------------------------------------------------
     2. Mobile hamburger menu
  --------------------------------------------------------------------- */
  (function mobileNavModule() {
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    function closeMenu() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    }

    function openMenu() {
      navLinks.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
    }

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* Close the mobile menu whenever a nav link is clicked */
    var links = navLinks.querySelectorAll('a[data-nav]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', closeMenu);
    }

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  })();

  /* ---------------------------------------------------------------------
     3. Smooth scrolling for in-page anchor links
  --------------------------------------------------------------------- */
  (function smoothScrollModule() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    var navbar = document.getElementById('navbar');

    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var navHeight = navbar ? navbar.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    }
  })();

  /* ---------------------------------------------------------------------
     4. Navbar scroll effect + active nav link highlighting (per page)
  --------------------------------------------------------------------- */
  (function navbarScrollModule() {
    var navbar = document.getElementById('navbar');
    var backToTop = document.getElementById('backToTop');
    var navLinkEls = document.querySelectorAll('.nav-link[data-nav]');
    var currentPage = document.body.getAttribute('data-page');

    /* Each page is its own HTML file, so the active link is set once
       from the <body data-page="..."> attribute rather than by
       tracking scroll position through several sections. */
    navLinkEls.forEach(function (link) {
      if (link.getAttribute('data-page') === currentPage) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    });

    function onScroll() {
      var scrollY = window.pageYOffset;

      if (navbar) {
        if (scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      if (backToTop) {
        if (scrollY > 600) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------------------
     5. Back-to-top button
  --------------------------------------------------------------------- */
  (function backToTopModule() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ---------------------------------------------------------------------
     6. Hero title type-writer effect
  --------------------------------------------------------------------- */
  (function typewriterModule() {
    var el = document.getElementById('typedTitle');
    if (!el) return;

    var phrases = ['Digital Marketer', 'Growth Strategist', 'Performance Marketer', 'Web Devloper'];
    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typingSpeed = 70;
    var deletingSpeed = 40;
    var pauseAtFull = 1400;
    var pauseAtEmpty = 400;

    function tick() {
      var current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, pauseAtFull);
          return;
        }
        setTimeout(tick, typingSpeed);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, pauseAtEmpty);
          return;
        }
        setTimeout(tick, deletingSpeed);
      }
    }

    setTimeout(tick, 600);
  })();

  /* ---------------------------------------------------------------------
     7. Scroll reveal animations (IntersectionObserver)
  --------------------------------------------------------------------- */
  (function revealModule() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     8. Animated skill bars (IntersectionObserver)
  --------------------------------------------------------------------- */
  (function skillBarsModule() {
    var cards = document.querySelectorAll('.skill-card');
    if (!cards.length) return;

    function animateCard(card) {
      var level = card.getAttribute('data-skill-level') || '0';
      var fill = card.querySelector('.skill-fill');
      if (fill) fill.style.width = level + '%';
    }

    if (!('IntersectionObserver' in window)) {
      cards.forEach(animateCard);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCard(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    cards.forEach(function (card) { observer.observe(card); });
  })();

  /* ---------------------------------------------------------------------
     9. Animated statistics counters (IntersectionObserver)
  --------------------------------------------------------------------- */
  (function statsModule() {
    var statEls = document.querySelectorAll('.stat-number');
    if (!statEls.length) return;

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); /* ease-out-cubic */
        var value = Math.floor(eased * target);
        el.textContent = value + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }

      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      statEls.forEach(animateCount);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     10. Project filtering
  --------------------------------------------------------------------- */
  (function projectFilterModule() {
    var buttons = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');
    var noResults = document.getElementById('noResults');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');
        var visibleCount = 0;

        cards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show = filter === 'all' || category === filter;
          card.classList.toggle('hidden-card', !show);
          if (show) visibleCount++;
        });

        if (noResults) noResults.hidden = visibleCount !== 0;
      });
    });
  })();

  /* ---------------------------------------------------------------------
     11. Contact form validation (no backend / no page reload)
  --------------------------------------------------------------------- */
  (function contactFormModule() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var fields = {
      name: document.getElementById('fieldName'),
      email: document.getElementById('fieldEmail'),
      subject: document.getElementById('fieldSubject'),
      message: document.getElementById('fieldMessage')
    };

    var errorEls = {
      name: document.getElementById('err-name'),
      email: document.getElementById('err-email'),
      subject: document.getElementById('err-subject'),
      message: document.getElementById('err-message')
    };

    var statusEl = document.getElementById('formStatus');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(fieldName, message) {
      var input = fields[fieldName];
      var errorEl = errorEls[fieldName];
      var row = input ? input.closest('.form-row') : null;

      if (errorEl) errorEl.textContent = message || '';
      if (row) row.classList.toggle('invalid', Boolean(message));
    }

    function validate() {
      var isValid = true;

      var nameVal = fields.name.value.trim();
      if (!nameVal) {
        setError('name', 'Please enter your name.');
        isValid = false;
      } else if (nameVal.length < 2) {
        setError('name', 'Name must be at least 2 characters.');
        isValid = false;
      } else {
        setError('name', '');
      }

      var emailVal = fields.email.value.trim();
      if (!emailVal) {
        setError('email', 'Please enter your email.');
        isValid = false;
      } else if (!emailPattern.test(emailVal)) {
        setError('email', 'Please enter a valid email address.');
        isValid = false;
      } else {
        setError('email', '');
      }

      var subjectVal = fields.subject.value.trim();
      if (!subjectVal) {
        setError('subject', 'Please enter a subject.');
        isValid = false;
      } else {
        setError('subject', '');
      }

      var messageVal = fields.message.value.trim();
      if (!messageVal) {
        setError('message', 'Please enter a message.');
        isValid = false;
      } else if (messageVal.length < 10) {
        setError('message', 'Message should be at least 10 characters.');
        isValid = false;
      } else {
        setError('message', '');
      }

      return isValid;
    }

    /* Live validation as the user leaves a field */
    Object.keys(fields).forEach(function (key) {
      var input = fields[key];
      if (!input) return;
      input.addEventListener('blur', function () {
        var row = input.closest('.form-row');
        if (row && row.classList.contains('invalid')) {
          validate();
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = validate();

      if (!isValid) {
        if (statusEl) {
          statusEl.textContent = 'Please fix the errors above and try again.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      /* No backend / API — simulate a successful send */
      if (statusEl) {
        statusEl.textContent = 'Thanks! Your message has been sent successfully.';
        statusEl.className = 'form-status success';
      }

      form.reset();
      Object.keys(errorEls).forEach(function (key) {
        setError(key, '');
      });
    });
  })();

  /* ---------------------------------------------------------------------
     12. Resume button placeholder (no file attached in this template)
  --------------------------------------------------------------------- */
  (function resumeButtonModule() {
    var resumeBtn = document.getElementById('resumeBtn');
    if (!resumeBtn) return;

    resumeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      resumeBtn.textContent = 'Add your resume link!';
      setTimeout(function () {
        resumeBtn.textContent = 'Download Resume';
      }, 1800);
    });
  })();

});
