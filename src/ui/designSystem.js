/**
 * Truth Collective — designSystem.js (Phase 7)
 * Navy + gold brand tokens for the visual experience layer.
 * Does not run scoring, engines, or the decision tree.
 */
export const colors = {
  navy: "#00044A",
  primaryNavy: "#00044A",
  navyDark: "#00022E",
  navyMid: "#0A1258",
  navyLight: "#1C2570",
  navyMuted: "#2A337A",
  gold: "#FFD60A",
  primaryGold: "#FFD60A",
  goldDark: "#FFBF1C",
  goldLight: "#FFE566",
  goldMuted: "#E6C008",
  white: "#FFFFFF",
  black: "#000000",
  backgroundLight: "#F5F6FA",
  backgroundDark: "#00044A",
  surface: "#FFFFFF"
};

export const neutrals = {
  0: "#FFFFFF",
  50: "#F5F6FA",
  100: "#EEF0F6",
  200: "#E2E5EE",
  300: "#C5CAD6",
  400: "#9AA3B2",
  500: "#6B7280",
  600: "#4B5563",
  700: "#374151",
  800: "#1F2937",
  900: "#111827",
  gray: "#6B7280"
};

export const semantic = {
  success: "#067647",
  successBg: "#ECFDF3",
  warning: "#B54708",
  warningBg: "#FFFAEB",
  danger: "#B42318",
  dangerBg: "#FEF3F2",
  info: "#1C2570",
  infoBg: "#EEF0FF"
};

export const typography = {
  fonts: {
    heading: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    body: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'
  },
  scale: {
    h1: { fontSize: "32px", fontWeight: "700", lineHeight: "1.2", letterSpacing: "-0.02em" },
    h2: { fontSize: "28px", fontWeight: "700", lineHeight: "1.25", letterSpacing: "-0.02em" },
    h3: { fontSize: "24px", fontWeight: "600", lineHeight: "1.3", letterSpacing: "-0.01em" },
    h4: { fontSize: "20px", fontWeight: "600", lineHeight: "1.35", letterSpacing: "0" },
    h5: { fontSize: "18px", fontWeight: "600", lineHeight: "1.4", letterSpacing: "0" },
    h6: { fontSize: "16px", fontWeight: "600", lineHeight: "1.4", letterSpacing: "0.02em" },
    body: { fontSize: "16px", fontWeight: "400", lineHeight: "1.6", letterSpacing: "0" },
    caption: { fontSize: "12px", fontWeight: "500", lineHeight: "1.4", letterSpacing: "0.04em" }
  }
};

export const spacing = {
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  24: "24px",
  32: "32px",
  48: "48px"
};

export const radius = {
  none: "0",
  sm: "6px",
  md: "12px",
  lg: "16px"
};

export const shadows = {
  xs: "0 1px 2px rgba(0, 4, 74, 0.06)",
  sm: "0 2px 8px rgba(0, 4, 74, 0.08)",
  md: "0 8px 24px rgba(0, 4, 74, 0.12)",
  lg: "0 16px 40px rgba(0, 4, 74, 0.16)"
};

export const components = {
  card: {
    background: "var(--color-surface)",
    color: "var(--color-navy)",
    padding: "var(--space-24)",
    radius: "var(--radius-md)",
    shadow: "var(--shadow-sm)",
    accent: "var(--color-gold)"
  },
  panel: {
    background: "var(--color-background)",
    color: "var(--color-navy)",
    padding: "var(--space-24) var(--space-32)",
    radius: "var(--radius-md)"
  },
  metric: {
    background: "var(--color-navy)",
    labelColor: "var(--color-gold-dark)",
    valueColor: "var(--color-white)",
    padding: "var(--space-16) var(--space-24)",
    radius: "var(--radius-md)"
  },
  initiativeBlock: {
    background: "var(--color-surface)",
    accent: "var(--color-gold-dark)",
    color: "var(--color-navy)",
    padding: "var(--space-16) var(--space-24)",
    radius: "var(--radius-md)"
  },
  roadmapPhase: {
    background: "var(--color-surface)",
    borderColor: "var(--color-navy)",
    color: "var(--color-navy)",
    padding: "var(--space-24)",
    radius: "var(--radius-md)"
  },
  scoreBar: {
    track: "var(--neutral-200)",
    fill: "var(--color-gold)",
    radius: "var(--radius-sm)"
  },
  engineTag: {
    background: "var(--color-navy)",
    color: "var(--color-gold)",
    radius: "var(--radius-sm)",
    padding: "var(--space-4) var(--space-8)"
  }
};

function setVars(el, map) {
  Object.keys(map).forEach(function (name) {
    el.style.setProperty(name, map[name]);
  });
}

export function cssVarMap() {
  var type = typography.scale;
  return {
    "--color-navy": colors.navy,
    "--color-navy-dark": colors.navyDark,
    "--color-navy-mid": colors.navyMid,
    "--color-navy-light": colors.navyLight,
    "--color-navy-muted": colors.navyMuted,
    "--color-gold": colors.gold,
    "--color-gold-dark": colors.goldDark,
    "--color-gold-light": colors.goldLight,
    "--color-gold-muted": colors.goldMuted,
    "--color-white": colors.white,
    "--color-black": colors.black,
    "--color-surface": colors.surface,
    "--color-background": colors.backgroundLight,
    "--color-background-dark": colors.backgroundDark,
    "--primaryNavy": colors.primaryNavy,
    "--primaryGold": colors.primaryGold,
    "--navyDark": colors.navyDark,
    "--navyLight": colors.navyLight,
    "--goldDark": colors.goldDark,
    "--goldLight": colors.goldLight,
    "--neutralGray": neutrals.gray,
    "--backgroundLight": colors.backgroundLight,
    "--backgroundDark": colors.backgroundDark,
    "--neutral-0": neutrals[0],
    "--neutral-50": neutrals[50],
    "--neutral-100": neutrals[100],
    "--neutral-200": neutrals[200],
    "--neutral-300": neutrals[300],
    "--neutral-400": neutrals[400],
    "--neutral-500": neutrals[500],
    "--neutral-600": neutrals[600],
    "--neutral-700": neutrals[700],
    "--neutral-800": neutrals[800],
    "--neutral-900": neutrals[900],
    "--color-success": semantic.success,
    "--color-success-bg": semantic.successBg,
    "--color-warning": semantic.warning,
    "--color-warning-bg": semantic.warningBg,
    "--color-danger": semantic.danger,
    "--color-danger-bg": semantic.dangerBg,
    "--color-info": semantic.info,
    "--color-info-bg": semantic.infoBg,
    "--font-heading": typography.fonts.heading,
    "--font-body": typography.fonts.body,
    "--font-mono": typography.fonts.mono,
    "--headingFont": typography.fonts.heading,
    "--bodyFont": typography.fonts.body,
    "--monoFont": typography.fonts.mono,
    "--text-h1-size": type.h1.fontSize,
    "--text-h1-weight": type.h1.fontWeight,
    "--text-h1-line": type.h1.lineHeight,
    "--text-h1-tracking": type.h1.letterSpacing,
    "--text-h2-size": type.h2.fontSize,
    "--text-h2-weight": type.h2.fontWeight,
    "--text-h2-line": type.h2.lineHeight,
    "--text-h2-tracking": type.h2.letterSpacing,
    "--text-h3-size": type.h3.fontSize,
    "--text-h3-weight": type.h3.fontWeight,
    "--text-h3-line": type.h3.lineHeight,
    "--text-h3-tracking": type.h3.letterSpacing,
    "--text-h4-size": type.h4.fontSize,
    "--text-h4-weight": type.h4.fontWeight,
    "--text-h4-line": type.h4.lineHeight,
    "--text-h4-tracking": type.h4.letterSpacing,
    "--text-h5-size": type.h5.fontSize,
    "--text-h5-weight": type.h5.fontWeight,
    "--text-h5-line": type.h5.lineHeight,
    "--text-h5-tracking": type.h5.letterSpacing,
    "--text-h6-size": type.h6.fontSize,
    "--text-h6-weight": type.h6.fontWeight,
    "--text-h6-line": type.h6.lineHeight,
    "--text-h6-tracking": type.h6.letterSpacing,
    "--text-body-size": type.body.fontSize,
    "--text-body-weight": type.body.fontWeight,
    "--text-body-line": type.body.lineHeight,
    "--text-body-tracking": type.body.letterSpacing,
    "--text-caption-size": type.caption.fontSize,
    "--text-caption-weight": type.caption.fontWeight,
    "--text-caption-line": type.caption.lineHeight,
    "--text-caption-tracking": type.caption.letterSpacing,
    "--space-4": spacing[4],
    "--space-8": spacing[8],
    "--space-12": spacing[12],
    "--space-16": spacing[16],
    "--space-24": spacing[24],
    "--space-32": spacing[32],
    "--space-48": spacing[48],
    "--spaceXS": spacing[4],
    "--spaceSM": spacing[8],
    "--spaceMD": spacing[16],
    "--spaceLG": spacing[24],
    "--spaceXL": spacing[32],
    "--radius-none": radius.none,
    "--radius-sm": radius.sm,
    "--radius-md": radius.md,
    "--radius-lg": radius.lg,
    "--radius": radius.md,
    "--shadow-xs": shadows.xs,
    "--shadow-sm": shadows.sm,
    "--shadow-md": shadows.md,
    "--shadow-lg": shadows.lg
  };
}

export function applyCssVars(root) {
  var el = root || (typeof document !== "undefined" ? document.documentElement : null);
  if (!el || !el.style) return;
  setVars(el, cssVarMap());
}

export const designSystem = {
  brand: "Truth Collective",
  colors: colors,
  neutrals: neutrals,
  semantic: semantic,
  typography: typography,
  spacing: spacing,
  radius: radius,
  shadows: shadows,
  components: components,
  applyCssVars: applyCssVars,
  cssVarMap: cssVarMap
};

export default designSystem;

if (typeof window !== "undefined") {
  window.TruthCollectiveTheme = designSystem;
  window.ISIDesignSystem = designSystem;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyCssVars(document.documentElement);
    });
  } else {
    applyCssVars(document.documentElement);
  }
}
