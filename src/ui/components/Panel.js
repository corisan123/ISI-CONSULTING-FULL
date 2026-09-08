/**
 * Panel — Truth Collective UI (Phase 7)
 * Section surface. Styles live in Panel.css via theme.css variables.
 */
export function Panel(options) {
  options = options || {};
  var el = document.createElement(options.tag || "section");
  el.className = "tc-panel" + (options.className ? " " + options.className : "");
  if (options.compact) el.classList.add("tc-panel--compact");

  if (options.title) {
    var title = document.createElement("h2");
    title.className = "tc-panel__title";
    title.textContent = options.title;
    el.appendChild(title);
  }

  if (options.subtitle) {
    var subtitle = document.createElement("p");
    subtitle.className = "tc-panel__subtitle";
    subtitle.textContent = options.subtitle;
    el.appendChild(subtitle);
  }

  var body = document.createElement("div");
  body.className = "tc-panel__body";
  if (options.children instanceof Node) body.appendChild(options.children);
  else if (options.body) {
    if (options.body instanceof Node) body.appendChild(options.body);
    else body.textContent = String(options.body);
  }
  el.appendChild(body);

  return el;
}

export default Panel;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.Panel = Panel;
}
