/**
 * RoadmapPhase — Truth Collective UI (Phase 7)
 * Phase card. Styles live in RoadmapPhase.css via theme.css variables.
 */
function padIndex(value) {
  var n = Number(value);
  if (!isFinite(n)) return String(value || "");
  return n < 10 ? "0" + n : String(n);
}

export function RoadmapPhase(options) {
  options = options || {};
  var el = document.createElement("section");
  el.className = "tc-roadmap-phase" + (options.className ? " " + options.className : "");

  var header = document.createElement("header");
  header.className = "tc-roadmap-phase__header";

  if (options.phase != null && options.phase !== "") {
    var index = document.createElement("span");
    index.className = "tc-roadmap-phase__index";
    index.textContent = padIndex(options.phase);
    header.appendChild(index);
  }

  var title = document.createElement("h3");
  title.className = "tc-roadmap-phase__title";
  title.textContent = options.title || "";
  header.appendChild(title);
  el.appendChild(header);

  if (options.focus) {
    var focus = document.createElement("p");
    focus.className = "tc-roadmap-phase__focus";
    focus.textContent = options.focus;
    el.appendChild(focus);
  }

  var body = document.createElement("div");
  body.className = "tc-roadmap-phase__body";

  var items = options.items || [];
  items.forEach(function (item) {
    if (item instanceof Node) {
      body.appendChild(item);
      return;
    }
    var row = document.createElement("p");
    row.className = "tc-roadmap-phase__item";
    row.textContent = String(item);
    body.appendChild(row);
  });

  if (options.children instanceof Node) body.appendChild(options.children);
  el.appendChild(body);

  return el;
}

export default RoadmapPhase;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.RoadmapPhase = RoadmapPhase;
}
