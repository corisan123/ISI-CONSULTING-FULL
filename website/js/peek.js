/**
 * Public desk: screens only. No calculation, no engines.
 */
(function () {
  "use strict";

  function protect(root) {
    if (!root) return;
    ["contextmenu", "dragstart", "copy", "cut", "selectstart"].forEach(function (evt) {
      root.addEventListener(evt, function (e) {
        var t = e.target && e.target.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
        e.preventDefault();
      });
    });
  }

  function lockedNotice() {
    var note = document.getElementById("peekLocked");
    if (!note) return;
    note.hidden = false;
    note.focus();
  }

  function go(key) {
    if (key === "diag") {
      window.location.assign(new URL("forms/intake.html", window.location.href).href);
      return;
    }
    if (key === "consult") {
      window.location.assign("https://calendly.com/contact-isi-consulting");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    protect(document.getElementById("peekDesk"));
    document.querySelectorAll(".desk-frame").forEach(protect);

    document.querySelectorAll("[data-open-peek]").forEach(function (el) {
      el.addEventListener("click", function () {
        window.location.assign(new URL("peek.html", window.location.href).href);
      });
    });

    document.querySelectorAll("[data-locked]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        lockedNotice();
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lockedNotice();
        }
      });
    });

    document.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(btn.getAttribute("data-go"));
      });
    });
  });
})();
