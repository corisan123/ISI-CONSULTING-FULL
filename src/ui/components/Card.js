/**
 * Card — Truth Collective UI (Phase 7)
 * Visual container only. Styles live in Card.css via theme.css variables.
 */
export function Card(options) {
  options = options || {};
  var el = document.createElement(options.tag || "article");
  el.className = "tc-card" + (options.className ? " " + options.className : "");

  if (options.title) {
    var title = document.createElement("h3");
    title.className = "tc-card__title";
    title.textContent = options.title;
    el.appendChild(title);
  }

  if (options.body) {
    var body = document.createElement("div");
    body.className = "tc-card__body";
    if (options.body instanceof Node) body.appendChild(options.body);
    else body.textContent = String(options.body);
    el.appendChild(body);
  }

  if (options.children instanceof Node) el.appendChild(options.children);

  return el;
}

export default Card;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.Card = Card;
}
