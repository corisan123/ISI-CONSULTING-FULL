/**
 * Public program desk — demonstration toys only.
 * Does not load /internal/ engines, formulas, or paths.
 */
(function () {
  "use strict";

  function protect(root) {
    if (!root) return;
    ["contextmenu", "dragstart", "copy", "cut", "selectstart"].forEach(function (evt) {
      root.addEventListener(evt, function (e) {
        e.preventDefault();
      });
    });
  }

  function money(n) {
    if (!isFinite(n)) return "—";
    var abs = Math.abs(n);
    var sign = n < 0 ? "-" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(0) + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }

  function npv(rate, flows) {
    var s = 0;
    for (var t = 0; t < flows.length; t++) s += flows[t] / Math.pow(1 + rate, t);
    return s;
  }

  function val(id) {
    return Number(document.getElementById(id).value);
  }

  function setOut(id, text, ok) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-pos", !!ok);
    el.classList.toggle("is-neg", ok === false);
  }

  function runWin() {
    var bids = val("peekBids");
    var awards = val("peekAwards");
    var w = bids ? awards / bids : NaN;
    setOut("peekWinOut", isFinite(w) ? (w * 100).toFixed(1) + "% win rate" : "—", w >= 0.25);
  }

  function runNpv() {
    var rate = val("peekRate") / 100;
    var inv = val("peekInv");
    var y1 = val("peekY1");
    var y2 = val("peekY2");
    var y3 = val("peekY3");
    var v = npv(rate, [-Math.abs(inv), y1, y2, y3]);
    setOut("peekNpvOut", "NPV " + money(v), v >= 0);
  }

  function runCpi() {
    var ev = val("peekEv");
    var ac = val("peekAc");
    var pv = val("peekPv");
    var cpi = ac ? ev / ac : NaN;
    var spi = pv ? ev / pv : NaN;
    var ok = cpi >= 1 && spi >= 1;
    setOut(
      "peekCpiOut",
      "CPI " + (isFinite(cpi) ? cpi.toFixed(2) : "—") + " · SPI " + (isFinite(spi) ? spi.toFixed(2) : "—"),
      ok
    );
  }

  function lockedNotice() {
    var note = document.getElementById("peekLocked");
    if (!note) return;
    note.hidden = false;
    note.focus();
  }

  function go(key) {
    if (key === "diag") {
      window.location.assign("/diagnostic/input.html");
      return;
    }
    if (key === "consult") {
      window.location.assign("https://calendly.com/contact-isi-consults");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var desk = document.getElementById("peekDesk");
    protect(desk);
    document.querySelectorAll(".desk-frame").forEach(protect);

    document.querySelectorAll("[data-open-peek]").forEach(function (el) {
      el.addEventListener("click", function () {
        window.location.assign(new URL("peek.html", window.location.href).href);
      });
    });

    var winForm = document.getElementById("peekWinForm");
    if (!winForm) return;
    winForm.addEventListener("submit", function (e) {
      e.preventDefault();
      runWin();
    });
    document.getElementById("peekNpvForm").addEventListener("submit", function (e) {
      e.preventDefault();
      runNpv();
    });
    document.getElementById("peekCpiForm").addEventListener("submit", function (e) {
      e.preventDefault();
      runCpi();
    });

    document.querySelectorAll("[data-locked]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        lockedNotice();
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lockedNotice();
        }
      });
    });

    document.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(btn.getAttribute("data-go"));
      });
    });

    runWin();
    runNpv();
    runCpi();
  });
})();
