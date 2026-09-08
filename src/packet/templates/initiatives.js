/**
 * Packet initiatives — ranked list from existing prioritization output.
 */
function pct(n) {
  var v = Number(n);
  if (!isFinite(v)) return "—";
  return Math.round(v * 100) + "%";
}

export function renderInitiatives(packet) {
  var section = document.createElement("section");
  section.className = "isi-packet-section";
  var h = document.createElement("h2");
  h.textContent = "Initiatives";
  section.appendChild(h);

  var intro = document.createElement("p");
  intro.className = "isi-packet-prose";
  intro.textContent =
    "Ranked work from the activated engines. Priority scores, ROI, and effort are the values already produced by the diagnostic — this packet does not re-score them.";
  section.appendChild(intro);

  var list = document.createElement("ol");
  list.className = "isi-packet-initiatives";
  (packet.initiatives || []).forEach(function (item, i) {
    if (i >= 8) return;
    var li = document.createElement("li");
    var title = document.createElement("h3");
    title.textContent = item.name || "Initiative";
    var meta = document.createElement("p");
    meta.className = "isi-packet-muted";
    meta.textContent = [item.firm, item.engineName || item.engineId, item.horizon ? "Horizon " + item.horizon : ""]
      .filter(Boolean)
      .join(" · ");
    var summary = document.createElement("p");
    summary.textContent = item.summary || "";
    var scores = document.createElement("p");
    scores.className = "isi-packet-muted";
    scores.textContent =
      "Priority " +
      (item.priorityScore != null ? Number(item.priorityScore).toFixed(1) : "—") +
      " · ROI " +
      pct(item.roi) +
      " · Effort " +
      pct(item.effort);
    li.appendChild(title);
    li.appendChild(meta);
    if (item.summary) li.appendChild(summary);
    li.appendChild(scores);
    list.appendChild(li);
  });
  if (!list.children.length) {
    var empty = document.createElement("p");
    empty.textContent = "No ranked initiatives are on file yet. Run the decision tree and prioritization first.";
    section.appendChild(empty);
  } else {
    section.appendChild(list);
  }
  return section;
}

export default renderInitiatives;
