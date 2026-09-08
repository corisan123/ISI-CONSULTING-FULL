/**
 * EngineTag — Truth Collective UI (Phase 7)
 * Visual label only. Styles live in EngineTag.css via theme.css variables.
 */
var LABELS = {
  growth: "Growth",
  expansion: "Expansion",
  alignment: "Alignment"
};

export function EngineTag(options) {
  options = options || {};
  var engine = String(options.engine || "").toLowerCase();
  var label = options.label || LABELS[engine] || options.engine || "";

  var el = document.createElement("span");
  el.className = "tc-engine-tag";
  if (LABELS[engine]) el.className += " tc-engine-tag--" + engine;
  if (options.className) el.className += " " + options.className;
  el.textContent = label;
  return el;
}

export default EngineTag;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.EngineTag = EngineTag;
}
