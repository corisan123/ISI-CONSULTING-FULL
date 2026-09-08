/**
 * Packet integrity and anti-copy helpers (Phase 9).
 * Deterrence and document fingerprinting only. Does not alter diagnostic data.
 */

function toHex(buffer) {
  var bytes = new Uint8Array(buffer);
  var out = "";
  for (var i = 0; i < bytes.length; i++) {
    var h = bytes[i].toString(16);
    out += h.length === 1 ? "0" + h : h;
  }
  return out;
}

function fnv1a(str) {
  var h = 2166136261;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

export function canonicalString(value) {
  return JSON.stringify(value);
}

export async function hashNarrativeTokens(tokens) {
  var payload = canonicalString(tokens || {});
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return toHex(buf);
  }
  return fnv1a(payload);
}

export function wrapCanvasLines(ctx, text, maxWidth) {
  var words = String(text || "").split(/\s+/);
  var lines = [];
  var line = "";
  words.forEach(function (word) {
    var test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export function renderNarrativeCanvas(blocks, options) {
  options = options || {};
  var width = options.width || 720;
  var pad = options.pad || 24;
  var lineHeight = options.lineHeight || 22;
  var canvas = document.createElement("canvas");
  canvas.className = "isi-packet-canvas";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");
  var maxText = width - pad * 2;
  ctx.font = "16px Inter, system-ui, sans-serif";

  var lines = [];
  (blocks || []).forEach(function (block) {
    if (!block) return;
    if (block.label) {
      lines.push({ kind: "label", text: block.label });
    }
    wrapCanvasLines(ctx, block.text || "", maxText).forEach(function (t) {
      lines.push({ kind: block.kind || "body", text: t });
    });
    lines.push({ kind: "gap", text: "" });
  });

  var height = pad * 2 + lines.length * lineHeight;
  canvas.width = width;
  canvas.height = Math.max(height, 80);
  canvas.style.width = "100%";
  canvas.style.maxWidth = width + "px";

  ctx.fillStyle = options.background || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var y = pad + 16;
  lines.forEach(function (row) {
    if (row.kind === "gap") {
      y += lineHeight * 0.35;
      return;
    }
    if (row.kind === "label") {
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFBF1C";
      ctx.fillText(String(row.text).toUpperCase(), pad, y);
    } else if (row.kind === "lead") {
      ctx.font = "600 18px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#00044A";
      ctx.fillText(row.text, pad, y);
    } else {
      ctx.font = "400 15px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#374151";
      ctx.fillText(row.text, pad, y);
    }
    y += lineHeight;
  });

  return canvas;
}

export function applyWatermark(root, text) {
  if (!root) return;
  root.classList.add("isi-packet--watermarked");
  root.setAttribute("data-watermark", text || "ISI CONFIDENTIAL");
}

export function applyAntiCopy(root) {
  if (!root) return;
  root.classList.add("isi-packet--protected");
  root.setAttribute("oncopy", "return false");
  root.setAttribute("oncut", "return false");
  root.setAttribute("oncontextmenu", "return false");
}
