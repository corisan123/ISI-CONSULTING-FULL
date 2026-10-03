/**
 * Grouped discovery — one family of questions per constraint, not a single generic form.
 */
(function () {
  "use strict";

  var GROUPS = {
    commercial: "commercial",
    financial: "financial",
    operations: "operations",
    project: "project",
    coaching: "coaching",
    startup: "startup"
  };

  function param() {
    try {
      return new URLSearchParams(location.search).get("g") || "";
    } catch (err) {
      return "";
    }
  }

  function paint() {
    var g = param();
    var hub = document.getElementById("discoveryHub");
    var form = document.getElementById("discoveryForm");
    var title = document.getElementById("discoveryTitle");
    var lede = document.getElementById("discoveryLede");
    if (!form) return;

    form.querySelectorAll("fieldset[data-group]").forEach(function (set) {
      var on = set.getAttribute("data-group") === g;
      set.hidden = !on;
      set.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (el.name && el.name.charAt(0) === "_") return;
        if (el.name === "discoveryGroup") return;
        el.disabled = !on;
        if (el.hasAttribute("data-req")) el.required = on;
      });
    });

    var groupField = document.getElementById("discoveryGroup");
    if (groupField) groupField.value = g;

    if (!g || !GROUPS[g]) {
      if (hub) hub.hidden = false;
      form.hidden = true;
      if (title) title.textContent = "Discovery  - choose the constraint family";
      if (lede) {
        lede.textContent =
          "Not one generic questionnaire. Pick the group that matches the file. Similar studies share a page. Engines stay off this site.";
      }
      return;
    }

    if (hub) hub.hidden = true;
    form.hidden = false;
    var labels = {
      commercial: "Commercial / Business Development discovery",
      financial: "Financial / cash / turnaround discovery",
      operations: "Manufacturing / operations discovery",
      project: "Capital project / schedule discovery",
      coaching: "Coaching / cadence discovery",
      startup: "Startup / venture discovery"
    };
    if (title) title.textContent = labels[g] || "Discovery";
    if (lede) {
      lede.textContent =
        "Step 3 of 4. These questions match this study type. Go back to intake anytime  - those answers stay on this device.";
    }
  }

  document.addEventListener("DOMContentLoaded", paint);
})();
