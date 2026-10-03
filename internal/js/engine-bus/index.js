/**

 * ISI proprietary engine registry (4–5 engines). Internal only.

 */

(function (global) {

  "use strict";



  var ENGINES = {

    "commercial-tollgate": { label: "Engine 1 — Commercial / tollgate", status: "active" },

    "financial-capital": { label: "Engine 2 — Financial & capital", status: "active" },

    "operations-throughput": { label: "Engine 3 — Operations & throughput", status: "active" },

    "venture-sequence": { label: "Engine 4 — Venture & sequence", status: "active" },

    "project-program": { label: "Engine 5 — Project / program & coaching", status: "active" }

  };



  function init() {

    if (global.ISI.engineBus.registerCommercial) global.ISI.engineBus.registerCommercial();

    if (global.ISI.engineBus.registerFinancial) global.ISI.engineBus.registerFinancial();

    if (global.ISI.engineBus.registerOperations) global.ISI.engineBus.registerOperations();

    if (global.ISI.engineBus.registerVenture) global.ISI.engineBus.registerVenture();

    if (global.ISI.engineBus.registerProject) global.ISI.engineBus.registerProject();

  }



  function getEngine(id) {

    var key = id;

    if (id === "financial") key = "financial-capital";

    if (id === "commercial") key = "commercial-tollgate";

    if (id === "operations") key = "operations-throughput";

    if (id === "venture") key = "venture-sequence";

    if (id === "project" || id === "coaching") key = "project-program";

    var map = {

      "commercial-tollgate": global.ISI.engineBus.commercial,

      "financial-capital": global.ISI.engineBus.financial,

      "operations-throughput": global.ISI.engineBus.operations,

      "venture-sequence": global.ISI.engineBus.venture,

      "project-program": global.ISI.engineBus.project

    };

    return map[key] || null;

  }



  function mapClientGroup(group) {

    var map = {

      commercial: "commercial-tollgate",

      financial: "financial-capital",

      operations: "operations-throughput",

      venture: "venture-sequence",

      project: "project-program",

      coaching: "project-program"

    };

    return map[group] || "financial-capital";

  }



  global.ISI = global.ISI || {};

  global.ISI.engineBus = global.ISI.engineBus || {};

  global.ISI.engineBus.ENGINES = ENGINES;

  global.ISI.engineBus.init = init;

  global.ISI.engineBus.getEngine = getEngine;

  global.ISI.engineBus.mapClientGroup = mapClientGroup;

})(typeof window !== "undefined" ? window : this);

