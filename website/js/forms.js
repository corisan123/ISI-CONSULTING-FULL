/**
 * ISI Consulting — forms.js (Block 1B)
 * Client Intake, Discovery Questionnaire, Consultation Scheduling,
 * Contact, Lead Magnet
 * Stores latest submission in sessionStorage for future diagnostic engine.
 */
(function (global) {
  "use strict";

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearErrors(form) {
    if (!form) return;
    form.querySelectorAll(".form-group").forEach(function (g) {
      g.classList.remove("has-error");
    });
  }

  function showError(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var group = field.closest(".form-group");
    if (group) group.classList.add("has-error");
  }

  function requireFields(ids) {
    var ok = true;
    ids.forEach(function (id) {
      var v = val(id);
      if (!v) {
        showError(id);
        ok = false;
      }
    });
    return ok;
  }

  function showSuccess(form, message) {
    var success = form ? form.querySelector(".form-success") : null;
    if (success) {
      if (message) success.textContent = message;
      success.classList.add("is-visible");
      success.setAttribute("role", "status");
      return true;
    }
    if (message) alert(message);
    else alert("Submitted successfully.");
    return false;
  }

  function store(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }
  }

  function draftKey(form) {
    return "isi_draft_" + (form.id || location.pathname);
  }

  function serializeLive(form) {
    var data = {};
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (!el.name && !el.id) return;
      var key = el.name || el.id;
      if (el.type === "checkbox" && el.name === "statedSymptoms") return;
      if (el.type === "checkbox") data[key] = el.checked;
      else if (el.type === "radio") {
        if (el.checked) data[key] = el.value;
      } else data[key] = el.value;
    });
    var symptoms = [];
    form.querySelectorAll("input[name='statedSymptoms']:checked").forEach(function (el) {
      symptoms.push(el.value);
    });
    if (form.querySelector("input[name='statedSymptoms']")) data.statedSymptoms = symptoms.join(",");
    return data;
  }

  function hydrateForm(form, data) {
    if (!data || !form) return;
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      var key = el.name || el.id;
      if (el.type === "checkbox" && el.name === "statedSymptoms") {
        el.checked = ("," + (data.statedSymptoms || "") + ",").indexOf("," + el.value + ",") >= 0;
        return;
      }
      if (data[key] == null || data[key] === "") return;
      if (el.type === "checkbox") el.checked = !!data[key];
      else if (el.type === "radio") el.checked = el.value === data[key];
      else el.value = data[key];
    });
  }

  function bindLiveForm(form) {
    if (!form) return;
    var key = draftKey(form);
    var restoreKey = form.getAttribute("data-restore-key");
    function save() {
      store(key, serializeLive(form));
    }
    function restore() {
      try {
        var raw = sessionStorage.getItem(key);
        if (raw) {
          hydrateForm(form, JSON.parse(raw));
          return;
        }
        if (restoreKey) {
          var submitted = sessionStorage.getItem(restoreKey);
          if (submitted) hydrateForm(form, JSON.parse(submitted));
        }
      } catch (err) {}
    }
    restore();
    form.addEventListener("input", save);
    form.addEventListener("change", save);
    window.addEventListener("pageshow", restore);
  }

  function maybeNavigate(form) {
    if (!form) return;
    var next = form.getAttribute("data-next");
    if (!next) return;
    /* Brief pause so the success message is visible */
    setTimeout(function () {
      window.location.href = next;
    }, 700);
  }

  function triggerGuideDownload() {
    var href = "/website/assets/isi-growth-diagnostic-guide-placeholder.txt";
    var a = document.createElement("a");
    a.href = href;
    a.download = "isi-growth-diagnostic-guide-placeholder.txt";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Client Intake — nine-section construction / trades profile.
   * Serializes every named control; required IDs must be present.
   */
  function submitClientIntake() {
    var form = document.getElementById("clientIntakeForm");
    clearErrors(form);

    var required = [];
    if (form) {
      form.querySelectorAll("[required]").forEach(function (el) {
        if (el.id) required.push(el.id);
      });
    }
    var ok = requireFields(required);
    var email = val("email");
    if (email && !validateEmail(email)) {
      showError("email");
      ok = false;
    }
    if (!ok) return false;

    var data = { submittedAt: new Date().toISOString() };
    if (form) {
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (!el.name) return;
        if (el.type === "checkbox") return;
        data[el.name] = String(el.value || "").trim();
      });
      var symptoms = [];
      form.querySelectorAll("input[name='statedSymptoms']:checked").forEach(function (el) {
        symptoms.push(el.value);
      });
      if (symptoms.length) data.statedSymptoms = symptoms.join(",");
    }
    data.companyName = data.companyName || val("companyName");
    data.industry = data.trade || data.industry || "";
    data.constraintFamily = data.constraintFamily || "growth";
    data.challenge = data.preventing || data.challenge || "";

    console.log("Client Intake submitted:", data);
    store("isi_clientIntake", data);
    try {
      var practice = {};
      var raw = sessionStorage.getItem("isi_practice");
      if (raw) practice = JSON.parse(raw);
      practice.engagement = practice.engagement || {};
      practice.engagement.company = data.companyName;
      practice.engagement.contact = data.contactName;
      practice.engagement.email = data.email;
      practice.engagement.industry = data.trade || data.industry;
      practice.engagement.constraint = data.constraintFamily;
      practice.engagement.updatedAt = data.submittedAt;
      practice.intake = data;
      sessionStorage.setItem("isi_practice", JSON.stringify(practice));
    } catch (err) {}
    showSuccess(
      form,
      "Thank you. Your intake has been saved on this device. Continue to commercial metrics or book a consultation."
    );
    maybeNavigate(form);
    return false;
  }

  /**
   * Discovery Questionnaire — financial & commercial metrics
   */
  function submitDiscovery() {
    var form = document.getElementById("discoveryForm");
    clearErrors(form);

    var required = [
      "annualRevenue",
      "grossMargin",
      "ebitda",
      "pipelineValue",
      "closeRate",
      "avgDealSize",
      "salesCycle",
      "customerConcentration",
      "salesTeamCapacity",
      "costToServe",
      "bottlenecks"
    ];
    var ok = requireFields(required);
    if (!ok) return false;

    var data = {
      annualRevenue: val("annualRevenue"),
      grossMargin: val("grossMargin"),
      ebitda: val("ebitda"),
      pipelineValue: val("pipelineValue"),
      closeRate: val("closeRate"),
      avgDealSize: val("avgDealSize"),
      salesCycle: val("salesCycle"),
      customerConcentration: val("customerConcentration"),
      salesTeamCapacity: val("salesTeamCapacity"),
      costToServe: val("costToServe"),
      bottlenecks: val("bottlenecks"),
      submittedAt: new Date().toISOString()
    };

    console.log("Discovery Questionnaire submitted:", data);
    store("isi_discovery", data);
    showSuccess(
      form,
      "Discovery data saved locally. Continuing to consultation scheduling…"
    );
    maybeNavigate(form);
    return false;
  }

  /**
   * Consultation Scheduling — schedName, schedEmail, schedDate, schedTime
   */
  function submitSchedule() {
    var form = document.getElementById("scheduleForm");
    clearErrors(form);

    var required = ["schedName", "schedEmail", "schedDate", "schedTime"];
    var ok = requireFields(required);
    var email = val("schedEmail");
    if (email && !validateEmail(email)) {
      showError("schedEmail");
      ok = false;
    }
    if (!ok) return false;

    var data = {
      schedName: val("schedName"),
      schedEmail: email,
      schedDate: val("schedDate"),
      schedTime: val("schedTime"),
      submittedAt: new Date().toISOString()
    };

    console.log("Consultation Schedule submitted:", data);
    store("isi_schedule", data);
    showSuccess(
      form,
      "Thank you. Your consultation request has been saved locally. We will confirm your preferred time when calendar sync is enabled."
    );
    maybeNavigate(form);
    return false;
  }

  /**
   * Contact — contactNameField, contactEmailField, contactMessageField
   */
  function submitContact() {
    var form = document.getElementById("contactForm");
    clearErrors(form);

    var required = ["contactNameField", "contactEmailField", "contactMessageField"];
    var ok = requireFields(required);
    var email = val("contactEmailField");
    if (email && !validateEmail(email)) {
      showError("contactEmailField");
      ok = false;
    }
    if (!ok) return false;

    var data = {
      name: val("contactNameField"),
      email: email,
      message: val("contactMessageField"),
      submittedAt: new Date().toISOString()
    };

    console.log("Contact Form Submitted:", data);
    store("isi_contact", data);
    showSuccess(form, "Thank you! Your message has been sent.");
    return false;
  }

  /**
   * Lead Magnet — leadEmail; triggers placeholder guide download
   */
  function submitLeadMagnet() {
    var form = document.getElementById("leadMagnetForm");
    clearErrors(form);

    var ok = requireFields(["leadEmail"]);
    var email = val("leadEmail");
    if (email && !validateEmail(email)) {
      showError("leadEmail");
      ok = false;
    }
    if (!ok) return false;

    var data = {
      email: email,
      requestedAt: new Date().toISOString()
    };

    console.log("Lead Magnet Request:", email);
    store("isi_leadMagnet", data);
    showSuccess(form, "Your download is ready.");
    triggerGuideDownload();
    return false;
  }

  /* Wire submit buttons that use type=submit inside isi-forms without inline onclick */
  function bindFormSubmit(formId, handler) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handler();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindFormSubmit("clientIntakeForm", submitClientIntake);
    bindFormSubmit("discoveryForm", submitDiscovery);
    bindFormSubmit("scheduleForm", submitSchedule);
    bindFormSubmit("contactForm", submitContact);
    bindFormSubmit("leadMagnetForm", submitLeadMagnet);
    [
      ["clientIntakeForm", "isi_clientIntake"],
      ["discoveryForm", "isi_discovery"],
      ["scheduleForm", "isi_schedule"],
      ["contactForm", "isi_contact"],
      ["leadMagnetForm", "isi_leadMagnet"]
    ].forEach(function (pair) {
      var form = document.getElementById(pair[0]);
      if (!form) return;
      form.setAttribute("data-restore-key", pair[1]);
      bindLiveForm(form);
    });
  });

  global.submitClientIntake = submitClientIntake;
  global.submitDiscovery = submitDiscovery;
  global.submitSchedule = submitSchedule;
  global.submitContact = submitContact;
  global.submitLeadMagnet = submitLeadMagnet;
})(typeof window !== "undefined" ? window : this);
