#!/usr/bin/env node
// Generates the Paper / Ink themes plus their monochrome variants
// (themes/paper-color-theme.json, ink, paper-mono, ink-mono)
// from the color tokens of https://webwithoutjs.com/lab/paper-ink/
//
// The site's CSS (abridged):
//   --paper: light-dark(oklch(95.5% .022 92), oklch(23% .02 55));
//   --ink:   light-dark(oklch(27% .025 55),  oklch(93% .02 92));
//   --oxide: light-dark(oklch(50% .16 38),   oklch(68% .14 45));
//   --muted: light-dark(oklch(45% .03 50),   oklch(72% .03 75));
//   --fill:  light-dark(oklch(92% .025 88),  oklch(28% .02 55));
//   --rule:  25% alpha of ink (per side)
//
// VS Code themes only accept sRGB hex, so everything is converted here.
// Four low-chroma hues (moss / slate / ochre / red) are derived from the
// same color world for syntax categories the site does not define.
// For the dark theme these syntax hues are desaturated further and pulled
// closer to the background (v3) so they do not glow on the dark ink ground;
// ink's keyword additionally uses a darker oxide than the UI accent.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------- OKLCH -> sRGB
function oklchToHex(L, C, H, alpha) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const lL = L + 0.3963377774 * a + 0.2158037573 * b;
  const mM = L - 0.1055613458 * a - 0.0638541728 * b;
  const sS = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = lL ** 3;
  const m = mM ** 3;
  const s = sS ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const enc = (v) => {
    v = Math.min(1, Math.max(0, v));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  };
  const h2 = (v) => Math.round(enc(v) * 255).toString(16).padStart(2, "0");
  let hex = `#${h2(r)}${h2(g)}${h2(bl)}`;
  if (alpha !== undefined) hex += Math.round(alpha * 255).toString(16).padStart(2, "0");
  return hex;
}

const A = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");

// ---------------------------------------------------------------- palettes
const paper = {
  name: "Paper",
  type: "light",
  bg: oklchToHex(0.955, 0.022, 92), // --paper
  fg: oklchToHex(0.27, 0.025, 55), // --ink
  accent: oklchToHex(0.5, 0.16, 38), // --oxide (rust)
  kw: oklchToHex(0.5, 0.16, 38), // keyword (same as accent)
  muted: oklchToHex(0.45, 0.03, 50), // --muted
  fill: oklchToHex(0.92, 0.025, 88), // --fill
  hover: oklchToHex(0.885, 0.03, 88), // derived: list/tab hover (deeper than fill)
  rule: oklchToHex(0.27, 0.025, 55, 0.25), // --rule
  // derived syntax hues (same hue logic, restrained chroma)
  green: oklchToHex(0.5, 0.075, 155), // moss — strings
  blue: oklchToHex(0.5, 0.08, 265), // slate — functions / types
  amber: oklchToHex(0.56, 0.1, 85), // ochre — constants / attributes
  red: oklchToHex(0.55, 0.17, 25), // brick — errors
};

const ink = {
  name: "Ink",
  type: "dark",
  bg: oklchToHex(0.23, 0.02, 55), // --paper (dark side)
  fg: oklchToHex(0.93, 0.02, 92), // --ink (dark side)
  accent: oklchToHex(0.68, 0.14, 45), // --oxide (terracotta) — UI accent
  kw: oklchToHex(0.64, 0.095, 45), // keyword: oxide darkened for syntax (v3)
  muted: oklchToHex(0.72, 0.03, 75), // --muted
  fill: oklchToHex(0.28, 0.02, 55), // --fill
  hover: oklchToHex(0.335, 0.025, 55), // derived: list/tab hover (lighter than fill)
  deep: oklchToHex(0.19, 0.028, 50), // --backdrop base, solid; warmed up from 0.12 so the tint survives
  rule: oklchToHex(0.93, 0.02, 92, 0.25), // --rule
  green: oklchToHex(0.69, 0.05, 155), // moss — strings (v3: desaturated)
  blue: oklchToHex(0.71, 0.045, 265), // slate — functions / types (v3)
  amber: oklchToHex(0.73, 0.065, 85), // ochre — constants (v3)
  red: oklchToHex(0.67, 0.1, 25), // brick — errors (v3)
};

// ---------------------------------------------------------------- mono variants
// Monochrome variants: the UI keeps the full palette; only the editor
// syntax highlighting collapses into the ink foreground, keeping the paper/
// ink family shade for comments plus typographic emphasis (italic, bold,
// underline).
function monoVariant(base) {
  return { ...base, mono: true, name: `${base.name} Mono` };
}
const paperMono = monoVariant(paper);
const inkMono = monoVariant(ink);

// ---------------------------------------------------------------- UI colors
function uiColors(p) {
  const barBg = p.type === "light" ? p.fg : p.deep; // status bar: ink bar / deep bar
  const barFg = p.type === "light" ? p.bg : p.fg;
  return {
    // base
    focusBorder: p.accent,
    foreground: p.fg,
    descriptionForeground: p.muted,
    errorForeground: p.red,
    "icon.foreground": p.fg,
    "widget.shadow": A(p.fg, 0.1),
    "selection.background": A(p.accent, 0.3),
    "text.foreground": p.fg,
    "text.linkForeground": p.accent,
    "text.separator": p.muted,

    // editor
    "editor.background": p.bg,
    "editor.foreground": p.fg,
    "editorWidget.background": p.fill,
    "editorWidget.border": p.rule,
    "editorCursor.foreground": p.fg,
    "editorWhitespace.foreground": p.rule,
    "editor.lineHighlightBackground": p.fill,
    "editor.selectionBackground": A(p.accent, 0.28),
    "editor.inactiveSelectionBackground": A(p.accent, 0.15),
    "editor.selectionHighlightBackground": A(p.accent, 0.12),
    "editor.wordHighlightBackground": A(p.accent, 0.18),
    "editor.wordHighlightStrongBackground": A(p.accent, 0.3),
    "editor.findMatchBackground": A(p.amber, 0.45),
    "editor.findMatchHighlightBackground": A(p.amber, 0.22),
    "editor.findRangeHighlightBackground": A(p.fg, 0.06),
    "editor.hoverHighlightBackground": p.fill,
    "editor.linkDecorations.border": A(p.accent, 0.6),
    "editor.rangeHighlightBackground": p.fill,
    "editorBreadcrumbs.foreground": p.muted,
    "editorBreadcrumbs.focusForeground": p.fg,
    "editorLineNumber.foreground": p.muted,
    "editorLineNumber.activeForeground": p.fg,
    "editorIndentGuide.background1": p.rule,
    "editorIndentGuide.activeBackground1": A(p.muted, 0.5),
    "editorGhostText.foreground": p.muted,
    "editorStickyScroll.background": p.fill,
    "editorStickyScrollHover.background": A(p.fg, 0.08),
    "editorSuggestWidget.background": p.fill,
    "editorSuggestWidget.border": p.rule,
    "editorSuggestWidget.foreground": p.fg,
    "editorSuggestWidget.selectedBackground": A(p.accent, 0.28),
    "editorSuggestWidget.highlightForeground": p.accent,
    "editorHoverWidget.background": p.fill,
    "editorHoverWidget.border": p.rule,
    "editorGutter.background": p.bg,
    "editorGutter.addedBackground": p.green,
    "editorGutter.modifiedBackground": p.amber,
    "editorGutter.deletedBackground": p.red,
    "editorBracketMatch.background": A(p.accent, 0.22),
    "editorBracketMatch.border": p.accent,
    "editorError.foreground": p.red,
    "editorWarning.foreground": p.amber,
    "editorInfo.foreground": p.blue,
    "editorHint.foreground": p.muted,
    "editorLink.activeForeground": p.accent,
    "editorOverviewRuler.addedForeground": A(p.green, 0.6),
    "editorOverviewRuler.modifiedForeground": A(p.amber, 0.6),
    "editorOverviewRuler.deletedForeground": A(p.red, 0.6),
    "scrollbarSlider.background": A(p.fg, 0.15),
    "scrollbarSlider.hoverBackground": A(p.fg, 0.28),
    "scrollbarSlider.activeBackground": A(p.fg, 0.4),
    "diffEditor.insertedTextBackground": A(p.green, 0.22),
    "diffEditor.removedTextBackground": A(p.red, 0.18),
    "diffEditor.insertedLineBackground": A(p.green, 0.12),
    "diffEditor.removedLineBackground": A(p.red, 0.1),
    "minimap.selectionHighlight": A(p.fg, 0.25),
    "minimap.findMatchHighlight": A(p.amber, 0.6),
    "minimap.errorGutterForeground": p.red,

    // panel & terminal
    "panel.background": p.bg,
    "panel.border": p.rule,
    "panelTitle.activeForeground": p.fg,
    "panelTitle.activeBorder": p.accent,
    "panelTitle.inactiveForeground": p.muted,
    "panelInput.border": p.rule,
    "terminal.background": p.fill,
    "terminal.foreground": p.fg,
    "terminal.cursorForeground": p.fg,
    "terminal.ansiBlack": p.muted,
    "terminal.ansiRed": p.red,
    "terminal.ansiGreen": p.green,
    "terminal.ansiYellow": p.amber,
    "terminal.ansiBlue": p.blue,
    "terminal.ansiMagenta": p.accent,
    "terminal.ansiCyan": p.blue,
    "terminal.ansiWhite": p.fg,
    "terminal.ansiBrightBlack": p.muted,
    "terminal.ansiBrightRed": p.red,
    "terminal.ansiBrightGreen": p.green,
    "terminal.ansiBrightYellow": p.amber,
    "terminal.ansiBrightBlue": p.blue,
    "terminal.ansiBrightMagenta": p.accent,
    "terminal.ansiBrightCyan": p.blue,
    "terminal.ansiBrightWhite": p.fg,
    "terminal.selectionBackground": A(p.accent, 0.28),

    // chrome: activity bar / side bar / title / status
    "activityBar.background": p.bg,
    "activityBar.foreground": p.fg,
    "activityBar.inactiveForeground": p.muted,
    "activityBar.activeBorder": p.accent,
    "activityBarBadge.background": p.accent,
    "activityBarBadge.foreground": p.bg,
    "sideBar.background": p.bg,
    "sideBar.foreground": p.fg,
    "sideBarTitle.foreground": p.muted,
    "sideBarSectionHeader.background": "",
    "sideBarSectionHeader.foreground": p.muted,
    "titleBar.activeBackground": p.bg,
    "titleBar.inactiveBackground": p.bg,
    "titleBar.activeForeground": p.fg,
    "titleBar.inactiveForeground": p.muted,
    "statusBar.background": barBg,
    "statusBar.foreground": barFg,
    "statusBar.noFolderBackground": barBg,
    "statusBar.noFolderForeground": barFg,
    "statusBar.debuggingBackground": p.accent,
    "statusBar.debuggingForeground": p.bg,
    "statusBar.focusBorder": p.accent,
    "statusBarItem.remoteBackground": p.accent,
    "statusBarItem.remoteForeground": p.bg,

    // tabs
    "tab.activeBackground": p.bg,
    "tab.inactiveBackground": p.fill,
    "tab.activeForeground": p.fg,
    "tab.inactiveForeground": p.muted,
    "tab.border": p.rule,
    "tab.activeBorder": "transparent",
    "tab.activeBorderTop": p.accent,
    "tab.unfocusedActiveBorderTop": p.muted,
    "tab.hoverBackground": p.hover,
    "tab.hoverBorder": "transparent",
    "tab.lastPinnedBorder": p.rule,

    // lists, quick input, menus
    "list.hoverBackground": p.hover,
    "list.activeSelectionBackground": A(p.accent, 0.28),
    "list.activeSelectionForeground": p.fg,
    "list.inactiveSelectionBackground": A(p.fg, 0.1),
    "list.inactiveSelectionForeground": p.fg,
    "list.highlightForeground": p.accent,
    "list.focusHighlightForeground": p.accent,
    "list.filterMatchBackground": A(p.amber, 0.35),
    "quickInput.background": p.fill,
    "quickInput.foreground": p.fg,
    "quickInput.titleBackground": A(p.fg, 0.08),
    "quickInputList.focusBackground": A(p.accent, 0.28),
    "quickInputList.focusForeground": p.fg,
    "pickerGroup.border": p.rule,
    "pickerGroup.headerForeground": p.muted,
    "tree.indentGuidesStroke": p.rule,
    "menu.background": p.fill,
    "menu.foreground": p.fg,
    "menu.selectionBackground": A(p.accent, 0.3),
    "menu.selectionForeground": p.fg,
    "menu.selectionBorder": p.accent,
    "menu.border": p.rule,
    "menubar.selectionBackground": p.hover,
    "menubar.selectionForeground": p.fg,

    // buttons, inputs, badges
    "button.background": p.fg,
    "button.foreground": p.bg,
    "button.hoverBackground": p.accent,
    "button.secondaryBackground": p.fill,
    "button.secondaryForeground": p.fg,
    "button.secondaryHoverBackground": p.hover,
    "input.background": p.bg,
    "input.foreground": p.fg,
    "input.border": p.rule,
    "input.activeBorder": p.accent,
    "input.placeholderForeground": p.muted,
    "inputValidation.errorBorder": p.red,
    "inputValidation.warningBorder": p.amber,
    "inputValidation.infoBorder": p.blue,
    "inputValidation.errorBackground": A(p.red, 0.1),
    "inputValidation.warningBackground": A(p.amber, 0.1),
    "inputValidation.infoBackground": A(p.blue, 0.1),
    "badge.background": p.accent,
    "badge.foreground": p.bg,
    "progressBar.background": p.accent,
    "extensionButton.prominentBackground": p.fg,
    "extensionButton.prominentForeground": p.bg,
    "extensionButton.prominentHoverBackground": p.accent,
    "keybindingLabel.background": p.fill,
    "keybindingLabel.foreground": p.fg,
    "keybindingLabel.borderColor": p.rule,
    "dropdown.background": p.fill,
    "dropdown.foreground": p.fg,
    "dropdown.border": p.rule,
    "checkbox.background": p.fill,
    "checkbox.border": p.rule,
    "inputOption.activeBackground": A(p.fg, 0.15),
    "inputOption.activeBorder": p.rule,
    "inputOption.activeForeground": p.fg,
    "notifications.background": p.fill,
    "notifications.foreground": p.fg,
    "notifications.border": p.rule,
    "notificationCenter.border": p.rule,
    "notificationToast.border": p.rule,

    // misc
    "border.foreground": p.rule,
    "debugExceptionWidget.background": A(p.red, 0.12),
    "debugExceptionWidget.border": p.red,
    "debugToolBar.background": p.fill,
    "charts.foreground": p.fg,
    "charts.primary": p.accent,
    "charts.secondary": p.green,
    "charts.third": p.blue,
    "gitDecoration.modifiedResourceForeground": p.amber,
    "gitDecoration.untrackedResourceForeground": p.green,
    "gitDecoration.deletedResourceForeground": p.red,
    "gitDecoration.ignoredResourceForeground": p.muted,
    "gitDecoration.conflictingResourceForeground": p.red,
    "gitDecoration.unchangedResourceForeground": p.muted,
    "portIndicator.foreground": p.muted,
    "welcomePage.background": p.bg,
    "welcomePage.tileHoverBackground": p.hover,
    "settings.headerForeground": p.fg,
    "settings.modifiedIndicatorForeground": p.amber,
    "settings.dropdownBackground": p.fill,
    "settings.checkboxBackground": p.fill,
    "settings.textInputBackground": p.bg,
    "extensions.listForeground": p.fg,
    "extensions.iconForeground": p.muted,
    "notebookEditor.background": p.bg,
    "notebookEditor.foreground": p.fg,
    "notebookEditor.focusBorder": "transparent",
    "notebook.cellEditorBackground": p.fill,
    "notebook.statusBarBackground": p.fill,
    "notebook.outputEditorBackground": p.fill,
  };
}

// ---------------------------------------------------------------- syntax
function tokenColors(p) {
  const t = (scope, settings) => ({ scope, settings });
  return [
    { settings: { foreground: p.fg } },
    t(["comment", "punctuation.definition.comment"], {
      foreground: p.muted,
      fontStyle: "italic",
    }),
    t(["string"], { foreground: p.green }),
    t(["string.regexp", "string.interpolated"], { foreground: p.green }),
    t(
      ["constant.numeric", "constant.language", "constant.character", "constant.other", "variable.other.constant", "support.constant"],
      { foreground: p.amber }
    ),
    t(
      ["keyword", "storage", "storage.type", "storage.modifier", "storage.unit", "punctuation.section.embedded"],
      { foreground: p.kw }
    ),
    t(["entity.name.function", "support.function"], { foreground: p.blue }),
    t(
      [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
        "entity.name.namespace",
        "entity.other.namespace",
      ],
      { foreground: p.blue }
    ),
    t(["entity.name.tag"], { foreground: p.kw }),
    t(["entity.other.attribute-name"], { foreground: p.amber }),
    t(["variable.language"], { foreground: p.kw }),
    t(["invalid"], { foreground: p.red }),
    t(["markup.heading"], { foreground: p.fg, fontStyle: "bold" }),
    t(["markup.italic"], { fontStyle: "italic" }),
    t(["markup.bold"], { fontStyle: "bold" }),
    t(["markup.underline.link.markdown", "markup.underline.link.html"], {
      foreground: p.kw,
      fontStyle: "underline",
    }),
    t(["markup.inserted"], { foreground: p.green }),
    t(["markup.deleted"], { foreground: p.red }),
    t(["markup.changed"], { foreground: p.amber }),
    t(["markup.quote"], { foreground: p.muted, fontStyle: "italic" }),
    t(["markup.inline.raw", "markup.raw"], { foreground: p.green }),
    t(["meta.diff.header", "markup.meta.diff"], { foreground: p.muted }),
    t(["meta.selector"], { foreground: p.blue }),
  ];
}

// Monochrome syntax: no color differentiation at all — comments keep the
// muted shade + italic, markdown keeps its typographic styles.
function monoTokenColors(p) {
  const t = (scope, settings) => ({ scope, settings });
  return [
    { settings: { foreground: p.fg } },
    t(["comment", "punctuation.definition.comment"], {
      foreground: p.muted,
      fontStyle: "italic",
    }),
    t(["markup.quote"], { foreground: p.muted, fontStyle: "italic" }),
    t(["meta.diff.header", "markup.meta.diff"], { foreground: p.muted }),
    t(["markup.heading"], { foreground: p.fg, fontStyle: "bold" }),
    t(["markup.italic"], { fontStyle: "italic" }),
    t(["markup.bold"], { fontStyle: "bold" }),
    t(["markup.underline.link.markdown", "markup.underline.link.html"], {
      fontStyle: "underline",
    }),
  ];
}

function monoSemanticTokenColors(p) {
  return {
    comment: { foreground: p.muted, fontStyle: "italic" },
  };
}

function semanticTokenColors(p) {
  return {
    comment: p.muted,
    keyword: p.kw,
    storage: p.kw,
    modifier: p.kw,
    self: p.kw,
    string: p.green,
    regexp: p.green,
    number: p.amber,
    constant: p.amber,
    bool: p.amber,
    null: p.amber,
    macro: p.amber,
    decorator: p.amber,
    enumMember: p.amber,
    function: p.blue,
    method: p.blue,
    type: p.blue,
    class: p.blue,
    interface: p.blue,
    enum: p.blue,
    struct: p.blue,
    typeParameter: p.blue,
    namespace: p.muted,
    package: p.muted,
    label: p.muted,
    property: p.fg,
    variable: p.fg,
    parameter: p.fg,
    field: p.fg,
    operator: p.fg,
  };
}

// ---------------------------------------------------------------- write
mkdirSync(join(root, "themes"), { recursive: true });
const definitions = {
  paper: { p: paper, tokens: tokenColors, semantic: semanticTokenColors },
  "paper-mono": { p: paperMono, tokens: monoTokenColors, semantic: monoSemanticTokenColors },
  ink: { p: ink, tokens: tokenColors, semantic: semanticTokenColors },
  "ink-mono": { p: inkMono, tokens: monoTokenColors, semantic: monoSemanticTokenColors },
};
const out = {};
for (const [key, { p, tokens, semantic }] of Object.entries(definitions)) {
  out[key] = join(root, "themes", `${key}-color-theme.json`);
  const theme = {
    name: p.name,
    type: p.type,
    colors: uiColors(p),
    tokenColors: tokens(p),
    semanticTokenColors: semantic(p),
  };
  writeFileSync(out[key], JSON.stringify(theme, null, 2) + "\n");
}

// print palettes for the README table
for (const p of [paper, ink]) {
  console.log(`\n${p.name} (${p.type}):`);
  const rows = [
    ["paper 纸面/背景", p.bg],
    ["ink 墨色/前景", p.fg],
    ["oxide 锈橙点缀", p.accent],
    ["keyword 关键字", p.kw],
    ["muted 弱化文字", p.muted],
    ["fill 面板/终端底", p.fill],
    ["hover 列表/页签悬停", p.hover],
    ...(p.deep ? [["deep 状态栏底", p.deep]] : []),
    ["rule 分隔线 (25%)", p.rule],
    ["moss 字符串", p.green],
    ["slate 函数/类型", p.blue],
    ["ochre 常量/属性", p.amber],
    ["brick 错误", p.red],
  ];
  for (const [label, hex] of rows) console.log(`  ${label}: ${hex}`);
}
for (const p of [paperMono, inkMono]) {
  console.log(`\n${p.name} (${p.type}, syntax monochrome):`);
  console.log(`  syntax → ${p.fg} (ink), comments → ${p.muted}`);
}
console.log("\nWrote:");
for (const f of Object.values(out)) console.log("  " + f);
