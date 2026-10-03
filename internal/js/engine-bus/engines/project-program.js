/**
 * ISI Engine 5 — Project / program & coaching (proprietary).
 * Project: EVM capital kit, diligence, root cause, risk EMV, tornado, MC, recovery matrix.
 * Coaching: readiness gate, root cause, scorecard, interventions, priority matrix (no NPV chain).
 */
(function (global) {
  "use strict";

  var UNSET_COMPANY = "Engagement file (unset)";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  function parseIndex(str, fallback) {
    if (!str) return fallback;
    var m = String(str).match(/(?:SPI|CPI)\s*0?\.(\d+)/i);
    if (m) return n("0." + m[1], fallback);
    m = String(str).match(/0?\.(\d{2,3})/);
    if (m) return n("0." + m[1], fallback);
    return fallback;
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

  function loadIntake(ctx) {
    var patch = ctx.inputs || {};
    var d = {};
    try {
      d = JSON.parse(sessionStorage.getItem("isi_clientIntake") || "{}");
    } catch (e) {
      d = {};
    }
    if (!d.companyName) {
      d.companyName = UNSET_COMPANY;
    }
    return Object.assign({ company: d.companyName }, d, patch);
  }

  function resolveStudyPath(intake, patch) {
    if (patch && patch.studyPath) return patch.studyPath;
    if (intake.group === "coaching") return "coaching";
    if (intake.group === "project") return "project";
    try {
      var fam = sessionStorage.getItem("isi_active_engagement_group");
      if (fam === "coaching") return "coaching";
      if (fam === "project") return "project";
    } catch (e) { /* ignore */ }
    return "project";
  }

  function defaultInputs(studyPath) {
    return {
      company: UNSET_COMPANY,
      studyPath: studyPath || "project",
      bac: 4200000,
      ac: 2150000,
      ev: 1680000,
      pv: 2100000,
      openHighRisks: 6,
      riskEmv: 185000,
      changeOrders: 310000,
      float: -18,
      diligenceSit: "capital",
      mcIterations: 4000,
      mcSeed: 20261005
    };
  }

  function inputsFromIntake(intake, base) {
    var merged = Object.assign({}, base);
    merged.company = intake.companyName || intake.company || UNSET_COMPANY;
    merged.studyPath = resolveStudyPath(intake, null);
    merged.diligenceSit = "capital";

    var slip = intake.scheduleSlip || intake["Schedule slip"] || "";
    var costFade = intake.costFade || intake["Cost or margin fade"] || "";
    var spiGuess = parseIndex(slip, NaN);
    var cpiGuess = parseIndex(costFade, NaN);
    if (isFinite(spiGuess) && spiGuess > 0 && spiGuess < 1.5) {
      merged.ev = Math.round(merged.pv * spiGuess);
    } else if (/week|late|slip/i.test(slip)) {
      merged.float = Math.min(merged.float, -12);
      merged.ev = Math.round(merged.ev * 0.92);
    }
    if (isFinite(cpiGuess) && cpiGuess > 0 && cpiGuess < 1.5) {
      merged.ac = Math.round(merged.ev / cpiGuess);
    } else if (/fade|\$/i.test(costFade)) {
      merged.ac = Math.round(merged.ac * 1.08);
    }
    var evmTrust = intake.evmTrusted || intake["EVM trusted"] || "";
    if (/two stories|no/i.test(evmTrust)) {
      merged.openHighRisks = Math.max(merged.openHighRisks, 8);
      merged.riskEmv = Math.round(merged.riskEmv * 1.15);
    }
    if (/stall|owner|gc|sign-off|claim/i.test(intake.changeControl || intake["Change control pain"] || "")) {
      merged.openHighRisks = Math.max(merged.openHighRisks, 7);
    }
    if (!intake.recoveryAuthority && !intake["Recovery authority"]) {
      merged.riskEmv = Math.round(merged.riskEmv * 1.1);
    }
    merged._intake = intake;
    return merged;
  }

  function coachingFromIntake(intake, base) {
    var merged = Object.assign({}, base);
    merged.company = intake.companyName || intake.company || UNSET_COMPANY;
    merged.studyPath = "coaching";
    var cadence = intake.weeklyCadence || intake["Weekly cadence"] || "";
    if (/yes/i.test(cadence)) merged.leadershipConfidence = "8";
    else if (/status/i.test(cadence)) merged.leadershipConfidence = "5";
    else merged.leadershipConfidence = "3";
    var qual = intake.qualification30 || intake["Qualification used in 30 days"] || "";
    merged.bdProcess = /yes/i.test(qual) ? "used on live bid" : /talked/i.test(qual) ? "ad hoc" : "no";
    var seat = intake.seatOccupied || intake["Seat occupied"] || "";
    merged.leadershipGaps = /vacant|no/i.test(seat) ? "no bench — vacant seat" : /partly|founder/i.test(seat) ? "founder covering" : "named owners";
    merged.deptConflict = intake.behaviorChange || intake["Behavior that must change"] || "";
    merged.handoffs = intake.coachingProof || intake["90-day coaching proof"] || "";
    merged.jobProfitVisibility = /margin|discount|pipeline/i.test(merged.deptConflict) ? "low" : "weekly";
    merged.statedSymptoms = "leadership_drag,handoff,qualification";
    merged._intake = intake;
    return merged;
  }

  function projectChangeIntegrity(intake) {
    var score = 0;
    var notes = [];
    if (intake.recoveryAuthority || intake["Recovery authority"]) score += 0.25;
    else notes.push("Recovery authority not named on file");
    if (intake.projectProof || intake["90-day project proof"]) score += 0.2;
    else notes.push("90-day EVM proof not defined");
    var evm = intake.evmTrusted || intake["EVM trusted"] || "";
    if (/yes/i.test(evm)) score += 0.25;
    else if (/two/i.test(evm)) score += 0.1;
    else notes.push("Earned value not trusted — one story required");
    if (!/stall|owner|gc|claim|sign-off/i.test(intake.changeControl || intake["Change control pain"] || "")) {
      score += 0.15;
    } else {
      notes.push("Change control / claims queue is binding recovery");
    }
    if (intake.namedJob || intake["Named job or portfolio"]) score += 0.15;
    else notes.push("Named job or portfolio not on file");
    return { score: Math.min(1, score), notes: notes };
  }

  function coachingReadiness(intake) {
    var score = 0;
    var notes = [];
    var seat = intake.seatOccupied || intake["Seat occupied"] || "";
    if (/yes/i.test(seat)) score += 0.3;
    else if (/partly/i.test(seat)) score += 0.15;
    else notes.push("Seat vacant — route to Fractional BD, not coaching theater");
    var cadence = intake.weeklyCadence || intake["Weekly cadence"] || "";
    if (/yes/i.test(cadence)) score += 0.25;
    else notes.push("No decision cadence with owners");
    var qual = intake.qualification30 || intake["Qualification used in 30 days"] || "";
    if (/yes/i.test(qual)) score += 0.2;
    else notes.push("Qualification not exercised on a live bid");
    if (intake.coachingProof || intake["90-day coaching proof"]) score += 0.15;
    else notes.push("90-day behavioral proof not defined");
    if (intake.rolesCoached || intake["Roles being coached"]) score += 0.1;
    return { score: Math.min(1, score), notes: notes };
  }

  var COACHING_INTERVENTIONS = [
    { id: "cadence", name: "Leadership cadence reset", test: function (d) { return Number(d.leadershipConfidence) <= 6; } },
    { id: "align", name: "Alignment between BD, ops, and finance", test: function (d) { return /conflict|break|poor|handoff|follow/i.test(d.deptConflict || d.handoffs || ""); } },
    { id: "training", name: "Training systems for key seats", test: function (d) { return /gap|bench|under|vacant|founder/i.test(d.leadershipGaps || ""); } },
    { id: "qual", name: "Qualification gate on live bids", test: function (d) { return /ad hoc|no|talked/i.test(d.bdProcess || ""); } }
  ];

  function coachingScorecard(intake) {
    var branches = [
      { id: "cadence", ok: Number(intake.leadershipConfidence) >= 7, label: "Weekly cadence & decision rights" },
      { id: "qual", ok: !/ad hoc|no|talked/i.test(intake.bdProcess || ""), label: "Qualification gate in use" },
      { id: "margin", ok: !/low|no visibility/i.test(intake.jobProfitVisibility || "low"), label: "Margin in the leadership loop" },
      { id: "skill", ok: !/no bench|vacant|gap|founder covering/i.test(intake.leadershipGaps || ""), label: "Named owners in critical seats" }
    ];
    var score = branches.filter(function (b) { return b.ok; }).length / branches.length;
    return { score: score, branches: branches };
  }

  function evmFromInputs(inp) {
    var fields = kitFields("capital");
    ["bac", "ac", "ev", "pv", "changeOrders", "float", "openRisks"].forEach(function (k) {
      if (inp[k] != null && isFinite(Number(inp[k]))) fields[k] = inp[k];
    });
    return global.ISI.kits.capital.run(fields);
  }

  function buildProjectNodes() {
    return {
      "file-intake": {
        label: "ISI Program File Intake module",
        dependsOn: [],
        storeAs: "engine5-intake",
        run: function (ctx) {
          var intake = loadIntake(ctx);
          var path = resolveStudyPath(intake, ctx.inputs || {});
          var base = defaultInputs(path);
          var merged =
            path === "coaching"
              ? coachingFromIntake(intake, base)
              : inputsFromIntake(intake, base);
          Object.assign(merged, ctx.inputs || {});
          merged.studyPath = merged.studyPath || path;
          merged.company = merged.company || intake.companyName || UNSET_COMPANY;
          if (global.ISI.store) {
            global.ISI.store.setEngagement({
              company: merged.company,
              industry: intake.trade,
              constraint: merged.studyPath === "coaching" ? "coaching" : "project",
              family: merged.studyPath === "coaching" ? "coaching" : "project"
            });
          }
          var intakeOut = Object.assign({}, intake);
          if (merged.studyPath === "coaching") {
            Object.assign(intakeOut, {
              leadershipConfidence: merged.leadershipConfidence,
              bdProcess: merged.bdProcess,
              leadershipGaps: merged.leadershipGaps,
              deptConflict: merged.deptConflict,
              handoffs: merged.handoffs,
              jobProfitVisibility: merged.jobProfitVisibility,
              statedSymptoms: merged.statedSymptoms
            });
          }
          return {
            headline:
              merged.company +
              " — ISI " +
              (merged.studyPath === "coaching" ? "coaching" : "project / program") +
              " bus loaded",
            inputs: merged,
            intake: intakeOut
          };
        }
      },
      "project-change-integrity": {
        label: "ISI Change Control & Recovery Integrity module",
        dependsOn: ["file-intake"],
        storeAs: "engine5-change-integrity",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — change / EVM integrity skipped", skipped: true };
          }
          var pip = projectChangeIntegrity(ctx.get("file-intake").intake);
          return {
            headline: "Change & recovery integrity " + (pip.score * 100).toFixed(0) + "%",
            score: pip.score,
            notes: pip.notes,
            skipped: false
          };
        }
      },
      "project-rootcause": {
        label: "ISI Program root-cause module",
        dependsOn: ["file-intake"],
        storeAs: "rootcause",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — program root-cause skipped (coaching module runs)", skipped: true };
          }
          var res = global.ISI.rootcause.run({ intake: ctx.get("file-intake").intake });
          return {
            headline: res.headline,
            keep: res.keep.length,
            killed: res.killed.length,
            payload: res,
            skipped: false
          };
        }
      },
      "project-diligence": {
        label: "ISI Capital Project Diligence Gate",
        dependsOn: ["file-intake"],
        storeAs: "diligence",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — capital diligence skipped", skipped: true };
          }
          var sit = inp.diligenceSit || "capital";
          var fields = {};
          if (global.ISI.diligence && global.ISI.diligence.FIELDS) {
            global.ISI.diligence.FIELDS.forEach(function (f) {
              fields[f.id] = f.value;
            });
          }
          var res = global.ISI.diligence.run(sit, fields, global.ISI.math);
          return {
            headline: res.tree.verdict + " — " + res.headline,
            verdict: res.tree.verdict,
            payload: res,
            skipped: false
          };
        }
      },
      "evm-kit": {
        label: "ISI EVM & Capital Project kit",
        dependsOn: ["file-intake"],
        storeAs: "engine5-evm-kit",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — EVM kit skipped", skipped: true };
          }
          var res = evmFromInputs(inp);
          return {
            headline: res.headline,
            metrics: res.metrics,
            branches: res.branches,
            fields: kitFields("capital"),
            skipped: false
          };
        }
      },
      "project-risk": {
        label: "ISI Risk Register / EMV module",
        dependsOn: ["evm-kit", "file-intake"],
        storeAs: "engine5-risk",
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
      "project-sensitivity": {
        label: "ISI One-Way Tornado (EAC $)",
        dependsOn: ["evm-kit", "file-intake"],
        storeAs: "sensitivity-1way",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — EAC tornado skipped", skipped: true };
          }
          var baseInp = Object.assign({}, inp);
          var baseEac = evmFromInputs(baseInp).metrics.EAC;
          var rows = global.ISI.trees.oneWay(
            { ev: baseInp.ev, ac: baseInp.ac },
            [
              { key: "ev", label: "Earned value EV", pct: 0.08 },
              { key: "ac", label: "Actual cost AC", pct: 0.1 }
            ],
            function (b) {
              var trial = Object.assign({}, baseInp, {
                ev: n(b.ev, baseInp.ev),
                ac: n(b.ac, baseInp.ac)
              });
              return evmFromInputs(trial).metrics.EAC;
            }
          );
          return {
            headline: "ISI One-Way Tornado · largest swing: " + rows[0].label,
            baseEac: baseEac,
            topSwing: rows[0].label,
            rows: rows,
            skipped: false
          };
        }
      },
      "project-monte-carlo": {
        label: "ISI Seeded Monte Carlo (EAC $)",
        dependsOn: ["evm-kit", "file-intake"],
        storeAs: "montecarlo",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — EAC Monte Carlo skipped", skipped: true };
          }
          var bac = n(inp.bac, 4200000);
          var mc = global.ISI.math.monteCarlo({
            iterations: n(inp.mcIterations, 4000),
            seed: n(inp.mcSeed, 20261005),
            inputs: [
              {
                name: "ev",
                type: "triangular",
                min: n(inp.ev, 1680000) * 0.88,
                mode: n(inp.ev, 1680000),
                max: n(inp.ev, 1680000) * 1.08
              },
              {
                name: "ac",
                type: "normal",
                mean: n(inp.ac, 2150000),
                stdev: n(inp.ac, 2150000) * 0.06
              }
            ],
            model: function (d) {
              var trial = Object.assign({}, inp, { ev: d.ev, ac: d.ac });
              return evmFromInputs(trial).metrics.EAC;
            }
          });
          var pPositive = 0;
          if (mc.values && mc.values.length) {
            var under = 0;
            for (var i = 0; i < mc.values.length; i++) {
              if (mc.values[i] <= bac) under++;
            }
            pPositive = under / mc.values.length;
          } else if (isFinite(mc.p50)) {
            pPositive = mc.p50 <= bac ? 0.55 : 0.35;
          }
          return {
            headline:
              "ISI Seeded Monte Carlo · P50 EAC $" + Math.round(mc.p50).toLocaleString(),
            p10: mc.p10,
            p50: mc.p50,
            p90: mc.p90,
            mean: mc.mean,
            pPositive: pPositive,
            seed: n(inp.mcSeed, 20261005),
            skipped: false
          };
        }
      },
      "project-matrix": {
        label: "ISI Project Recovery Decision Matrix",
        dependsOn: [
          "project-risk",
          "evm-kit",
          "project-diligence",
          "project-monte-carlo",
          "project-sensitivity",
          "project-change-integrity"
        ],
        storeAs: "matrix",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            return { headline: "Coaching path — recovery matrix skipped", skipped: true };
          }
          var evm = ctx.get("evm-kit");
          var m = evm.metrics || {};
          var dd = ctx.get("project-diligence");
          var mc = ctx.get("project-monte-carlo");
          var pip = ctx.get("project-change-integrity");
          var alts = [
            {
              id: "recover",
              label: "Recovery plan (TCPI focus)",
              ev: n(m.VAC, 0),
              score: n(m.TCPI, 1) >= 1 ? 0.85 : 0.45,
              mcFit: mc.p50 <= n(inp.bac, 4200000) * 1.05 ? 0.8 : 0.4
            },
            {
              id: "rebaseline",
              label: "Re-baseline scope & BAC",
              ev: n(m.VAC, 0) * 0.55,
              score: 0.6,
              mcFit: 0.65
            },
            {
              id: "stop",
              label: "Stop / descope",
              ev: 0,
              score: m.SPI < 0.85 && m.CPI < 0.85 ? 0.75 : 0.35,
              mcFit: m.SPI < 0.85 ? 0.7 : 0.3
            }
          ];
          var matrix = global.ISI.trees.decisionMatrix(alts, [
            {
              id: "ev",
              label: "Value preserved (VAC)",
              weight: 0.3,
              score: function (a) { return a.ev; },
              normalize: function (v) {
                var mx = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.ev); })) || 1;
                return (v / mx + 1) / 2;
              }
            },
            {
              id: "fit",
              label: "Schedule/cost fit",
              weight: 0.35,
              score: function (a) { return a.score; },
              normalize: function (v) { return v; }
            },
            {
              id: "mc",
              label: "EAC within BAC band",
              weight: 0.2,
              score: function (a) { return a.mcFit; },
              normalize: function (v) { return v; }
            },
            {
              id: "integrity",
              label: "Change / recovery integrity",
              weight: 0.15,
              score: function () { return pip.score || 0.5; },
              normalize: function (v) { return v; }
            }
          ]);
          if (global.ISI.store) {
            global.ISI.store.saveResult("matrix", matrix);
          }
          var decisionScore =
            (dd.verdict !== "STOP" ? 0.3 : 0.08) +
            (n(m.SPI, 1) >= 0.85 ? 0.15 : 0.05) +
            (n(m.CPI, 1) >= 0.85 ? 0.15 : 0.05) +
            mc.pPositive * 0.25 +
            (pip.score || 0) * 0.2;
          return {
            headline: matrix.best.label + " · ISI project recovery score " + decisionScore.toFixed(2),
            score: decisionScore,
            matrixBest: matrix.best.label,
            matrix: matrix,
            recovery: n(m.TCPI, 1) >= 1 ? "TCPI_RECOVERY" : "REBASELINE_OR_STOP",
            skipped: false
          };
        }
      },
      "coaching-readiness": {
        label: "ISI Coaching Readiness Gate",
        dependsOn: ["file-intake"],
        storeAs: "engine5-coaching-readiness",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath !== "coaching") {
            return { headline: "Project path — coaching readiness skipped", skipped: true };
          }
          var ready = coachingReadiness(ctx.get("file-intake").intake);
          var verdict = ready.score >= 0.55 ? "COACHING_OK" : "NOT_READY";
          return {
            headline:
              verdict === "COACHING_OK"
                ? "Coaching readiness " + (ready.score * 100).toFixed(0) + "% — proceed to scorecard"
                : "Not ready — fix seat / cadence before coaching spend",
            score: ready.score,
            verdict: verdict,
            notes: ready.notes,
            skipped: false
          };
        }
      },
      "coaching-diagnosis": {
        label: "ISI Coaching root-cause module",
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
        label: "ISI Coaching Scorecard module (no NPV)",
        dependsOn: ["coaching-readiness", "file-intake"],
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
            branches: card.branches,
            skipped: false
          };
        }
      },
      "coaching-interventions": {
        label: "ISI Coaching Interventions module",
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
            names: fired.map(function (m) { return m.name; }),
            skipped: false
          };
        }
      },
      "coaching-matrix": {
        label: "ISI Coaching Priority Decision Matrix",
        dependsOn: ["coaching-interventions", "coaching-scorecard", "coaching-readiness"],
        storeAs: "engine5-coaching-matrix",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath !== "coaching") {
            return { headline: "Project path — coaching matrix skipped", skipped: true };
          }
          var ready = ctx.get("coaching-readiness");
          var card = ctx.get("coaching-scorecard");
          var intr = ctx.get("coaching-interventions");
          var alts = [
            {
              id: "cadence",
              label: "Cadence-first — decision rights & weekly owners",
              fit: card.score,
              modules: intr.active.indexOf("cadence") >= 0 ? 0.9 : 0.5
            },
            {
              id: "qual",
              label: "Qualification-first — live bid gate in 30 days",
              fit: card.score * 0.9,
              modules: intr.active.indexOf("qual") >= 0 ? 0.95 : 0.45
            },
            {
              id: "align",
              label: "Handoff alignment — BD / ops / finance",
              fit: card.score * 0.85,
              modules: intr.active.indexOf("align") >= 0 ? 0.88 : 0.4
            }
          ];
          var matrix = global.ISI.trees.decisionMatrix(alts, [
            {
              id: "fit",
              label: "Scorecard fit",
              weight: 0.45,
              score: function (a) { return a.fit; },
              normalize: function (v) { return v; }
            },
            {
              id: "mod",
              label: "Module urgency",
              weight: 0.35,
              score: function (a) { return a.modules; },
              normalize: function (v) { return v; }
            },
            {
              id: "ready",
              label: "Readiness gate",
              weight: 0.2,
              score: function () { return ready.score; },
              normalize: function (v) { return v; }
            }
          ]);
          var decisionScore = ready.score * 0.4 + card.score * 0.35 + Math.min(1, intr.active.length / 3) * 0.25;
          return {
            headline: matrix.best.label + " · ISI coaching priority score " + decisionScore.toFixed(2),
            score: decisionScore,
            matrixBest: matrix.best.label,
            matrix: matrix,
            readiness: ready.verdict,
            skipped: false
          };
        }
      },
      summary: {
        label: "ISI Program Engine summary KPIs",
        dependsOn: [
          "project-matrix",
          "project-monte-carlo",
          "project-sensitivity",
          "project-risk",
          "evm-kit",
          "project-diligence",
          "project-change-integrity",
          "project-rootcause",
          "coaching-matrix",
          "coaching-interventions",
          "coaching-scorecard",
          "coaching-readiness",
          "coaching-diagnosis"
        ],
        storeAs: "engine5-summary",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          if (inp.studyPath === "coaching") {
            var card = ctx.get("coaching-scorecard");
            var intr = ctx.get("coaching-interventions");
            var dm = ctx.get("coaching-matrix");
            var ready = ctx.get("coaching-readiness");
            var rc = ctx.get("coaching-diagnosis");
            return {
              headline: dm.headline || card.headline,
              kpis: {
                path: "coaching",
                company: inp.company,
                readiness: ready.verdict,
                scorecard: card.score,
                modules: (intr.active || []).length,
                rootcauseKeep: rc.keep,
                matrixBest: dm.matrixBest,
                decisionScore: dm.score,
                npvChain: "skipped"
              }
            };
          }
          var evm = ctx.get("evm-kit");
          var risk = ctx.get("project-risk");
          var mx = ctx.get("project-matrix");
          var dd = ctx.get("project-diligence");
          var sens = ctx.get("project-sensitivity");
          var mc = ctx.get("project-monte-carlo");
          var rcProj = ctx.get("project-rootcause");
          return {
            headline: mx.headline || evm.headline,
            kpis: {
              path: "project",
              company: inp.company,
              diligence: dd.verdict,
              spi: evm.metrics && evm.metrics.SPI,
              cpi: evm.metrics && evm.metrics.CPI,
              eac: evm.metrics && evm.metrics.EAC,
              vac: evm.metrics && evm.metrics.VAC,
              riskEmv: risk.metrics && risk.metrics.emv,
              rootcauseKeep: rcProj.keep,
              sensitivityTop: sens.topSwing,
              mcP50: mc.p50,
              mcPPositive: mc.pPositive,
              matrixBest: mx.matrixBest,
              decisionScore: mx.score
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
