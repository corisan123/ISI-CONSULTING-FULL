/**
 * ISI Consulting — practice store
 * Session-scoped engagement data. Nothing leaves the browser.
 */
(function (global) {
  "use strict";

  var KEY = "isi_practice";
  var INPUT_KEY = "isi_input";

  function empty() {
    return {
      engagement: {
        company: "Placeholder Manufacturing Co.",
        contact: "Alex Rivera",
        email: "alex.rivera@placeholder.example",
        industry: "Manufacturing",
        constraint: "growth",
        updatedAt: null
      },
      results: {},
      kpis: {},
      bus: {},
      lastTool: null
    };
  }

  function read() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return empty();
      var parsed = JSON.parse(raw);
      return Object.assign(empty(), parsed, {
        engagement: Object.assign(empty().engagement, parsed.engagement || {}),
        results: parsed.results || {},
        kpis: parsed.kpis || {},
        bus: parsed.bus || {}
      });
    } catch (err) {
      return empty();
    }
  }

  function write(data) {
    data.engagement = data.engagement || {};
    data.engagement.updatedAt = new Date().toISOString();
    try {
      sessionStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("isi practice store write failed", err);
    }
    return data;
  }

  function saveResult(toolId, payload) {
    var data = read();
    data.results[toolId] = {
      at: new Date().toISOString(),
      payload: payload
    };
    data.lastTool = toolId;
    return write(data);
  }

  function setEngagement(patch) {
    var data = read();
    Object.assign(data.engagement, patch || {});
    return write(data);
  }

  function setKpis(patch) {
    var data = read();
    Object.assign(data.kpis, patch || {});
    return write(data);
  }

  function setBus(patch) {
    var data = read();
    data.bus = Object.assign({}, data.bus || {}, patch || {});
    data.bus.updatedAt = new Date().toISOString();
    return write(data);
  }

  function getBus() {
    return read().bus || {};
  }

  function readDiagnosticInput() {
    try {
      var raw = sessionStorage.getItem(INPUT_KEY) || sessionStorage.getItem("isi_diagnosticInput");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function resetDemo() {
    var demo = empty();
    demo.kpis = {
      revenue: 25000000,
      margin: 28,
      ebitdaPct: 8,
      pipeline: 8000000,
      closeRate: 22,
      discountRate: 10,
      investment: 450000,
      horizon: 5
    };
    return write(demo);
  }

  global.ISI = global.ISI || {};
  global.ISI.store = {
    KEY: KEY,
    read: read,
    write: write,
    saveResult: saveResult,
    setEngagement: setEngagement,
    setKpis: setKpis,
    setBus: setBus,
    getBus: getBus,
    readDiagnosticInput: readDiagnosticInput,
    resetDemo: resetDemo,
    empty: empty
  };
})(typeof window !== "undefined" ? window : this);
