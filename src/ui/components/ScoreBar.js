/**
 * ScoreBar — Truth Collective UI (Phase 7)
 * Width comes from a passed-in value. Colors live in ScoreBar.css.
 */
function clamp(value, min, max) {
  var n = Number(value);
  if (!isFinite(n)) n = 0;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function toneFor(percent) {
  if (percent >= 75) return "success";
  if (percent >= 50) return "warning";
  return "danger";
}

export function ScoreBar(options) {
  options = options || {};
  var max = Number(options.max);
  if (!isFinite(max) || max <= 0) max = 100;
  var value = clamp(options.value, 0, max);
  var percent = Math.round((value / max) * 100);
  var tone = toneFor(percent);

  var el = document.createElement("div");
  el.className = "tc-score-bar" + (options.className ? " " + options.className : "");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", (options.label ? options.label + " " : "") + percent + " of " + max);

  if (options.label) {
    var label = document.createElement("span");
    label.className = "tc-score-bar__label";
    label.textContent = options.label;
    el.appendChild(label);
  }

  var track = document.createElement("div");
  track.className = "tc-score-bar__track";

  var fill = document.createElement("div");
  fill.className = "tc-score-bar__fill";
  fill.setAttribute("data-tone", tone);
  fill.style.width = percent + "%";
  track.appendChild(fill);
  el.appendChild(track);

  if (options.showValue !== false) {
    var readout = document.createElement("span");
    readout.className = "tc-score-bar__value";
    readout.textContent = String(percent);
    el.appendChild(readout);
  }

  return el;
}

export default ScoreBar;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.ScoreBar = ScoreBar;
}
