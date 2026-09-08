/**
 * Packet ROI / EBITDA — illustrative model on top of existing inputs and initiative ROI.
 * Does not change scoring engines.
 */
function money(n) {
  var v = Number(n);
  if (!isFinite(v)) return "—";
  return "$" + Math.round(v).toLocaleString("en-US");
}

function pctPoints(n) {
  var v = Number(n);
  if (!isFinite(v)) return "—";
  return v.toFixed(1) + " pts";
}

export function renderRoiEbitda(packet) {
  var section = document.createElement("section");
  section.className = "isi-packet-section";
  var h = document.createElement("h2");
  h.textContent = "ROI & EBITDA Model";
  section.appendChild(h);

  var note = document.createElement("p");
  note.className = "isi-packet-prose";
  note.textContent =
    "Illustrative packet model. It reads revenue, EBITDA %, and the ROI/impact fields already on ranked initiatives. It does not re-run scoring or the decision tree.";
  section.appendChild(note);

  var m = packet.modeling || {};
  var grid = document.createElement("div");
  grid.className = "isi-packet-metrics";
  [
    ["Annual revenue (input)", money(m.revenue)],
    ["Current EBITDA", money(m.ebitdaCurrent) + (m.ebitdaPct != null ? " (" + m.ebitdaPct + "%)" : "")],
    ["Average initiative ROI", m.averageRoiPct != null ? m.averageRoiPct + "%" : "—"],
    ["Directional value at stake", money(m.valueAtStake)],
    ["Illustrative EBITDA lift", money(m.ebitdaLift)],
    ["Modeled EBITDA (after lift)", money(m.ebitdaModeled)]
  ].forEach(function (pair) {
    var el = document.createElement("div");
    el.className = "isi-packet-metric";
    var l = document.createElement("span");
    l.className = "isi-packet-metric__label";
    l.textContent = pair[0];
    var v = document.createElement("span");
    v.className = "isi-packet-metric__value";
    v.textContent = pair[1];
    el.appendChild(l);
    el.appendChild(v);
    grid.appendChild(el);
  });
  section.appendChild(grid);

  if (m.marginLiftPts != null) {
    var extra = document.createElement("p");
    extra.className = "isi-packet-muted";
    extra.textContent = "Implied margin lift from top-initiative impact fields: " + pctPoints(m.marginLiftPts) + " (conservative realization 25%).";
    section.appendChild(extra);
  }

  return section;
}

export default renderRoiEbitda;
