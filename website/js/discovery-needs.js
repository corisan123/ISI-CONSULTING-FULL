/**
 * Needs form follows the intake family. No engines. Draft key includes group.
 */
(function () {
  "use strict";

  var LABELS = {
    commercial: "Fractional Business Development",
    financial: "Financial / turnaround / growth capital",
    operations: "Manufacturing and operations",
    venture: "Startup, turnaround, or business plan",
    coaching: "Coaching and training",
    project: "Project management and recovery"
  };

  var PROMPTS = {
    commercial: "Name the weekly commercial number, who owns it today, and what qualification must be true on live bids before the seat is considered real.",
    financial: "Name the financial decision this quarter, whether a STOP is allowed, and what diligence must see before a growth story is sold.",
    operations: "Name the constraint resource, where work stalls in a typical week, and what 90-day floor proof is not a poster.",
    venture: "Name the buyer or recast thesis, runway in weeks, and the dated kill condition if the plan fails.",
    coaching: "Name the occupied seats, the weekly behavior that must change, and proof that is a week of notes without ISI in the room.",
    project: "Name the live job or portfolio, schedule/cost/scope pain, and what earned-value or recovery proof leadership will accept in 90 days."
  };

  function resolveGroup() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get("group");
    if (fromUrl && LABELS[fromUrl]) return fromUrl;
    try {
      var active = sessionStorage.getItem("isi_active_engagement_group");
      if (active && LABELS[active]) return active;
      var keys = ["commercial", "financial", "operations", "venture", "coaching", "project"];
      for (var i = 0; i < keys.length; i++) {
        if (sessionStorage.getItem("isi_groupIntake_" + keys[i])) return keys[i];
      }
    } catch (err) {}
    return "commercial";
  }

  function paint() {
    var group = resolveGroup();
    document.body.setAttribute("data-needs-group", group);
    var docKey = "discovery-needs-" + group;
    document.body.setAttribute("data-doc", docKey);

    var kicker = document.getElementById("needsGroupLabel");
    if (kicker) kicker.textContent = LABELS[group] || group;

    var prompt = document.getElementById("needsGroupPrompt");
    if (prompt) prompt.textContent = PROMPTS[group] || "";

    document.querySelectorAll("[data-needs-panel]").forEach(function (panel) {
      var g = panel.getAttribute("data-needs-panel");
      panel.hidden = g !== group;
    });
  }

  document.addEventListener("DOMContentLoaded", paint);
})();
