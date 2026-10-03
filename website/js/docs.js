/**
 * Fillable document drafts. Saves on this device. Print to PDF from the browser.
 */
(function () {
  "use strict";

  function key() {
    return "isi_fillable_" + (document.body.getAttribute("data-doc") || "doc");
  }

  function root() {
    return document.getElementById("docForm") || document.querySelector(".paper");
  }

  function serialize() {
    var data = {};
    var el = root();
    if (!el) return data;
    el.querySelectorAll("input, textarea, select").forEach(function (field) {
      var k = field.name || field.id;
      if (!k) return;
      if (field.type === "checkbox") data[k] = field.checked;
      else data[k] = field.value;
    });
    data._savedAt = new Date().toISOString();
    return data;
  }

  function hydrate(data) {
    if (!data) return;
    var el = root();
    if (!el) return;
    el.querySelectorAll("input, textarea, select").forEach(function (field) {
      var k = field.name || field.id;
      if (!k || data[k] == null) return;
      if (field.type === "checkbox") field.checked = !!data[k];
      else field.value = data[k];
    });
  }

  function save() {
    try {
      sessionStorage.setItem(key(), JSON.stringify(serialize()));
      var st = document.getElementById("saveStatus");
      if (st) st.textContent = "Draft saved on this computer.";
    } catch (err) {}
  }

  function restore() {
    try {
      var raw = sessionStorage.getItem(key());
      if (raw) hydrate(JSON.parse(raw));
    } catch (err) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    restore();
    var el = root();
    if (el) {
      el.addEventListener("input", save);
      el.addEventListener("change", save);
    }
    var printBtn = document.querySelector("[data-doc-print]");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        save();
        window.print();
      });
    }
  });
})();
