/* ===================================================================
   AUREVIA REALTY — Vanilla JS Interactions
=================================================================== */
(function () {
  'use strict';

  /* -----------------------------------------------------------
     1. PAGE LOADER
  ------------------------------------------------------------ */
  function initLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('is-hidden');
      }, 350);
    });
  }

  /* -----------------------------------------------------------
     2. SCROLL PROGRESS BAR
  ------------------------------------------------------------ */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* -----------------------------------------------------------
     3. STICKY HEADER + ACTIVE NAV LINK
  ------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    var navToggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    var overlay = document.getElementById('navOverlay');
    var navLinks = document.querySelectorAll('[data-nav]');
    var backToTop = document.getElementById('backToTop');

    function onScroll() {
      if (window.scrollY > 60) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      if (backToTop) {
        if (window.scrollY > 500) backToTop.classList.add('is-visible');
        else backToTop.classList.remove('is-visible');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('is-open');
        overlay.classList.toggle('is-open', isOpen);
        navToggle.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
    if (overlay) overlay.addEventListener('click', closeMenu);
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* active link on scroll */
    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href');
      var el = id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      if (el) sections.push({ link: link, el: el });
    });
    function onScrollSpy() {
      var scrollPos = window.scrollY + window.innerHeight * 0.35;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.el.offsetTop <= scrollPos) current = s;
      });
      sections.forEach(function (s) {
        s.link.classList.toggle('active', s === current);
      });
    }
    window.addEventListener('scroll', onScrollSpy, { passive: true });
    onScrollSpy();

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* -----------------------------------------------------------
     4. HERO SLIDER
  ------------------------------------------------------------ */
  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero__slide');
    var dotsWrap = document.getElementById('heroDots');
    if (!slides.length) return;
    var current = 0;
    var timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      if (i === 0) dot.classList.add('is-active');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('button');

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = index;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
      resetTimer();
    }
    function next() {
      goTo((current + 1) % slides.length);
    }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 5500);
    }
    resetTimer();
  }

  /* -----------------------------------------------------------
     5. SCROLL REVEAL (IntersectionObserver)
  ------------------------------------------------------------ */
  function initScrollReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------
     6. ANIMATED COUNTERS
  ------------------------------------------------------------ */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var duration = 1800;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------
     7. TESTIMONIAL SLIDER
  ------------------------------------------------------------ */
  function initTestimonials() {
    var track = document.getElementById('testiTrack');
    var dotsWrap = document.getElementById('testiDots');
    var prevBtn = document.getElementById('testiPrev');
    var nextBtn = document.getElementById('testiNext');
    if (!track) return;
    var slides = track.querySelectorAll('.testi-slide');
    var current = 0;
    var timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      if (i === 0) dot.classList.add('is-active');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('button');

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
      resetTimer();
    }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    resetTimer();
  }

  /* -----------------------------------------------------------
     8. GALLERY LIGHTBOX
  ------------------------------------------------------------ */
  function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightboxImg');
    var counter = document.getElementById('lightboxCounter');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    if (!items.length || !lightbox) return;
    var current = 0;

    function open(index) {
      current = index;
      render();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function render() {
      var item = items[current];
      img.src = item.getAttribute('data-full');
      img.alt = item.getAttribute('data-caption') || '';
      counter.textContent = (current + 1) + ' / ' + items.length;
    }
    function go(delta) {
      current = (current + delta + items.length) % items.length;
      render();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { open(i); });
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
  }

  /* -----------------------------------------------------------
     9. FAQ ACCORDION
  ------------------------------------------------------------ */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    function setHeight(item, open) {
      var answer = item.querySelector('.faq-item__a');
      if (open) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = 0;
      }
    }

    items.forEach(function (item) {
      var q = item.querySelector('.faq-item__q');
      setHeight(item, item.classList.contains('is-open'));
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          setHeight(other, false);
        });
        if (!isOpen) {
          item.classList.add('is-open');
          setHeight(item, true);
        }
      });
    });

    window.addEventListener('resize', function () {
      items.forEach(function (item) {
        setHeight(item, item.classList.contains('is-open'));
      });
    });
  }

  /* -----------------------------------------------------------
     10. BUTTON RIPPLE EFFECT
  ------------------------------------------------------------ */
  function initRipple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        var size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 650);
      });
    });
  }

  /* -----------------------------------------------------------
     11. CONTACT FORM (static — client-side validation only)
  ------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    var msg = document.getElementById('formMsg');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      msg.className = 'form-msg';

      if (!name || !phone || !email || !message) {
        msg.textContent = 'Please fill in all fields before submitting.';
        msg.classList.add('is-error');
        return;
      }
      if (!emailPattern.test(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.classList.add('is-error');
        return;
      }

      msg.textContent = 'Thank you, ' + name + '! Your enquiry has been received — our team will contact you within 24 hours.';
      msg.classList.add('is-success');
      form.reset();
    });
  }

  /* -----------------------------------------------------------
     12. FOOTER YEAR
  ------------------------------------------------------------ */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------
     INIT
  ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initScrollProgress();
    initHeader();
    initHeroSlider();
    initScrollReveal();
    initCounters();
    initTestimonials();
    initLightbox();
    initFaq();
    initRipple();
    initContactForm();
    initYear();
  });
})();
