/**
 * Metric — Truth Collective UI (Phase 7)
 * Label + value tile. Styles live in Metric.css via theme.css variables.
 */
export function Metric(options) {
  options = options || {};
  var el = document.createElement("div");
  el.className = "tc-metric" + (options.className ? " " + options.className : "");

  var label = document.createElement("span");
  label.className = "tc-metric__label";
  label.textContent = options.label || "";
  el.appendChild(label);

  var valueRow = document.createElement("div");
  valueRow.className = "tc-metric__value-row";
  var value = document.createElement("span");
  value.className = "tc-metric__value";
  value.textContent = options.value == null ? "" : String(options.value);
  valueRow.appendChild(value);

  if (options.unit) {
    var unit = document.createElement("span");
    unit.className = "tc-metric__unit";
    unit.textContent = options.unit;
    valueRow.appendChild(unit);
  }
  el.appendChild(valueRow);

  if (options.hint) {
    var hint = document.createElement("span");
    hint.className = "tc-metric__hint";
    hint.textContent = options.hint;
    el.appendChild(hint);
  }

  return el;
}

export default Metric;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.Metric = Metric;
}
