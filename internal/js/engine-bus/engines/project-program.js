/**

 * ISI Engine 5 — Project / program & coaching (proprietary).

 * EVM capital kit + risk for project; coaching scorecard without NPV chain.

 */

(function (global) {

  "use strict";



  function n(v, d) {

    var x = Number(v);

    return isFinite(x) ? x : d;

  }



  function kitFields(kitId) {

    var kit = global.ISI.kits && global.ISI.kits[kitId];

    var fields = {};

    if (!kit || !kit.fields) return fields;

    kit.fields.forEach(function (f) {

      fields[f.id] = f.value;

    });

    return fields;

  }



  function demoIntake() {

    return {

      companyName: "Client company (placeholder)",

      leadershipConfidence: "5",

      bdProcess: "ad hoc",

      deptConflict: "ops vs BD on what we should bid",

      leadershipGaps: "no bench behind the owner",

      handoffs: "breaks between estimating and PM",

      statedSymptoms: "leadership_drag,forecast_miss"

    };

  }



  function loadIntake() {

    try {

      var d = JSON.parse(sessionStorage.getItem("isi_clientIntake") || "{}");

      return d.companyName ? d : demoIntake();

    } catch (e) {

      return demoIntake();

    }

  }



  var COACHING_INTERVENTIONS = [

    { id: "cadence", name: "Leadership cadence reset", test: function (d) { return Number(d.leadershipConfidence) <= 6; } },

    { id: "align", name: "Alignment between BD, ops, and finance", test: function (d) { return /conflict|break|poor/i.test(d.deptConflict || d.handoffs || ""); } },

    { id: "training", name: "Training systems for key seats", test: function (d) { return /gap|bench|under/i.test(d.leadershipGaps || ""); } }

  ];



  function coachingScorecard(intake) {

    var branches = [

      { id: "cadence", ok: Number(intake.leadershipConfidence) >= 7, label: "Weekly cadence & decision rights" },

      { id: "qual", ok: !/ad hoc|no/i.test(intake.bdProcess || ""), label: "Qualification gate in use" },

      { id: "margin", ok: !/low|no visibility/i.test(intake.jobProfitVisibility || "low"), label: "Margin in the leadership loop" },

      { id: "skill", ok: !/no bench|vacant|gap/i.test(intake.leadershipGaps || ""), label: "Named owners in critical seats" }

    ];

    var score = branches.filter(function (b) { return b.ok; }).length / branches.length;

    return { score: score, branches: branches };

  }



  function defaultInputs() {

    return {

      company: "Client company (placeholder)",

      studyPath: "project",

      openHighRisks: 6,

      riskEmv: 185000

    };

  }



  function buildProjectNodes() {

    return {

      "file-intake": {

        label: "Program file intake",

        dependsOn: [],

        storeAs: "engine5-intake",

        run: function (ctx) {

          var merged = Object.assign(defaultInputs(), ctx.inputs || {});

          merged._intake = loadIntake();

          merged.company = merged.company || merged._intake.companyName;

          if (global.ISI.store) {

            global.ISI.store.setEngagement({

              company: merged.company,

              constraint: merged.studyPath === "coaching" ? "coaching" : "project"

            });

          }

          return {

            headline: merged.company + " — " + (merged.studyPath === "coaching" ? "coaching" : "project") + " path",

            inputs: merged,

            intake: merged._intake

          };

        }

      },

      "evm-kit": {

        label: "Capital project / EVM kit",

        dependsOn: ["file-intake"],

        storeAs: "capital",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath === "coaching") {

            return { headline: "Coaching path — EVM chain skipped", skipped: true };

          }

          var fields = kitFields("capital");

          Object.keys(inp).forEach(function (k) {

            if (fields[k] != null || isFinite(Number(inp[k]))) fields[k] = inp[k];

          });

          var res = global.ISI.kits.capital.run(fields);

          return { headline: res.headline, metrics: res.metrics, branches: res.branches, skipped: false };

        }

      },

      "project-risk": {

        label: "Risk register / EMV",

        dependsOn: ["evm-kit", "file-intake"],

        storeAs: "risk",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath === "coaching") {

            return { headline: "Coaching path — project EMV skipped", skipped: true };

          }

          var evm = ctx.get("evm-kit");

          var openHigh = n(inp.openHighRisks, 6);

          var emv = n(inp.riskEmv, 0);

          var spi = evm.metrics && evm.metrics.SPI;

          var cpi = evm.metrics && evm.metrics.CPI;

          return {

            headline: "Open high risks: " + openHigh + " · EMV $" + Math.round(emv).toLocaleString(),

            metrics: { emv: emv, openHigh: openHigh, spi: spi, cpi: cpi },

            skipped: false

          };

        }

      },

      "project-matrix": {

        label: "Recovery decision matrix",

        dependsOn: ["project-risk", "evm-kit"],

        storeAs: "matrix",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath === "coaching") {

            return { headline: "Coaching path — recovery matrix skipped", skipped: true };

          }

          var evm = ctx.get("evm-kit");

          var m = evm.metrics || {};

          var alts = [

            { id: "recover", label: "Recovery plan (TCPI focus)", ev: n(m.VAC, 0), score: n(m.TCPI, 1) >= 1 ? 0.8 : 0.4 },

            { id: "rebaseline", label: "Re-baseline scope & BAC", ev: n(m.VAC, 0) * 0.5, score: 0.55 },

            { id: "stop", label: "Stop / descope", ev: 0, score: m.SPI < 0.85 && m.CPI < 0.85 ? 0.7 : 0.3 }

          ];

          var matrix = global.ISI.trees.decisionMatrix(alts, [

            { id: "ev", label: "Value preserved", weight: 0.4, score: function (a) { return a.ev; }, normalize: function (v) { var m = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.ev); })) || 1; return (v / m + 1) / 2; } },

            { id: "fit", label: "Schedule/cost fit", weight: 0.6, score: function (a) { return a.score; }, normalize: function (v) { return v; } }

          ]);

          return { headline: "Matrix: " + matrix.best.label, matrix: matrix, best: matrix.best.label };

        }

      },

      "coaching-diagnosis": {

        label: "Coaching diagnosis (root cause)",

        dependsOn: ["file-intake"],

        storeAs: "rootcause",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath !== "coaching") {

            return { headline: "Project path — coaching diagnosis skipped", skipped: true };

          }

          var res = global.ISI.rootcause.run({ intake: ctx.get("file-intake").intake });

          return { headline: res.headline, keep: res.keep.length, payload: res, skipped: false };

        }

      },

      "coaching-scorecard": {

        label: "Coaching scorecard (no NPV)",

        dependsOn: ["coaching-diagnosis", "file-intake"],

        storeAs: "engine5-coaching-score",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath !== "coaching") {

            return { headline: "Project path — scorecard skipped", skipped: true };

          }

          var card = coachingScorecard(ctx.get("file-intake").intake);

          return {

            headline: "Cadence scorecard " + (card.score * 100).toFixed(0) + "%",

            score: card.score,

            branches: card.branches

          };

        }

      },

      "coaching-interventions": {

        label: "Coaching interventions",

        dependsOn: ["coaching-scorecard", "file-intake"],

        storeAs: "interventions",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath !== "coaching") {

            return { headline: "Project path — interventions skipped", skipped: true };

          }

          var intake = ctx.get("file-intake").intake;

          var fired = COACHING_INTERVENTIONS.filter(function (m) { return m.test(intake); });

          return {

            headline: fired.length + " coaching modules active",

            active: fired.map(function (m) { return m.id; }),

            names: fired.map(function (m) { return m.name; })

          };

        }

      },

      summary: {

        label: "Program engine summary KPIs",

        dependsOn: ["project-matrix", "project-risk", "evm-kit", "coaching-interventions", "coaching-scorecard"],

        storeAs: "engine5-summary",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          if (inp.studyPath === "coaching") {

            var card = ctx.get("coaching-scorecard");

            var intr = ctx.get("coaching-interventions");

            return {

              headline: card.headline,

              kpis: {

                path: "coaching",

                scorecard: card.score,

                modules: (intr.active || []).length,

                npvChain: "skipped"

              }

            };

          }

          var evm = ctx.get("evm-kit");

          var risk = ctx.get("project-risk");

          var mx = ctx.get("project-matrix");

          return {

            headline: mx.headline || evm.headline,

            kpis: {

              path: "project",

              spi: evm.metrics && evm.metrics.SPI,

              cpi: evm.metrics && evm.metrics.CPI,

              eac: evm.metrics && evm.metrics.EAC,

              riskEmv: risk.metrics && risk.metrics.emv,

              matrixBest: mx.best

            }

          };

        }

      }

    };

  }



  function register() {

    var nodes = buildProjectNodes();

    var engine = global.ISI.engineBus.createEngine("project-program", nodes);

    global.ISI.engineBus.project = engine;

    return engine;

  }



  global.ISI = global.ISI || {};

  global.ISI.engineBus = global.ISI.engineBus || {};

  global.ISI.engineBus.registerProject = register;

})(typeof window !== "undefined" ? window : this);

