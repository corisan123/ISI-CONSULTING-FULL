/**
 * InitiativeBlock — Truth Collective UI (Phase 7)
 * Displays an initiative title and body. Styles live in InitiativeBlock.css.
 */
import { EngineTag } from "./EngineTag.js";

export function InitiativeBlock(options) {
  options = options || {};
  var el = document.createElement("article");
  el.className = "tc-initiative" + (options.className ? " " + options.className : "");

  var header = document.createElement("div");
  header.className = "tc-initiative__header";

  var title = document.createElement("h3");
  title.className = "tc-initiative__title";
  title.textContent = options.title || "";
  header.appendChild(title);

  if (options.engine || options.engineLabel) {
    header.appendChild(
      EngineTag({
        engine: options.engine,
        label: options.engineLabel
      })
    );
  }
  el.appendChild(header);

  if (options.description || options.body) {
    var body = document.createElement("p");
    body.className = "tc-initiative__body";
    body.textContent = String(options.description || options.body);
    el.appendChild(body);
  }

  if (options.impact) {
    var impact = document.createElement("p");
    impact.className = "tc-initiative__impact";
    impact.textContent = options.impact;
    el.appendChild(impact);
  }

  if (options.children instanceof Node) el.appendChild(options.children);

  return el;
}

export default InitiativeBlock;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.InitiativeBlock = InitiativeBlock;
}
