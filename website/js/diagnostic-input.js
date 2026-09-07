/**
 * ISI Consulting — diagnostic-input.js (Block 2A Sections 1–3)
 * Validate → build diagData (canonical keys) → log → sessionStorage → alert.
 * Does NOT run scoring / decision tree / ROI (Block 2B+).
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "isi_input";
  var STORAGE_KEY_LEGACY = "isi_diagnosticInput";
  var DISCOVERY_KEY = "isi_discovery";

  /** DOM id → canonical engine key (matches src/data/diagnosticInput.json) */
  var FIELD_MAP = {
    diagRevenue: "revenue",
    diagMargin: "margin",
    diagEBITDA: "ebitda",
    diagPipeline: "pipeline",
    diagCloseRate: "closeRate",
    diagDealSize: "dealSize",
    diagSalesCycle: "salesCycle",
    diagCustConc: "customerConcentration",
    diagSalesCap: "salesCapacity",
    diagCTS: "costToServe",
    diagBottlenecks: "bottlenecks",
    diagLeadership: "leadership"
  };

  var REQUIRED_IDS = Object.keys(FIELD_MAP);

  var PCT_SOFT_IDS = [
    "diagMargin",
    "diagEBITDA",
    "diagCloseRate",
    "diagCustConc",
    "diagCTS"
  ];

  var NON_NEGATIVE_IDS = [
    "diagRevenue",
    "diagPipeline",
    "diagDealSize",
    "diagSalesCap",
    "diagSalesCycle"
  ];

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function numVal(id) {
    var raw = val(id);
    if (raw === "") return NaN;
    return Number(raw);
  }

  function clearErrors(form) {
    if (!form) return;
    form.querySelectorAll(".form-group").forEach(function (g) {
      g.classList.remove("has-error");
    });
    var soft = document.getElementById("diagSoftWarn");
    if (soft) {
      soft.hidden = true;
      soft.textContent = "";
    }
  }

  function showError(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var group = field.closest(".form-group");
    if (group) group.classList.add("has-error");
  }

  function showSoftWarn(messages) {
    var soft = document.getElementById("diagSoftWarn");
    if (!soft || !messages || !messages.length) return;
    soft.hidden = false;
    soft.textContent =
      "Note: " + messages.join(" ") + " Values were still saved.";
  }

  function parseLooseNumber(raw, preferPct) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s) return null;
    if (preferPct) {
      var pct = s.match(/(\d+(?:\.\d+)?)\s*%/);
      if (pct) {
        var pn = Number(pct[1]);
        if (isFinite(pn)) return pn;
      }
    }
    var cleaned = s.replace(/[$,%\s,]/g, "");
    var m = cleaned.match(/-?\d+(\.\d+)?/);
    if (!m) return null;
    var n = Number(m[0]);
    return isFinite(n) ? n : null;
  }

  function prefillFromDiscovery() {
    var raw;
    try {
      raw = sessionStorage.getItem(DISCOVERY_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var disc;
    try {
      disc = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!disc || typeof disc !== "object") return;

    var map = {
      annualRevenue: "diagRevenue",
      grossMargin: "diagMargin",
      ebitda: "diagEBITDA",
      pipelineValue: "diagPipeline",
      closeRate: "diagCloseRate",
      avgDealSize: "diagDealSize",
      salesCycle: "diagSalesCycle",
      customerConcentration: "diagCustConc",
      salesTeamCapacity: "diagSalesCap",
      costToServe: "diagCTS",
      bottlenecks: "diagBottlenecks"
    };

    Object.keys(map).forEach(function (srcKey) {
      var destId = map[srcKey];
      var el = document.getElementById(destId);
      if (!el || el.value) return;
      var src = disc[srcKey];
      if (src == null || src === "") return;

      if (destId === "diagBottlenecks") {
        el.value = String(src);
        return;
      }

      var preferPct = (
        destId === "diagMargin" ||
        destId === "diagEBITDA" ||
        destId === "diagCloseRate" ||
        destId === "diagCustConc" ||
        destId === "diagCTS"
      );
      var n = parseLooseNumber(src, preferPct);
      if (n != null) el.value = String(n);
    });
  }

  /** Canonical payload — matches src/data/diagnosticInput.json */
  function buildDiagData() {
    return {
      revenue: Number(document.getElementById("diagRevenue").value),
      margin: Number(document.getElementById("diagMargin").value),
      ebitda: Number(document.getElementById("diagEBITDA").value),
      pipeline: Number(document.getElementById("diagPipeline").value),
      closeRate: Number(document.getElementById("diagCloseRate").value),
      dealSize: Number(document.getElementById("diagDealSize").value),
      salesCycle: Number(document.getElementById("diagSalesCycle").value),
      customerConcentration: Number(document.getElementById("diagCustConc").value),
      salesCapacity: Number(document.getElementById("diagSalesCap").value),
      costToServe: Number(document.getElementById("diagCTS").value),
      bottlenecks: document.getElementById("diagBottlenecks").value,
      leadership: Number(document.getElementById("diagLeadership").value)
    };
  }

  function validate() {
    var ok = true;
    var soft = [];

    REQUIRED_IDS.forEach(function (id) {
      var raw = val(id);
      if (!raw && id !== "diagBottlenecks") {
        showError(id);
        ok = false;
        return;
      }
      if (id === "diagBottlenecks") {
        if (!raw) {
          showError(id);
          ok = false;
        }
        return;
      }

      var n = numVal(id);
      if (!isFinite(n)) {
        showError(id);
        ok = false;
        return;
      }

      if (id === "diagLeadership") {
        if (n < 1 || n > 10) {
          showError(id);
          ok = false;
        }
        return;
      }

      if (NON_NEGATIVE_IDS.indexOf(id) !== -1 && n < 0) {
        showError(id);
        ok = false;
        return;
      }

      if (PCT_SOFT_IDS.indexOf(id) !== -1 && (n < 0 || n > 100)) {
        var lab = document.querySelector('label[for="' + id + '"]');
        soft.push(
          (lab ? lab.textContent.trim() : id) +
            " is outside 0–100 (" +
            n +
            ")."
        );
      }
    });

    return { ok: ok, softWarnings: soft };
  }

  /**
   * Section 2 — Log → Validate → Store → Alert
   * Data shape matches Section 3 JSON template.
   */
  function submitDiagnosticInput() {
    var form = document.getElementById("diagnosticInputForm");
    clearErrors(form);

    var result = validate();
    if (!result.ok) return false;

    var diagData = buildDiagData();

    console.log("Diagnostic Input:", diagData);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(diagData));
      sessionStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(diagData));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    if (result.softWarnings.length) {
      showSoftWarn(result.softWarnings);
    }

    alert("Diagnostic input saved. Proceeding to scoring.");
    window.location.href = "/diagnostic/scoring.html";
    return false;
  }

  function bindForm() {
    var form = document.getElementById("diagnosticInputForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitDiagnosticInput();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    prefillFromDiscovery();
    bindForm();
  });

  global.submitDiagnosticInput = submitDiagnosticInput;
  global.buildDiagData = buildDiagData;
})(typeof window !== "undefined" ? window : this);
