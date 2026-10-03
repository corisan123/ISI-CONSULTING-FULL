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
    if (group === "operations") {
      return Object.assign(base, {
        opsConstraint: d["Believed constraint"] || "",
        opsStall: d["Where work stalls"] || "",
        otif: d.OTIF || "",
        qualityCost: d["Quality cost"] || "",
        wipDays: d["WIP or days on hand"] || "",
        capexProposed: d["Capex proposed first"] || "",
        handoffBreaks: d["Handoff breaks"] || "",
        opsProof: d["90-day operational proof"] || "",
        statedSymptoms: "constraint,flow,quality,handoff"
      });
    }
    if (group === "venture") {
      return Object.assign(base, {
        fileType: d["File type"] || "",
        offer: d["Offer in one sentence"] || "",
        namedBuyer: d["Named buyer or concentration"] || "",
        runwayWeeks: d["Runway weeks"] || "",
        unitEconKnown: d["Unit economics known"] || "",
        killCondition: d["Kill condition"] || "",
        acceptsDiligence: d["Accepts diligence next"] || "",
        statedSymptoms: "runway,unit_econ,sequence,kill"
      });
    }
    if (group === "project") {
      return Object.assign(base, {
        namedJob: d["Named job or portfolio"] || "",
        scheduleSlip: d["Schedule slip"] || "",
        costFade: d["Cost or margin fade"] || "",
        changeControl: d["Change control pain"] || "",
        evmTrusted: d["EVM trusted"] || "",
        recoveryAuthority: d["Recovery authority"] || "",
        projectProof: d["90-day project proof"] || "",
        statedSymptoms: "schedule,cost,change,evm,recovery"
      });
    }
    if (group === "coaching") {
      return Object.assign(base, {
        seatOccupied: d["Seat occupied"] || "",
        rolesCoached: d["Roles being coached"] || "",
        weeklyCadence: d["Weekly cadence"] || "",
        qualification30: d["Qualification used in 30 days"] || "",
        behaviorChange: d["Behavior that must change"] || "",
        coachingProof: d["90-day coaching proof"] || "",
        leadershipConfidence: /yes/i.test(d["Weekly cadence"] || "") ? "8" : /status/i.test(d["Weekly cadence"] || "") ? "5" : "3",
        bdProcess: /yes/i.test(d["Qualification used in 30 days"] || "") ? "used on live bid" : /talked/i.test(d["Qualification used in 30 days"] || "") ? "ad hoc" : "no",
        leadershipGaps: /vacant|no/i.test(d["Seat occupied"] || "") ? "no bench — vacant seat" : /partly|founder/i.test(d["Seat occupied"] || "") ? "founder covering" : "named owners",
        deptConflict: d["Behavior that must change"] || "",
        handoffs: d["90-day coaching proof"] || "",
        statedSymptoms: "leadership_drag,handoff,qualification"
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
