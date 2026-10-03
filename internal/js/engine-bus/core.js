/**
 * ISI proprietary engine bus — dependency graph, invalidate, recompute.
 * Trade secret. Internal only. Not client-facing.
 */
(function (global) {
  "use strict";

  var STORE_KEY = "isi_engine_graph";

  function readGraph(engineId) {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      var all = raw ? JSON.parse(raw) : {};
      return all[engineId] || { nodes: {}, order: [], version: 0 };
    } catch (e) {
      return { nodes: {}, order: [], version: 0 };
    }
  }

  function writeGraph(engineId, graph) {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      var all = raw ? JSON.parse(raw) : {};
      all[engineId] = graph;
      sessionStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn("engine-bus write failed", e);
    }
  }

  function topoSort(nodeDefs) {
    var ids = Object.keys(nodeDefs);
    var visited = {};
    var order = [];
    function visit(id) {
      if (visited[id]) return;
      visited[id] = true;
      (nodeDefs[id].dependsOn || []).forEach(visit);
      order.push(id);
    }
    ids.forEach(visit);
    return order;
  }

  function createEngine(engineId, nodeDefs) {
    var order = topoSort(nodeDefs);

    function snapshotInputs(engineId) {
      var g = readGraph(engineId);
      g.order = order;
      g.nodeDefs = Object.keys(nodeDefs).reduce(function (acc, id) {
        acc[id] = { label: nodeDefs[id].label, dependsOn: nodeDefs[id].dependsOn || [] };
        return acc;
      }, {});
      writeGraph(engineId, g);
      return g;
    }

    function getNodeOutput(engineId, nodeId) {
      var g = readGraph(engineId);
      return g.nodes && g.nodes[nodeId] ? g.nodes[nodeId].output : null;
    }

    function setInput(engineId, patch) {
      var g = readGraph(engineId);
      g.inputs = Object.assign({}, g.inputs || {}, patch || {});
      g.dirtyFrom = "inputs";
      writeGraph(engineId, g);
      return recompute(engineId, null);
    }

    function invalidateFrom(engineId, nodeId) {
      var g = readGraph(engineId);
      var idx = order.indexOf(nodeId);
      if (idx === -1) return g;
      for (var i = idx; i < order.length; i++) {
        var id = order[i];
        if (g.nodes && g.nodes[id]) {
          g.nodes[id].stale = true;
        }
      }
      g.version = (g.version || 0) + 1;
      writeGraph(engineId, g);
      return g;
    }

    function recompute(engineId, fromNodeId) {
      var g = readGraph(engineId);
      g.nodes = g.nodes || {};
      g.inputs = g.inputs || {};
      var startIdx = fromNodeId ? order.indexOf(fromNodeId) : 0;
      if (startIdx < 0) startIdx = 0;
      var ctx = {
        engineId: engineId,
        inputs: g.inputs,
        get: function (id) {
          return g.nodes[id] && g.nodes[id].output;
        }
      };
      var log = [];
      for (var i = startIdx; i < order.length; i++) {
        var id = order[i];
        var def = nodeDefs[id];
        if (!def || !def.run) continue;
        try {
          var out = def.run(ctx);
          g.nodes[id] = {
            output: out,
            at: new Date().toISOString(),
            stale: false
          };
          if (global.ISI && global.ISI.store && def.storeAs) {
            global.ISI.store.saveResult(def.storeAs, out);
          }
          log.push({ id: id, label: def.label, headline: out.headline || "OK" });
        } catch (err) {
          g.nodes[id] = {
            error: String(err && err.message ? err.message : err),
            at: new Date().toISOString(),
            stale: false
          };
          log.push({ id: id, label: def.label, headline: "Error", detail: g.nodes[id].error });
          break;
        }
      }
      g.version = (g.version || 0) + 1;
      g.lastRun = log;
      writeGraph(engineId, g);
      if (global.ISI && global.ISI.store) {
        global.ISI.store.setBus({ activeEngine: engineId, engineVersion: g.version });
      }
      return { graph: g, log: log };
    }

    snapshotInputs(engineId);

    return {
      id: engineId,
      order: order,
      setInput: function (patch) {
        return setInput(engineId, patch);
      },
      recompute: function (fromNodeId) {
        return recompute(engineId, fromNodeId);
      },
      invalidateFrom: function (nodeId) {
        invalidateFrom(engineId, nodeId);
        return recompute(engineId, nodeId);
      },
      read: function () {
        return readGraph(engineId);
      },
      getNodeOutput: function (nodeId) {
        return getNodeOutput(engineId, nodeId);
      }
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.engineBus = {
    createEngine: createEngine,
    readGraph: readGraph,
    STORE_KEY: STORE_KEY
  };
})(typeof window !== "undefined" ? window : this);
