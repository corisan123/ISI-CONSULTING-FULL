/**
 * Group intake submit — five questionnaires, then the matching client glimpse.
 * Does not load /internal/ engines.
 */
(function () {
  "use strict";

  var NEXT = {
    financial: "../glimpse/financial.html",
    operations: "../glimpse/operations.html",
    venture: "../glimpse/venture.html",
    commercial: "../glimpse/commercial.html",
    coaching: "../glimpse/coaching.html"
  };

  function submitGroupIntake() {
    var form = document.getElementById("groupIntakeForm");
    if (!ISI.forms) return false;
    var group = (form && form.getAttribute("data-group")) || "commercial";
    var required = [];
    if (form) {
      form.querySelectorAll("[required]").forEach(function (el) {
        if (el.id) required.push(el.id);
      });
    }
    var ok = true;
    required.forEach(function (id) {
      var el = document.getElementById(id);
      var v = el ? String(el.value || "").trim() : "";
      if (!v) {
        var g = el && el.closest(".form-group");
        if (g) g.classList.add("has-error");
        ok = false;
      }
    });
    var emailEl = document.getElementById("email");
    var email = emailEl ? String(emailEl.value || "").trim() : "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      var eg = emailEl.closest(".form-group");
      if (eg) eg.classList.add("has-error");
      ok = false;
    }
    if (!ok) return false;

    var data = { group: group, submittedAt: new Date().toISOString() };
    if (form) {
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (!el.name || el.disabled) return;
        if (el.name.charAt(0) === "_") return;
        if (el.type === "checkbox") data[el.name] = el.checked;
        else data[el.name] = String(el.value || "").trim();
      });
    }
    try {
      sessionStorage.setItem("isi_groupIntake", JSON.stringify(data));
      sessionStorage.setItem("isi_groupIntake_" + group, JSON.stringify(data));
    } catch (err) {}

    form.setAttribute("data-next", NEXT[group] || "../schedule.html");
    var nextField = form.querySelector("input[name='_next']");
    if (nextField) {
      nextField.value = "https://isiconsults.com/glimpse/" + group;
    }
    if (ISI.forms.deliverToInbox) ISI.forms.deliverToInbox(form);
    else location.href = NEXT[group];
    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("groupIntakeForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitGroupIntake();
    });
  });
})();
