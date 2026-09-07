/**
 * ISI Consulting — Growth Engine (Offering #1)
 * Bain Full Potential / Commercial Excellence.
 */
(function (global) {
  "use strict";
  if (!global.ISI || !global.ISI.createEngine) return;

  global.ISI.createEngine({
    id: "growth",
    name: "Revenue Growth & Problem Diagnosis",
    shortName: "Growth Engine",
    firm: "Bain",
    family: "Full Potential / Commercial Excellence",
    modelUrl: "/src/data/engines/growthModel.json",
    scoreModules: function (ctx, model, kit) {
      var input = ctx.input || {};
      var scores = (ctx.scoring && ctx.scoring.scores) || {};
      var mat = kit.maturityScore(input.commercialMaturity);
      var ambition =
        input.growthAmbition === "stabilize" ? 38 :
        input.growthAmbition === "expand" ? 58 : 64;
      var pipeline = kit.normalize(input.pipeline, 0, 1000000);
      var cycle = 100 - kit.normalize(input.salesCycle, 0, 180);
      var close = kit.normalize(input.closeRate, 0, 100);
      var conc = 100 - kit.normalize(input.customerConcentration, 0, 100);
      var cap = kit.normalize(input.salesCapacity, 0, 20);
      var gtm = kit.avg([mat, close, pipeline, scores.revenue || 0]);
      return {
        growthStrategy: kit.mix(scores.revenue || 0, ambition, 0.45),
        marketPositioning: kit.mix(scores.revenue || 0, close, 0.5),
        pricingStrategy: scores.margin || 0,
        salesProcessMaturity: kit.mix(mat, close, 0.45),
        pipelineVelocity: kit.mix(pipeline, cycle, 0.5),
        customerSegmentation: kit.mix(conc, scores.operations || 50, 0.35),
        channelStrategy: kit.mix(cap, mat, 0.5),
        gtmArchitecture: gtm
      };
    }
  });
})(typeof window !== "undefined" ? window : this);
