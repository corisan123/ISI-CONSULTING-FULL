/**
 * ISI Consulting — isiNav.js (Block 3A Section 2 / 3B Section 2)
 * Injects diagnostic step nav + progress bar at top of page.
 */
(function (global) {
  "use strict";

  var ORDER = [
    "input",
    "scoring",
    "decision",
    "prioritization",
    "roadmap",
    "dashboard",
    "summary"
  ];

  var NAV_URLS = [
    "/src/components/isiNav.html",
    "../../src/components/isiNav.html",
    "../src/components/isiNav.html"
  ];

  function highlightActiveStep(activeStep) {
    var steps = document.querySelectorAll(".isi-nav-step");
    var activeIndex = ORDER.indexOf(activeStep);

    steps.forEach(function (step) {
      var stepKey = step.getAttribute("data-step");
      var stepIndex = ORDER.indexOf(stepKey);

      step.classList.remove("isi-nav-step-active", "isi-nav-step-complete", "isi-nav-step-future");

      if (stepKey === activeStep) {
        step.classList.add("isi-nav-step-active");
      } else if (activeIndex >= 0 && stepIndex >= 0 && stepIndex < activeIndex) {
        step.classList.add("isi-nav-step-complete");
      } else {
        step.classList.add("isi-nav-step-future");
      }
    });
  }

  function updateProgressBar(activeStep) {
    var index = ORDER.indexOf(activeStep);
    var percent = index < 0 ? 0 : Math.round(((index + 1) / ORDER.length) * 100);
    var fill = document.getElementById("isiProgressFill");
    if (fill) fill.style.width = percent + "%";
  }

  function injectIsiNav(activeStep) {
    var attempt = 0;

    function tryFetch() {
      if (attempt >= NAV_URLS.length) {
        console.warn("isiNav: could not load isiNav.html");
        return;
      }
      var url = NAV_URLS[attempt++];
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .then(function (html) {
          var navContainer = document.createElement("div");
          navContainer.className = "isi-nav-root";
          navContainer.innerHTML = html;
          var headerAnchor =
            document.querySelector(".isi-header-root") ||
            document.querySelector(".isi-header");
          if (headerAnchor) {
            headerAnchor.insertAdjacentElement("afterend", navContainer);
          } else {
            document.body.prepend(navContainer);
          }
          document.body.classList.add("isi-diagnostic");
          highlightActiveStep(activeStep);
          updateProgressBar(activeStep);
        })
        .catch(function () {
          tryFetch();
        });
    }

    tryFetch();
  }

  global.injectIsiNav = injectIsiNav;
  global.highlightActiveStep = highlightActiveStep;
  global.updateProgressBar = updateProgressBar;
})(typeof window !== "undefined" ? window : this);
