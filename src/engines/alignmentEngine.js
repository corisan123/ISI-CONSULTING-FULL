/**
 * ISI Consulting — Alignment Engine (Offering #3)
 * McKinsey 7S / OHI / operating-model transformation.
 */
(function (global) {
  "use strict";
  if (!global.ISI || !global.ISI.createEngine) return;

  global.ISI.createEngine({
    id: "alignment",
    name: "BD + Operational Excellence Alignment",
    shortName: "Alignment Engine",
    firm: "McKinsey",
    family: "Org & Ops Transformation",
    modelUrl: "/src/data/engines/alignmentModel.json",
    scoreModules: function (ctx, model, kit) {
      var input = ctx.input || {};
      var scores = (ctx.scoring && ctx.scoring.scores) || {};
      var tension =
        input.bdOpsTension === "broken" ? 22 :
        input.bdOpsTension === "strained" ? 44 :
        input.bdOpsTension === "aligned" ? 82 : 55;
      var cts = 100 - kit.normalize(input.costToServe, 0, 100);
      var ops = scores.operations || 0;
      var lead = scores.leadership || 0;
      var margin = scores.margin || 0;
      var cap = kit.normalize(input.salesCapacity, 0, 20);
      return {
        crossFunctional: kit.mix(tension, ops, 0.45),
        leadershipCapability: lead,
        executionDiscipline: kit.mix(ops, lead, 0.5),
        operatingModel: kit.mix(ops, cts, 0.5),
        cultureIncentives: kit.mix(lead, margin, 0.45),
        governanceCadence: lead,
        costExcellence: kit.mix(margin, cts, 0.5),
        capabilityBuilding: kit.mix(cap, lead, 0.5)
      };
    }
  });
})(typeof window !== "undefined" ? window : this);
