/**
 * ISI Consulting — isiHeader.js (Block 3B Section 2)
 * Injects branded diagnostic header at top of page (before nav).
 */
(function (global) {
  "use strict";

  var HEADER_URLS = [
    "/src/components/isiHeader.html"
  ];

  function injectIsiHeader() {
    var attempt = 0;

    function tryFetch() {
      if (attempt >= HEADER_URLS.length) {
        console.warn("isiHeader: could not load isiHeader.html");
        return;
      }
      var url = HEADER_URLS[attempt++];
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .then(function (html) {
          var root = document.createElement("div");
          root.className = "isi-header-root";
          root.innerHTML = html;
          document.body.prepend(root);
        })
        .catch(function () {
          tryFetch();
        });
    }

    tryFetch();
  }

  global.injectIsiHeader = injectIsiHeader;
})(typeof window !== "undefined" ? window : this);
