/**
 * Phase 8 — insert a narrative surface into a live layout container.
 * Does not score, activate engines, or write session data.
 */
import { Card } from "../ui/components/Card.js";

function paragraph(className, text) {
  var p = document.createElement("p");
  p.className = className;
  p.textContent = text || "";
  return p;
}

export function renderNarrativeSurface(surface) {
  surface = surface || {};
  var body = document.createElement("div");
  body.className = "tc-narrative__body";

  body.appendChild(paragraph("tc-narrative__lead", surface.lead));

  var insights = document.createElement("ul");
  insights.className = "tc-narrative__insights";
  (surface.insights || []).forEach(function (line) {
    var li = document.createElement("li");
    li.textContent = line;
    insights.appendChild(li);
  });
  body.appendChild(insights);

  body.appendChild(paragraph("tc-narrative__rationale", surface.rationale));
  body.appendChild(paragraph("tc-narrative__next", surface.nextPhaseFraming));

  var card = Card({
    className: "tc-narrative",
    title: surface.title || "Narrative",
    children: body
  });
  if (surface.id) card.setAttribute("data-narrative-surface", surface.id);
  return card;
}

export function insertNarrativeSurface(surface, outputId) {
  var output = document.getElementById(outputId);
  var parent =
    (output && output.parentNode) ||
    document.querySelector(".tc-diagnostic-layout__content") ||
    document.querySelector(".tc-results-layout__main") ||
    document.querySelector(".isi-page");
  if (!parent || !surface) return null;

  var node = renderNarrativeSurface(surface);
  var prior = parent.querySelector(":scope > .tc-narrative");
  if (prior) {
    prior.replaceWith(node);
  } else if (output && output.parentNode === parent) {
    parent.insertBefore(node, output);
  } else {
    parent.insertBefore(node, parent.firstChild);
  }
  return node;
}
