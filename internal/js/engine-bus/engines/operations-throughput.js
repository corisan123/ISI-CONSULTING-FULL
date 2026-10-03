/**
 * ISI Engine 3 — Operations & throughput (proprietary).
 * Libraries: ISI.kits, ISI.diligence, ISI.math, ISI.rootcause, ISI.trees.
 */
(function (global) {
  "use strict";

  var UNSET_COMPANY = "Engagement file (unset)";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  function parsePct(str, fallback) {
    if (!str) return fallback;
    var num = parseFloat(String(str).replace(/[^0-9.]/g, ""));
    return isFinite(num) ? num : fallback;
  }

  function parseDays(str, fallback) {
    if (!str) return fallback;
    var m = String(str).match(/(\d+(?:\.\d+)?)/);
    return m ? n(m[1], fallback) : fallback;
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

  function defaultInputs() {
    return {
      company: UNSET_COMPANY,
      diligenceSit: "throughput",
      demand: 1200,
      constraintCap: 900,
      contrib: 85,
      oee: 62,
      scrap: 7.5,
      wip: 18,
      otif: 81,
      exploitThresholdPct: 0.35,
      proposedCapex: 450000,
      mcIterations: 4000,
      mcSeed: 20261003
    };
  }

  function inputsFromIntake(intake, base) {
    var merged = Object.assign({}, base);
    merged.company = intake.companyName || intake.company || UNSET_COMPANY;
    merged.diligenceSit = "throughput";
    merged.otif = parsePct(intake.otif || intake.OTIF, merged.otif);
    merged.wip = parseDays(intake.wipDays || intake["WIP or days on hand"], merged.wip);
    if (/yes|purchase|on the table/i.test(intake.capexProposed || intake["Capex proposed first"] || "")) {
      merged.proposedCapex = Math.max(merged.proposedCapex, 650000);
    } else if (/consider/i.test(intake.capexProposed || intake["Capex proposed first"] || "")) {
      merged.proposedCapex = Math.max(merged.proposedCapex, 520000);
    }
    if (/stall|queue|material|quality|signature|change order/i.test(intake.opsStall || intake["Where work stalls"] || "")) {
      merged.scrap = Math.max(merged.scrap, 9);
      merged.oee = Math.min(merged.oee, 58);
    }
    if (/break|sold work|cannot absorb|estimate/i.test(intake.handoffBreaks || intake["Handoff breaks"] || "")) {
      merged.demand = Math.round(merged.demand * 1.08);
    }
    merged._intake = intake;
    return merged;
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

  function opsFieldsFromInputs(inp) {
    var fields = kitFields("operations");
    [
      "demand", "constraintCap", "contrib", "oee", "scrap", "wip", "otif",
      "changeover", "fte", "overtimePct"
    ].forEach(function (k) {
      if (inp[k] != null && isFinite(Number(inp[k]))) fields[k] = inp[k];
    });
    return fields;
  }

  function annualLost(fields) {
    var res = global.ISI.kits.operations.run(fields);
    return {
      lost: n(res.metrics && res.metrics.annualContributionAtRisk, 0),
      gap: n(res.metrics && res.metrics.weeklyGap, 0),
      metrics: res.metrics,
      kit: res
    };
  }

  function opsFlowIntegrity(intake) {
    var score = 0;
    var notes = [];
    var otif = parsePct(intake.otif || intake.OTIF, 0);
    if (otif >= 92) score += 0.25;
    else if (otif >= 85) score += 0.15;
    else notes.push("OTIF / delivery integrity weak");
    if (!/break|poor|silo|sold work|cannot absorb|estimate/i.test(intake.handoffBreaks || intake["Handoff breaks"] || "")) {
      score += 0.25;
    } else {
      notes.push("BD / estimating / ops handoffs breaking");
    }
    if (!/stall|queue|wait|signature|commissioning/i.test(intake.opsStall || intake["Where work stalls"] || "")) {
      score += 0.2;
    } else {
      notes.push("Work stalls weekly at a known queue");
    }
    if (intake.opsProof || intake["90-day operational proof"]) score += 0.15;
    else notes.push("90-day floor proof not yet defined");
    if (intake.opsConstraint || intake["Believed constraint"]) score += 0.15;
    else notes.push("Constraint resource not named");
    return { score: Math.min(1, score), notes: notes };
  }

  function buildOperationsNodes() {
    return {
      "file-intake": {
        label: "ISI Throughput File Intake module",
        dependsOn: [],
        storeAs: "engine3-intake",
        run: function (ctx) {
          var intake = loadIntake(ctx);
          var base = defaultInputs();
          var merged = inputsFromIntake(intake, base);
          Object.assign(merged, ctx.inputs || {});
          merged.company = merged.company || intake.companyName || UNSET_COMPANY;
          if (global.ISI.store) {
            global.ISI.store.setEngagement({
              company: merged.company,
              industry: intake.trade,
              constraint: "operations",
              family: "operations"
            });
          }
          return {
            headline: merged.company + " — ISI operations & throughput bus loaded",
            inputs: merged,
            intake: intake
          };
        }
      },
      "ops-rootcause": {
        label: "ISI Operational root-cause module",
        dependsOn: ["file-intake"],
        storeAs: "rootcause",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var res = global.ISI.rootcause.run({ intake: intake });
          return {
            headline: res.headline,
            keep: res.keep.length,
            killed: res.killed.length,
            payload: res
          };
        }
      },
      "ops-pipeline-integrity": {
        label: "ISI Pipeline & handoff integrity (ops)",
        dependsOn: ["file-intake"],
        storeAs: "engine3-pipeline",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var pip = opsFlowIntegrity(intake);
          return {
            headline: "Handoff / flow integrity " + (pip.score * 100).toFixed(0) + "%",
            score: pip.score,
            notes: pip.notes
          };
        }
      },
      "constraint-ops": {
        label: "ISI Constraint ID module",
        dependsOn: ["file-intake"],
        storeAs: "operations",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var fields = opsFieldsFromInputs(inp);
          var res = global.ISI.kits.operations.run(fields);
          return {
            headline: res.headline,
            metrics: res.metrics,
            branches: res.branches,
            fields: fields
          };
        }
      },
      "ops-diligence": {
        label: "ISI Throughput Diligence Gate",
        dependsOn: ["file-intake"],
        storeAs: "diligence",
        run: function (ctx) {
          var sit = ctx.get("file-intake").inputs.diligenceSit || "throughput";
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
            payload: res
          };
        }
      },
      "roi-throughput": {
        label: "ISI Exploit-vs-Elevate ROI module",
        dependsOn: ["constraint-ops"],
        storeAs: "roi-throughput",
        run: function (ctx) {
          var ops = ctx.get("constraint-ops");
          var lost = n(ops.metrics && ops.metrics.annualContributionAtRisk, 0);
          return {
            headline: "Exploit path — lost throughput about $" + Math.round(lost).toLocaleString() + "/yr",
            metrics: { lostThroughput: lost, exploitFirst: true },
            lostThroughput: lost
          };
        }
      },
      "capex-gate": {
        label: "ISI CAPEX deferral gate",
        dependsOn: ["roi-throughput", "ops-diligence", "file-intake"],
        storeAs: "engine3-capex-gate",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var lost = ctx.get("roi-throughput").lostThroughput;
          var capex = n(inp.proposedCapex, 450000);
          var threshold = n(inp.exploitThresholdPct, 0.35);
          var exploitRecovery = lost * threshold;
          var dd = ctx.get("ops-diligence").verdict;
          var deferCapex = exploitRecovery >= capex * 0.15 || dd === "CAUTION" || dd === "STOP";
          var verdict = deferCapex ? "DEFER_CAPEX" : "CAPEX_REVIEW";
          return {
            headline: verdict === "DEFER_CAPEX"
              ? "Defer capacity CAPEX — exploit constraint first"
              : "CAPEX may be justified after exploit proof",
            verdict: verdict,
            exploitRecovery: exploitRecovery,
            proposedCapex: capex,
            diligence: dd
          };
        }
      },
      "ops-sensitivity": {
        label: "ISI One-Way Tornado (lost throughput $)",
        dependsOn: ["constraint-ops", "file-intake"],
        storeAs: "sensitivity-1way",
        run: function (ctx) {
          var ops = ctx.get("constraint-ops");
          var baseFields = Object.assign({}, ops.fields);
          var baseLost = annualLost(baseFields).lost;
          var rows = global.ISI.trees.oneWay(
            { oee: baseFields.oee, contrib: baseFields.contrib },
            [
              { key: "oee", label: "Constraint OEE", pct: 0.12 },
              { key: "contrib", label: "Contribution $/unit", pct: 0.15 }
            ],
            function (b) {
              var f = Object.assign({}, baseFields, {
                oee: n(b.oee, baseFields.oee),
                contrib: n(b.contrib, baseFields.contrib)
              });
              return annualLost(f).lost;
            }
          );
          return {
            headline: "ISI One-Way Tornado · largest swing: " + rows[0].label,
            baseLost: baseLost,
            topSwing: rows[0].label,
            rows: rows
          };
        }
      },
      "ops-monte-carlo": {
        label: "ISI Seeded Monte Carlo (throughput $)",
        dependsOn: ["constraint-ops", "file-intake"],
        storeAs: "montecarlo",
        run: function (ctx) {
          var ops = ctx.get("constraint-ops");
          var inp = ctx.get("file-intake").inputs;
          var fields = ops.fields;
          var gap = n(ops.metrics.weeklyGap, 0);
          var mc = global.ISI.math.monteCarlo({
            iterations: n(inp.mcIterations, 4000),
            seed: n(inp.mcSeed, 20261003),
            inputs: [
              {
                name: "oee",
                type: "triangular",
                min: Math.max(35, n(fields.oee, 62) - 18),
                mode: n(fields.oee, 62),
                max: Math.min(95, n(fields.oee, 62) + 12)
              },
              {
                name: "contrib",
                type: "normal",
                mean: n(fields.contrib, 85),
                stdev: n(fields.contrib, 85) * 0.12
              },
              {
                name: "demand",
                type: "triangular",
                min: n(fields.demand, 1200) * 0.88,
                mode: n(fields.demand, 1200),
                max: n(fields.demand, 1200) * 1.12
              }
            ],
            model: function (d) {
              var f = Object.assign({}, fields, {
                oee: d.oee,
                contrib: d.contrib,
                demand: d.demand
              });
              var lost = annualLost(f).lost;
              var scrapLeak = gap * d.contrib * 52 * (n(fields.scrap, 7.5) / 100) * 0.35;
              return lost + scrapLeak;
            }
          });
          return {
            headline:
              "ISI Seeded Monte Carlo · P50 lost/recovery $" +
              Math.round(mc.p50).toLocaleString(),
            p10: mc.p10,
            p50: mc.p50,
            p90: mc.p90,
            mean: mc.mean,
            seed: n(inp.mcSeed, 20261003)
          };
        }
      },
      "ops-decision-matrix": {
        label: "ISI Exploit vs CAPEX Decision Matrix",
        dependsOn: ["capex-gate", "roi-throughput", "ops-diligence", "ops-monte-carlo", "ops-sensitivity"],
        storeAs: "matrix",
        run: function (ctx) {
          var gate = ctx.get("capex-gate");
          var roi = ctx.get("roi-throughput");
          var dd = ctx.get("ops-diligence");
          var mc = ctx.get("ops-monte-carlo");
          var pip = ctx.get("ops-pipeline-integrity");
          var alts = [
            {
              id: "exploit",
              label: "Exploit constraint — zero/low CAPEX",
              recovery: gate.exploitRecovery,
              mcP50: mc.p50 * 0.55,
              diligenceOk: dd.verdict !== "STOP" ? 0.9 : 0.35
            },
            {
              id: "hybrid",
              label: "Hybrid — prove exploit, phase CAPEX",
              recovery: gate.exploitRecovery * 0.75 + gate.proposedCapex * 0.08,
              mcP50: mc.p50 * 0.75,
              diligenceOk: dd.verdict === "CAUTION" ? 0.8 : 0.65
            },
            {
              id: "elevate",
              label: "Elevate capacity — deploy CAPEX",
              recovery: Math.max(roi.lostThroughput * 0.6, gate.proposedCapex * 0.22),
              mcP50: mc.p50,
              diligenceOk: gate.verdict === "CAPEX_REVIEW" && dd.verdict !== "STOP" ? 0.85 : 0.25
            }
          ];
          var matrix = global.ISI.trees.decisionMatrix(alts, [
            {
              id: "recovery",
              label: "Exploit recovery $",
              weight: 0.35,
              score: function (a) { return a.recovery; },
              normalize: function (v) {
                var m = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.recovery); })) || 1;
                return (v / m + 1) / 2;
              }
            },
            {
              id: "mc",
              label: "Monte Carlo P50 throughput $",
              weight: 0.25,
              score: function (a) { return a.mcP50; },
              normalize: function (v) {
                var m = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.mcP50); })) || 1;
                return (v / m + 1) / 2;
              }
            },
            {
              id: "dd",
              label: "Clears throughput diligence",
              weight: 0.2,
              score: function (a) { return a.diligenceOk; },
              normalize: function (v) { return v; }
            },
            {
              id: "flow",
              label: "Handoff / flow integrity",
              weight: 0.2,
              score: function () { return pip.score; },
              normalize: function (v) { return v; }
            }
          ]);
          if (global.ISI.store) {
            global.ISI.store.saveResult("matrix", matrix);
          }
          var score =
            (gate.verdict === "DEFER_CAPEX" ? 0.35 : 0.15) +
            (dd.verdict !== "STOP" ? 0.3 : 0.05) +
            (mc.p50 > gate.proposedCapex * 0.1 ? 0.2 : 0.08) +
            pip.score * 0.15;
          return {
            headline: matrix.best.label + " · ISI Exploit vs CAPEX score " + score.toFixed(2),
            score: score,
            matrixBest: matrix.best.label,
            matrix: matrix,
            capexGate: gate.verdict
          };
        }
      },
      summary: {
        label: "ISI Operations Engine summary KPIs",
        dependsOn: [
          "ops-decision-matrix",
          "ops-monte-carlo",
          "ops-sensitivity",
          "capex-gate",
          "constraint-ops",
          "ops-diligence",
          "ops-pipeline-integrity",
          "ops-rootcause"
        ],
        storeAs: "engine3-summary",
        run: function (ctx) {
          var ops = ctx.get("constraint-ops");
          var roi = ctx.get("roi-throughput");
          var gate = ctx.get("capex-gate");
          var dd = ctx.get("ops-diligence");
          var sens = ctx.get("ops-sensitivity");
          var mc = ctx.get("ops-monte-carlo");
          var dm = ctx.get("ops-decision-matrix");
          var intake = ctx.get("file-intake").inputs;
          return {
            headline: dm.headline,
            kpis: {
              company: intake.company,
              diligence: dd.verdict,
              weeklyGap: ops.metrics.weeklyGap,
              oee: ops.metrics.oee,
              lostThroughput: roi.lostThroughput,
              capexGate: gate.verdict,
              sensitivityTop: sens.topSwing,
              mcP50: mc.p50,
              matrixBest: dm.matrixBest,
              decisionScore: dm.score
            }
          };
        }
      }
    };
  }

  function register() {
    var nodes = buildOperationsNodes();
    var engine = global.ISI.engineBus.createEngine("operations-throughput", nodes);
    global.ISI.engineBus.operations = engine;
    return engine;
  }

  global.ISI = global.ISI || {};
  global.ISI.engineBus = global.ISI.engineBus || {};
  global.ISI.engineBus.registerOperations = register;
})(typeof window !== "undefined" ? window : this);
