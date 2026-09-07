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

  function maybeNavigate(form) {
    if (!form) return;
    var next = form.getAttribute("data-next");
    if (!next) return;
    /* Brief pause so the success message is visible */
    setTimeout(function () {
      window.location.href = next;
    }, 700);
  }

  function resolveAssetPath(relativeFromWebsite) {
    /* forms/* pages sit one level deeper than site root pages */
    var path = window.location.pathname || "";
    if (path.indexOf("/forms/") !== -1) {
      return "../" + relativeFromWebsite;
    }
    return relativeFromWebsite;
  }

  function triggerGuideDownload() {
    var href = resolveAssetPath("assets/isi-growth-diagnostic-guide-placeholder.txt");
    var a = document.createElement("a");
    a.href = href;
    a.download = "isi-growth-diagnostic-guide-placeholder.txt";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Client Intake — companyName, contactName, email, phone, industry, challenge
   */
  function submitClientIntake() {
    var form = document.getElementById("clientIntakeForm");
    clearErrors(form);

    var required = ["companyName", "contactName", "email", "phone", "industry", "challenge"];
    var ok = requireFields(required);
    var email = val("email");
    if (email && !validateEmail(email)) {
      showError("email");
      ok = false;
    }
    if (!ok) return false;

    var data = {
      companyName: val("companyName"),
      contactName: val("contactName"),
      email: email,
      phone: val("phone"),
      industry: val("industry"),
      challenge: val("challenge"),
      submittedAt: new Date().toISOString()
    };

    console.log("Client Intake submitted:", data);
    store("isi_clientIntake", data);
    showSuccess(
      form,
      "Thank you. Your client intake has been saved locally. Continuing to the Discovery Questionnaire…"
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
  });

  global.submitClientIntake = submitClientIntake;
  global.submitDiscovery = submitDiscovery;
  global.submitSchedule = submitSchedule;
  global.submitContact = submitContact;
  global.submitLeadMagnet = submitLeadMagnet;
})(typeof window !== "undefined" ? window : this);
