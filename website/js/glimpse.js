/**
 * Client-facing diagnostic glimpse. Reads this browser’s group intake.
 * No /internal/ scripts. No formulas. No copy of working engines.
 */
(function () {
  "use strict";

  function read(group) {
    try {
      var raw = sessionStorage.getItem("isi_groupIntake_" + group) || sessionStorage.getItem("isi_groupIntake");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paint() {
    var body = document.body;
    var group = body.getAttribute("data-group") || "";
    var data = read(group);
    var empty = document.getElementById("glimpseEmpty");
    var board = document.getElementById("glimpseBoard");
    if (!data || data.group && data.group !== group) {
      if (data && data.group && data.group !== group) data = read(group);
    }
    if (!data) {
      if (empty) empty.hidden = false;
      if (board) board.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (board) board.hidden = false;
    var company = document.getElementById("glimpseCompany");
    if (company) {
      company.textContent =
        (data.Company || data.companyName || "This company") +
        (data.Contact || data.contactName ? " · " + (data.Contact || data.contactName) : "") +
        " · framed for the room  - not the internal engine";
    }
    var facts = document.getElementById("glimpseFacts");
    if (facts) {
      var skip = { group: 1, submittedAt: 1, _honey: 1 };
      var html = "";
      Object.keys(data).forEach(function (k) {
        if (skip[k] || !data[k] || data[k] === "true" || data[k] === "false") return;
        if (k === "companyName" || k === "contactName" || k === "email" || k === "phone") return;
        if (k === "Company" || k === "Contact" || k === "Email" || k === "Phone") return;
        html += "<div class='test'><div class='q'>" + esc(k.replace(/_/g, " ")) + "</div><p class='because'>" + esc(data[k]) + "</p></div>";
      });
      facts.innerHTML = html || "<p class='eng-desc'>Answers from intake appear here after you submit that group’s questionnaire.</p>";
    }
    var who = document.getElementById("glimpseWho");
    if (who) {
      who.textContent = [data.companyName, data.email, data.phone].filter(Boolean).join(" · ");
    }
  }

  document.addEventListener("DOMContentLoaded", paint);
})();
