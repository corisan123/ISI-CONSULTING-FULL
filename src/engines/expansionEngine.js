/**
 * ISI Consulting — Expansion Engine (Offering #2)
 * Deloitte / Monitor Growth & Innovation + Three Horizons gates.
 */
(function (global) {
  "use strict";
  if (!global.ISI || !global.ISI.createEngine) return;

  global.ISI.createEngine({
    id: "expansion",
    name: "New Offices, Startups & Revenue Streams",
    shortName: "Expansion Engine",
    firm: "Deloitte",
    family: "Growth & Innovation / Operating Model",
    modelUrl: "/src/data/engines/expansionModel.json",
    scoreModules: function (ctx, model, kit) {
      var input = ctx.input || {};
      var scores = (ctx.scoring && ctx.scoring.scores) || {};
      var intent = input.expansionIntent || "none";
      var ops = scores.operations || 0;
      var lead = scores.leadership || 0;
      var margin = scores.margin || 0;
      var rev = scores.revenue || 0;
      var coreReady = kit.avg([ops, lead, margin]);
      var officeIntent = intent === "new_office" || intent === "both";
      var streamIntent = intent === "new_revenue_stream" || intent === "both";
      var ambitionExpand = input.growthAmbition === "expand";
      return {
        marketEntry: kit.mix(coreReady, ambitionExpand || intent !== "none" ? 48 : 72, 0.4),
        newOfficeLaunch: officeIntent ? kit.mix(ops, lead, 0.5) : kit.mix(ops, 78, 0.3),
        newRevenueStream: streamIntent ? kit.mix(rev, margin, 0.5) : kit.mix(rev, 76, 0.3),
        productStrategy: kit.mix(rev, kit.normalize(input.dealSize, 0, 250000), 0.45),
        operationalScaling: ops,
        orgDesign: lead,
        capitalAllocation: margin,
        innovationReadiness: kit.mix(lead, kit.maturityScore(input.commercialMaturity), 0.5)
      };
    }
  });
})(typeof window !== "undefined" ? window : this);
