/**
 * Public-page protection. Does not hide HTML from a determined reader —
 * browsers can always View Source — but it blocks casual copy, drag, and
 * right-click on intake, discovery, guides, and client diagnostic glimpses.
 * Working engines stay under /internal/ and are never linked here.
 * Typing in inputs and textareas is allowed.
 */
(function (global) {
  "use strict";

  function isField(el) {
    if (!el || !el.tagName) return false;
    var t = el.tagName.toUpperCase();
    return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || el.isContentEditable;
  }

  function attach(root) {
    if (!root) return;
    if (root.setAttribute) root.setAttribute("data-isi-protect", "");
    ["contextmenu", "dragstart"].forEach(function (evt) {
      root.addEventListener(evt, function (e) {
        if (isField(e.target)) return;
        e.preventDefault();
      });
    });
    ["copy", "cut"].forEach(function (evt) {
      root.addEventListener(evt, function (e) {
        if (isField(e.target)) return;
        e.preventDefault();
      });
    });
    root.addEventListener("selectstart", function (e) {
      if (isField(e.target)) return;
      e.preventDefault();
    });
  }

  function boot() {
    attach(document);
    attach(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.ISI = global.ISI || {};
  global.ISI.protect = { attach: attach };
})(typeof window !== "undefined" ? window : this);
