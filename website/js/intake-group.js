/**
 * Group intake submit — five questionnaires, then the matching client glimpse.
 * Does not load /internal/ engines.
 */
(function () {
  "use strict";

  function mapGroupToClientIntake(data, group) {
    var d = data || {};
    var base = {
      companyName: d.Company || d["Legal business name"] || d["Legal or working name"] || "",
      trade: d.Industry || d["Industry / sector"] || "Construction",
      group: group
    };
    if (group === "commercial") {
      return Object.assign(base, {
        winRate: d["Win rate percent"] || "",
        pipelineConsistency: d["Pipeline consistency"] || "",
        bdProcess: d["Qualification used on live bids"] || "",
        proposalFrustration: d["Pursuit frustration"] || "",
        leadershipConfidence: "5",
        leadershipGaps: d["Business Development seat"] || "",
        kpisTracked: "revenue and backlog",
        statedSymptoms: "revenue_down,margin_down,forecast_miss"
      });
    }
    if (group === "financial") {
      return Object.assign(base, {
        finDecision: d["Decision this quarter"] || "",
        jobProfitVisibility: d["Job profit visibility"] || "",
        cashTightness: d["Cash tightness"] || "",
        coveragePressure: d["Coverage pressure"] || "",
        marginLeak: d["Where margin leaks"] || "",
        weeklyFinancials: d["Weekly financial numbers"] || "",
        stopAllowed: d["Will a STOP be allowed"] || "",
        revenue: d["Annual revenue"] || ""
      });
    }
    return Object.assign(base, d);
  }

  var NEXT = {
    financial: "../glimpse/financial.html",
    operations: "../glimpse/operations.html",
    venture: "../glimpse/venture.html",
    commercial: "../glimpse/commercial.html",
    coaching: "../glimpse/coaching.html",
    project: "../glimpse/project.html"
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
      sessionStorage.setItem("isi_active_engagement_group", group);
      sessionStorage.setItem("isi_engagement_family", group);
      var clientIntake = mapGroupToClientIntake(data, group);
      sessionStorage.setItem("isi_clientIntake", JSON.stringify(clientIntake));
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
