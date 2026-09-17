/**
 * ISI Consulting — site.js
 * Nav, mobile menu, form placeholder validation (no backend / no diagnostic engines)
 */
(function () {
  "use strict";

  /* Mobile nav */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Mark current page in nav */
  function markCurrentNav() {
    var path = window.location.pathname.replace(/\/$/, "");
    var file = path.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hrefFile = href.split("/").pop();
      if (hrefFile === file || (file === "" && hrefFile === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* Simple client-side form validation hooks */
  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearErrors(form) {
    form.querySelectorAll(".form-group").forEach(function (g) {
      g.classList.remove("has-error");
    });
  }

  function showError(field) {
    var group = field.closest(".form-group");
    if (group) group.classList.add("has-error");
  }

  function initForms() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors(form);
        var valid = true;

        form.querySelectorAll("[required]").forEach(function (field) {
          var value = (field.value || "").trim();
          if (!value) {
            showError(field);
            valid = false;
            return;
          }
          if (field.type === "email" && !validateEmail(value)) {
            showError(field);
            valid = false;
          }
        });

        if (!valid) return;

        var success = form.querySelector(".form-success");
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("role", "status");
        }
        /* Do not reset. Drafts stay so Back does not wipe the file. */
      });
    });
  }

  var EXPLORE = {
    system: {
      title: "The Unified Growth System",
      html:
        "<p>Fractional BD leadership is the tollgate. Diagnostic intelligence and targeted interventions open only when that seat proves they are needed — sequenced so you do not buy a catalog of tools before the commercial constraint is named.</p>" +
        "<p>Study type reconfigures the work: a manufacturing throughput study does not run like a cash turnaround or a CAPEX case. The engines stay with the firm.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="services/fractional-business-development.html">Fractional BD</a><a class="btn btn-outline" href="system.html">See the system</a></div>'
    },
    fractional: {
      title: "Fractional BD leadership",
      html:
        "<p>The engagement this practice is built on. A senior commercial operator inside the company — pipeline architecture, qualification standards, CRM discipline, proposal cadence — without a full-time VP of BD.</p>" +
        "<p>Daniel Reid has owned that seat: $48 million in automation transactions over 24 months, profit centers from inception to $6.2 million at 67%+ gross margin, and $1.8 million in awards in 12 months after a stalled commercial rebuild. Strategy, finance, PM, and manufacturing practice follow only if the constraint is not the BD seat.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="services/fractional-business-development.html">The offering</a><a class="btn btn-outline" href="forms/client-intake.html">Start intake</a></div>'
    },
    strategy: {
      title: "Strategy &amp; diagnosis",
      html:
        "<p>Find the constraint before you spend on the symptom. Intake captures what leadership believes. Diligence and structured diagnosis keep or kill competing causes before a workstream is sold.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="system.html">How the system works</a><a class="btn btn-outline" href="https://calendly.com/contact-isi-consults" target="_blank" rel="noopener noreferrer">Schedule</a></div>'
    },
    finance: {
      title: "Financial solutions",
      html:
        "<p>Profitability, margin leakage, declining share, and turnaround due diligence — named in numbers. Fractional finance when a full-time seat is not the answer yet.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="services/index.html">Business solutions</a><a class="btn btn-outline" href="forms/client-intake.html">Start intake</a></div>'
    },
    pm: {
      title: "Project management",
      html:
        "<p>Estimate, field, and closeout on one set of decision rights. Promises and capacity stay synchronized so claims do not become the operating system.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="services/index.html">PM consulting</a><a class="btn btn-outline" href="https://calendly.com/contact-isi-consults" target="_blank" rel="noopener noreferrer">Schedule</a></div>'
    },
    ops: {
      title: "Manufacturing &amp; process",
      html:
        "<p>Shop, yard, and fabrication practice for construction-serving manufacturers: bottlenecks, waste, throughput, and a rhythm the crew can actually run.</p>" +
        '<div class="overlay-actions"><a class="btn btn-primary" href="services/operational-alignment.html">Process work</a><a class="btn btn-outline" href="forms/client-intake.html">Start intake</a></div>'
    }
  };

  var SPARKS = {
    up: "M8,118 C40,112 55,96 80,88 C110,78 130,92 160,70 C190,48 215,42 248,28 C275,18 300,22 312,16",
    recover: "M8,42 C40,38 60,70 90,86 C120,102 145,118 175,96 C205,74 230,40 260,32 C285,26 300,30 312,24",
    pulse: "M8,90 C35,86 50,50 78,58 C108,66 125,110 158,88 C188,68 210,36 242,44 C270,52 292,22 312,28"
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function sync() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function initReveal() {
    var nodes = document.querySelectorAll(
      "main > section:not(.hero), .page-header, .card, .overlay-card, .solution-card, .problem-list li, .stat"
    );
    if (!nodes.length) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 8) * 0.05 + "s";
      io.observe(el);
    });
  }

  function sparkPath(kind) {
    return SPARKS[kind] || SPARKS.up;
  }

  function initSparks() {
    document.querySelectorAll("[data-spark]").forEach(function (host) {
      if (host.querySelector("svg")) return;
      var kind = host.getAttribute("data-spark") || "up";
      var uid = "isiFill-" + Math.random().toString(36).slice(2, 8);
      var endY = kind === "recover" ? 24 : kind === "pulse" ? 28 : 16;
      host.innerHTML =
        '<svg class="spark-svg" viewBox="0 0 320 140" role="img" aria-hidden="true">' +
        "<defs><linearGradient id=\"" + uid + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">" +
        '<stop offset="0%" stop-color="#C9A235" stop-opacity="0.45"/>' +
        '<stop offset="100%" stop-color="#C9A235" stop-opacity="0"/>' +
        "</linearGradient></defs>" +
        '<path class="spark-area" d="' + sparkPath(kind) + ' L312,140 L8,140 Z" fill="url(#' + uid + ')"/>' +
        '<path class="spark-line" d="' + sparkPath(kind) + '"/>' +
        '<circle class="spark-dot" cx="312" cy="' + endY + '" r="4"/>' +
        "</svg>";
    });
  }

  function ensureOverlay() {
    var existing = document.getElementById("isi-overlay");
    if (existing) return existing;
    var wrap = document.createElement("div");
    wrap.id = "isi-overlay";
    wrap.className = "isi-overlay";
    wrap.innerHTML =
      '<button type="button" class="isi-overlay-backdrop" aria-label="Close overlay"></button>' +
      '<div class="isi-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="isi-overlay-title">' +
      '<button type="button" class="isi-overlay-close" aria-label="Close">×</button>' +
      '<div class="isi-overlay-body"></div></div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function openExplore(key) {
    var data = EXPLORE[key];
    if (!data) return;
    var wrap = ensureOverlay();
    var body = wrap.querySelector(".isi-overlay-body");
    body.innerHTML = "<h2 id=\"isi-overlay-title\">" + data.title + "</h2>" + data.html;
    wrap.classList.add("is-open");
    document.documentElement.classList.add("isi-overlay-open");
    var closeBtn = wrap.querySelector(".isi-overlay-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeExplore() {
    var wrap = document.getElementById("isi-overlay");
    if (!wrap) return;
    wrap.classList.remove("is-open");
    document.documentElement.classList.remove("isi-overlay-open");
  }

  function initExplore() {
    var wrap = ensureOverlay();
    wrap.addEventListener("click", function (e) {
      if (e.target.classList.contains("isi-overlay-backdrop") || e.target.classList.contains("isi-overlay-close")) {
        closeExplore();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeExplore();
    });
    document.querySelectorAll("[data-explore]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openExplore(btn.getAttribute("data-explore"));
      });
    });
  }

  function initToggles() {
    document.querySelectorAll("[data-isi-toggle-root]").forEach(function (root) {
      var buttons = root.querySelectorAll("[data-isi-toggle] [data-pane]");
      var panes = root.querySelectorAll("[data-pane-id]");
      if (!buttons.length || !panes.length) return;
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-pane");
          buttons.forEach(function (b) {
            var on = b === btn;
            b.classList.toggle("is-on", on);
            b.setAttribute("aria-selected", on ? "true" : "false");
          });
          panes.forEach(function (pane) {
            pane.classList.toggle("is-on", pane.getAttribute("data-pane-id") === id);
          });
        });
      });
    });
  }

  function initCountUp() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    function run(el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      if (prefersReducedMotion() || isNaN(end)) {
        el.textContent = prefix + end + suffix;
        return;
      }
      var start = 0;
      var t0 = null;
      var dur = 1100;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(start + (end - start) * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  }

  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "scroll-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.prepend(bar);
    }
    function sync() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    markCurrentNav();
    initForms();
    initHeaderScroll();
    initSparks();
    initReveal();
    initExplore();
    initToggles();
    initCountUp();
    initScrollProgress();
  });
})();
