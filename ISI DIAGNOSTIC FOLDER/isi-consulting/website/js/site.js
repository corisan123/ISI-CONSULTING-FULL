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
        form.reset();
        /* Placeholder only — no backend submission */
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    markCurrentNav();
    initForms();
  });
})();
