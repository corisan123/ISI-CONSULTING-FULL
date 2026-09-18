/**
 * ISI Consulting — canvas charts (no third-party libraries)
 */
(function (global) {
  "use strict";

  var NAVY = "#0F1F3D";
  var GOLD = "#C9A235";
  var STEEL = "#5b7a9d";
  var GREEN = "#067647";
  var RED = "#b42318";
  var MUTED = "#8fa8c4";

  function size(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 640;
    var h = canvas.clientHeight || 280;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function axes(ctx, w, h, pad) {
    ctx.strokeStyle = "#d0d7e2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
  }

  function histogram(canvas, hist, opts) {
    opts = opts || {};
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 16, r: 12, b: 28, l: 44 };
    var innerW = s.w - pad.l - pad.r;
    var innerH = s.h - pad.t - pad.b;
    axes(ctx, s.w, s.h, pad);
    var maxC = Math.max.apply(null, hist.counts) || 1;
    var bw = innerW / hist.counts.length;
    ctx.fillStyle = opts.color || STEEL;
    for (var i = 0; i < hist.counts.length; i++) {
      var bh = (hist.counts[i] / maxC) * innerH;
      ctx.fillRect(pad.l + i * bw + 1, pad.t + innerH - bh, Math.max(1, bw - 2), bh);
    }
    if (opts.markers) {
      opts.markers.forEach(function (m) {
        var x = pad.l + ((m.value - hist.min) / (hist.max - hist.min || 1)) * innerW;
        ctx.strokeStyle = m.color || GOLD;
        ctx.beginPath();
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, pad.t + innerH);
        ctx.stroke();
      });
    }
  }

  function bars(canvas, labels, values, opts) {
    opts = opts || {};
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 16, r: 12, b: 40, l: 48 };
    var innerW = s.w - pad.l - pad.r;
    var innerH = s.h - pad.t - pad.b;
    axes(ctx, s.w, s.h, pad);
    var mx = Math.max.apply(null, values.map(Math.abs)) || 1;
    var bw = innerW / values.length;
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      var bh = (Math.abs(v) / mx) * (innerH * 0.92);
      ctx.fillStyle = v >= 0 ? (opts.pos || GREEN) : (opts.neg || RED);
      ctx.fillRect(pad.l + i * bw + 4, pad.t + innerH - bh, Math.max(2, bw - 8), bh);
      ctx.fillStyle = NAVY;
      var lab = labels[i] || "";
      ctx.fillText(lab.length > 10 ? lab.slice(0, 9) + "…" : lab, pad.l + i * bw + bw / 2, s.h - 12);
    }
  }

  function line(canvas, series, opts) {
    opts = opts || {};
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 16, r: 12, b: 28, l: 48 };
    var innerW = s.w - pad.l - pad.r;
    var innerH = s.h - pad.t - pad.b;
    axes(ctx, s.w, s.h, pad);
    var all = [];
    series.forEach(function (g) { all = all.concat(g.values); });
    var lo = Math.min.apply(null, all);
    var hi = Math.max.apply(null, all);
    if (lo === hi) {
      lo -= 1;
      hi += 1;
    }
    series.forEach(function (g) {
      ctx.strokeStyle = g.color || GOLD;
      ctx.lineWidth = 2;
      ctx.beginPath();
      g.values.forEach(function (v, i) {
        var x = pad.l + (i / Math.max(1, g.values.length - 1)) * innerW;
        var y = pad.t + innerH - ((v - lo) / (hi - lo)) * innerH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  function tornado(canvas, rows) {
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 12, r: 16, b: 16, l: 110 };
    var innerW = s.w - pad.l - pad.r;
    var innerH = s.h - pad.t - pad.b;
    var mid = pad.l + innerW / 2;
    var maxAbs = 1;
    rows.forEach(function (r) {
      maxAbs = Math.max(maxAbs, Math.abs(r.low), Math.abs(r.high));
    });
    var rowH = innerH / rows.length;
    ctx.strokeStyle = "#d0d7e2";
    ctx.beginPath();
    ctx.moveTo(mid, pad.t);
    ctx.lineTo(mid, pad.t + innerH);
    ctx.stroke();
    ctx.font = "12px Segoe UI, sans-serif";
    rows.forEach(function (r, i) {
      var y = pad.t + i * rowH + rowH * 0.2;
      var h = rowH * 0.55;
      var x1 = mid + (r.low / maxAbs) * (innerW / 2);
      var x2 = mid + (r.high / maxAbs) * (innerW / 2);
      ctx.fillStyle = STEEL;
      ctx.fillRect(Math.min(x1, mid), y, Math.abs(x1 - mid), h);
      ctx.fillStyle = GOLD;
      ctx.fillRect(Math.min(mid, x2), y, Math.abs(x2 - mid), h);
      ctx.fillStyle = NAVY;
      ctx.textAlign = "right";
      ctx.fillText(r.label, pad.l - 8, y + h * 0.75);
    });
  }

  function radar(canvas, labels, values) {
    var s = size(canvas);
    var ctx = s.ctx;
    var cx = s.w / 2;
    var cy = s.h / 2;
    var r = Math.min(s.w, s.h) * 0.36;
    var n = labels.length;
    ctx.strokeStyle = "#d0d7e2";
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        var rr = (r * ring) / 4;
        var x = cx + Math.cos(ang) * rr;
        var y = cy + Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(201,162,53,0.35)";
    ctx.strokeStyle = GOLD;
    ctx.beginPath();
    values.forEach(function (v, i) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      var rr = r * Math.max(0, Math.min(1, v));
      var x = cx + Math.cos(ang) * rr;
      var y = cy + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = NAVY;
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    labels.forEach(function (lab, i) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      ctx.fillText(lab, cx + Math.cos(ang) * (r + 16), cy + Math.sin(ang) * (r + 16));
    });
  }

  function heatmap(canvas, matrix, rowLabels, colLabels, opts) {
    opts = opts || {};
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 28, r: 8, b: 8, l: 90 };
    var rows = matrix.length;
    var cols = matrix[0] ? matrix[0].length : 0;
    var cw = (s.w - pad.l - pad.r) / cols;
    var rh = (s.h - pad.t - pad.b) / rows;
    var flat = [];
    matrix.forEach(function (r) { flat = flat.concat(r); });
    var lo = Math.min.apply(null, flat);
    var hi = Math.max.apply(null, flat);
    function color(v) {
      var t = (v - lo) / (hi - lo || 1);
      var r = Math.round(15 + t * 186);
      var g = Math.round(31 + t * 131);
      var b = Math.round(61 + (1 - t) * 80);
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    ctx.font = "10px Segoe UI, sans-serif";
    for (var i = 0; i < rows; i++) {
      ctx.fillStyle = NAVY;
      ctx.textAlign = "right";
      ctx.fillText(rowLabels[i] || "", pad.l - 6, pad.t + i * rh + rh * 0.65);
      for (var j = 0; j < cols; j++) {
        ctx.fillStyle = color(matrix[i][j]);
        ctx.fillRect(pad.l + j * cw + 1, pad.t + i * rh + 1, cw - 2, rh - 2);
        if (opts.showValues) {
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          var cell = matrix[i][j];
          var txt = Math.abs(cell) >= 1000 ? (cell / 1000).toFixed(0) + "k" : (typeof cell === "number" ? cell.toFixed(1) : cell);
          ctx.fillText(txt, pad.l + j * cw + cw / 2, pad.t + i * rh + rh * 0.62);
        }
        if (i === 0) {
          ctx.fillStyle = NAVY;
          ctx.textAlign = "center";
          ctx.fillText(colLabels[j] || "", pad.l + j * cw + cw / 2, 16);
        }
      }
    }
  }

  function scatterFit(canvas, x, y, fit) {
    var s = size(canvas);
    var ctx = s.ctx;
    var pad = { t: 16, r: 16, b: 28, l: 44 };
    var n = Math.min(x.length, y.length);
    if (!n) return;
    var xmin = Math.min.apply(null, x.slice(0, n));
    var xmax = Math.max.apply(null, x.slice(0, n));
    var ymin = Math.min.apply(null, y.slice(0, n));
    var ymax = Math.max.apply(null, y.slice(0, n));
    if (xmin === xmax) { xmin -= 1; xmax += 1; }
    if (ymin === ymax) { ymin -= 1; ymax += 1; }
    function X(v) { return pad.l + ((v - xmin) / (xmax - xmin)) * (s.w - pad.l - pad.r); }
    function Y(v) { return s.h - pad.b - ((v - ymin) / (ymax - ymin)) * (s.h - pad.t - pad.b); }
    axes(ctx, s.w, s.h, pad);
    ctx.fillStyle = GOLD;
    for (var i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(X(x[i]), Y(y[i]), 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (fit) {
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X(xmin), Y(fit.intercept + fit.slope * xmin));
      ctx.lineTo(X(xmax), Y(fit.intercept + fit.slope * xmax));
      ctx.stroke();
    }
  }

  global.ISI = global.ISI || {};
  global.ISI.charts = {
    histogram: histogram,
    bars: bars,
    line: line,
    tornado: tornado,
    radar: radar,
    heatmap: heatmap,
    scatterFit: scatterFit,
    NAVY: NAVY,
    GOLD: GOLD,
    STEEL: STEEL,
    GREEN: GREEN,
    RED: RED,
    MUTED: MUTED
  };
})(typeof window !== "undefined" ? window : this);
