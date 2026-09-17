/**
 * ISI Consulting — start/gate page
 * Consult vs Engage toggle, then scenario chips. Not a public engine.
 */
(function () {
  "use strict";

  var CAL = "https://calendly.com/contact-isi-consults";

  var SCENARIOS = [
    {
      id: "bd",
      chip: "Fractional BD",
      title: "Fractional BD leadership",
      href: "services/fractional-business-development.html",
      blurb: "The tollgate. A commercial operator in the seat.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A short consultation",
        left: [
          "Whether the gap is a missing BD seat or something downstream",
          "Pipeline, qualification, and who owns the weekly cadence",
          "Whether a full-time hire is even the right next spend"
        ],
        leftCta: "How fractional BD works",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "Daniel Reid takes the call — boutique capacity, not a rotating bench",
          "You leave with a named next step: BD seat, intake, or not yet",
          "No public calculator. Numbers stay in the engagement"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "Confidentiality, then the file",
        left: [
          "Confidentiality notice before detailed commercial facts",
          "Nine-section intake: company, leadership, BD, operations, margin",
          "Drafts stay on this device so Back does not wipe them"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "Stated symptoms are captured. Causes are not assumed",
          "Fractional BD is the default path unless intake proves otherwise",
          "Discovery follows intake when the file is ready"
        ],
        rightHref: "forms/client-intake.html"
      }
    },
    {
      id: "finance",
      chip: "Financial",
      title: "Financial solutions",
      href: "services/corporate-turnaround.html",
      blurb: "Profitability, leakage, turnaround diligence.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A diligence conversation",
        left: [
          "Where margin leaks between estimate, field, and invoice",
          "Whether cash tells a different story than the P&amp;L",
          "What a turnaround file would need before a growth story is sold"
        ],
        leftCta: "Financial solutions",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "Due diligence first whenever money is involved",
          "Live formulas stay in the engagement, not on this page",
          "Honest next step: intake, BD seat, or not a fit"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "Facts before a turnaround pitch",
        left: [
          "Confidentiality before you share statements or backlog",
          "Intake captures the symptom; diligence tests the cause",
          "No public model of your books"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "Margin, cash, and forecast misses belong in the file",
          "If the real gap is the BD seat, we say so",
          "Discovery follows when the numbers are in"
        ],
        rightHref: "forms/client-intake.html"
      }
    },
    {
      id: "pm",
      chip: "Project management",
      title: "Project management",
      href: "services/operational-alignment.html",
      blurb: "Live work: schedule, cost, claims, recovery.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A delivery conversation",
        left: [
          "Jobs running late, change orders, and who holds decision rights",
          "Whether the bid board and the field share one capacity number",
          "Recovery on live work vs. a prettier Gantt"
        ],
        leftCta: "PM consulting",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "Construction and AEC language: estimate, buyout, retainage",
          "Named next step on the actual constraint",
          "The same operator who runs BD can stay on the workstream"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "The job file, then the study",
        left: [
          "Confidentiality before project-level detail",
          "Intake flags schedule, claims, and bandwidth",
          "Study type reconfigures the work only after the file exists"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "Live-project facts, not a generic PM workshop",
          "If commercial leadership is the real gap, BD remains the gate",
          "Discovery after intake"
        ],
        rightHref: "forms/client-intake.html"
      }
    },
    {
      id: "ops",
      chip: "Manufacturing",
      title: "Manufacturing &amp; process",
      href: "services/operational-alignment.html",
      blurb: "Shop, yard, throughput, and waste.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A throughput conversation",
        left: [
          "Whether the shop or yard is the constraint — not “busy”",
          "Bid board vs. capacity, overtime, and cost-to-serve",
          "What a manufacturing study would actually change this quarter"
        ],
        leftCta: "Process work",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "Operator language from fabrication and automation seats",
          "No six-figure tool pitch before the bottleneck is named",
          "Honest next step, including “not yet”"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "Map the work, then the fix",
        left: [
          "Confidentiality before shop-floor or routing detail",
          "Intake captures throughput symptoms",
          "Interventions only if the constraint is operational"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "If the yard cannot keep up because BD is undisciplined, we say so",
          "Manufacturing practice follows the BD tollgate",
          "Discovery after intake"
        ],
        rightHref: "forms/client-intake.html"
      }
    },
    {
      id: "startup",
      chip: "Startup plan",
      title: "Startup &amp; business plan",
      href: "contact.html",
      blurb: "Customized plan for a new or spinning-out firm.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A formation conversation",
        left: [
          "Whether the venture has a commercial engine or only a trade",
          "What a customized plan must prove before capital or a lease",
          "Construction / AEC context — not a generic template pack"
        ],
        leftCta: "Start a conversation",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "Built from numbers, not a downloaded outline",
          "Fractional BD is often the first operating seat after formation",
          "Clear go / no-go on whether ISI is the right partner"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "Facts for a plan that can be run",
        left: [
          "Confidentiality before market, capital, or partner detail",
          "Intake instead of a blank business-plan questionnaire",
          "The plan is an engagement, not a public generator"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "Capture the venture as it actually is",
          "If the missing piece is a BD operator, that is the gate",
          "Discovery after intake"
        ],
        rightHref: "forms/client-intake.html"
      }
    },
    {
      id: "coach",
      chip: "Coaching",
      title: "Coaching &amp; training",
      href: "services/leadership-alignment.html",
      blurb: "PMs, estimators, and BD staff — weekly behavior.",
      consult: {
        leftKicker: "What the conversation covers",
        leftTitle: "A capability conversation",
        left: [
          "Which seat is not holding: estimator, BD, or PM",
          "Cadence and qualification vs. another classroom day",
          "Whether coaching sticks without a commercial operating system"
        ],
        leftCta: "Coaching &amp; training",
        rightKicker: "Request time",
        rightTitle: "Schedule a consultation",
        right: [
          "CEU-certified industry trainer — still boutique, still Daniel",
          "Training follows the constraint, not a catalog of courses",
          "Named next step after one conversation"
        ]
      },
      engage: {
        leftKicker: "Proper order",
        leftTitle: "Who needs the seat, not a seminar",
        left: [
          "Confidentiality before naming people and gaps",
          "Intake on bandwidth, leadership, and BD maturity",
          "Coaching is an intervention, not the default product"
        ],
        leftCta: "Forms in order",
        leftHref: "forms/index.html",
        rightKicker: "Open a file",
        rightTitle: "Start client intake",
        right: [
          "If the company needs a BD leader more than a workshop, we say so",
          "Same person who diagnoses stays on the workstream",
          "Discovery after intake"
        ],
        rightHref: "forms/client-intake.html"
      }
    }
  ];

  function findScenario(id) {
    var i;
    for (i = 0; i < SCENARIOS.length; i++) {
      if (SCENARIOS[i].id === id) return SCENARIOS[i];
    }
    return SCENARIOS[0];
  }

  function listHtml(items) {
    return "<ul>" + items.map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul>";
  }

  function initGate() {
    var root = document.querySelector("[data-isi-gate]");
    if (!root) return;

    var mode = "consult";
    var scenarioId = (window.location.hash || "#bd").replace("#", "") || "bd";
    if (!findScenario(scenarioId) || findScenario(scenarioId).id !== scenarioId) scenarioId = "bd";

    var modeBtns = root.querySelectorAll("[data-gate-mode] [data-mode]");
    var left = root.querySelector("[data-gate-left]");
    var right = root.querySelector("[data-gate-right]");
    var chips = root.querySelector("[data-gate-chips]");
    var tiles = root.querySelector("[data-gate-tiles]");

    chips.innerHTML = SCENARIOS.map(function (s) {
      return '<button type="button" class="gate-chip" data-scenario="' + s.id + '">' + s.chip + "</button>";
    }).join("");

    tiles.innerHTML = SCENARIOS.map(function (s) {
      return (
        '<a class="card" href="' + s.href + '"><h3>' + s.title + "</h3><p>" + s.blurb +
        '</p><span class="card-link">Open →</span></a>'
      );
    }).join("");

    function render() {
      var s = findScenario(scenarioId);
      var pack = s[mode];
      var leftHref = pack.leftHref || s.href;
      var rightHref = pack.rightHref || CAL;
      var rightTarget = rightHref.indexOf("http") === 0 ? ' target="_blank" rel="noopener noreferrer"' : "";
      var rightClass = "btn btn-primary";
      var leftClass = mode === "consult" ? "btn btn-outline" : "btn btn-outline";

      left.className = "gate-card gate-card-light";
      left.innerHTML =
        '<p class="gate-kicker">' + pack.leftKicker + "</p><h2>" + pack.leftTitle + "</h2>" +
        listHtml(pack.left) +
        '<a class="' + leftClass + '" href="' + leftHref + '">' + pack.leftCta + "</a>";

      right.className = "gate-card gate-card-dark";
      right.innerHTML =
        '<p class="gate-kicker">' + pack.rightKicker + "</p><h2>" + pack.rightTitle + "</h2>" +
        listHtml(pack.right) +
        '<a class="' + rightClass + '" href="' + rightHref + '"' + rightTarget + ">" +
        (mode === "consult" ? "Request a consultation" : "Start intake") + "</a>";

      modeBtns.forEach(function (btn) {
        var on = btn.getAttribute("data-mode") === mode;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      chips.querySelectorAll("[data-scenario]").forEach(function (btn) {
        btn.classList.toggle("is-on", btn.getAttribute("data-scenario") === scenarioId);
      });
    }

    modeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = btn.getAttribute("data-mode");
        render();
      });
    });
    chips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-scenario]");
      if (!btn) return;
      scenarioId = btn.getAttribute("data-scenario");
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + scenarioId);
      } else {
        window.location.hash = scenarioId;
      }
      render();
    });
    window.addEventListener("hashchange", function () {
      scenarioId = (window.location.hash || "#bd").replace("#", "") || "bd";
      render();
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", initGate);
})();
