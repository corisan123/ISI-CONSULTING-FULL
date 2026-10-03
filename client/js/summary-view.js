/**
 * Client diagnostic summary — render published snapshot only (no engine math).
 */
(function (global) {
  "use strict";

  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(global.location.search || "");
    return m ? decodeURIComponent(m[1]) : "";
  }

  function readSnapshot() {
    try {
      var raw = sessionStorage.getItem("isi_client_summary");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function el(id) {
    return document.getElementById(id);
  }

  function verdictClass(v) {
    var s = String(v || "").toUpperCase();
    if (s.indexOf("GO") === 0 || s === "PROCEED") return "go";
    if (s.indexOf("STOP") === 0) return "stop";
    if (s.indexOf("CAUTION") === 0 || s.indexOf("HOLD") === 0) return "caution";
    return "";
  }

  function renderMetrics(container, metrics) {
    container.innerHTML = "";
    (metrics || []).forEach(function (m) {
      var d = document.createElement("div");
      d.className = "kpi";
      d.innerHTML = "<div class='val'>" + m.value + "</div><div class='lbl'>" + m.label + "</div>";
      container.appendChild(d);
    });
  }

  function renderBands(container, bands) {
    container.innerHTML = "";
    if (!bands) return;
    [["P10", bands.p10], ["P50", bands.p50], ["P90", bands.p90], ["Mean", bands.mean], ["P(NPV>0)", bands.pPositive]].forEach(function (p) {
      if (p[1] == null || p[1] === "—") return;
      var d = document.createElement("div");
      d.className = "kpi";
      d.innerHTML = "<div class='val'>" + p[1] + "</div><div class='lbl'>" + p[0] + "</div>";
      container.appendChild(d);
    });
  }

  function renderTornado(container, section) {
    container.innerHTML = "";
    if (!section || !section.drivers || !section.drivers.length) {
      container.innerHTML = "<p class='eng-desc'>Top driver: " + (section.topDriver || "—") + "</p>";
      return;
    }
    var maxSwing = 1;
    section.drivers.forEach(function (d) {
      var n = parseFloat(String(d.swing).replace(/[^0-9.]/g, "")) || 0;
      if (n > maxSwing) maxSwing = n;
    });
    section.drivers.forEach(function (d) {
      var n = parseFloat(String(d.swing).replace(/[^0-9.]/g, "")) || 0;
      var w = Math.max(8, Math.round((n / maxSwing) * 100));
      var row = document.createElement("div");
      row.className = "eng-tornado-row";
      row.innerHTML =
        "<div class='eng-tornado-label'>" + d.label + "</div>" +
        "<div class='eng-tornado-track'><div class='eng-tornado-fill' style='width:" + w + "%'></div></div>" +
        "<div class='eng-tornado-meta'>" + d.lowNpv + " → " + d.highNpv + "</div>";
      container.appendChild(row);
    });
  }

  function renderPrograms(container, programs) {
    container.innerHTML = "";
    (programs || []).forEach(function (p, i) {
      var d = document.createElement("div");
      d.className = "tree-node";
      d.innerHTML =
        "<div class='kind'>Program " + (i + 1) + "</div><h3>" + p.name + "</h3><p>" + (p.headline || "") + "</p>";
      container.appendChild(d);
    });
  }

  function paint() {
    var snap = readSnapshot();
    var group = qs("group") || (snap && snap.group) || "";
    var empty = el("summaryEmpty");
    var board = el("summaryBoard");
    if (!snap) {
      if (empty) empty.hidden = false;
      if (board) board.hidden = true;
      return;
    }
    if (group && snap.group !== group) {
      if (empty) {
        empty.hidden = false;
        empty.querySelector("p").textContent =
          "No summary for group \"" + group + "\" in this browser. Publish from the matching internal engine first.";
      }
      if (board) board.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (board) board.hidden = false;

    document.title = snap.title + " | ISI Consulting";
    if (el("sumTitle")) el("sumTitle").textContent = snap.title;
    if (el("sumMeta")) {
      el("sumMeta").textContent =
        snap.company +
        " · " +
        snap.group +
        " family · published " +
        new Date(snap.publishedAt).toLocaleString() +
        " · bus v" +
        (snap.graphVersion || 0);
    }
    if (el("sumNarrative")) el("sumNarrative").textContent = snap.narrative || "";
    if (el("sumVerdict")) {
      el("sumVerdict").textContent = snap.verdict || "—";
      var box = el("verdictBox");
      if (box) {
        box.className = "verdict " + verdictClass(snap.verdict);
      }
    }
    if (el("sumHeadline")) el("sumHeadline").textContent = snap.headline || "";
    if (el("sumDisclaimer")) el("sumDisclaimer").textContent = snap.disclaimer || "";

    var sectionsRoot = el("sumSections");
    if (!sectionsRoot) return;
    sectionsRoot.innerHTML = "";
    (snap.sections || []).forEach(function (sec) {
      var card = document.createElement("section");
      card.className = "eng-card";
      card.innerHTML = "<h2>" + sec.title + "</h2>";
      if (sec.metrics) {
        var row = document.createElement("div");
        row.className = "kpi-row";
        renderMetrics(row, sec.metrics);
        card.appendChild(row);
      }
      if (sec.bands) {
        var prob = document.createElement("div");
        prob.className = "kpi-row";
        renderBands(prob, sec.bands);
        card.appendChild(prob);
        if (sec.note) {
          var note = document.createElement("p");
          note.className = "eng-desc";
          note.textContent = sec.note;
          card.appendChild(note);
        }
      }
      if (sec.id === "sensitivity") {
        var tor = document.createElement("div");
        tor.className = "eng-tornado";
        renderTornado(tor, sec);
        card.appendChild(tor);
      }
      if (sec.text) {
        var p = document.createElement("p");
        p.className = "eng-desc";
        p.textContent = sec.text;
        card.appendChild(p);
      }
      sectionsRoot.appendChild(card);
    });

    renderPrograms(el("sumPrograms"), snap.programs);
  }

  global.ISI = global.ISI || {};
  global.ISI.clientSummaryView = { paint: paint, readSnapshot: readSnapshot };
})(typeof window !== "undefined" ? window : this);
