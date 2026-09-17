/**
 * ISI Consulting — FAQ accordion
 */
(function () {
  "use strict";

  var ITEMS = [
    {
      q: "Where does the work actually start?",
      a: "Open Start: toggle Consultation or Intake, then pick the scenario. Fractional business development leadership is the tollgate. Strategy, financial diligence, project management, coaching, and manufacturing practice open only after that seat is honest about what it can and cannot close. <a href=\"start.html\">Choose a path</a>."
    },
    {
      q: "Will you actually bring strategy, or just execute what we already think is wrong?",
      a: "We are hired to find the cause. Declining revenue, compressed margin, and missed forecasts are symptoms. Intake captures what you believe. Diligence and structured diagnosis keep or kill competing causes before workstreams are sold. We do not take the stated problem as the brief."
    },
    {
      q: "Will you understand construction, AEC, and how the work actually runs?",
      a: "That is the locked niche. ISI works predominantly in construction and several sectors of the industry, including the AEC community — GCs, specialty, civil, mechanical, electrical, fabrication, and related manufacturing. The language is jobs, estimates, buyout, retainage, and throughput — not a generic playbook."
    },
    {
      q: "We've been burned by consultants (and AI platforms) that claimed the work was done. How is this different?",
      a: "The public site is the offer. The working programs — due diligence, decision trees, sensitivity, Monte Carlo, regression, risk — run in the engagement, with live formulas and a packet you can follow. If a number cannot be shown, it is not a finding."
    },
    {
      q: "Who actually does the work, and how many seats do you run at once?",
      a: "Daniel Reid leads the work — MBA, PMP, LEED AP, founder. This is boutique capacity, not a bench of juniors rotating through your file. Fractional BD, coaching, and project-management support are scoped so the same person who owned commercial numbers in construction, automation, and manufacturing stays on the workstream."
    },
    {
      q: "What happens to the information we put in intake and discovery?",
      a: "Answers are saved on your device as you type so Back does not wipe them. We treat everything shared as confidential from first contact. A formal NDA and Statement of Work follow when an engagement starts. We do not publish your numbers as a public calculator."
    },
    {
      q: "Our estimator, BD, or PM seat isn't holding. Can you step in?",
      a: "Yes — that is the fractional BD path, and the reason the site exists. We install cadence, qualification, and margin discipline inside the company rather than writing a report and leaving. Manufacturing best-practice and project-management studies follow the same rule: exploit the constraint before you hire or buy."
    },
    {
      q: "Are we a good fit to work together?",
      a: "Fit is typically construction or AEC, often $5M–$50M, with a leadership team willing to change process if the diagnostic recommends it. Strategy, financial turnaround diligence, startup business plans, project management, coaching, and manufacturing practice are in scope. If you need a firm that will rubber-stamp the story you already believe, we are not the right partner."
    }
  ];

  function render(root) {
    if (!root) return;
    root.innerHTML = "<h2>Still have some questions?</h2>";
    ITEMS.forEach(function (item, i) {
      var wrap = document.createElement("div");
      wrap.className = "faq-item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = '<span class="plus">+</span><span>' + item.q + "</span>";
      var panel = document.createElement("div");
      panel.className = "faq-a";
      panel.innerHTML = '<div class="faq-a-inner"><p>' + item.a + "</p></div>";
      btn.addEventListener("click", function () {
        var open = wrap.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.querySelector(".plus").textContent = open ? "−" : "+";
      });
      wrap.appendChild(btn);
      wrap.appendChild(panel);
      root.appendChild(wrap);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-isi-faq]").forEach(render);
  });
})();
