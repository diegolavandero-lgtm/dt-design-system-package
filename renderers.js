/* ================================================================
   renderers.js — DT Design System v2.4.1
   Each renderer takes a data object (from JSON) and returns HTML.
================================================================ */

/* ── UTILITIES ── */
function isLight(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*0.2126 + g*0.7152 + b*0.0722) > 150;
}

function sectionHeader(data) {
  return `
    <h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)">${data.title}</h1>
    <p class="sub" style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px">${data.description || ''}</p>
  `;
}

function card(content, extra) {
  return `<div class="card" ${extra || ''}>${content}</div>`;
}

function codeBlock(code) {
  return `<div class="code" style="margin-bottom:14px"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(code)}</pre></div>`;
}

function usageCard(snippet) {
  if (!snippet) return '';
  return `<div class="card flush" style="margin-bottom:24px">
    <div class="card-hdr" style="display:flex;align-items:center;gap:8px">
      <svg width="14" height="14" viewBox="0 0 32 32" fill="var(--b6)"><path d="M10,6L8.59,7.41,13.17,12H4v2h9.17L8.59,18.59,10,20l7-7Zm12,8,7,7-1.41,1.41L22.83,18H32V16H22.83l4.76-4.59L26,10Z"/></svg>
      <span class="ttl">How to call in pages</span>
    </div>
    <div class="code" style="border-radius:0;margin:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(snippet)}</pre></div>
  </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function tabCard(tabs) {
  const tabHtml = tabs.map((t,i) => `<div class="t-tab ${i===0?'on':''}" onclick="switchTab(this)">${t.label}</div>`).join('');
  const panelHtml = tabs.map((t,i) => `<div class="tp ${i===0?'on':''}">${t.content}</div>`).join('');
  return `<div class="card flush"><div class="tabs">${tabHtml}</div>${panelHtml}</div>`;
}

function badgeHtml(label, type) {
  const PC = {
    success: { bg:'var(--g1)', bd:'var(--g3)', fg:'var(--g7)' },
    danger:  { bg:'var(--r1)', bd:'var(--r3)', fg:'var(--r6)' },
    error:   { bg:'var(--r1)', bd:'var(--r3)', fg:'var(--r6)' },
    warning: { bg:'var(--o1)', bd:'var(--o3)', fg:'var(--o7)' },
    info:    { bg:'var(--b1)', bd:'var(--b3)', fg:'var(--b6)' },
    neutral: { bg:'var(--n2)', bd:'var(--n4)', fg:'var(--n6)' },
    outline: { bg:'#fff',      bd:'var(--n4)', fg:'var(--n6)' },
  };
  const c = PC[type] || PC.neutral;
  return `<span style="display:inline-flex;align-items:center;height:22px;padding:2px 6px;border-radius:4px;border:1px solid ${c.bd};background:${c.bg};color:${c.fg};font:600 11px/1 var(--font-sans);white-space:nowrap">${escHtml(label)}</span>`;
}

/* ── CARBON DESIGN SYSTEM ICONS (IBM) — viewBox 0 0 32 32, fill-based ── */
const ICON_PATHS = {
  // key: inner SVG markup (one or more <path>/<circle>/<rect> elements)
  'notification':  '<path d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>',
  'user':          '<path d="M16,4a5,5,0,1,1-5,5,5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,16,2Z"/><path d="M26,30H24V25a5,5,0,0,0-5-5H13a5,5,0,0,0-5,5v5H6V25a7,7,0,0,1,7-7h6a7,7,0,0,1,7,7Z"/>',
  'settings':      '<path d="M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.77l1.92-1.68A2,2,0,0,0,29.3,11L26.94,7a2,2,0,0,0-1.73-1,2,2,0,0,0-.64.1l-2.43.82a11.35,11.35,0,0,0-1.31-.75l-.51-2.52a2,2,0,0,0-2-1.61H13.64a2,2,0,0,0-2,1.61l-.51,2.52a11.48,11.48,0,0,0-1.32.75L7.43,6.06A2,2,0,0,0,6.79,6,2,2,0,0,0,5.06,7L2.7,11a2,2,0,0,0,.41,2.51L5,15.24c0,.25,0,.5,0,.76s0,.51,0,.77L3.11,18.45A2,2,0,0,0,2.7,21L5.06,25a2,2,0,0,0,1.73,1,2,2,0,0,0,.64-.1l2.43-.82a11.35,11.35,0,0,0,1.31.75l.51,2.52a2,2,0,0,0,2,1.61h4.72a2,2,0,0,0,2-1.61l.51-2.52a11.48,11.48,0,0,0,1.32-.75l2.42.82a2,2,0,0,0,.64.1,2,2,0,0,0,1.73-1L29.3,21a2,2,0,0,0-.41-2.51ZM25.21,24l-3.43-1.16a8.86,8.86,0,0,1-2.71,1.57L18.36,28H13.64l-.71-3.55a9.36,9.36,0,0,1-2.7-1.57L6.79,24,4.43,20l2.72-2.4a8.9,8.9,0,0,1,0-3.13L4.43,12,6.79,8l3.43,1.16a8.86,8.86,0,0,1,2.71-1.57L13.64,4h4.72l.71,3.55a9.36,9.36,0,0,1,2.7,1.57L25.21,8,27.57,12l-2.72,2.4a8.9,8.9,0,0,1,0,3.13L27.57,20Z"/>',
  'activity':      '<path d="M12,29a1,1,0,0,1-.92-.62L6.33,17H2V15H7a1,1,0,0,1,.92.62L12,25.28,20.06,3.65A1,1,0,0,1,21,3a1,1,0,0,1,.93.68L25.72,15H30v2H25a1,1,0,0,1-.95-.68L21,7,12.94,28.35A1,1,0,0,1,12,29Z"/>',
  'chart-bar':     '<path d="M4,2H2V28a2,2,0,0,0,2,2H30V28H4V25H26V17H4V13H18V5H4ZM24,19v4H4V19ZM16,7v4H4V7Z"/>',
  'truck':         '<path d="M4 16H16V18H4z"/><path d="M2 11H12V13H2z"/><path d="M29.9189,16.6064l-3-7A.9985.9985,0,0,0,26,9H23V7a1,1,0,0,0-1-1H6V8H21V20.5562A3.9924,3.9924,0,0,0,19.1421,23H12.8579a4,4,0,1,0,0,2h6.2842a3.9806,3.9806,0,0,0,7.7158,0H29a1,1,0,0,0,1-1V17A.9965.9965,0,0,0,29.9189,16.6064ZM9,26a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,9,26ZM23,11h2.3408l2.1431,5H23Zm0,15a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,23,26Zm5-3H26.8579A3.9954,3.9954,0,0,0,23,20V18h5Z"/>',
  'package':       '<path d="M26,30H6a2,2,0,0,1-2-2V16a2,2,0,0,1,2-2H9v2H6V28H26V16H23V14h3a2,2,0,0,1,2,2V28A2,2,0,0,1,26,30Z"/><path d="M13 20H19V22H13z"/><path d="M20.59 8.59 17 12.17 17 2 15 2 15 12.17 11.41 8.59 10 10 16 16 22 10 20.59 8.59z"/>',
  'message':       '<path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z"/>',
  'apps':          '<path d="M8,4V8H4V4Zm2-2H2v8h8Zm8,2V8H14V4Zm2-2H12v8h8Zm8,2V8H24V4Zm2-2H22v8h8ZM8,14v4H4V14Zm2-2H2v8h8Zm8,2v4H14V14Zm2-2H12v8h8Zm8,2v4H24V14Zm2-2H22v8h8ZM8,24v4H4V24Zm2-2H2v8h8Zm8,2v4H14V24Zm2-2H12v8h8Zm8,2v4H24V24Zm2-2H22v8h8Z"/>',
  'search':        '<path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/>',
  'help':          '<path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/><circle cx="16" cy="23.5" r="1.5"/><path d="M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z"/>',
  'grid':          '<path d="M8,4V8H4V4Zm2-2H2v8h8Zm8,2V8H14V4Zm2-2H12v8h8Zm8,2V8H24V4Zm2-2H22v8h8ZM8,14v4H4V14Zm2-2H2v8h8Zm8,2v4H14V14Zm2-2H12v8h8Zm8,2v4H24V14Zm2-2H22v8h8ZM8,24v4H4V24Zm2-2H2v8h8Zm8,2v4H14V24Zm2-2H12v8h8Zm8,2v4H24V24Zm2-2H22v8h8Z"/>',
  'route':         '<path d="M12,30H4a2.0023,2.0023,0,0,1-2-2V24a2.0023,2.0023,0,0,1,2-2h8a2.0023,2.0023,0,0,1,2,2v4A2.0023,2.0023,0,0,1,12,30ZM4,24v4h8V24Z"/><path d="M28,20H12a2.0023,2.0023,0,0,1-2-2V14a2.0023,2.0023,0,0,1,2-2H28a2.0023,2.0023,0,0,1,2,2v4A2.0023,2.0023,0,0,1,28,20ZM12,14v4H28V14Z"/><path d="M16,10H4A2.0023,2.0023,0,0,1,2,8V4A2.0023,2.0023,0,0,1,4,2H16a2.0023,2.0023,0,0,1,2,2V8A2.0023,2.0023,0,0,1,16,10ZM4,4V8H16V4Z"/>',
  'location':      '<path d="M16,18a5,5,0,1,1,5-5A5.0057,5.0057,0,0,1,16,18Zm0-8a3,3,0,1,0,3,3A3.0033,3.0033,0,0,0,16,10Z"/><path d="M16,30,7.5645,20.0513c-.0479-.0571-.3482-.4515-.3482-.4515A10.8888,10.8888,0,0,1,5,13a11,11,0,0,1,22,0,10.8844,10.8844,0,0,1-2.2148,6.5973l-.0015.0025s-.3.3944-.3447.4474ZM8.8125,18.395c.001.0007.2334.3082.2866.3744L16,26.9079l6.91-8.15c.0439-.0552.2783-.3649.2788-.3657A8.901,8.901,0,0,0,25,13,9,9,0,1,0,7,13a8.9054,8.9054,0,0,0,1.8125,5.395Z"/>',
  'dashboard':     '<path d="M24 21H26V26H24z"/><path d="M20 16H22V26H20z"/><path d="M11,26a5.0059,5.0059,0,0,1-5-5H8a3,3,0,1,0,3-3V16a5,5,0,0,1,0,10Z"/><path d="M28,2H4A2.002,2.002,0,0,0,2,4V28a2.0023,2.0023,0,0,0,2,2H28a2.0027,2.0027,0,0,0,2-2V4A2.0023,2.0023,0,0,0,28,2Zm0,9H14V4H28ZM12,4v7H4V4ZM4,28V13H28.0007l.0013,15Z"/>',
  'document':      '<path d="M25.7,9.3l-7-7C18.5,2.1,18.3,2,18,2H8C6.9,2,6,2.9,6,4v24c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V10C26,9.7,25.9,9.5,25.7,9.3z M18,4.4l5.6,5.6H18V4.4z M24,28H8V4h8v6c0,1.1,0.9,2,2,2h6V28z"/><path d="M10 22H22V24H10z"/><path d="M10 16H22V18H10z"/>',
  'edit':          '<path d="M2 26H30V28H2z"/><path d="M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z"/>',
  'delete':        '<path d="M12 12H14V24H12z"/><path d="M18 12H20V24H18z"/><path d="M4,6V8H6V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V8h2V6ZM8,28V8H24V28Z"/><path d="M12 2H20V4H12z"/>',
  'close-filled':  '<path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4L14.4,16L9,10.6L10.6,9L16,14.4L21.4,9L23,10.6L17.6,16L23,21.4L21.4,23z"/>',
  // aliases for topbar icon order keys
  'alerts':        '<path d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>',
  'messages':      '<path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z"/>',
  'help-circle':   '<path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/><circle cx="16" cy="23.5" r="1.5"/><path d="M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z"/>',
  'bell':          '<path d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>',
  'overflow-menu-vertical': '<circle cx="16" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="24" r="2"/>',
  'chevron--down':  '<path d="M16,22,6,12l1.4-1.4,8.6,8.6,8.6-8.6L26,12Z"/>',
  'filter--add':    '<polygon points="29.7,18.7 29.7,16.7 23.2,16.7 23.2,10.2 21.2,10.2 21.2,16.7 14.8,16.7 14.8,18.7 21.2,18.7 21.2,25.2 23.2,25.2 23.2,18.7"/><path d="M4,4C2.9,4,2,4.9,2,6v3.2c0,0.5,0.2,1,0.6,1.4L10,18v8c0,1.1,0.9,2,2,2h4c1.1,0,2-0.9,2-2v-2h-2v2h-4v-8.8l-0.6-0.6L4,9.2V6h20v2h2V6c0-1.1-0.9-2-2-2H4z"/>',
  'filter--remove': '<path d="M18,28H14a2,2,0,0,1-2-2V18.41L4.59,11A2,2,0,0,1,4,9.59V6A2,2,0,0,1,6,4H26a2,2,0,0,1,2,2V9.59A2,2,0,0,1,27.41,11L20,18.41V26A2,2,0,0,1,18,28ZM6,6V9.59l8,8V26h4V17.59l8-8V6Z"/><polygon points="29 15 27.586 13.586 25 16.172 22.414 13.586 21 15 23.586 17.586 21 20.172 22.414 21.586 25 19 27.586 21.586 29 20.172 26.414 17.586 29 15"/>',
  'filter--reset': '<path d="M18,28H14a2,2,0,0,1-2-2V18.41L4.59,11A2,2,0,0,1,4,9.59V6A2,2,0,0,1,6,4H26a2,2,0,0,1,2,2V9.59A2,2,0,0,1,27.41,11L20,18.41V26A2,2,0,0,1,18,28ZM6,6V9.59l8,8V26h4V17.59l8-8V6Z"/><polygon points="22,12 17,16 22,20 22,18 27,18 27,14 22,14"/>',
  // sidebar / navigation icons
  'group':            '<path d="M16,8a5,5,0,1,0,5,5A5,5,0,0,0,16,8Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,16,16Z"/><path d="M26,12a4,4,0,1,0,4,4A4,4,0,0,0,26,12Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,26,18Z"/><path d="M6,12a4,4,0,1,0,4,4A4,4,0,0,0,6,12Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,6,18Z"/><path d="M24.23,21.85A14.08,14.08,0,0,0,16,20a14.08,14.08,0,0,0-8.23,1.85A1,1,0,0,0,7.33,23V28h2V23.38A12.18,12.18,0,0,1,16,22a12.18,12.18,0,0,1,6.67,1.38V28h2V23A1,1,0,0,0,24.23,21.85Z"/><path d="M4,25.63V28H2V23A8,8,0,0,1,5,21.1a5.94,5.94,0,0,1-1.27-1.74A6,6,0,0,0,0,25V28H2V25.63A6.17,6.17,0,0,1,4,25.63Z"/><path d="M28.27,19.36A5.94,5.94,0,0,1,27,21.1,8,8,0,0,1,30,23v5h2V25A6,6,0,0,0,28.27,19.36Z"/>',
  'receipt':          '<path d="M26,2H6A2,2,0,0,0,4,4V30l4-2,4,2,4-2,4,2,4-2,4,2V4A2,2,0,0,0,26,2Zm0,26.18-2-1-4,2-4-2-4,2-4-2-2,1V4H26ZM9,10H23V12H9Zm0,6H23V18H9Zm0,6H17V24H9Z"/>',
  'undo':             '<path d="M20,10H7.815l3.587-3.586L10,5,4,11l6,6,1.402-1.402L7.818,12H20a6,6,0,0,1,0,12H12v2h8a8,8,0,0,0,0-16Z"/>',
  'task-complete':    '<path d="M25,4H7A2,2,0,0,0,5,6V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V6A2,2,0,0,0,25,4Zm0,24H7V6H25Zm-11-7.83-2.58-2.59L10,19l4,4,8-8-1.41-1.42Z"/><path d="M11,12H21V14H11Zm0,4H15V18H11Z"/>',
  'store':            '<path d="M28,4H4A2,2,0,0,0,2,6V12a2,2,0,0,0,1,1.72V28a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V13.72A2,2,0,0,0,30,12V6A2,2,0,0,0,28,4ZM4,6H28v6H4ZM18,28H14V22h4Zm9,0H20V22a2,2,0,0,0-2-2H14a2,2,0,0,0-2,2v6H5V14H27Z"/>',
  // LM sidebar icons (Carbon Design System)
  'report-data':      '<rect x="15" y="20" width="2" height="4"/><rect x="20" y="18" width="2" height="6"/><rect x="10" y="14" width="2" height="10"/><path d="M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z"/>',
  'network-3':        '<path d="M30,30H22V22h8Zm-6-2h4V24H24Z"/><path d="M20,27H8A6,6,0,0,1,8,15h2v2H8a4,4,0,0,0,0,8H20Z"/><path d="M20,20H12V12h8Zm-6-2h4V14H14Z"/><path d="M24,17H22V15h2a4,4,0,0,0,0-8H12V5H24a6,6,0,0,1,0,12Z"/><path d="M10,10H2V2h8ZM4,8H8V4H4Z"/>',
  'document-multiple':'<path d="M22,6H20V4H6A2,2,0,0,0,4,6V22H6V6H20V8h2V6ZM26,10H10A2,2,0,0,0,8,12V28A2,2,0,0,0,10,30H26A2,2,0,0,0,28,28V12A2,2,0,0,0,26,10Zm0,18H10V12H26Z"/>',
  'delivery':         '<path d="M4 16H16V18H4z"/><path d="M2 11H12V13H2z"/><path d="M29.9189,16.6064l-3-7A.9985.9985,0,0,0,26,9H23V7a1,1,0,0,0-1-1H6V8H21V20.5562A3.9924,3.9924,0,0,0,19.1421,23H12.8579a4,4,0,1,0,0,2h6.2842a3.9806,3.9806,0,0,0,7.7158,0H29a1,1,0,0,0,1-1V17A.9965.9965,0,0,0,29.9189,16.6064ZM9,26a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,9,26ZM23,11h2.3408l2.1431,5H23Zm0,15a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,23,26Zm5-3H26.8579A3.9954,3.9954,0,0,0,23,20V18h5Z"/>',
  'chart-column':     '<path d="M27,28V6H19V28H15V14H7V28H4V2H2V28a2,2,0,0,0,2,2H30V28ZM13,28H9V16h4Zm12,0H21V8h4Z"/>',
  'events':           '<path d="M26,14H24v2h2a3.0033,3.0033,0,0,1,3,3v4h2V19A5.0058,5.0058,0,0,0,26,14Z"/><path d="M24,4a3,3,0,1,1-3,3,3,3,0,0,1,3-3m0-2a5,5,0,1,0,5,5A5,5,0,0,0,24,2Z"/><path d="M23,30H21V28a3.0033,3.0033,0,0,0-3-3H14a3.0033,3.0033,0,0,0-3,3v2H9V28a5.0059,5.0059,0,0,1,5-5h4a5.0059,5.0059,0,0,1,5,5Z"/><path d="M16,13a3,3,0,1,1-3,3,3,3,0,0,1,3-3m0-2a5,5,0,1,0,5,5A5,5,0,0,0,16,11Z"/><path d="M8,14H6a5.0059,5.0059,0,0,0-5,5v4H3V19a3.0033,3.0033,0,0,1,3-3H8Z"/><path d="M8,4A3,3,0,1,1,5,7,3,3,0,0,1,8,4M8,2a5,5,0,1,0,5,5A5,5,0,0,0,8,2Z"/>',
  'file-system':      '<path d="M26,16H6V4H26ZM26,28H6V18H26ZM4,2V30a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V2a2,2,0,0,0-2-2H6A2,2,0,0,0,4,2ZM9,7h2v4H9ZM9,21h2v4H9Z"/>',
  'currency':         '<path d="M21,12V10H17V7H15v3H13a2.002,2.002,0,0,0-2,2v3a2.002,2.002,0,0,0,2,2h6v3H11v2h4v3h2V22h2a2.0023,2.0023,0,0,0,2-2V17a2.002,2.002,0,0,0-2-2H13V12Z"/><path d="M16,4A12,12,0,1,1,4,16,12.0353,12.0353,0,0,1,16,4m0-2A14,14,0,1,0,30,16,14.0412,14.0412,0,0,0,16,2Z"/>',
  'return':           '<path d="M22,8v2c2.2061,0,4,1.7944,4,4s-1.7939,4-4,4H10v-5l-6,6,6,6v-5H22c3.3086,0,6-2.6914,6-6S25.3086,8,22,8Z"/>',
  'white-paper':      '<path d="M19 10H26V12H19z"/><path d="M19 15H26V17H19z"/><path d="M19 20H26V22H19z"/><path d="M6 10H13V12H6z"/><path d="M6 15H13V17H6z"/><path d="M6 20H13V22H6z"/><path d="M28,5H4A2.002,2.002,0,0,0,2,7V25a2.002,2.002,0,0,0,2,2H28a2.002,2.002,0,0,0,2-2V7A2.002,2.002,0,0,0,28,5ZM4,7H15V25H4ZM17,25V7H28V25Z"/>',
  'document-import':  '<polygon points="28 19 14.83 19 17.41 16.41 16 15 11 20 16 25 17.41 23.59 14.83 21 28 21 28 19"/><path d="M24,14V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,16,2H6A2,2,0,0,0,4,4V28a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V26H22v2H6V4h8v6a2,2,0,0,0,2,2h6v2Zm-8-4V4.41L21.59,10Z"/>',
  // status / pill icons
  'calendar':          '<path d="M26,4h-4V2h-2v2h-8V2h-2v2H6C4.9,4,4,4.9,4,6v20c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C28,4.9,27.1,4,26,4z M26,26H6V12h20V26z M26,10H6V6h4v2h2V6h8v2h2V6h4V10z"/>',
  'check':             '<path d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"/>',
  'checkmark-filled':  '<path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z"/>',
  'ban':               '<path d="M16 2A14 14 0 1 0 30 16 14 14 0 0 0 16 2zm-12 14A12 12 0 0 1 22.9 5.41L5.41 22.9A11.93 11.93 0 0 1 4 16zm12 12a11.93 11.93 0 0 1-6.9-2.41L26.59 9.1A11.93 11.93 0 0 1 28 16 12 12 0 0 1 16 28z"/>',
  'refresh':           '<path d="M12 10H6.78A11 11 0 0 1 27 16h2A13 13 0 0 0 6 6.68V2H4v8h8zM20 22h5.22A11 11 0 0 1 5 16H3a13 13 0 0 0 23 9.32V30h2v-8H20z"/>',
  'warning':           '<path d="M16,23a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,23Z"/><path d="M15 12H17V21H15z"/><path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"/>',
  'arrow-right':       '<path d="M18 6L16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.607 18 26 28 16 18 6z"/>',
  // PlannerPro icons
  'planner-route':     '<path d="M28.78,8.22,23.56,3,22.14,4.41,25.73,8H4v2H25.73l-3.59,3.59,1.42,1.41,5.22-5.22A1,1,0,0,0,28.78,8.22Z"/><path d="M6.27,22H28V20H6.27l3.59-3.59L8.44,15,3.22,20.22a1,1,0,0,0,0,1.36L8.44,27l1.41-1.41Z"/>',
  'time':              '<path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/><polygon points="17 8 15 8 15 17 23 17 23 15 17 15 17 8"/>',
  'download':          '<path d="M26,24v4H6V24H4v4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V24Z"/><path d="M26,14,24.59,12.59,17,20.17V2H15V20.17L7.41,12.59,6,14,16,24Z"/>',
  'document-text':     '<path d="M25.7,9.3l-7-7A1,1,0,0,0,18,2H8A2,2,0,0,0,6,4V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V10A1,1,0,0,0,25.7,9.3ZM18,4.4,23.6,10H18ZM24,28H8V4h8v8h8Z"/><path d="M11,14H21V16H11Z"/><path d="M11,18H21V20H11Z"/><path d="M11,22H17V24H11Z"/>',
  'settings':          '<path d="M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.76l1.92-1.68A2,2,0,0,0,29.3,11.14l-2.36-4a2,2,0,0,0-2.37-.9L22.43,7a9.56,9.56,0,0,0-1.31-.75l-.51-2.14A2,2,0,0,0,18.64,2.5H13.92A2,2,0,0,0,12,4.11L11.44,6.26A9.56,9.56,0,0,0,10.13,7L7.83,6.24a2,2,0,0,0-2.37.9L3.1,11.14a2,2,0,0,0,.48,2.46L5.5,15.24c0,.25,0,.5,0,.76s0,.51,0,.76L3.58,18.44a2,2,0,0,0-.48,2.46l2.36,4a2,2,0,0,0,2.37.9l2.29-.77A9.56,9.56,0,0,0,11.44,25.74l.51,2.14A2,2,0,0,0,13.92,29.5h4.72a2,2,0,0,0,1.93-1.61l.51-2.14A9.56,9.56,0,0,0,22.23,25l2.29.77a2,2,0,0,0,2.37-.9l2.36-4a2,2,0,0,0-.48-2.46ZM26,19.14l1.28,1.12L25,24l-1.69-.57A7.64,7.64,0,0,1,21,24.77L20.41,27H17.59L17,24.77a7.64,7.64,0,0,1-2.32-1.34L13,24l-2.29-3.74,1.28-1.12a7.65,7.65,0,0,1,0-2.28L10.71,15.74,13,12l1.69.57A7.64,7.64,0,0,1,17,11.23L17.59,9h2.82L21,11.23a7.64,7.64,0,0,1,2.32,1.34L25,12l2.29,3.74-1.28,1.12A7.65,7.65,0,0,1,26,19.14Z"/><path d="M16,12a4,4,0,1,0,4,4A4,4,0,0,0,16,12Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,16,18Z"/>',
  'plan':              '<path d="M24,4H8A2,2,0,0,0,6,6V26a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V6A2,2,0,0,0,24,4ZM8,26V6H24V26Z"/><path d="M11 9H21V11H11z"/><path d="M11 13H21V15H11z"/><path d="M11 17H21V19H11z"/><path d="M11 21H16V23H11z"/>',
  'recently-viewed':   '<path d="M16,4A12,12,0,0,0,6.34,8.34L4,6V12h6L7.75,9.75A10,10,0,1,1,16,26V28A12,12,0,0,0,16,4Z"/><polygon points="17 8 15 8 15 17 23 17 23 15 17 15 17 8"/>',
  'data-base':         '<path d="M16,4C8.27,4,2,6.69,2,10V22c0,3.31,6.27,6,14,6s14-2.69,14-6V10C30,6.69,23.73,4,16,4ZM28,22c0,1.86-5.23,4-12,4S4,23.86,4,22V18.74A21.59,21.59,0,0,0,16,21a21.59,21.59,0,0,0,12-2.26ZM28,16c0,1.86-5.23,4-12,4S4,17.86,4,16V12.74A21.59,21.59,0,0,0,16,15a21.59,21.59,0,0,0,12-2.26ZM16,13C9.23,13,4,10.86,4,9s5.23-4,12-4,12,2.14,12,4S22.77,13,16,13Z"/>',

};

function iconSvg(name, size, color) {
  const inner = ICON_PATHS[name] || ICON_PATHS['apps'];
  return `<svg width="${size||16}" height="${size||16}" viewBox="0 0 32 32" fill="${color||'currentColor'}" aria-label="${name}"><title>${name}</title>${inner}</svg>`;
}

/* ── MAP PIN SVG ── */
function pinSVG({fill, selected, inner, badge, size}) {
  fill = fill || '#0C47C7';
  size = size || 58;
  const h = Math.round(size * 1.3);
  const gnd = selected
    ? `<ellipse cx="${size*.46}" cy="${h*.94}" rx="${size*.42}" ry="${size*.09}" fill="#2D2926"/>`
    : `<ellipse cx="${size*.45}" cy="${h*.92}" rx="${size*.18}" ry="${size*.05}" fill="rgba(0,0,0,.12)" filter="url(#blur)"/>`;

  let innerContent = '';
  if (inner === 'circle') {
    innerContent = `<circle cx="${size*.455}" cy="${h*.44}" r="${size*.21}" fill="white"/>`;
  } else if (inner === 'x') {
    const cx = size*.455, cy = h*.44, s = size*.14;
    innerContent = `<path d="M${cx-s} ${cy-s} L${cx+s} ${cy+s} M${cx+s} ${cy-s} L${cx-s} ${cy+s}" stroke="white" stroke-width="${size*.04}" stroke-linecap="round"/>`;
  } else if (inner === 'plus') {
    const cx = size*.455, cy = h*.44, s = size*.15;
    innerContent = `<path d="M${cx} ${cy-s} V${cy+s} M${cx-s} ${cy} H${cx+s}" stroke="white" stroke-width="${size*.04}" stroke-linecap="round"/>`;
  }

  const badgePart = badge !== null && badge !== undefined ? `
    <circle cx="${size*.83}" cy="${h*.04}" r="${size*.18}" fill="#4B82FA" stroke="white" stroke-width="${size*.04}"/>
    <text x="${size*.83}" y="${h*.04}" text-anchor="middle" dominant-baseline="central" fill="white" font-family="DM Sans,sans-serif" font-weight="700" font-size="${size*.13}">${badge}</text>` : '';

  const fillId = 'grad' + fill.replace('#','');
  return `<svg width="${size}" height="${h}" viewBox="0 0 ${size} ${h}" overflow="visible">
    <defs>
      <filter id="blur"><feGaussianBlur stdDeviation="${size*.03}"/></filter>
      <linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity="1"/>
        <stop offset="1" stop-color="white" stop-opacity=".35"/>
      </linearGradient>
    </defs>
    ${gnd}
    <path d="M${size*.455} ${h*.03} C${size*.7} ${h*.03} ${size*.91} ${h*.18} ${size*.91} ${h*.38} C${size*.91} ${h*.54} ${size*.83} ${h*.67} ${size*.73} ${h*.73} C${size*.65} ${h*.79} ${size*.54} ${h*.87} ${size*.515} ${h*.93} C${size*.508} ${h*.94} ${size*.503} ${h*.95} ${size*.455} ${h*.95} C${size*.41} ${h*.95} ${size*.40} ${h*.94} ${size*.395} ${h*.93} C${size*.37} ${h*.87} ${size*.26} ${h*.79} ${size*.18} ${h*.73} C${size*.08} ${h*.67} ${size*.0} ${h*.54} ${size*.0} ${h*.38} C${size*.0} ${h*.18} ${size*.21} ${h*.03} ${size*.455} ${h*.03} Z" fill="${fill}"/>
    <path d="M${size*.455} ${h*.03} C${size*.7} ${h*.03} ${size*.91} ${h*.18} ${size*.91} ${h*.38} C${size*.91} ${h*.54} ${size*.83} ${h*.67} ${size*.73} ${h*.73} C${size*.65} ${h*.79} ${size*.54} ${h*.87} ${size*.515} ${h*.93} C${size*.508} ${h*.94} ${size*.503} ${h*.95} ${size*.455} ${h*.95} C${size*.41} ${h*.95} ${size*.40} ${h*.94} ${size*.395} ${h*.93} C${size*.37} ${h*.87} ${size*.26} ${h*.79} ${size*.18} ${h*.73} C${size*.08} ${h*.67} ${size*.0} ${h*.54} ${size*.0} ${h*.38} C${size*.0} ${h*.18} ${size*.21} ${h*.03} ${size*.455} ${h*.03} Z" fill="none" stroke="url(#${fillId})" stroke-width="${size*.03}"/>
    ${innerContent}
    ${badgePart}
  </svg>`;
}

/* ================================================================
   RENDERERS OBJECT
================================================================ */
/* ── TABLE HELPERS — module-level so tablepage() can call tblDemoTable() ── */
const _tblSortBoth = `<svg class="tbl-sort" width="9" height="9" viewBox="0 0 32 32" fill="currentColor"><path d="M16 4L6 16h20L16 4zm0 24L6 16h20l-10 12z"/></svg>`;
const _tblSortAsc  = `<svg class="tbl-sort" width="9" height="9" viewBox="0 0 32 32" fill="currentColor"><path d="M6 20h20L16 8z"/></svg>`;

function tblRc(cell, extraCls) {
  const cls = extraCls ? ` class="${extraCls}"` : '';
  if (cell === null || cell === undefined) return `<td${cls}></td>`;
  if (typeof cell !== 'object') return `<td${cls}>${escHtml(String(cell))}</td>`;

  switch (cell.type) {
    case 'checkbox':
      return `<td class="tbl-cb-td${extraCls?' '+extraCls:''}"><div class="tbl-cb"><input type="checkbox"${cell.value?' checked':''} onclick="tblRowSel(this)"></div></td>`;

    case 'avatar-text': {
      const ini = cell.initials || (cell.value||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      return `<td${cls}><div class="tbl-av"><div class="tbl-av-dot" style="background:${cell.color||'#1F60ED'}">${escHtml(ini)}</div><span>${escHtml(cell.value||'')}</span></div></td>`;
    }

    case 'text-icon':
    case 'icon-text': {
      const ico = iconSvg(cell.icon||'location', 14, 'var(--n5)');
      return `<td${cls}><div class="tbl-ti">${ico}<span>${escHtml(cell.value||'')}</span></div></td>`;
    }

    case 'text-icon-right': {
      const ico = iconSvg(cell.icon||'document', 14, 'var(--n5)');
      return `<td${cls}><div class="tbl-ti">${escHtml(cell.value||'')} ${ico}</div></td>`;
    }

    case 'text-sub':
      return `<td${cls}><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span><span style="display:block;font:400 11px var(--font-sans);color:var(--n5);line-height:1.3;margin-top:2px">${escHtml(cell.sub||'')}</span></td>`;

    case 'text-error':
      return `<td${cls}><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span><span style="display:block;font:400 11px var(--font-sans);color:var(--r6);line-height:1.3;margin-top:2px">${escHtml(cell.error||'')}</span></td>`;

    case 'text-icon-error': {
      const ico = iconSvg('close-filled', 14, 'var(--r6)');
      return `<td${cls}><div style="display:flex;align-items:center;gap:6px">${ico}<span style="font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span></div><span style="display:block;font:400 11px var(--font-sans);color:var(--r6);line-height:1.3;margin-top:2px">${escHtml(cell.error||'')}</span></td>`;
    }

    case 'sub-header':
      return `<td${cls}><span style="display:block;font:400 11px var(--font-sans);color:var(--n5);line-height:1.3">${escHtml(cell.sub||cell.label||'')}</span><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3;margin-top:2px">${escHtml(cell.value||'')}</span></td>`;

    case 'link':
      return `<td class="cell-lnk${extraCls?' '+extraCls:''}">${escHtml(cell.value||'')}</td>`;

    case 'badge':
      return `<td${cls}>${badgeHtml(cell.value||'', cell.variant||'neutral')}</td>`;

    case 'date':
      return `<td${cls}>${escHtml(cell.value||'')}</td>`;

    case 'number':
      return `<td class="cell-num${extraCls?' '+extraCls:''}">${escHtml(String(cell.value||''))}</td>`;

    case 'text-secondary':
      return `<td class="cell-muted${extraCls?' '+extraCls:''}">${escHtml(cell.value||'')}</td>`;

    case 'rating': {
      const n = Math.round(cell.value||0);
      const uid = 'sr'+Math.random().toString(36).slice(2,7);
      const stars = [1,2,3,4,5].map(i =>
        `<span class="star${i<=n?' on':''}" onclick="starSet(this)" onmouseenter="starHov(this,true)" onmouseleave="starHov(this,false)">★</span>`
      ).join('');
      return `<td${cls}><div class="tbl-stars" id="${uid}">${stars}</div></td>`;
    }

    case 'switch': {
      const on = cell.value ? ' on' : '';
      return `<td${cls}><div class="tbl-sw-track${on}" onclick="this.classList.toggle('on')"><div class="tbl-sw-thumb"></div></div></td>`;
    }

    case 'switch-text': {
      const on = cell.value ? ' on' : '';
      const lbl = escHtml(cell.label || (cell.value ? 'On' : 'Off'));
      return `<td${cls}><div class="tbl-sw-wrap"><div class="tbl-sw-track${on}" onclick="this.classList.toggle('on')"><div class="tbl-sw-thumb"></div></div><span>${lbl}</span></div></td>`;
    }

    case 'chip-lg':
      return `<td${cls}><span class="tbl-chip lg">${escHtml(cell.value||'')}</span></td>`;

    case 'chip-sm':
      return `<td${cls}><span style="display:inline-flex;align-items:center;height:22px;padding:2px 6px;border-radius:4px;border:1px solid var(--n4);background:var(--n2);color:var(--n6);font:600 11px/1 var(--font-sans);white-space:nowrap">${escHtml(cell.value||'')}</span></td>`;

    case 'pill-new':
      return `<td${cls}><span style="display:inline-flex;align-items:center;height:22px;padding:2px 6px;border-radius:4px;border:1px solid var(--b3);background:var(--b1);color:var(--b6);font:600 11px/1 var(--font-sans);white-space:nowrap">${escHtml(cell.value||'New')}</span></td>`;

    case 'loading-bar': {
      const pct = Math.min(100, Math.max(0, cell.value||0));
      return `<td${cls}><div class="tbl-bar-wrap"><div class="tbl-bar"><div class="tbl-bar-fill" style="width:${pct}%"></div></div><span class="tbl-bar-pct">${pct}%</span></div></td>`;
    }

    case 'lazy':
      return `<td${cls}><div class="tbl-skel cell"></div></td>`;

    case 'actions': {
      const acts = cell.value || [];
      let btns;
      if (acts.length <= 2) {
        btns = acts.map(act =>
          `<button class="tbl-act-btn" onclick="return false" title="${escHtml(act)}">${iconSvg(act,14)}</button>`
        ).join('');
      } else {
        const overflow = acts.slice(1);
        const dataActs = JSON.stringify(overflow).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        btns = `<button class="tbl-act-btn" onclick="return false" title="${escHtml(acts[0])}">${iconSvg(acts[0],14)}</button>` +
          `<button class="tbl-act-btn" data-acts="${dataActs}" onclick="tblMenu(this)" title="More options">${iconSvg('overflow-menu-vertical',14)}</button>`;
      }
      return `<td class="tbl-acts-col${extraCls?' '+extraCls:''}"><div class="tbl-acts">${btns}</div></td>`;
    }

    default:
      return `<td${cls}>${escHtml(String(cell.value!==undefined?cell.value:''))}</td>`;
  }
}

function tblRh(col, actsCls) {
  const extra = actsCls ? ` class="${actsCls}"` : '';
  if (col.type === 'lazy') {
    return `<th${extra}><div class="tbl-skel hd"></div></th>`;
  }
  const w = col.type === 'checkbox' ? ' style="width:40px"' : '';
  const sv = col.sort==='asc' ? _tblSortAsc : col.sort==='desc' ? _tblSortDesc : col.sortable ? _tblSortBoth : '';
  if (col.sub) {
    return `<th${w}${extra}><div class="tbl-hd-stack"><span class="tbl-hd-sub">${escHtml(col.sub)}</span><span>${escHtml(col.label||'')}${sv}</span></div></th>`;
  }
  if (col.type === 'actions') {
    return `<th class="tbl-acts-col" style="text-align:center"${w}>${escHtml(col.label||'')}</th>`;
  }
  return `<th${w}${extra}>${escHtml(col.label||'')}${sv}</th>`;
}

function tblRr(row, cols) {
  const cls = row.state==='hover'?'hov':row.state==='selected'?'sel':row.state==='disabled'?'dis':'';
  const cells = (row.cells||[]).map((c,i) => {
    const colType = cols && cols[i] ? cols[i].type : null;
    return tblRc(c);
  }).join('');
  return `<tr${cls?' class="'+cls+'"':''  }>${cells}</tr>`;
}

function tblDemoTable(def) {
  const cols = def.columns || [];
  const hasCb = cols.some(c => c.type === 'checkbox');
  const hasActs = cols.some(c => c.type === 'actions');
  const isBulk = hasCb && hasActs;

  let bulkBarHtml = '';
  if (isBulk) {
    const actsSet = new Set();
    (def.rows||[]).forEach(row => {
      (row.cells||[]).forEach(cell => {
        if (cell && cell.type === 'actions') {
          (cell.value||[]).filter(a => a !== 'edit').forEach(a => actsSet.add(a));
        }
      });
    });
    const bulkBtns = [...actsSet].map(act =>
      `<button class="tbl-bulk-btn" onclick="return false" title="${escHtml(act)}">${iconSvg(act,14,'currentColor')}<span>${escHtml(act.charAt(0).toUpperCase()+act.slice(1))}</span></button>`
    ).join('');
    bulkBarHtml = `<div class="tbl-bulk-bar"><span class="tbl-bulk-cnt"></span><div class="tbl-bulk-actions">${bulkBtns}</div></div>`;
  }

  let head;
  if (isBulk) {
    const masterCb = `<div class="tbl-cb"><input type="checkbox" onclick="tblMaster(this)" style="width:14px;height:14px;accent-color:var(--b5);cursor:pointer"></div>`;
    head = cols.map(c => {
      if (c.type === 'checkbox') return `<th style="width:40px;padding:10px 0;text-align:center">${masterCb}</th>`;
      if (c.type === 'actions') return `<th class="tbl-acts-col" style="text-align:center">${escHtml(c.label||'')}</th>`;
      const sv = c.sort==='asc' ? _tblSortAsc : c.sort==='desc' ? _tblSortDesc : c.sortable ? _tblSortBoth : '';
      if (c.sub) return `<th><div class="th-inner"><div class="tbl-hd-stack"><span class="tbl-hd-sub">${escHtml(c.sub)}</span><span>${escHtml(c.label||'')}${sv}</span></div></div></th>`;
      return `<th><div class="th-inner">${escHtml(c.label||'')}${sv}</div></th>`;
    }).join('');
  } else {
    head = cols.map(c => tblRh(c)).join('');
  }

  const body = (def.rows||[]).map(r => tblRr(r, cols)).join('');
  return `<div class="tbl-outer">${bulkBarHtml}<div class="tbl-wrap"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
}

const renderers = {

  /* ── OVERVIEW ── */
  overview(data) {
    const d = data.dashboard || {};

    const stats = (d.stats || []).map(s => `
      <div class="dash-stat">
        <div class="ds-lbl">${escHtml(s.label)}</div>
        <div class="ds-val"${s.id ? ` id="${s.id}"` : ''}>${escHtml(s.value)}</div>
        <div class="ds-trend"${s.id ? ` id="${s.id}-trend"` : ''}>${escHtml(s.trend)}</div>
      </div>`).join('');

    const warnIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--o7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const infoIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    const a11yItems = (d.a11yWarnings || []).map(w => `
      <a class="a11y-item" href="#${w.id}" onclick="navigate('${escHtml(w.id)}');return false;">
        <div class="a11y-icon ${w.severity === 'warning' ? 'warn' : 'info'}">${w.severity === 'warning' ? warnIcon : infoIcon}</div>
        <div class="a11y-body">
          <div class="ab-comp">${escHtml(w.component)}</div>
          <div class="ab-issue">${escHtml(w.issue)}</div>
        </div>
      </a>`).join('');

    const warnCount = (d.a11yWarnings || []).filter(w => w.severity === 'warning').length;
    const infoCount = (d.a11yWarnings || []).filter(w => w.severity === 'info').length;
    const badgeParts = [];
    if (warnCount) badgeParts.push(`<span class="badge bo">${warnCount} warning${warnCount > 1 ? 's' : ''}</span>`);
    if (infoCount) badgeParts.push(`<span class="badge bb">${infoCount} info</span>`);

    const dashboard = `
      <div style="margin-bottom:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h2 style="font:700 16px var(--font-sans);color:var(--n7);margin:0;display:flex;align-items:center;gap:8px">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </h2>
          <span style="font:400 11px var(--font-sans);color:var(--n5)">${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
        </div>
        <div class="dash-stats">${stats}</div>
        <div class="dash-panels">
          <div class="dash-feed">
            <div class="dash-feed-hdr">
              <span class="ttl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Latest updates
              </span>
            </div>
            <div id="dash-activity"><div style="padding:18px 16px;font:400 12px var(--font-sans);color:var(--n5)">Loading…</div></div>
          </div>
          <div class="dash-a11y">
            <div class="dash-warn-hdr">
              <span class="ttl">
                ${warnIcon}
                Accessibility
              </span>
              <div style="display:flex;gap:5px">${badgeParts.join('')}</div>
            </div>
            ${a11yItems || '<div style="padding:18px 16px;font:400 12px var(--font-sans);color:var(--n5)">No issues found.</div>'}
          </div>
        </div>
      </div>`;

    const products = (data.products || []).map(p => `
      <div class="prod-card" style="border-top:3px solid ${p.hex}">
        <div style="font:700 13px var(--font-sans)">${p.name}</div>
        <div style="font:500 10px var(--font-mono);color:var(--n5);margin:3px 0">${p.hex}</div>
        <div style="font:400 11px var(--font-sans);color:var(--n5)">${p.description}</div>
      </div>`).join('');

    const repoRows = (data.repoStructure || []).map(r =>
      `<div>${r.icon} <strong>${escHtml(r.name)}</strong> — ${escHtml(r.desc)}</div>`).join('');

    const tokenCode = data.install ? data.install.tokens : '';

    return `
      ${sectionHeader(data)}
      ${dashboard}
      <div class="card">
        <h3 style="margin:0 0 14px;font:700 14px var(--font-sans)">What's inside this repo</h3>
        <div class="prod-grid">${products}</div>
      </div>
      <div class="card flush">
        <div class="card-hdr"><span class="ttl">colors_and_type.css</span><span class="meta">v2.4 · 8.2 KB</span></div>
        <div class="code"><button class="cp" onclick="copyCode(this)">Copy</button><pre><span class="cm">/* Instalar: npm install @beetrack/hp-tokens-style */</span>
<span class="kw">@import</span> <span class="str">'~@beetrack/hp-tokens-style'</span>;

<span class="cm">/* O carga las fuentes directamente */</span>
<span class="kw">@import</span> <span class="str">url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&amp;display=swap')</span>;

<span class="cm">/* Tokens clave de colors.scss */</span>
${tokenCode.split('\n').map(l => `<span class="tg">${escHtml(l.split(':')[0])}</span>:${escHtml(l.split(':').slice(1).join(':'))}`).join('\n')}</pre></div>
      </div>
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Repository structure</h3>
      <div class="card" style="background:var(--n1)">
        <div style="font:400 12px var(--font-mono);color:var(--n7);line-height:2">${repoRows}</div>
      </div>`;
  },

  /* ── BRAND ── */
  brand(data) {
    const products = (data.products || []).map(p => `
      <div style="height:100px;background:${p.hex};border-radius:8px;display:flex;flex-direction:column;justify-content:flex-end;padding:12px;color:#fff">
        <b style="font-size:13px">${p.name}</b>
        <span style="font:400 10px var(--font-mono);opacity:.85">${p.hex}</span>
        <span style="font:400 11px var(--font-sans);opacity:.8;margin-top:2px">${p.description}</span>
      </div>`).join('');

    const hp = data.honeypotBrand || {};
    return `
      ${sectionHeader(data)}
      <div class="card" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        ${products}
      </div>
      <div class="card" style="margin-top:0">
        <h3 style="font:700 13px var(--font-sans);margin:0 0 10px;color:var(--n7)">Honeypot brand</h3>
        <div style="display:flex;gap:10px">
          ${hp.primary ? `<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:4px;background:${hp.primary};border:1px solid rgba(0,0,0,.08)"></div><code style="font:500 11px var(--font-mono)">${hp.primary} · $hp-primary</code></div>` : ''}
          ${hp.secondary ? `<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:4px;background:${hp.secondary};border:1px solid rgba(0,0,0,.08)"></div><code style="font:500 11px var(--font-mono)">${hp.secondary} · $hp-secondary</code></div>` : ''}
          ${hp.tertiary ? `<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:4px;background:${hp.tertiary};border:1px solid rgba(0,0,0,.08)"></div><code style="font:500 11px var(--font-mono)">${hp.tertiary} · $hp-tertiary</code></div>` : ''}
        </div>
      </div>`;
  },

  /* ── VOICE ── */
  voice(data) {
    const guidelines = (data.guidelines || []).map(g =>
      `<li style="margin-bottom:8px">${g.text}</li>`).join('');

    const examples = (data.examples || []).map(e => {
      const isDo = e.type === 'do';
      return `<div class="vc ${isDo ? 'good' : 'bad'}">
        <div class="vl">${isDo ? '✓ Do' : '✗ Don\'t'}</div>
        <div class="vx">${e.text}</div>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card" style="margin-bottom:12px">
        <ul style="margin:0;padding-left:16px;line-height:2;font-size:13px;color:var(--n7)">${guidelines}</ul>
      </div>
      <div class="voice-grid">${examples}</div>`;
  },

  /* ── COLORS ── */
  colors(data) {
    const CS = `<style>
      .cs-section{margin-bottom:40px}
      .cs-scale-title{font:700 22px/1.2 var(--font-sans);color:var(--n7);margin:0 0 2px}
      .cs-scale-sub{font:400 12px var(--font-sans);color:var(--n5);margin:0 0 14px;display:block}
      .cs-strip{display:flex;overflow:hidden;border:1px solid var(--n3);border-radius:8px}
      .cs-strip.cs-below{border-top:none;border-radius:0 0 8px 8px}
      .cs-sw{flex:1;padding:14px 10px 12px;min-height:108px;display:flex;flex-direction:column;justify-content:flex-end;gap:1px;transition:filter .12s;border-right:1px solid rgba(0,0,0,.07)}
      .cs-sw:last-child{border-right:none}
      .cs-sw:hover{filter:brightness(.9)}
      .cs-sw-name{font:400 13px/1.3 var(--font-sans)}
      .cs-sw-hex{font:400 11px/1.5 var(--font-sans)}
      .cs-sw-meta{font:400 10px/1.4 var(--font-sans);opacity:.75}
      /* neutral special row */
      .cs-special{display:flex;overflow:hidden;border:1px solid var(--n3);border-radius:8px 8px 0 0;border-bottom:none}
      .cs-sp-white{flex:1.2;padding:14px 10px 12px;min-height:128px;display:flex;flex-direction:column;justify-content:flex-end;gap:1px;background:#fff;color:#39414D;border-right:1px solid rgba(0,0,0,.07)}
      .cs-sp-large{flex:2;padding:14px 10px 12px;min-height:128px;display:flex;flex-direction:column;justify-content:flex-end;gap:1px;border-right:1px solid rgba(255,255,255,.12)}
      .cs-sp-large:last-child{border-right:none}
      /* opacity */
      .op-block{display:flex;align-items:stretch;border-radius:8px;overflow:hidden;margin-bottom:3px}
      .op-label-cell{width:136px;flex-shrink:0;padding:14px 14px;display:flex;align-items:center;font:400 13px var(--font-sans)}
      .op-swatches{flex:1;display:flex;overflow:hidden}
      .op-sw{flex:1;padding:14px 10px 12px;min-height:88px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;border-left:1px solid rgba(0,0,0,.07)}
      .op-sw-name{font:400 11px/1.3 var(--font-sans)}
      .op-sw-desc{font:400 10px/1.3 var(--font-sans);opacity:.7}
    </style>`;

    function csw(s) {
      const tc = isLight(s.hex) ? '#39414D' : '#fff';
      return `<div class="cs-sw color-sw" style="background:${s.hex};color:${tc}"
        onclick="copyToClipboard('${s.hex}',this)" title="Copy ${s.hex}">
        <div class="cs-sw-name">${escHtml(s.label)}</div>
        <div class="cs-sw-hex">Hex: ${s.hex}</div>
        ${s.hsb ? `<div class="cs-sw-meta">HSB: ${escHtml(s.hsb)}</div>` : ''}
        ${s.hcl != null ? `<div class="cs-sw-meta">HCL: ${s.hcl}</div>` : ''}
        ${s.use ? `<div class="cs-sw-meta">Use: ${escHtml(s.use)}</div>` : ''}
      </div>`;
    }

    const neutralScale = (data.scales || []).find(s => s.id === 'neutral');
    let neutralHtml = '';
    if (neutralScale) {
      const specCells = (neutralScale.special || []).map((s, i) => {
        const tc = isLight(s.hex) ? '#39414D' : '#fff';
        const cls = i === 0 ? 'cs-sp-white color-sw' : 'cs-sp-large color-sw';
        return `<div class="${cls}" style="${i > 0 ? `background:${s.hex};color:${tc}` : ''}"
          onclick="copyToClipboard('${s.hex}',this)" title="Copy ${s.hex}">
          <div class="cs-sw-name">${escHtml(s.label)}</div>
          <div class="cs-sw-hex">Hex: ${s.hex}</div>
          ${s.hcl != null ? `<div class="cs-sw-meta">HCL: ${s.hcl}</div>` : ''}
        </div>`;
      }).join('');
      const nCells = (neutralScale.swatches || []).map(s => csw(s)).join('');
      neutralHtml = `<div class="cs-section">
        <p class="cs-scale-title">${escHtml(neutralScale.label)}</p>
        ${neutralScale.group ? `<span class="cs-scale-sub">${escHtml(neutralScale.group)}</span>` : ''}
        <div class="cs-special">${specCells}</div>
        <div class="cs-strip cs-below">${nCells}</div>
      </div>`;
    }

    const colorScales = (data.scales || []).filter(s => s.id !== 'neutral').map(scale => {
      const cells = (scale.swatches || []).map(s => csw(s)).join('');
      return `<div class="cs-section">
        <p class="cs-scale-title">${escHtml(scale.label)}</p>
        <div class="cs-strip">${cells}</div>
      </div>`;
    }).join('');

    let opacityHtml = '';
    const op = data.opacity;
    if (op) {
      const darkCells = (op.dark || []).map(o =>
        `<div class="op-sw color-sw" style="background:${o.css};" onclick="copyToClipboard('${escHtml(o.label)}',this)" title="Copy ${escHtml(o.label)}">
          <div class="op-sw-name" style="color:#39414D">${escHtml(o.label)}</div>
          <div class="op-sw-desc" style="color:#39414D">${escHtml(o.desc)}</div>
        </div>`).join('');
      const lightCells = (op.light || []).map(o =>
        `<div class="op-sw color-sw" style="background:${o.css};border-left-color:rgba(255,255,255,.12)" onclick="copyToClipboard('${escHtml(o.label)}',this)" title="Copy ${escHtml(o.label)}">
          <div class="op-sw-name" style="color:#fff">${escHtml(o.label)}</div>
          <div class="op-sw-desc" style="color:#fff">${escHtml(o.desc)}</div>
        </div>`).join('');
      opacityHtml = `<div class="cs-section">
        <p class="cs-scale-title">${escHtml(op.label || 'Opacity scale')}</p>
        <div class="op-block" style="background:#fff;border:1px solid var(--n3);margin-bottom:3px">
          <div class="op-label-cell" style="color:var(--n7)">Dark Opacity</div>
          <div class="op-swatches">${darkCells}</div>
        </div>
        <div class="op-block" style="background:#132045">
          <div class="op-label-cell" style="color:#fff">Light Opacity</div>
          <div class="op-swatches">${lightCells}</div>
        </div>
      </div>`;
    }

    const semRows = (data.semanticTokens || []).map(t =>
      `<tr>
        <td><div style="width:36px;height:36px;border-radius:4px;background:${t.hex};border:1px solid rgba(19,32,69,.1);cursor:pointer" onclick="copyToClipboard('${t.hex}',this)"></div></td>
        <td><code>${escHtml(t.name)}</code></td>
        <td><code>${t.hex}</code>${t.sub ? ` <span style="color:var(--n5);font-size:10px">· ${t.sub}</span>` : ''}</td>
        <td style="color:var(--n5)">${escHtml(t.use)}</td>
      </tr>`).join('');

    return `${CS}
      ${sectionHeader(data)}
      ${neutralHtml}
      ${colorScales}
      ${opacityHtml}
      ${semRows ? `<div class="cs-section">
        <p class="cs-scale-title" style="font-size:18px">Design tokens</p>
        <span class="cs-scale-sub">Semantic <code>$dt-*</code> variables</span>
        <table class="ttbl">
          <thead><tr><th style="width:56px">Swatch</th><th>Token</th><th>Hex</th><th>Use</th></tr></thead>
          <tbody>${semRows}</tbody>
        </table>
      </div>` : ''}`;
  },

  /* ── TYPOGRAPHY ── */
  typography(data) {
    const fonts = (data.fonts || []).map(f => `
      <div>
        <div style="font:500 10px var(--font-sans);letter-spacing:.1em;text-transform:uppercase;color:var(--n5);margin-bottom:7px">${escHtml(f.family)} ${f.token ? `— <code>${escHtml(f.token)}</code>` : ''}</div>
        <div style="font:700 32px/1.1 'DM Sans',sans-serif;letter-spacing:-.02em;color:var(--n7)">${escHtml(f.specimen)}</div>
        ${f.sample ? `<div style="font:400 14px/20px 'DM Sans',sans-serif;color:var(--n7);margin-top:7px">${escHtml(f.sample)}</div>` : ''}
        <div style="font:400 12px 'DM Sans',sans-serif;color:var(--n5);margin-top:7px">${escHtml(f.note)}</div>
      </div>`).join('');

    function weightLabel(w) {
      return w >= 700 ? 'Bold' : w >= 600 ? 'Semi-bold' : w >= 500 ? 'Medium' : 'Regular';
    }

    const scaleRows = (data.scale || []).map(s => {
      const style = `font-style:${s.italic ? 'italic' : 'normal'}`;
      const preview = `<div style="font:${s.weight} ${s.size}px/${s.lineHeight}px 'DM Sans',sans-serif;${style};color:var(--n7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(s.sample)}</div>`;
      const spec    = `<span style="font:400 11px 'DM Sans',sans-serif;color:var(--n5)">${s.size}/${s.lineHeight}px · ${weightLabel(s.weight)}${s.italic ? ' Italic' : ''}</span>`;
      const tokenEl = s.token ? `<code style="font:400 10px 'DM Sans',sans-serif;color:var(--n45)">${escHtml(s.token)}</code>` : '';

      return `
        <tr style="border-bottom:1px solid var(--n3)">
          <td style="padding:14px 16px;vertical-align:middle;width:160px;white-space:nowrap">
            <div style="font:700 12px 'DM Sans',sans-serif;color:var(--n7)">${escHtml(s.name)}</div>
            <div style="margin-top:3px">${tokenEl}</div>
          </td>
          <td style="padding:14px 16px;vertical-align:middle;border-left:1px solid var(--n3)">
            ${preview}
            <div style="margin-top:4px">${spec}</div>
          </td>
        </tr>`;
    }).join('');

    const ruleNote = data.rule ? `
      <div class="bn in" style="margin-bottom:14px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style="font:400 13px 'DM Sans',sans-serif;color:var(--n7)"><strong>Rule:</strong> ${escHtml(data.rule)}</span>
      </div>` : '';

    return `
      ${sectionHeader(data)}
      <div class="card" style="margin-bottom:12px">
        <div>${fonts}</div>
      </div>
      ${ruleNote}
      <div class="card flush">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:var(--n2);border-bottom:1px solid var(--n4)">
              <th style="padding:10px 16px;font:700 12px 'DM Sans',sans-serif;text-align:left;color:var(--n7);width:160px">Style · Token</th>
              <th style="padding:10px 16px;font:700 12px 'DM Sans',sans-serif;text-align:left;color:var(--n7);border-left:1px solid var(--n3)">Preview · Specs</th>
            </tr>
          </thead>
          <tbody>${scaleRows}</tbody>
        </table>
      </div>`;
  },

  /* ── SPACING ── */
  spacing(data) {
    const rows = (data.scale || []).map(s => `
      <div class="sp-row">
        <div class="sp-tok">${escHtml(s.token)}</div>
        <div class="sp-val">${s.px}px</div>
        <div class="sp-bar" style="width:${s.px}px"></div>
        <div class="sp-use">${s.use}</div>
      </div>`).join('');

    return `
      ${sectionHeader(data)}
      <div class="card">${rows}</div>`;
  },

  /* ── RADII ── */
  radii(data) {
    const cells = (data.scale || []).map(s => {
      let preview;
      if (s.special === 'pill') {
        preview = `<div class="r-pill-box"></div>`;
      } else if (s.special === 'topbar') {
        preview = `<div class="r-topbar" style="border-radius:${s.px}px 0 0 0"></div>`;
      } else {
        preview = `<div class="r-box" style="border-radius:${s.px}px"></div>`;
      }
      return `<div class="r-cell">
        ${preview}
        <div class="r-lbl">${escHtml(s.label)}</div>
        <div class="r-sub">${escHtml(s.use)}</div>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card">
        <div class="radii-grid">${cells}</div>
      </div>`;
  },

  /* ── SHADOWS ── */
  shadows(data) {
    const levels = (data.levels || []).map(l => `
      <div class="sh-cell">
        <div class="sh-box" style="box-shadow:${l.css}"></div>
        <div style="font:600 11px var(--font-sans);color:var(--n7)">${escHtml(l.name)}</div>
        <div style="font:400 10px var(--font-mono);color:var(--n5)">${l.css.replace('rgba(0,0,0,0.15)','').trim()}</div>
        <div style="font:400 10px var(--font-sans);color:var(--n5);margin-top:2px">${escHtml(l.description)}</div>
      </div>`).join('');

    const focus = data.focusRing || {};
    return `
      ${sectionHeader(data)}
      <div class="card">
        <div class="sh-grid" style="grid-template-columns:repeat(5,1fr)">${levels}</div>
        <div style="margin-top:20px;text-align:center">
          <div class="sh-box" style="box-shadow:${focus.css || '0 0 0 3px rgba(75,130,250,.25)'};border-color:var(--b5);max-width:220px;margin:0 auto"></div>
          <div style="font:600 11px var(--font-sans);color:var(--n7);margin-top:7px">focus-ring</div>
          <div style="font:400 10px var(--font-mono);color:var(--n5);margin-top:3px">${focus.css || ''} — ${focus.description || ''}</div>
        </div>
      </div>`;
  },

  /* ── ICONOGRAPHY ── */
  iconography(data) {
    const lib = data.library || {};

    const renderIconGrid = (list) => list.map(([name, inner, tag]) => `
      <div class="icon-cell">
        <svg viewBox="0 0 32 32" fill="currentColor">${inner}</svg>
        <span class="ic-lbl">${escHtml(name.toLowerCase())}</span>
        ${tag ? `<span class="ic-tag">${escHtml(tag)}</span>` : ''}
      </div>`).join('');

    let iconContent = '';
    if (data.categories && data.categories.length) {
      iconContent = data.categories.map(cat => `
        <div class="card" style="margin-bottom:10px">
          <div class="card-hdr"><span class="ttl">${escHtml(cat.label)}</span></div>
          <div class="icon-grid" style="padding:14px 14px 10px">${renderIconGrid(cat.icons)}</div>
        </div>`).join('');
    } else {
      iconContent = `<div class="card"><div class="icon-grid">${renderIconGrid(data.icons || [])}</div></div>`;
    }

    const order = (data.topbarOrder || []).map((n,i) =>
      `<span style="font:500 12px var(--font-sans);color:var(--n5)">${i+1} · ${n}</span>`).join('');

    const libBadge = lib.name ? `
      <div class="card" style="margin-bottom:14px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="var(--b5)"><path d="M8,4V8H4V4Zm2-2H2v8h8Zm8,2V8H14V4Zm2-2H12v8h8Zm8,2V8H24V4Zm2-2H22v8h8ZM8,14v4H4V14Zm2-2H2v8h8Zm8,2v4H14V14Zm2-2H12v8h8Zm8,2v4H24V14Zm2-2H22v8h8ZM8,24v4H4V24Zm2-2H2v8h8Zm8,2v4H14V24Zm2-2H12v8h8Zm8,2v4H24V24Zm2-2H22v8h8Z"/></svg>
        <div>
          <div style="font:600 13px var(--font-sans);color:var(--n7)">${escHtml(lib.name)} <span style="font-weight:400;color:var(--n5)">by ${escHtml(lib.vendor)}</span></div>
          <div style="font:400 11px var(--font-mono);color:var(--n5);margin-top:2px">${escHtml(lib.package)}@${escHtml(lib.version)} · ${escHtml(lib.viewBox)} · ${escHtml(lib.style)}-based · <a href="${escHtml(lib.cdnBase)}" target="_blank" style="color:var(--b5)">${escHtml(lib.cdnBase)}</a></div>
        </div>
      </div>` : '';

    return `
      ${sectionHeader(data)}
      ${libBadge}
      ${iconContent}
      ${order ? `<div class="card flush" style="margin-top:10px">
        <div class="card-hdr"><span class="ttl">Topbar icon order (invariable)</span></div>
        <div style="padding:14px;display:flex;gap:20px;align-items:center">${order}</div>
      </div>` : ''}`;
  },

  /* ── BUTTONS ── */
  buttons(data) {
    const t  = data.tokens || {};
    const mt = data.mobileTokens || {};

    function renderStates(states, height, padding, fontSize, fontWeight, lineHeight) {
      const fw = fontWeight || 700;
      const lh = lineHeight || fontSize;
      return states.map(s => {
        const style = [
          `background:${s.bg}`,
          `color:${s.color}`,
          s.border && s.border !== 'none' ? `border:${s.border}` : 'border:none',
          s.underline ? 'text-decoration:underline' : '',
        ].filter(Boolean).join(';');
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px">
          <button style="${style};font:${fw} ${fontSize}/${lh} var(--font-sans);height:${height};padding:${padding};border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center">${escHtml(s.text)}</button>
          <span style="font:400 9px var(--font-sans);color:var(--n45);text-transform:uppercase;letter-spacing:.05em">${escHtml(s.label)}</span>
        </div>`;
      }).join('');
    }

    const variantRows = (data.variants || []).map(v => `
      <tr style="border-bottom:1px solid var(--n3)">
        <td style="padding:14px;vertical-align:middle;width:110px">
          <div style="font:700 11px var(--font-sans);color:var(--n7)">${escHtml(v.label)}</div>
        </td>
        <td style="padding:14px;vertical-align:middle;border-left:1px solid var(--n3);background:#FAFBFD">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
            ${renderStates(v.states, t.height || '32px', t.padding || '0 32px', t.fontSize || '14px', t.fontWeight || 700, t.lineHeight || '20px')}
          </div>
        </td>
        <td style="padding:14px;vertical-align:middle;border-left:1px solid var(--n3);background:#F5F6FA">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
            ${renderStates(v.states, mt.height || '48px', mt.padding || '0 24px', mt.fontSize || '14px', mt.fontWeight || t.fontWeight || 700, mt.lineHeight || t.lineHeight || '20px')}
          </div>
        </td>
      </tr>`).join('');

    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td><td><code>${escHtml(String(mt[k] || '—'))}</code></td></tr>`).join('');

    const previewTab = `
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:var(--n2);border-bottom:1px solid var(--n4)">
            <th style="padding:9px 14px;font:700 11px var(--font-sans);text-align:left;color:var(--n7);width:110px">Variant</th>
            <th style="padding:9px 14px;font:700 11px var(--font-sans);text-align:left;color:var(--n7);border-left:1px solid var(--n3)">
              <span style="display:flex;align-items:center;gap:5px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                Desktop <span style="font-weight:400;color:var(--n5);margin-left:4px">32px · body-small-bold · 0 32px</span>
              </span>
            </th>
            <th style="padding:9px 14px;font:700 11px var(--font-sans);text-align:left;color:var(--n7);border-left:1px solid var(--n3)">
              <span style="display:flex;align-items:center;gap:5px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Mobile <span style="font-weight:400;color:var(--n5);margin-left:4px">48px · 14px · 0 24px</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>${variantRows}</tbody>
      </table>`;

    const codeTab = `<div class="code" style="border-radius:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;

    const tokensTab = `
      <div style="padding:16px">
        ${mt.note ? `<div class="bn in" style="margin-bottom:14px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${escHtml(mt.note)}</span>
        </div>` : ''}
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Desktop</th><th>Mobile</th></tr></thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>`;

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}`;
  },

  /* ── INPUTS & DROPDOWNS ── */
  inputs(data) {
    // ─── Text input icons ───
    const ICONS = {
      search:  `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/></svg>`,
      error:   `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--r6)"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M15,8h2v12h-2V8z M16,24c-0.8,0-1.5-0.7-1.5-1.5S15.2,21,16,21s1.5,0.7,1.5,1.5S16.8,24,16,24z"/></svg>`,
      success: `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--g5)"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M14,21.5L8.5,16l1.4-1.4L14,18.6l8.1-8.1l1.4,1.4L14,21.5z"/></svg>`,
      infoOut: `<svg class="ico-out" viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28ZM17,22H15V14h2ZM16,10a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,10Z"/></svg>`,
      infoFil: `<svg class="ico-fil" viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--n5);display:none"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm-1,8h2v2H15Zm4,14H13V22h2V16H13V14h4v8h2Z"/></svg>`,
    };

    function renderVariant(v, hasLabel) {
      const isDisabled = v.state === 'disabled';
      const isFocused  = v.state === 'focused';
      const isFilled   = v.state === 'filled';
      const isError    = v.state === 'error';
      const isValid    = v.state === 'valid';
      const needsValIcons = isError || isValid;

      let border = '1px solid var(--n3)';
      if (isFocused)  border = '2px solid var(--b6)';
      if (isFilled)   border = '1px solid var(--n5)';
      if (isError)    border = '1px solid var(--r6)';
      if (isValid)    border = '1px solid var(--g5)';
      if (isDisabled) border = '1px solid var(--n3)';

      const bg       = isDisabled ? 'var(--n1)' : '#fff';
      const initBg   = isFocused ? 'var(--b1)' : bg;
      const padR     = (needsValIcons || v.trailingIcon) ? '34px' : '10px';
      const initVal  = v.value || '';
      const ph       = v.placeholder || 'Placeholder';

      const onFocus = needsValIcons
        ? `this.style.border='2px solid var(--b6)';this.style.background='var(--b1)';this.parentElement.querySelectorAll('.vi').forEach(function(i){i.style.display='none'})`
        : `this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'`;
      const onBlur = needsValIcons
        ? `if(!this.value){this.style.border='1px solid var(--n3)';this.style.background='${bg}';this.parentElement.querySelectorAll('.vi').forEach(function(i){i.style.display='none'})}else{handleValidation(this);this.style.background='${bg}'}`
        : `this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='${bg}'`;
      const onMEnter = `if(!this.disabled&&document.activeElement!==this)this.style.background='var(--n2)'`;
      const onMLeave = `if(!this.disabled&&document.activeElement!==this)this.style.background='${bg}'`;

      const inputEl = `<input
        type="${needsValIcons ? 'email' : 'text'}"
        class="dt-inp"
        value="${escHtml(initVal)}"
        placeholder="${escHtml(ph)}"
        ${isDisabled ? 'disabled' : ''}
        style="width:100%;height:32px;padding:0 ${padR} 0 10px;border:${border};border-radius:6px;font:400 14px/20px var(--font-sans);background:${initBg};color:var(--n7);box-sizing:border-box${isDisabled ? ';opacity:.55;cursor:not-allowed' : ''}"
        onfocus="${onFocus}"
        onblur="${onBlur}"
        onmouseenter="${onMEnter}"
        onmouseleave="${onMLeave}"
        ${needsValIcons ? 'oninput="handleValidation(this)"' : ''}
      >`;

      const icoPos = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;pointer-events:none';
      let iconOverlay = '';
      if (needsValIcons) {
        iconOverlay = `
          <div class="vi vi-err" style="${icoPos};color:var(--r6);${isError ? 'display:flex' : 'display:none'}"><svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M15,8h2v12h-2V8z M16,24c-0.8,0-1.5-0.7-1.5-1.5S15.2,21,16,21s1.5,0.7,1.5,1.5S16.8,24,16,24z"/></svg></div>
          <div class="vi vi-ok"  style="${icoPos};color:var(--g5);${isValid  ? 'display:flex' : 'display:none'}"><svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M14,21.5L8.5,16l1.4-1.4L14,18.6l8.1-8.1l1.4,1.4L14,21.5z"/></svg></div>`;
      } else if (v.trailingIcon === 'search') {
        iconOverlay = `<div style="${icoPos};color:var(--n5)"><svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/></svg></div>`;
      }

      const infoTip = v.labelTooltip
        ? `<span style="position:relative;display:inline-flex;align-items:center;cursor:default"
            onmouseenter="let t=this.querySelector('.inp-tt');t.style.opacity='1';t.style.visibility='visible';this.querySelector('.ico-out').style.display='none';this.querySelector('.ico-fil').style.display='inline-flex'"
            onmouseleave="let t=this.querySelector('.inp-tt');t.style.opacity='0';t.style.visibility='hidden';this.querySelector('.ico-out').style.display='inline-flex';this.querySelector('.ico-fil').style.display='none'">
            ${ICONS.infoOut}${ICONS.infoFil}
            <div class="inp-tt" style="position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:8px 10px;border-radius:6px;font:400 12px/16px var(--font-sans);width:180px;white-space:normal;pointer-events:none;opacity:0;visibility:hidden;transition:opacity .15s;z-index:99">${escHtml(v.labelTooltip)}<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div></div>
          </span>`
        : '';

      const labelHtml = hasLabel
        ? `<div style="display:flex;align-items:center;gap:4px;font:400 12px/16px var(--font-sans);color:var(--n7);margin-bottom:4px">Label${infoTip}</div>`
        : '';

      const helperHtml = v.helperText
        ? `<div style="font:400 12px/16px var(--font-sans);color:${isError ? 'var(--r6)' : 'var(--n5)'};margin-top:3px">${escHtml(v.helperText)}</div>`
        : '';

      return `<div style="display:flex;flex-direction:column;width:200px">
        <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">${escHtml(v.label)}</div>
        ${labelHtml}
        <div style="position:relative">${inputEl}${iconOverlay}</div>
        ${helperHtml}
      </div>`;
    }

    const groupSections = (data.variantGroups || []).map(group => {
      const cards = (group.variants || []).map(v => renderVariant(v, group.id === 'with-label')).join('');
      return `<div style="margin-bottom:32px">
        <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">${escHtml(group.label)}</div>
        <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">${escHtml(group.description)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:20px 28px">${cards}</div>
      </div>`;
    }).join('');

    // ─── Dropdown internals ───
    const opts      = data.dropdownOptions      || ['Todos','Esta semana','Este mes','Últimos 3 meses','Personalizado'];
    const multiOpts = data.dropdownMultiOptions || ['Todos','Santiago','Valparaíso','Biobío','Maule'];

    const CHEVRON = `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
    const LIST_IC = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0"><path d="M8 6H28V8H8zM4 6H6V8H4zM8 14H28V16H8zM4 14H6V16H4zM8 22H28V24H8zM4 22H6V24H4z"/></svg>`;
    const X_SVG   = `<svg viewBox="0 0 32 32" width="9" height="9" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>`;

    function trig(type, { theme, state, filled, hasIcon }) {
      const isBorder = theme === 'border';
      const isHover  = state === 'hover';
      const isActive = state === 'active';
      const isDis    = state === 'disabled';

      let border = isBorder ? '1px solid var(--n3)' : '1px solid transparent';
      if (isActive) border = '2px solid var(--b6)';

      let bg = isBorder ? '#fff' : 'transparent';
      if (isHover) bg = 'var(--n2)';
      if (isDis)   bg = 'var(--n1)';

      const chevColor = isDis ? 'var(--n4)' : 'var(--n5)';
      const dim       = isDis ? 'opacity:.55' : '';

      let inner = '';
      if (type === 'multi') {
        const chipSt = isDis
          ? 'display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;background:var(--n3);border:1px solid var(--n4);border-radius:999px;font:400 12px/1 var(--font-sans);color:var(--n5)'
          : 'display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;background:var(--b1);border:1px solid var(--b3);border-radius:999px;font:400 12px/1 var(--font-sans);color:var(--b6)';
        const chip = filled ? `<span style="${chipSt}">${X_SVG}&nbsp;All</span>` : `<span style="font:400 14px/20px var(--font-sans);color:var(--n5)">Placeholder...</span>`;
        inner = `${hasIcon ? `<span style="color:var(--n5);display:flex">${LIST_IC}</span>` : ''}<div style="flex:1;min-width:0;overflow:hidden">${chip}</div>`;
      } else {
        const textColor = filled ? (isDis ? 'var(--n5)' : 'var(--n7)') : 'var(--n5)';
        const val = filled ? 'example' : 'Placeholder...';
        inner = `${hasIcon ? `<span style="color:var(--n5);display:flex">${LIST_IC}</span>` : ''}<span style="flex:1;font:400 14px/20px var(--font-sans);color:${textColor};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${val}</span>`;
      }

      return `<div style="display:flex;align-items:center;height:32px;padding:0 10px;border:${border};border-radius:6px;background:${bg};gap:6px;${dim};width:100%;box-sizing:border-box">
        ${inner}<span style="color:${chevColor};display:flex;flex-shrink:0">${CHEVRON}</span>
      </div>`;
    }

    function stateGrid(type, filled) {
      const states  = ['normal','hover','active','disabled'];
      const stLbls  = { normal:'Normal', hover:'Hover', active:'Active', disabled:'Disabled' };
      const configs = [
        { theme:'border',     hasIcon:false },
        { theme:'border',     hasIcon:true  },
        { theme:'borderless', hasIcon:false },
        { theme:'borderless', hasIcon:true  },
      ];

      const h1 = `<div></div>
        <div style="grid-column:span 2;font:700 12px/16px var(--font-sans);color:var(--n7);border-bottom:2px solid var(--n3);padding-bottom:6px">Theme: border</div>
        <div style="grid-column:span 2;font:700 12px/16px var(--font-sans);color:var(--n7);border-bottom:2px solid var(--n3);padding-bottom:6px">Theme: borderless</div>`;
      const h2 = `<div></div>` + configs.map(c =>
        `<div style="font:400 12px/16px var(--font-sans);color:var(--n5)">${c.hasIcon ? 'With icon' : 'Simple'}</div>`
      ).join('');
      const rows = states.map(s => {
        const cells = configs.map(c => `<div style="min-width:0">${trig(type, { ...c, state: s, filled })}</div>`).join('');
        return `<div style="font:400 14px/20px var(--font-sans);color:var(--n5);white-space:nowrap">State: ${escHtml(stLbls[s])}</div>${cells}`;
      }).join('');

      return `<div style="margin-bottom:24px">
        <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin-bottom:12px">Filled: ${filled ? 'T' : 'F'}</div>
        <div style="display:grid;grid-template-columns:100px repeat(4,1fr);gap:8px 12px;align-items:center">${h1}${h2}${rows}</div>
      </div>`;
    }

    const menuItems = opts.map(o => {
      const safe = o.replace(/'/g, '&#39;');
      return `<div onclick='dtPickOpt(this)' data-val='${safe}'
        onmouseenter='this.style.background="var(--b1)";this.style.color="var(--b7)"'
        onmouseleave='this.style.background="";this.style.color="var(--n7)"'
        style='height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer'
      >${escHtml(o)}</div>`;
    }).join('');

    const multiMenuItems = multiOpts.map(o => {
      const safe = o.replace(/'/g, '&#39;');
      return `<label class='dt-mopt' onclick='event.stopPropagation()'
        onmouseenter='this.style.background="var(--b1)"'
        onmouseleave='this.style.background=""'
        style='height:36px;padding:0 12px;display:flex;align-items:center;gap:8px;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer'>
        <input type='checkbox' data-label='${safe}' onchange='dtMultiCheck(this)' style='cursor:pointer;accent-color:var(--b6)'>
        ${escHtml(o)}
      </label>`;
    }).join('');

    function interactiveCard(label, trigHtml, menuHtml, isMulti) {
      return `<div style="display:flex;flex-direction:column;gap:6px">
        <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">${escHtml(label)}</div>
        <div class='dt-drop-wrap' style='position:relative;width:240px'>
          ${trigHtml}
          <div class='${isMulti ? 'dt-mmenu' : 'dt-dmenu'}' style='display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0'>
            ${menuHtml}
          </div>
        </div>
      </div>`;
    }

    const selTrig = (dataTheme, theme) => `<div class='dt-dtrigger' ${dataTheme}
      onclick='dtDrop(this.parentElement)'
      onmouseenter='if(!this.parentElement.classList.contains("dt-open"))this.style.background="var(--n2)"'
      onmouseleave='if(!this.parentElement.classList.contains("dt-open"))this.style.background="${theme === 'borderless' ? 'transparent' : '#fff'}"'
      style='display:flex;align-items:center;height:32px;padding:0 10px;border:${theme === 'border' ? '1px solid var(--n3)' : '1px solid transparent'};border-radius:6px;background:${theme === 'border' ? '#fff' : 'transparent'};cursor:pointer;gap:6px'>
      <span class='dt-dlabel' style='flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)'>Select an option...</span>
      <span style='color:var(--n5);display:flex;flex-shrink:0'>${CHEVRON}</span>
    </div>`;

    const multiTrig = `<div class='dt-mtrigger'
      onclick='dtMultiDrop(this.parentElement)'
      onmouseenter='if(!this.parentElement.classList.contains("dt-mopen"))this.style.background="var(--n2)"'
      onmouseleave='if(!this.parentElement.classList.contains("dt-mopen"))this.style.background="#fff"'
      style='display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px'>
      <div class='dt-mchips' style='flex:1;display:flex;gap:4px;align-items:center;min-width:0;overflow:hidden'>
        <span style='font:400 14px/20px var(--font-sans);color:var(--n6)'>Select options...</span>
      </div>
      <span style='color:var(--n5);display:flex;flex-shrink:0'>${CHEVRON}</span>
    </div>`;

    const dropInteractive = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Interactive</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Click to open, select an option to see the filled state.</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap">
        ${interactiveCard('Select', selTrig("data-theme='border'", 'border'), menuItems, false)}
        ${interactiveCard('Select — borderless', selTrig("data-theme='borderless'", 'borderless'), menuItems, false)}
        ${interactiveCard('Multiselect', multiTrig, multiMenuItems, true)}
      </div>
    </div>`;

    const selectSection = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Select</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Single-value dropdown. Border and borderless themes.</div>
      ${stateGrid('select', true)}${stateGrid('select', false)}
    </div>`;

    const multiSection = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Multiselect</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Multiple selections shown as chips. Filled: T shows default "All" chip.</div>
      ${stateGrid('multi', true)}${stateGrid('multi', false)}
    </div>`;

    // ─── Sub-section divider ───
    const subHead = text => `<div style="font:700 18px/24px var(--font-sans);color:var(--n7);padding-bottom:14px;margin-bottom:24px;border-bottom:2px solid var(--n3)">${escHtml(text)}</div>`;

    // ─── Combined tabs ───
    const inputTokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');
    const dropTokenRows = Object.entries(data.dropdownTokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:24px;background:var(--n1)">
      <div style="margin-bottom:48px">
        ${subHead('Text inputs')}
        ${groupSections}
      </div>
      <div>
        ${subHead('Dropdowns')}
        ${dropInteractive}${selectSection}${multiSection}
      </div>
    </div>`;

    const combinedCode = (data.code || '') + '\n\n\n/* ──────────── DROPDOWNS ──────────── */\n\n' + (data.dropdownCode || '');
    const codeTab = `<div class="code" style="border-radius:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(combinedCode)}</pre></div>`;

    const tokensTab = `<div style="padding:16px">
      <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin-bottom:12px">Text inputs</div>
      <table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${inputTokenRows}</tbody></table>
      <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin:24px 0 12px">Dropdowns</div>
      <table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${dropTokenRows}</tbody></table>
    </div>`;

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}`;
  },

  /* ── TOOLTIP ── */
  tooltip(data) {
    const text = data.content || 'Tooltip content';

    // Carbon information icons — outline (default) and filled (hover)
    const OUT_PATH = 'M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28ZM17,22H15V14h2ZM16,10a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,10Z';
    const FIL_PATH = 'M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm-1,8h2v2H15Zm4,14H13V22h2V16H13V14h4v8h2Z';
    const icoOut    = `<svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="${OUT_PATH}"/></svg>`;
    const icoFil    = `<svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="${FIL_PATH}"/></svg>`;
    const icoOutCls = `<svg class="ico-out" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="${OUT_PATH}"/></svg>`;
    const icoFilCls = `<svg class="ico-fil" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" style="flex-shrink:0;color:var(--n5);display:none"><path d="${FIL_PATH}"/></svg>`;
    const X_CLOSE   = `<svg viewBox="0 0 32 32" width="10" height="10" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>`;

    const subHead = t => `<div style="font:700 18px/24px var(--font-sans);color:var(--n7);padding-bottom:14px;margin-bottom:28px;border-bottom:2px solid var(--n3)">${escHtml(t)}</div>`;
    const cardLabel = t => `<div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em;margin-bottom:16px">${escHtml(t)}</div>`;
    const tip = (pos, arrow, extra='') => `<div style="position:absolute;${pos};background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;z-index:2${extra ? ';' + extra : ''}">${escHtml(text)}<div style="position:absolute;${arrow};width:0;height:0"></div></div>`;

    // ─── Section 1: Info icon states ───
    const stateDefault = `<div>
      ${cardLabel('Default')}
      <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">Label ${icoOut}</div>
    </div>`;

    const stateHover = `<div>
      ${cardLabel('Hover')}
      <div style="padding-top:88px">
        <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
          Label
          <div style="position:relative;display:inline-flex;align-items:center">
            ${tip('bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)','top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)')}
            ${icoFil}
          </div>
        </div>
      </div>
    </div>`;

    const stateInteractive = `<div>
      ${cardLabel('Interactive')}
      <div style="padding-top:88px">
        <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
          Label
          <span style="position:relative;display:inline-flex;align-items:center;cursor:default"
            onmouseenter="let t=this.querySelector('.tt-ico');t.style.opacity='1';t.style.visibility='visible';this.querySelector('.ico-out').style.display='none';this.querySelector('.ico-fil').style.display='inline-flex'"
            onmouseleave="let t=this.querySelector('.tt-ico');t.style.opacity='0';t.style.visibility='hidden';this.querySelector('.ico-out').style.display='inline-flex';this.querySelector('.ico-fil').style.display='none'">
            ${icoOutCls}${icoFilCls}
            <div class="tt-ico" style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;opacity:0;visibility:hidden;transition:opacity .15s;z-index:10;pointer-events:none">${escHtml(text)}<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div></div>
          </span>
        </div>
      </div>
    </div>`;

    const iconSection = `<div style="margin-bottom:52px">
      ${subHead('Info icon')}
      <div style="display:flex;flex-wrap:wrap;gap:32px 56px;align-items:flex-end">${stateDefault}${stateHover}${stateInteractive}</div>
    </div>`;

    // ─── Section 2: Placements (filled icon = tooltip is showing) ───
    function makeCard(placement) {
      const isTop    = placement === 'top';
      const isBottom = placement === 'bottom';
      const isLeft   = placement === 'left';
      let tipPos, arrowPos, spacer;
      if (isTop) {
        tipPos   = 'bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)';
        arrowPos = 'top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)';
        spacer   = 'padding-top:88px';
      } else if (isBottom) {
        tipPos   = 'top:calc(100% + 8px);left:50%;transform:translateX(-50%)';
        arrowPos = 'bottom:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid var(--n7)';
        spacer   = 'padding-bottom:88px';
      } else if (isLeft) {
        tipPos   = 'right:calc(100% + 8px);top:50%;transform:translateY(-50%)';
        arrowPos = 'left:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:5px solid var(--n7)';
        spacer   = 'padding-left:190px';
      } else {
        tipPos   = 'left:calc(100% + 8px);top:50%;transform:translateY(-50%)';
        arrowPos = 'right:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:5px solid var(--n7)';
        spacer   = 'padding-right:190px';
      }
      return `<div>
        ${cardLabel(placement)}
        <div style="${spacer}">
          <div style="position:relative;display:inline-flex;align-items:center">
            ${tip(tipPos, arrowPos)}
            ${icoFil}
          </div>
        </div>
      </div>`;
    }

    const placementsSection = `<div style="margin-bottom:52px">
      ${subHead('Placements')}
      <div style="display:flex;flex-wrap:wrap;gap:32px 56px;align-items:flex-end">${['top','bottom','left','right'].map(p => makeCard(p)).join('')}</div>
    </div>`;

    // ─── Section 3: Persistent (with close button) ───
    const persistentSection = `<div>
      ${subHead('Persistent (with close)')}
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-top:-18px;margin-bottom:24px">Tooltip stays visible until the user closes it manually.</div>
      <div style="padding-top:96px;display:inline-flex">
        <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
          Label
          <div class="tt-persist-wrap" style="position:relative;display:inline-flex;align-items:center">
            <div class="tt-persist" style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:10px 28px 10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;z-index:2">
              ${escHtml(text)}
              <button onclick="this.closest('.tt-persist-wrap').querySelector('.tt-persist').style.display='none'"
                style="position:absolute;top:8px;right:8px;background:transparent;border:none;color:#fff;cursor:pointer;padding:2px;display:flex;align-items:center;opacity:.6;line-height:1"
                onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.6'">${X_CLOSE}</button>
              <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div>
            </div>
            ${icoFil}
          </div>
        </div>
      </div>
    </div>`;

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:32px;background:var(--n1)">${iconSection}${placementsSection}${persistentSection}</div>`;
    const codeTab    = `<div class="code" style="border-radius:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;
    const tokensTab  = `<div style="padding:16px"><table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${tokenRows}</tbody></table></div>`;

    return `
      ${sectionHeader(data)}
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}`;
  },

  /* ── DROPDOWNS ── */
  dropdowns(data) {
    const opts      = data.options      || ['Todos','Esta semana','Este mes','Últimos 3 meses','Personalizado'];
    const multiOpts = data.multiOptions || ['Todos','Santiago','Valparaíso','Biobío','Maule'];

    const CHEVRON  = `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
    const LIST_IC  = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0"><path d="M8 6H28V8H8zM4 6H6V8H4zM8 14H28V16H8zM4 14H6V16H4zM8 22H28V24H8zM4 22H6V24H4z"/></svg>`;
    const X_SVG    = `<svg viewBox="0 0 32 32" width="9" height="9" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>`;

    function trig(type, { theme, state, filled, hasIcon }) {
      const isBorder = theme === 'border';
      const isHover  = state === 'hover';
      const isActive = state === 'active';
      const isDis    = state === 'disabled';

      let border = isBorder ? '1px solid var(--n3)' : '1px solid transparent';
      if (isActive) border = '2px solid var(--b6)';

      let bg = isBorder ? '#fff' : 'transparent';
      if (isHover) bg = 'var(--n2)';
      if (isDis)   bg = 'var(--n1)';

      const chevColor = isDis ? 'var(--n4)' : 'var(--n5)';
      const dim       = isDis ? 'opacity:.55' : '';

      let inner = '';
      if (type === 'multi') {
        const chipSt = isDis
          ? 'display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;background:var(--n3);border:1px solid var(--n4);border-radius:999px;font:400 12px/1 var(--font-sans);color:var(--n5)'
          : 'display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;background:var(--b1);border:1px solid var(--b3);border-radius:999px;font:400 12px/1 var(--font-sans);color:var(--b6)';
        const chip = filled ? `<span style="${chipSt}">${X_SVG}&nbsp;All</span>` : `<span style="font:400 14px/20px var(--font-sans);color:var(--n5)">Placeholder...</span>`;
        inner = `${hasIcon ? `<span style="color:var(--n5);display:flex">${LIST_IC}</span>` : ''}<div style="flex:1;min-width:0;overflow:hidden">${chip}</div>`;
      } else {
        const textColor = filled ? (isDis ? 'var(--n5)' : 'var(--n7)') : 'var(--n5)';
        const val = filled ? 'example' : 'Placeholder...';
        inner = `${hasIcon ? `<span style="color:var(--n5);display:flex">${LIST_IC}</span>` : ''}<span style="flex:1;font:400 14px/20px var(--font-sans);color:${textColor};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${val}</span>`;
      }

      return `<div style="display:flex;align-items:center;height:32px;padding:0 10px;border:${border};border-radius:6px;background:${bg};gap:6px;${dim};width:100%;box-sizing:border-box">
        ${inner}<span style="color:${chevColor};display:flex;flex-shrink:0">${CHEVRON}</span>
      </div>`;
    }

    function stateGrid(type, filled) {
      const states   = ['normal','hover','active','disabled'];
      const stLbls   = { normal:'Normal', hover:'Hover', active:'Active', disabled:'Disabled' };
      const configs  = [
        { theme:'border',     hasIcon:false },
        { theme:'border',     hasIcon:true  },
        { theme:'borderless', hasIcon:false },
        { theme:'borderless', hasIcon:true  },
      ];

      const h1 = `<div></div>
        <div style="grid-column:span 2;font:700 12px/16px var(--font-sans);color:var(--n7);border-bottom:2px solid var(--n3);padding-bottom:6px">Theme: border</div>
        <div style="grid-column:span 2;font:700 12px/16px var(--font-sans);color:var(--n7);border-bottom:2px solid var(--n3);padding-bottom:6px">Theme: borderless</div>`;
      const h2 = `<div></div>` + configs.map(c =>
        `<div style="font:400 12px/16px var(--font-sans);color:var(--n5)">${c.hasIcon ? 'With icon' : 'Simple'}</div>`
      ).join('');
      const rows = states.map(s => {
        const cells = configs.map(c => `<div style="min-width:0">${trig(type, { ...c, state: s, filled })}</div>`).join('');
        return `<div style="font:400 14px/20px var(--font-sans);color:var(--n5);white-space:nowrap">State: ${escHtml(stLbls[s])}</div>${cells}`;
      }).join('');

      return `<div style="margin-bottom:24px">
        <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin-bottom:12px">Filled: ${filled ? 'T' : 'F'}</div>
        <div style="display:grid;grid-template-columns:100px repeat(4,1fr);gap:8px 12px;align-items:center">${h1}${h2}${rows}</div>
      </div>`;
    }

    const menuItems = opts.map(o => {
      const safe = o.replace(/'/g, '&#39;');
      return `<div onclick='dtPickOpt(this)' data-val='${safe}'
        onmouseenter='this.style.background="var(--b1)";this.style.color="var(--b7)"'
        onmouseleave='this.style.background="";this.style.color="var(--n7)"'
        style='height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer'
      >${escHtml(o)}</div>`;
    }).join('');

    const multiMenuItems = multiOpts.map(o => {
      const safe = o.replace(/'/g, '&#39;');
      return `<label class='dt-mopt' onclick='event.stopPropagation()'
        onmouseenter='this.style.background="var(--b1)"'
        onmouseleave='this.style.background=""'
        style='height:36px;padding:0 12px;display:flex;align-items:center;gap:8px;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer'>
        <input type='checkbox' data-label='${safe}' onchange='dtMultiCheck(this)' style='cursor:pointer;accent-color:var(--b6)'>
        ${escHtml(o)}
      </label>`;
    }).join('');

    function interactiveCard(id, label, trigHtml, menuHtml, isMulti) {
      const triggerClass = isMulti ? 'dt-mtrigger' : 'dt-dtrigger';
      const clickFn = isMulti ? 'dtMultiDrop' : 'dtDrop';
      const dataTheme = !isMulti ? "data-theme='border'" : '';
      return `<div style="display:flex;flex-direction:column;gap:6px">
        <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">${escHtml(label)}</div>
        <div class='dt-drop-wrap' style='position:relative;width:240px'>
          ${trigHtml}
          <div class='${isMulti ? 'dt-mmenu' : 'dt-dmenu'}' style='display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0'>
            ${menuHtml}
          </div>
        </div>
      </div>`;
    }

    const selTrig = (dataTheme, theme) => `<div class='dt-dtrigger' ${dataTheme}
      onclick='dtDrop(this.parentElement)'
      onmouseenter='if(!this.parentElement.classList.contains("dt-open"))this.style.background="var(--n2)"'
      onmouseleave='if(!this.parentElement.classList.contains("dt-open"))this.style.background="${theme === 'borderless' ? 'transparent' : '#fff'}"'
      style='display:flex;align-items:center;height:32px;padding:0 10px;border:${theme === 'border' ? '1px solid var(--n3)' : '1px solid transparent'};border-radius:6px;background:${theme === 'border' ? '#fff' : 'transparent'};cursor:pointer;gap:6px'>
      <span class='dt-dlabel' style='flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)'>Select an option...</span>
      <span style='color:var(--n5);display:flex;flex-shrink:0'>${CHEVRON}</span>
    </div>`;

    const multiTrig = `<div class='dt-mtrigger'
      onclick='dtMultiDrop(this.parentElement)'
      onmouseenter='if(!this.parentElement.classList.contains("dt-mopen"))this.style.background="var(--n2)"'
      onmouseleave='if(!this.parentElement.classList.contains("dt-mopen"))this.style.background="#fff"'
      style='display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px'>
      <div class='dt-mchips' style='flex:1;display:flex;gap:4px;align-items:center;min-width:0;overflow:hidden'>
        <span style='font:400 14px/20px var(--font-sans);color:var(--n6)'>Select options...</span>
      </div>
      <span style='color:var(--n5);display:flex;flex-shrink:0'>${CHEVRON}</span>
    </div>`;

    const interactive = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Interactive</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Click to open, select an option to see the filled state.</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap">
        ${interactiveCard('s1','Select', selTrig("data-theme='border'", 'border'), menuItems, false)}
        ${interactiveCard('s2','Select — borderless', selTrig("data-theme='borderless'", 'borderless'), menuItems, false)}
        ${interactiveCard('s3','Multiselect', multiTrig, multiMenuItems, true)}
      </div>
    </div>`;

    const selectSection = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Select</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Single-value dropdown. Border and borderless themes.</div>
      ${stateGrid('select', true)}${stateGrid('select', false)}
    </div>`;

    const multiSection = `<div style="margin-bottom:40px">
      <div style="font:700 16px/22px var(--font-sans);color:var(--n7);margin-bottom:4px">Multiselect</div>
      <div style="font:400 14px/20px var(--font-sans);color:var(--n5);margin-bottom:20px">Multiple selections shown as chips. Filled: T shows default "All" chip.</div>
      ${stateGrid('multi', true)}${stateGrid('multi', false)}
    </div>`;

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:24px;background:var(--n1)">${interactive}${selectSection}${multiSection}</div>`;
    const codeTab    = `<div class="code" style="border-radius:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;
    const tokensTab  = `<div style="padding:16px"><table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${tokenRows}</tbody></table></div>`;

    return `
      ${sectionHeader(data)}
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}`;
  },

  /* ── SELECTION ── */
  selection(data) {
    const rows = (data.controls || []).map(ctrl => {
      let states = '';
      if (ctrl.type === 'checkbox') {
        states = ctrl.states.map(s => {
          let inner = '';
          if (s.on === true) inner = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
          if (s.on === 'mixed') inner = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
          const cls = s.disabled ? 'chk dis' : (s.on ? 'chk on' : 'chk');
          return `<div style="display:flex;align-items:center;gap:6px;font:400 13px var(--font-sans)"><div class="${cls}">${inner}</div>${escHtml(s.label)}</div>`;
        }).join('');
      } else if (ctrl.type === 'radio') {
        states = ctrl.states.map(s => {
          const disStyle = s.disabled ? 'background:var(--n2);border-color:var(--n3)' : '';
          const cls = s.on ? 'rad on' : 'rad';
          return `<div style="display:flex;align-items:center;gap:6px;font:400 13px var(--font-sans)"><div class="${cls}" style="${disStyle}"></div>${escHtml(s.label)}</div>`;
        }).join('');
      } else if (ctrl.type === 'switch') {
        states = ctrl.states.map(s => {
          return `<div style="display:flex;align-items:center;gap:6px;font:400 13px var(--font-sans)"><div class="swt ${s.on ? 'on' : ''}" onclick="this.classList.toggle('on')"></div>${escHtml(s.label)}</div>`;
        }).join('');
      }
      return `<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <span style="width:88px;font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em">${escHtml(ctrl.label)}</span>
        ${states}
      </div>`;
    }).join('');

    /* ─── FILE UPLOADER ─── */
    const fuBtnStyle = 'height:32px;padding:0 14px;border-radius:50px;font:700 13px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap';
    const fuBtnDisStyle = 'height:32px;padding:0 14px;border-radius:50px;font:700 13px/1 var(--font-sans);background:#fff;color:var(--n4);border:1px solid var(--n4);cursor:not-allowed;display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap';
    const fuFileIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
    const fuCloseIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    function fuFilePill(filename, disabled) {
      const bg = disabled ? 'var(--n2)' : '#fff';
      const clr = disabled ? 'var(--n4)' : 'var(--n7)';
      const bd  = disabled ? 'var(--n3)' : 'var(--n4)';
      return `<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px 0 10px;border-radius:4px;background:${bg};border:1px solid ${bd};font:400 13px var(--font-sans);color:${clr};cursor:default">
        <span style="color:${disabled?'var(--n4)':'var(--n5)'};">${fuFileIcon}</span>
        <span>${filename}</span>
        ${disabled ? '' : `<span style="width:16px;height:16px;border-radius:50%;background:var(--n3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:var(--n5)">${fuCloseIcon}</span>`}
      </span>`;
    }
    function fuRow(label, hasToggle, toggleOn, hasFile, filename) {
      const disabled = hasToggle && !toggleOn;
      const labelClr = disabled ? 'var(--n4)' : 'var(--n6)';
      const noFileTxt = disabled ? `<span style="font:400 12px var(--font-sans);color:var(--n4)">No file chosen</span>` : `<span style="font:400 12px var(--font-sans);color:var(--n5)">No file chosen</span>`;
      const toggleHtml = hasToggle ? `<div class="swt ${toggleOn ? 'on' : ''}" style="pointer-events:none;flex-shrink:0"></div>` : '';
      const fileArea = hasFile
        ? fuFilePill(filename || 'Example', disabled)
        : `${disabled ? `<button style="${fuBtnDisStyle}">${fuFileIcon}Choose File</button>` : `<button style="${fuBtnStyle}">${fuFileIcon}Choose File</button>`}${noFileTxt}`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--n3)">
        ${toggleHtml}
        <span style="font:500 13px var(--font-sans);color:${labelClr};min-width:100px">${label}</span>
        <div style="display:flex;align-items:center;gap:8px">${fileArea}</div>
      </div>`;
    }
    const fuVariantsHTML = [
      fuRow('Header Image', false, false, false, null),
      fuRow('Header Image', false, false, true,  'Logo.svg'),
      fuRow('Header Image', true,  false, false, null),
      fuRow('Header Image', true,  true,  false, null),
      fuRow('Header Image', true,  true,  true,  'banner.png'),
    ].join('');
    const fuHelperText = `<div style="margin-top:4px;font:400 12px var(--font-sans);color:var(--n5)">Please upload the image of width 200px and height 60px</div>`;

    const fuCodeSnippet = `&lt;!-- File uploader (no toggle) --&gt;
&lt;div class="fu-wrap"&gt;
  &lt;label class="fu-label"&gt;Header Image&lt;/label&gt;
  &lt;div class="fu-control" id="fu-1"&gt;
    &lt;button class="fu-btn" onclick="fuOpen('fu-1')"&gt;
      &lt;!-- file icon --&gt; Choose File
    &lt;/button&gt;
    &lt;span class="fu-placeholder"&gt;No file chosen&lt;/span&gt;
    &lt;!-- pill injected by JS when file selected --&gt;
  &lt;/div&gt;
  &lt;p class="fu-hint"&gt;Please upload an image 200×60px&lt;/p&gt;
&lt;/div&gt;

&lt;!-- With toggle --&gt;
&lt;div class="fu-wrap"&gt;
  &lt;div class="swt" id="fu-toggle" onclick="fuToggle(this,'fu-2')"&gt;&lt;/div&gt;
  &lt;label class="fu-label"&gt;Header Image&lt;/label&gt;
  &lt;div class="fu-control" id="fu-2" data-disabled="true"&gt;...&lt;/div&gt;
&lt;/div&gt;`;

    const fileUploaderSection = `
      <h3 style="font:700 18px var(--font-sans);color:var(--n7);margin:32px 0 6px;display:flex;align-items:center;gap:8px">File uploader</h3>
      <p class="desc" style="margin-bottom:16px">Combines an optional toggle, label and file picker. Clicking Choose File opens the OS picker. The selected file appears as a dismissible pill — closing it returns to the empty state. When the toggle is OFF the whole control is disabled.</p>
      <div class="card" style="padding:0 20px;margin-bottom:12px">
        <div style="padding:12px 0 4px;font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;display:grid;grid-template-columns:26px 108px 1fr;gap:10px;align-items:center">
          <span>Toggle</span><span>Label</span><span>Control area</span>
        </div>
        ${fuVariantsHTML}
      </div>

      <!-- Live preview -->
      <div class="card" style="margin-bottom:12px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:16px">Live preview</div>
        <div id="fu-live-wrap" style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="swt on" id="fu-live-toggle" onclick="fuLiveToggle()"></div>
            <span style="font:500 13px var(--font-sans);color:var(--n6);min-width:100px" id="fu-live-label">Header Image</span>
            <div style="display:flex;align-items:center;gap:8px" id="fu-live-control">
              <button id="fu-live-btn" style="${fuBtnStyle}" onclick="fuLivePick()">
                ${fuFileIcon}Choose File
              </button>
              <span id="fu-live-placeholder" style="font:400 12px var(--font-sans);color:var(--n5)">No file chosen</span>
            </div>
          </div>
          ${fuHelperText}
        </div>
        <input type="file" id="fu-live-input" style="display:none" onchange="fuLiveOnChange(this)">
      </div>

      <!-- Code snippet -->
      <div class="card" style="margin-bottom:0;padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--n3)">
          <span style="font:600 13px/1 var(--font-sans);color:var(--n7)">HTML snippet</span>
          <button onclick="copyCode(this)" style="height:24px;padding:0 10px;border-radius:4px;font:600 11px var(--font-sans);background:var(--n2);color:var(--n6);border:1px solid var(--n3);cursor:pointer">Copy</button>
        </div>
        <pre style="margin:0;padding:16px;font:400 11px/1.7 var(--font-mono);color:var(--n6);background:var(--n1);overflow-x:auto">${fuCodeSnippet}</pre>
      </div>

      <script>
      function fuLiveToggle() {
        const toggle = document.getElementById('fu-live-toggle');
        const btn = document.getElementById('fu-live-btn');
        const label = document.getElementById('fu-live-label');
        const placeholder = document.getElementById('fu-live-placeholder');
        toggle.classList.toggle('on');
        const isOn = toggle.classList.contains('on');
        label.style.color = isOn ? 'var(--n6)' : 'var(--n4)';
        if (!isOn) {
          btn.style.cssText = '${fuBtnDisStyle.replace(/'/g, "\\'")}';
          btn.onclick = null;
          placeholder.style.color = 'var(--n4)';
        } else {
          btn.style.cssText = '${fuBtnStyle.replace(/'/g, "\\'")}';
          btn.onclick = fuLivePick;
          placeholder.style.color = 'var(--n5)';
        }
      }
      function fuLivePick() {
        const toggle = document.getElementById('fu-live-toggle');
        if (!toggle.classList.contains('on')) return;
        document.getElementById('fu-live-input').click();
      }
      function fuLiveOnChange(input) {
        const ctrl = document.getElementById('fu-live-control');
        const file = input.files[0];
        if (!file) return;
        ctrl.innerHTML = \`<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px 0 10px;border-radius:4px;background:#fff;border:1px solid var(--n4);font:400 13px var(--font-sans);color:var(--n7)">
          <span style="color:var(--n5)">${fuFileIcon}</span>
          <span>\${file.name}</span>
          <span onclick="fuLiveClear()" style="width:16px;height:16px;border-radius:50%;background:var(--n3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:var(--n5)">${fuCloseIcon}</span>
        </span>\`;
        input.value = '';
      }
      function fuLiveClear() {
        const ctrl = document.getElementById('fu-live-control');
        ctrl.innerHTML = \`<button id="fu-live-btn" style="${fuBtnStyle.replace(/`/g,'\\`')}" onclick="fuLivePick()">${fuFileIcon}Choose File</button><span id="fu-live-placeholder" style="font:400 12px var(--font-sans);color:var(--n5)">No file chosen</span>\`;
      }
      <\/script>`;

    /* ─── TABS ─── */
    // Render a complete tab GROUP (container + n tabs + sliding pill)
    // gid = unique ID for JS interactivity; active = initially active index
    let _tabGid = 0;
    function tabGroup(n, size, active, badgeNums) {
      const gid  = 'tg-' + (++_tabGid);
      const pillW = size === 'dense' ? 74 : 98;
      const gap   = size === 'dense' ? 12 : 24;  // CSS gap between buttons = step between pill positions
      const pillX = 4 + active * (pillW + gap);  // initial absolute left of pill
      const BADGE_NUMS = [5,12,3,8,1,7];
      const tabs = Array.from({length:n}, (_,i) => {
        const badge = badgeNums
          ? `<span style="position:absolute;top:-8px;right:-5px;min-width:16px;height:16px;border-radius:8px;background:var(--r6);color:#fff;font:700 9px/1 var(--font-sans);display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box;z-index:3">${BADGE_NUMS[i]||1}</span>`
          : '';
        // Fully inline onclick — no global function needed (innerHTML scripts don't auto-execute)
        const onclick = `(function(b){var c=b.closest('[data-pillw]'),p=document.getElementById(c.id+'-pill'),ts=[].slice.call(c.querySelectorAll('button')),w=+c.dataset.pillw,g=+c.dataset.gap,i=ts.indexOf(b);p.style.left=(4+i*(w+g))+'px';c.dataset.active=String(i);ts.forEach(function(t){t.style.background='transparent'})})(this)`;
        return `<button onclick="${onclick}"
          style="position:relative;z-index:1;width:${pillW}px;height:24px;border-radius:12px;background:transparent;border:none;font:700 12px/1 var(--font-sans);color:var(--n7);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"
          onmouseenter="if([].slice.call(this.closest('[data-pillw]').querySelectorAll('button')).indexOf(this)!==+this.closest('[data-active]').dataset.active)this.style.background='rgba(193,205,225,.45)'"
          onmouseleave="this.style.background='transparent'">Section${badge}</button>`;
      }).join('');
      // store pillW and gap as data-attrs so the click handler knows the step
      return `<div id="${gid}" data-active="${active}" data-pillw="${pillW}" data-gap="${gap}"
        style="display:inline-flex;gap:${gap}px;background:var(--n2);border-radius:16px;padding:4px;position:relative;user-select:none">
        <div id="${gid}-pill" style="position:absolute;top:4px;left:${pillX}px;width:${pillW}px;height:24px;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(19,32,69,.1);transition:left .18s cubic-bezier(.4,0,.2,1);z-index:0;pointer-events:none"></div>
        ${tabs}
      </div>`;
    }

    // Dense rows (2–6 tabs)
    const denseRows = [2,3,4,5,6].map(n =>
      `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--n3)">
        <span style="font:500 11px var(--font-sans);color:var(--n5);width:54px;flex-shrink:0">${n} tabs</span>
        <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
          <div>
            <div style="font:400 10px var(--font-sans);color:var(--n4);margin-bottom:6px">No badge</div>
            ${tabGroup(n,'dense',0,false)}
          </div>
          <div style="padding-top:8px">
            <div style="font:400 10px var(--font-sans);color:var(--n4);margin-bottom:6px">With badge</div>
            ${tabGroup(n,'dense',0,true)}
          </div>
        </div>
      </div>`
    ).join('');

    // Wide rows (2–6 tabs)
    const wideRows = [2,3,4,5,6].map(n =>
      `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--n3)">
        <span style="font:500 11px var(--font-sans);color:var(--n5);width:54px;flex-shrink:0">${n} tabs</span>
        <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
          <div>
            <div style="font:400 10px var(--font-sans);color:var(--n4);margin-bottom:6px">No badge</div>
            ${tabGroup(n,'wide',0,false)}
          </div>
          <div style="padding-top:8px">
            <div style="font:400 10px var(--font-sans);color:var(--n4);margin-bottom:6px">With badge</div>
            ${tabGroup(n,'wide',0,true)}
          </div>
        </div>
      </div>`
    ).join('');

    // Per-tab state pill renderer (kept for reference row at the bottom)
    function tabPill(size, status, withBadge, badgeNum) {
      const w = size === 'dense' ? 74 : 98;
      const h = 24;
      let bg = 'transparent', border = 'none', shadow = '';
      if (status === 'selected') { bg = '#fff'; shadow = ';box-shadow:0 1px 3px rgba(19,32,69,.1)'; }
      if (status === 'hover')    { bg = '#E1E6ED'; }
      if (status === 'focused')  { bg = '#fff'; border = '1.5px solid #4B82FA'; }
      const bdStyle = border !== 'none' ? `border:${border};box-sizing:border-box;` : '';
      const badgeHTML = withBadge
        ? `<span style="position:absolute;top:-8px;right:-5px;min-width:${size==='dense'?20:17}px;height:16px;border-radius:8px;background:var(--r6);color:#fff;font:700 9px/1 var(--font-sans);display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box;z-index:2">${badgeNum}</span>`
        : '';
      return `<div style="position:relative;width:${w}px;height:${h}px;border-radius:12px;background:${bg};${bdStyle}display:flex;align-items:center;justify-content:center;font:700 12px/1 var(--font-sans);color:var(--n7)${shadow}">Section${badgeHTML}</div>`;
    }

    const tabStates = ['idle','hover','selected','focused'];
    const tabStateLabels = { idle:'Idle', hover:'Hover', selected:'Selected', focused:'Focused' };
    const tabVariantsHTML = `
      <style>
        .tab-vgrid{display:grid;grid-template-columns:80px 1fr 1fr 1fr 1fr;gap:8px;align-items:center}
        .tab-vhdr{font:600 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;text-align:center}
        .tab-vcell{display:flex;flex-direction:column;gap:8px;align-items:center}
        .tab-vcell-inner{display:flex;flex-direction:column;align-items:center;gap:3px}
        .tab-vcell-lbl{font:400 10px var(--font-sans);color:var(--n5);text-align:center}
      </style>
      <div class="tab-vgrid" style="margin-bottom:8px">
        <div></div>
        <div class="tab-vhdr">Dense · no badge</div>
        <div class="tab-vhdr">Dense · badge</div>
        <div class="tab-vhdr">Wide · no badge</div>
        <div class="tab-vhdr">Wide · badge</div>
      </div>
      ${tabStates.map(st => `
        <div class="tab-vgrid" style="padding:10px 0;border-top:1px solid var(--n3)">
          <div style="font:500 12px var(--font-sans);color:var(--n7)">${tabStateLabels[st]}</div>
          <div style="background:var(--n2);border-radius:8px;padding:10px;display:flex;justify-content:center">${tabPill('dense',st,false,3)}</div>
          <div style="background:var(--n2);border-radius:8px;padding:14px 10px 10px;display:flex;justify-content:center">${tabPill('dense',st,true,3)}</div>
          <div style="background:var(--n2);border-radius:8px;padding:10px;display:flex;justify-content:center">${tabPill('wide',st,false,3)}</div>
          <div style="background:var(--n2);border-radius:8px;padding:14px 10px 10px;display:flex;justify-content:center">${tabPill('wide',st,true,3)}</div>
        </div>`).join('')}`;

    const tabTokensHTML = `
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:12px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--n3);font:600 13px/1 var(--font-sans);color:var(--n7)">Tokens</div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:var(--n2)">
            <th style="padding:7px 12px;font:600 11px var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Property</th>
            <th style="padding:7px 12px;font:600 11px var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Token</th>
            <th style="padding:7px 12px;font:600 11px var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Value</th>
          </tr></thead>
          <tbody>
            ${[
              ['Container bg','--n2','#F0F2F5'],
              ['Container radius','—','16px (pill)'],
              ['Container padding','—','4px'],
              ['Dense tab width','—','74px'],
              ['Wide tab width','—','98px'],
              ['Tab height','—','24px'],
              ['Tab radius','—','12px'],
              ['Selected bg','—','#ffffff'],
              ['Hover bg','--n3','#E1E6ED'],
              ['Focused border','--b5','#4B82FA'],
              ['Badge bg','--r6','#DE350B'],
              ['Tab font','—','700 12px DM Sans'],
            ].map(([p,t,v]) => `<tr style="border-top:1px solid var(--n3)">
              <td style="padding:7px 12px;font:500 12px var(--font-sans);color:var(--n7)">${p}</td>
              <td style="padding:7px 12px;font:400 11px var(--font-mono);color:var(--b7)">${t}</td>
              <td style="padding:7px 12px;font:400 11px var(--font-mono);color:var(--n5)">${v}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    const tabCodeSnippet = `&lt;!-- Dense tabs, 3 options, no badge --&gt;
&lt;div class="dt-tabs dt-tabs--dense" data-active="0"&gt;
  &lt;div class="dt-tab-indicator"&gt;&lt;/div&gt;
  &lt;button class="dt-tab dt-tab--active" onclick="dtTabSelect(this,0)"&gt;Section 1&lt;/button&gt;
  &lt;button class="dt-tab" onclick="dtTabSelect(this,1)"&gt;Section 2&lt;/button&gt;
  &lt;button class="dt-tab" onclick="dtTabSelect(this,2)"&gt;Section 3&lt;/button&gt;
&lt;/div&gt;

&lt;!-- Wide tabs with badges --&gt;
&lt;div class="dt-tabs dt-tabs--wide" data-active="0"&gt;
  &lt;div class="dt-tab-indicator"&gt;&lt;/div&gt;
  &lt;button class="dt-tab dt-tab--active" onclick="dtTabSelect(this,0)"&gt;
    Section 1&lt;span class="dt-tab-badge"&gt;3&lt;/span&gt;
  &lt;/button&gt;
  &lt;button class="dt-tab" onclick="dtTabSelect(this,1)"&gt;
    Section 2&lt;span class="dt-tab-badge"&gt;12&lt;/span&gt;
  &lt;/button&gt;
&lt;/div&gt;

&lt;!-- CSS --&gt;
&lt;style&gt;
.dt-tabs { display:inline-flex; background:var(--n2); border-radius:16px;
           padding:4px; position:relative; }
.dt-tabs--dense .dt-tab { width:74px; }
.dt-tabs--wide  .dt-tab { width:98px; }
.dt-tab { position:relative; z-index:1; height:24px; border-radius:12px;
          font:700 12px/1 var(--font-sans); color:var(--n7);
          border:none; background:transparent; cursor:pointer; }
.dt-tab:hover:not(.dt-tab--active) { background:var(--n3); }
.dt-tab:focus-visible { outline:1.5px solid var(--b5); }
.dt-tab-indicator { position:absolute; top:4px; left:4px; height:24px;
                    border-radius:12px; background:#fff;
                    box-shadow:0 1px 3px rgba(19,32,69,.1);
                    transition:transform .2s cubic-bezier(.4,0,.2,1); z-index:0; }
.dt-tab-badge { position:absolute; top:-8px; right:-5px; min-width:16px;
                height:16px; border-radius:8px; background:var(--r6);
                color:#fff; font:700 9px/1 var(--font-sans);
                display:flex; align-items:center; justify-content:center; padding:0 4px; }
&lt;/style&gt;`;

    const tabClaudeNote = `
      <div class="card" style="background:var(--b1);border:1px solid var(--b3);margin-bottom:0">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--b7)" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <div>
            <div style="font:700 13px var(--font-sans);color:var(--b7);margin-bottom:4px">Using tabs in new screens</div>
            <div style="font:400 12px var(--font-sans);color:var(--b7);line-height:1.6">When a screen needs tabs, always call <code style="font:600 11px var(--font-mono);background:var(--b2);padding:1px 5px;border-radius:3px">dtTabsHtml(labels, activeIndex, opts)</code> from <strong>renderers.js</strong>. Never write the container + pill HTML manually — the sliding animation and token usage are encapsulated there. Pass <code style="font:600 11px var(--font-mono);background:var(--b2);padding:1px 5px;border-radius:3px">{ size:'dense'|'wide', badge:false|[n,n,...] }</code> as options.</div>
          </div>
        </div>
      </div>`;

    const tabsSection = `
      <h3 style="font:700 18px var(--font-sans);color:var(--n7);margin:32px 0 6px">Tabs</h3>
      <p class="desc" style="margin-bottom:16px">Pill-shaped segment switcher. Two sizes (Dense 74px · Wide 98px), 2–6 options, optional numeric badge per tab. Click any tab in the groups below to see the sliding pill animation.</p>

      <!-- Dense groups -->
      <div class="card" style="margin-bottom:12px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:4px">Dense · all combinations</div>
        <div style="font:400 11px var(--font-sans);color:var(--n5);margin-bottom:16px">Tab pill width: 74px · Container height: 32px · Click any tab to activate</div>
        ${denseRows}
      </div>

      <!-- Wide groups -->
      <div class="card" style="margin-bottom:12px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:4px">Wide · all combinations</div>
        <div style="font:400 11px var(--font-sans);color:var(--n5);margin-bottom:16px">Tab pill width: 98px · Container height: 32px · Click any tab to activate</div>
        ${wideRows}
      </div>

      <!-- Tokens -->
      ${tabTokensHTML}

      <!-- Code snippet -->
      <div class="card" style="margin-bottom:12px;padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--n3)">
          <span style="font:600 13px/1 var(--font-sans);color:var(--n7)">HTML + CSS snippet</span>
          <button onclick="copyCode(this)" style="height:24px;padding:0 10px;border-radius:4px;font:600 11px var(--font-sans);background:var(--n2);color:var(--n6);border:1px solid var(--n3);cursor:pointer">Copy</button>
        </div>
        <pre style="margin:0;padding:16px;font:400 11px/1.7 var(--font-mono);color:var(--n6);background:var(--n1);overflow-x:auto">${tabCodeSnippet}</pre>
      </div>

      <!-- Claude usage note -->
      ${tabClaudeNote}`;

    return `
      ${sectionHeader(data)}
      <div class="card">${rows}</div>
      ${fileUploaderSection}
      ${tabsSection}`;
  },

  /* ── CHIPS / PILLS ── */
  chips(data) {
    const VARIANTS = ['text','no-outline','outline','icon-outline','icon-outline-x','icon-solid-x','solid'];
    const VARIANT_LABELS = ['Text','No outline','Outline','Icon','Icon + ×','Solid + ×','Solid'];

    const CC = {
      info:    { light:'var(--b1)', bd:'var(--b3)', fg:'var(--b6)', solid:'var(--b5)', solidFg:'#fff' },
      success: { light:'var(--g1)', bd:'var(--g3)', fg:'var(--g7)', solid:'var(--g5)', solidFg:'#fff' },
      warning: { light:'var(--o1)', bd:'var(--o3)', fg:'var(--o7)', solid:'var(--o5)', solidFg:'#fff' },
      error:   { light:'var(--r1)', bd:'var(--r3)', fg:'var(--r6)', solid:'var(--r5)', solidFg:'#fff' },
      neutral: { light:'var(--n2)', bd:'var(--n4)', fg:'var(--n6)', solid:'var(--n5)', solidFg:'#fff' },
    };

    const BASE_PILL = 'display:inline-flex;align-items:center;gap:4px;height:22px;padding:2px 6px;border-radius:4px;font:600 11px/1 var(--font-sans);white-space:nowrap;';
    const X_BTN = iconSvg('close', 10, 'currentColor').replace('<svg ', '<svg style="opacity:.7;flex-shrink:0" ');

    function renderVariant(label, icon, colorKey, variant) {
      const c = CC[colorKey] || CC.neutral;
      const ic = icon ? iconSvg(icon, 12, c.fg) : '';
      const icS = icon ? iconSvg(icon, 12, c.solidFg) : '';
      switch (variant) {
        case 'text':
          return `<span style="${BASE_PILL}background:transparent;color:${c.fg}">${escHtml(label)}</span>`;
        case 'no-outline':
          return `<span style="${BASE_PILL}background:${c.light};color:${c.fg}">${escHtml(label)}</span>`;
        case 'outline':
          return `<span style="${BASE_PILL}background:${c.light};color:${c.fg};border:1px solid ${c.bd}">${escHtml(label)}</span>`;
        case 'icon-outline':
          return `<span style="${BASE_PILL}background:${c.light};color:${c.fg};border:1px solid ${c.bd}">${ic}${escHtml(label)}</span>`;
        case 'icon-outline-x':
          return `<span style="${BASE_PILL}background:${c.light};color:${c.fg};border:1px solid ${c.bd}">${ic}${escHtml(label)}${X_BTN}</span>`;
        case 'icon-solid-x':
          return `<span style="${BASE_PILL}background:${c.solid};color:${c.solidFg}">${icS}${escHtml(label)}${X_BTN}</span>`;
        case 'solid':
          return `<span style="${BASE_PILL}background:${c.solid};color:${c.solidFg}">${escHtml(label)}</span>`;
        default:
          return `<span style="${BASE_PILL}background:${c.light};color:${c.fg}">${escHtml(label)}</span>`;
      }
    }

    function renderSimplePill(p) {
      const c = CC[p.color] || CC.neutral;
      const ic = p.icon ? iconSvg(p.icon, 12, c.fg) : '';
      const dismiss = p.dismissible ? X_BTN : '';
      return `<span style="${BASE_PILL}background:${c.light};color:${c.fg};border:1px solid ${c.bd}">${ic}${escHtml(p.label)}${dismiss}</span>`;
    }

    const tokens = data.tokens || {};
    const tokenRows = Object.entries(tokens).map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;font:600 12px/1 var(--font-mono);color:var(--n7)">${escHtml(k)}</td>
        <td style="padding:8px 12px;font:400 12px/1 var(--font-mono);color:var(--n5)">--chip-${escHtml(k)}</td>
        <td style="padding:8px 12px;font:400 12px/1 var(--font-mono);color:var(--b6)">${escHtml(v)}</td>
      </tr>`).join('');

    const tokensCard = `
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:24px">
        <div style="padding:14px 16px;border-bottom:1px solid var(--n3)">
          <span style="font:600 13px/1 var(--font-sans);color:var(--n7)">Tokens</span>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:var(--n2)">
              <th style="padding:8px 12px;font:600 11px/1 var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Property</th>
              <th style="padding:8px 12px;font:600 11px/1 var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Token</th>
              <th style="padding:8px 12px;font:600 11px/1 var(--font-sans);color:var(--n5);text-align:left;text-transform:uppercase;letter-spacing:.04em">Value</th>
            </tr>
          </thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>`;

    const statuses = data.statuses || [];
    const headerCells = VARIANT_LABELS.map(l =>
      `<div style="font:600 11px/1 var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;padding:6px 0">${l}</div>`
    ).join('');

    const statusRows = statuses.map(s => {
      const cells = VARIANTS.map(v => `<div style="display:flex;align-items:center">${renderVariant(s.label, s.icon, s.color, v)}</div>`).join('');
      return cells;
    }).join('');

    const gridCols = `repeat(${VARIANTS.length}, minmax(0,1fr))`;
    const statusGrid = `
      <div class="card" style="margin-bottom:24px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:16px">Status × variant grid</div>
        <div style="display:grid;grid-template-columns:${gridCols};gap:6px;align-items:center">
          ${headerCells}
          ${statusRows}
        </div>
      </div>`;

    const groups = (data.groups || []);
    const groupCards = groups.map(g => {
      const pills = (g.pills || []).map(renderSimplePill).join('');
      return `
        <div style="flex:1;min-width:200px">
          <div style="font:600 11px/1 var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">${escHtml(g.title)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">${pills}</div>
        </div>`;
    }).join('');

    const groupsCard = `
      <div class="card" style="margin-bottom:24px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:16px">Groups</div>
        <div style="display:flex;flex-wrap:wrap;gap:20px 32px">${groupCards}</div>
      </div>`;

    const snippet = `<span class="pill-info">Scheduled</span>
<span class="pill-success">Delivered</span>
<span class="pill-warning">Pending</span>
<span class="pill-error">Failed</span>
<span class="pill-neutral">Draft</span>

<!-- With icon -->
<span class="pill-success pill-icon">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
  Delivered
</span>

<!-- Dismissible -->
<span class="pill-info pill-x">
  Zone: North
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
</span>`;

    const snippetCard = `
      <div class="card" style="margin-bottom:24px">
        <div style="font:600 13px/1 var(--font-sans);color:var(--n7);margin-bottom:12px">Usage</div>
        ${codeBlock(snippet)}
      </div>`;

    return `${sectionHeader(data)}${tokensCard}${statusGrid}${groupsCard}${snippetCard}`;
  },

  /* ── BADGES ── */
  badges(data) {
    const badgeMap = {success:'bg', danger:'br', warning:'bo', info:'bb', neutral:'bn', outline:'bx'};
    const badges = (data.badges || []).map(b => {
      const cls = badgeMap[b.type] || 'bn';
      const dot = b.dot ? '<span class="dot"></span>' : '';
      return `<span class="badge ${cls}">${dot}${escHtml(b.label)}</span>`;
    }).join('');

    const chips = (data.chips || []).map(c => {
      const bg = c.chipBg ? `background:${c.chipBg};color:${c.chipColor}` : '';
      return `<span class="chip" style="${bg}"><span class="av" style="background:${c.avatarBg};color:${c.avatarColor}">${escHtml(c.initials)}</span>${escHtml(c.label)}</span>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      <div class="card">
        <div style="display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center">
          ${badges}${chips}
        </div>
      </div>`;
  },

  /* ── ALERTS / TOASTS ── */
  alerts(data) {
    const TYPES = data.types || ['info', 'neutral', 'warning', 'error', 'success'];

    const TC = {
      info:    { bg: 'var(--b2)', bd: 'var(--b3)',  fg: 'var(--b7)', ic: 'var(--b6)',  ip: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' },
      neutral: { bg: 'var(--n2)', bd: 'var(--n3)',  fg: 'var(--n6)', ic: 'var(--n5)',  ip: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' },
      warning: { bg: 'var(--o1)', bd: 'var(--o3)',  fg: 'var(--n7)', ic: 'var(--o7)',  ip: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
      error:   { bg: 'var(--r1)', bd: '#f5c2c7',    fg: 'var(--r7)', ic: 'var(--r6)',  ip: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
      success: { bg: 'var(--g1)', bd: 'var(--g2)',  fg: 'var(--g7)', ic: 'var(--g6)',  ip: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>' },
    };

    function typeIcon(type) {
      const c = TC[type] || TC.info;
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="${c.ic}" style="flex-shrink:0;margin-top:1px">${c.ip}</svg>`;
    }

    function xBtn() {
      return `<button style="flex-shrink:0;background:none;border:none;padding:0;cursor:pointer;opacity:.55;display:flex;align-items:center;line-height:0" title="Dismiss"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
    }

    function actionIcon(name) {
      const paths = {
        eye:      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      };
      return `<button style="flex-shrink:0;background:none;border:none;padding:0;cursor:pointer;opacity:.6;display:flex;align-items:center;line-height:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths[name] || ''}</svg></button>`;
    }

    function renderAlert(row, type) {
      const c = TC[type] || TC.info;
      const base = `background:${c.bg};border:1px solid ${c.bd};border-radius:6px;color:${c.fg}`;

      if (row.title) {
        const paras = row.paragraphs || (row.text ? [row.text] : []);
        return `<div style="${base};padding:14px 40px 14px 16px;position:relative">
          ${row.hasClose !== false ? `<div style="position:absolute;top:10px;right:10px">${xBtn()}</div>` : ''}
          <strong style="display:block;font:700 14px/1.4 var(--font-sans);margin-bottom:8px">${escHtml(row.title)}</strong>
          ${paras.map(p => `<p style="margin:0 0 6px;font:400 13px/1.5 var(--font-sans)">${escHtml(p)}</p>`).join('')}
        </div>`;
      }

      const extras = (row.extraActions || []).map(actionIcon).join('');
      const lines = (row.text || '').split('\n');
      const textHtml = lines.length > 1
        ? lines.map(l => escHtml(l)).join('<br>')
        : escHtml(row.text || '');
      return `<div style="${base};padding:10px 12px;display:flex;align-items:center;gap:10px">
        ${typeIcon(type)}
        <span style="flex:1;font:400 13px/1.4 var(--font-sans)">${textHtml}</span>
        ${extras}
        ${row.hasClose !== false ? xBtn() : ''}
      </div>`;
    }

    if (data.groups) {
      const sections = data.groups.map(group => {
        const cells = (group.rows || []).flatMap(row => TYPES.map(type => renderAlert(row, type)));
        return `<div style="display:grid;grid-template-columns:repeat(${TYPES.length},1fr);gap:10px;margin-bottom:24px">${cells.join('')}</div>`;
      }).join('');
      return `${sectionHeader(data)}${sections}`;
    }

    return sectionHeader(data);
  },

  /* ── MODAL ── */
  modal(data) {
    const p  = data.preview || {};
    const t  = data.tokens || {};
    const mt = data.mobileTokens || {};

    function renderFields(fields, isMobile) {
      return fields.map(f => {
        const focusCls = f.state === 'focus' ? 'foc' : '';
        const selectArrow = f.type === 'select' ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>` : '';
        return `<div class="fld" style="margin-bottom:10px">
          <label style="font-size:${isMobile ? '12px' : '13px'}">${escHtml(f.label)}${f.required ? ' <span class="req">*</span>' : ''}</label>
          <div class="inp ${focusCls}" style="${f.type === 'select' ? 'justify-content:space-between;' : ''}height:${isMobile ? '44px' : '40px'}">
            <input value="${escHtml(f.value || '')}" style="width:100%;font-size:13px">${selectArrow}
          </div>
          ${f.helper ? `<div class="hlp" style="font-size:${isMobile ? '10px' : '11px'}">${escHtml(f.helper)}</div>` : ''}
        </div>`;
      }).join('');
    }

    function renderActions(actions, isMobile) {
      const layout = isMobile
        ? 'display:flex;flex-direction:column-reverse;gap:8px;border-top:1px solid var(--n3);padding-top:14px;margin-top:4px'
        : 'display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--n3);padding-top:14px;margin-top:4px';
      return `<div style="${layout}">${actions.map(a => {
        const cls = a.type === 'primary' ? 'btn pri' : 'btn sec';
        const style = isMobile ? 'width:100%;justify-content:center;height:48px' : '';
        return `<button class="${cls}" style="${style}">${escHtml(a.label)}</button>`;
      }).join('')}</div>`;
    }

    const warning = p.warning ? `<div class="bn wr" style="margin-bottom:14px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFAB00" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
      <span>${escHtml(p.warning)}</span>
    </div>` : '';

    const desktopModal = `
      <div style="background:rgba(19,32,69,.45);padding:32px 24px;border-radius:8px;display:flex;justify-content:center;align-items:center;min-height:520px">
        <div style="width:440px;max-width:100%;background:#fff;border-radius:4px;padding:24px;border:1px solid #A3B5D1;box-shadow:0 8px 16px rgba(0,0,0,.15)">
          <div style="display:flex;align-items:flex-start;margin-bottom:4px">
            <h1 style="font:700 22px/1.3 var(--font-sans);color:#546884;flex:1;margin:0">${escHtml(p.title || '')}</h1>
            <svg style="width:22px;height:22px;color:var(--n5);cursor:pointer;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </div>
          <div style="font:400 12px var(--font-sans);color:var(--n5);margin:4px 0 16px">${escHtml(p.subtitle || '')}</div>
          ${renderFields(p.fields || [], false)}
          ${warning}
          ${renderActions(p.actions || [], false)}
        </div>
      </div>`;

    const mobileModal = `
      <div style="background:rgba(19,32,69,.45);padding:24px 16px;border-radius:8px;display:flex;justify-content:center;align-items:center;min-height:520px">
        <div style="width:288px;background:#1a1a1a;border-radius:28px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.4)">
          <div style="background:#F0F2F5;border-radius:22px;height:480px;position:relative;overflow:hidden">
            <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:#1a1a1a;border-radius:2px"></div>
            <div style="position:absolute;inset:32px 16px 16px;background:#fff;border-radius:8px;padding:16px;box-shadow:0 8px 16px rgba(0,0,0,.15);display:flex;flex-direction:column">
              <div style="display:flex;align-items:flex-start;margin-bottom:4px">
                <h1 style="font:700 18px/1.3 var(--font-sans);color:#546884;flex:1;margin:0">${escHtml(p.title || '')}</h1>
                <svg style="width:20px;height:20px;color:var(--n5);cursor:pointer;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </div>
              <div style="font:400 11px var(--font-sans);color:var(--n5);margin:4px 0 12px">${escHtml(p.subtitle || '')}</div>
              <div style="flex:1;overflow:auto;min-height:0">
                ${renderFields(p.fields || [], true)}
                ${warning}
              </div>
              ${renderActions(p.actions || [], true)}
            </div>
          </div>
        </div>
      </div>`;

    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td><td><code>${escHtml(String(mt[k] || '—'))}</code></td></tr>`).join('');

    return `
      ${sectionHeader(data)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div>
          <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Desktop
            <span style="font-weight:400;color:var(--n5);margin-left:auto">500px wide · centered</span>
          </div>
          <div class="card flush">${desktopModal}</div>
        </div>
        <div>
          <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Mobile
            <span style="font-weight:400;color:var(--n5);margin-left:auto">full-width · stacked actions</span>
          </div>
          <div class="card flush">${mobileModal}</div>
        </div>
      </div>
      ${mt.note ? `<div class="bn in" style="margin-bottom:14px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${escHtml(mt.note)}</span>
      </div>` : ''}
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Design tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Desktop</th><th>Mobile</th></tr></thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>`;
  },

  /* ── TABLE ── */
  table(data) {
    const sortBothSvg = `<svg class="tbl-sort" width="9" height="9" viewBox="0 0 32 32" fill="currentColor"><path d="M16 4L6 16h20L16 4zm0 24L6 16h20l-10 12z"/></svg>`;
    const sortAscSvg  = `<svg class="tbl-sort" width="9" height="9" viewBox="0 0 32 32" fill="currentColor"><path d="M6 20h20L16 8z"/></svg>`;
    const sortDescSvg = `<svg class="tbl-sort" width="9" height="9" viewBox="0 0 32 32" fill="currentColor"><path d="M6 12h20l-10 12z"/></svg>`;

    /* ── cell renderer ── */
    function rc(cell, extraCls) {
      const cls = extraCls ? ` class="${extraCls}"` : '';
      if (cell === null || cell === undefined) return `<td${cls}></td>`;
      if (typeof cell !== 'object') return `<td${cls}>${escHtml(String(cell))}</td>`;

      switch (cell.type) {
        case 'checkbox':
          return `<td class="tbl-cb-td${extraCls?' '+extraCls:''}"><div class="tbl-cb"><input type="checkbox"${cell.value?' checked':''} onclick="tblRowSel(this)"></div></td>`;

        case 'avatar-text': {
          const ini = cell.initials || (cell.value||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
          return `<td${cls}><div class="tbl-av"><div class="tbl-av-dot" style="background:${cell.color||'#1F60ED'}">${escHtml(ini)}</div><span>${escHtml(cell.value||'')}</span></div></td>`;
        }

        case 'text-icon':
        case 'icon-text': {
          const ico = iconSvg(cell.icon||'location', 14, 'var(--n5)');
          return `<td${cls}><div class="tbl-ti">${ico}<span>${escHtml(cell.value||'')}</span></div></td>`;
        }

        case 'text-icon-right': {
          const ico = iconSvg(cell.icon||'document', 14, 'var(--n5)');
          return `<td${cls}><div class="tbl-ti">${escHtml(cell.value||'')} ${ico}</div></td>`;
        }

        case 'text-sub':
          return `<td${cls}><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span><span style="display:block;font:400 11px var(--font-sans);color:var(--n5);line-height:1.3;margin-top:2px">${escHtml(cell.sub||'')}</span></td>`;

        case 'text-error':
          return `<td${cls}><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span><span style="display:block;font:400 11px var(--font-sans);color:var(--r6);line-height:1.3;margin-top:2px">${escHtml(cell.error||'')}</span></td>`;

        case 'text-icon-error': {
          const ico = iconSvg('close-filled', 14, 'var(--r6)');
          return `<td${cls}><div style="display:flex;align-items:center;gap:6px">${ico}<span style="font:400 13px var(--font-sans);color:var(--n7);line-height:1.3">${escHtml(cell.value||'')}</span></div><span style="display:block;font:400 11px var(--font-sans);color:var(--r6);line-height:1.3;margin-top:2px">${escHtml(cell.error||'')}</span></td>`;
        }

        case 'sub-header':
          return `<td${cls}><span style="display:block;font:400 11px var(--font-sans);color:var(--n5);line-height:1.3">${escHtml(cell.sub||cell.label||'')}</span><span style="display:block;font:400 13px var(--font-sans);color:var(--n7);line-height:1.3;margin-top:2px">${escHtml(cell.value||'')}</span></td>`;

        case 'link':
          return `<td class="cell-lnk${extraCls?' '+extraCls:''}">${escHtml(cell.value||'')}</td>`;

        case 'badge':
          return `<td${cls}>${badgeHtml(cell.value||'', cell.variant||'neutral')}</td>`;

        case 'date':
          return `<td${cls}>${escHtml(cell.value||'')}</td>`;

        case 'number':
          return `<td class="cell-num${extraCls?' '+extraCls:''}">${escHtml(String(cell.value||''))}</td>`;

        case 'text-secondary':
          return `<td class="cell-muted${extraCls?' '+extraCls:''}">${escHtml(cell.value||'')}</td>`;

        case 'rating': {
          const n = Math.round(cell.value||0);
          const uid = 'sr'+Math.random().toString(36).slice(2,7);
          const stars = [1,2,3,4,5].map(i =>
            `<span class="star${i<=n?' on':''}" onclick="starSet(this)" onmouseenter="starHov(this,true)" onmouseleave="starHov(this,false)">★</span>`
          ).join('');
          return `<td${cls}><div class="tbl-stars" id="${uid}">${stars}</div></td>`;
        }

        case 'switch': {
          const on = cell.value ? ' on' : '';
          return `<td${cls}><div class="tbl-sw-track${on}" onclick="this.classList.toggle('on')"><div class="tbl-sw-thumb"></div></div></td>`;
        }

        case 'switch-text': {
          const on = cell.value ? ' on' : '';
          const lbl = escHtml(cell.label || (cell.value ? 'On' : 'Off'));
          return `<td${cls}><div class="tbl-sw-wrap"><div class="tbl-sw-track${on}" onclick="this.classList.toggle('on')"><div class="tbl-sw-thumb"></div></div><span>${lbl}</span></div></td>`;
        }

        case 'chip-lg':
          return `<td${cls}><span class="tbl-chip lg">${escHtml(cell.value||'')}</span></td>`;

        case 'chip-sm':
          return `<td${cls}><span style="display:inline-flex;align-items:center;height:22px;padding:2px 6px;border-radius:4px;border:1px solid var(--n4);background:var(--n2);color:var(--n6);font:600 11px/1 var(--font-sans);white-space:nowrap">${escHtml(cell.value||'')}</span></td>`;

        case 'pill-new':
          return `<td${cls}><span style="display:inline-flex;align-items:center;height:22px;padding:2px 6px;border-radius:4px;border:1px solid var(--b3);background:var(--b1);color:var(--b6);font:600 11px/1 var(--font-sans);white-space:nowrap">${escHtml(cell.value||'New')}</span></td>`;

        case 'loading-bar': {
          const pct = Math.min(100, Math.max(0, cell.value||0));
          return `<td${cls}><div class="tbl-bar-wrap"><div class="tbl-bar"><div class="tbl-bar-fill" style="width:${pct}%"></div></div><span class="tbl-bar-pct">${pct}%</span></div></td>`;
        }

        case 'lazy':
          return `<td${cls}><div class="tbl-skel cell"></div></td>`;

        case 'actions': {
          const acts = cell.value || [];
          let btns;
          if (acts.length <= 2) {
            btns = acts.map(act =>
              `<button class="tbl-act-btn" onclick="return false" title="${escHtml(act)}">${iconSvg(act,14)}</button>`
            ).join('');
          } else {
            const overflow = acts.slice(1);
            const dataActs = JSON.stringify(overflow).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            btns = `<button class="tbl-act-btn" onclick="return false" title="${escHtml(acts[0])}">${iconSvg(acts[0],14)}</button>` +
              `<button class="tbl-act-btn" data-acts="${dataActs}" onclick="tblMenu(this)" title="More options">${iconSvg('overflow-menu-vertical',14)}</button>`;
          }
          return `<td class="tbl-acts-col${extraCls?' '+extraCls:''}"><div class="tbl-acts">${btns}</div></td>`;
        }

        default:
          return `<td${cls}>${escHtml(String(cell.value!==undefined?cell.value:''))}</td>`;
      }
    }

    /* ── header renderer (supports sub-label and lazy) ── */
    function rh(col, actsCls) {
      const extra = actsCls ? ` class="${actsCls}"` : '';
      if (col.type === 'lazy') {
        return `<th${extra}><div class="tbl-skel hd"></div></th>`;
      }
      const w = col.type === 'checkbox' ? ' style="width:40px"' : '';
      const sv = col.sort==='asc' ? sortAscSvg : col.sort==='desc' ? sortDescSvg : col.sortable ? sortBothSvg : '';
      if (col.sub) {
        return `<th${w}${extra}><div class="tbl-hd-stack"><span class="tbl-hd-sub">${escHtml(col.sub)}</span><span>${escHtml(col.label||'')}${sv}</span></div></th>`;
      }
      if (col.type === 'actions') {
        return `<th class="tbl-acts-col" style="text-align:center"${w}>${escHtml(col.label||'')}</th>`;
      }
      return `<th${w}${extra}>${escHtml(col.label||'')}${sv}</th>`;
    }

    /* ── row renderer ── */
    function rr(row, cols) {
      const cls = row.state==='hover'?'hov':row.state==='selected'?'sel':row.state==='disabled'?'dis':'';
      const cells = (row.cells||[]).map((c,i) => {
        const colType = cols && cols[i] ? cols[i].type : null;
        return rc(c);
      }).join('');
      return `<tr${cls?' class="'+cls+'"':''  }>${cells}</tr>`;
    }

    /* ── build one scrollable demo table ── */
    function demoTable(def) {
      const cols = def.columns || [];
      const hasCb = cols.some(c => c.type === 'checkbox');
      const hasActs = cols.some(c => c.type === 'actions');
      const isBulk = hasCb && hasActs;

      let bulkBarHtml = '';
      if (isBulk) {
        const actsSet = new Set();
        (def.rows||[]).forEach(row => {
          (row.cells||[]).forEach(cell => {
            if (cell && cell.type === 'actions') {
              (cell.value||[]).filter(a => a !== 'edit').forEach(a => actsSet.add(a));
            }
          });
        });
        const bulkBtns = [...actsSet].map(act =>
          `<button class="tbl-bulk-btn" onclick="return false" title="${escHtml(act)}">${iconSvg(act,14,'currentColor')}<span>${escHtml(act.charAt(0).toUpperCase()+act.slice(1))}</span></button>`
        ).join('');
        bulkBarHtml = `<div class="tbl-bulk-bar"><span class="tbl-bulk-cnt"></span><div class="tbl-bulk-actions">${bulkBtns}</div></div>`;
      }

      let head;
      if (isBulk) {
        const masterCb = `<div class="tbl-cb"><input type="checkbox" onclick="tblMaster(this)" style="width:14px;height:14px;accent-color:var(--b5);cursor:pointer"></div>`;
        head = cols.map(c => {
          if (c.type === 'checkbox') return `<th style="width:40px;padding:10px 0;text-align:center">${masterCb}</th>`;
          if (c.type === 'actions') return `<th class="tbl-acts-col" style="text-align:center">${escHtml(c.label||'')}</th>`;
          const sv = c.sort==='asc' ? sortAscSvg : c.sort==='desc' ? sortDescSvg : c.sortable ? sortBothSvg : '';
          if (c.sub) return `<th><div class="th-inner"><div class="tbl-hd-stack"><span class="tbl-hd-sub">${escHtml(c.sub)}</span><span>${escHtml(c.label||'')}${sv}</span></div></div></th>`;
          return `<th><div class="th-inner">${escHtml(c.label||'')}${sv}</div></th>`;
        }).join('');
      } else {
        head = cols.map(c => rh(c)).join('');
      }

      const body = (def.rows||[]).map(r => rr(r, cols)).join('');
      return `<div class="tbl-outer">${bulkBarHtml}<div class="tbl-wrap"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
    }

    /* ── row types demo ── */
    const rd = data.rowTypeDemo || {};
    const rdTable = demoTable(rd);

    /* ── cell types demo ── */
    const cd = data.cellTypeDemo || {};
    const cdTable = demoTable(cd);

    /* ── extended demo groups ── */
    const groupSections = (data.cellTypeDemoGroups||[]).map(g =>
      `<div style="margin-bottom:20px">
        <div style="font:600 13px var(--font-sans);color:var(--n5);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;font-size:11px">${escHtml(g.label)}</div>
        <div class="card flush">${demoTable(g)}</div>
      </div>`
    ).join('');

    /* ── row state spec ── */
    const rowSpecRows = (data.rowTypes||[]).map(rt => {
      const sw = `background:${rt.bg||'#fff'};${rt.stripeColor?`box-shadow:inset 3px 0 0 ${rt.stripeColor};`:''}${rt.opacity?'opacity:.4;':''}`;
      return `<tr><td><strong>${escHtml(rt.label)}</strong></td>
        <td><span class="tbl-spec-sw" style="${sw}"></span><code>${escHtml(rt.bg||'—')}</code>${rt.stripeColor?` + <code>${escHtml(rt.stripeColor)}</code> stripe`:''}${rt.opacity?` · ${rt.opacity} opacity`:''}</td>
        <td>${escHtml(rt.description)}</td></tr>`;
    }).join('');

    /* ── badge variants ── */
    const badgeVars = (data.cellTypes||[]).find(ct=>ct.badgeVariants);
    const badgeVarHtml = badgeVars ? badgeVars.badgeVariants.map(bv=>badgeHtml(bv.label,bv.variant)).join('&nbsp;') : '';

    /* ── cell type spec ── */
    const cellSpecRows = (data.cellTypes||[]).map(ct =>
      `<tr><td><code>${escHtml(ct.id)}</code></td><td><strong>${escHtml(ct.label)}</strong></td><td>${escHtml(ct.description)}</td></tr>`
    ).join('');

    /* ── column type map ── */
    const cmapRows = Object.entries(data.columnTypeMap||{}).map(([type,ps]) =>
      `<tr><td><code>${escHtml(type)}</code></td><td>${ps.map(p=>`<code style="margin-right:3px">${escHtml(p||'""')}</code>`).join('')}</td></tr>`
    ).join('');

    /* ── tokens ── */
    const tokRows = Object.entries(data.tokens||{}).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td>${escHtml(v)}</td></tr>`
    ).join('');

    /* ── scroll demo ── */
    const sd = data.scrollDemo;
    const scrollSection = sd ? `
      <div style="margin-bottom:28px">
        <div class="tbl-stitle">Sticky actions · horizontal scroll</div>
        <div class="tbl-desc">With many columns the Actions column stays fixed to the right edge — white background so it covers scrolled content. All other columns scroll under it.</div>
        <div class="card flush">${demoTable(sd)}</div>
      </div>` : '';

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}

      <div style="margin-bottom:28px">
        <div class="tbl-stitle">Row types</div>
        <div class="card flush" style="margin-bottom:14px">${rdTable}</div>
        <div class="card">
          <table class="ttbl">
            <thead><tr><th>State</th><th>Background</th><th>Description</th></tr></thead>
            <tbody>${rowSpecRows}</tbody>
          </table>
        </div>
      </div>

      ${scrollSection}

      <div style="margin-bottom:28px">
        <div class="tbl-stitle">Cell types</div>
        <div class="card flush" style="margin-bottom:20px">${cdTable}</div>
        ${groupSections}
        ${badgeVarHtml?`<div style="margin-bottom:14px"><span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;margin-right:10px">Badge variants</span>${badgeVarHtml}</div>`:''}
        <div class="card">
          <table class="ttbl">
            <thead><tr><th>ID</th><th>Label</th><th>Description</th></tr></thead>
            <tbody>${cellSpecRows}</tbody>
          </table>
        </div>
      </div>

      <div style="margin-bottom:28px">
        <div class="tbl-stitle">Column type inference</div>
        <div class="tbl-desc">Column names matching these patterns are auto-assigned the corresponding cell type.</div>
        <div class="card">
          <table class="ttbl">
            <thead><tr><th>Cell type</th><th>Matching column names</th></tr></thead>
            <tbody>${cmapRows}</tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="tbl-stitle">Tokens</div>
        <div class="card">
          <table class="ttbl">
            <thead><tr><th>Token</th><th>Value</th></tr></thead>
            <tbody>${tokRows}</tbody>
          </table>
        </div>
      </div>

      ${(function(){
        /* ─ MOBILE RESPONSIVE PATTERNS ─ */
        // We use the scrollDemo data to build real mobile previews
        const sd = data.scrollDemo || {};
        const allCols = sd.columns || [];
        const allRows = sd.rows || [];

        // Subset: cols 1-6 (skip checkbox col 0), rows 0-3
        // Labels for card view
        const cardCols = allCols.slice(1); // skip checkbox
        const cardRows = allRows.slice(0, 4);

        // ── helper: render a simple cell value as plain text for card view
        function cellText(cell) {
          if (!cell) return '—';
          if (typeof cell !== 'object') return escHtml(String(cell));
          if (cell.type === 'badge') return `<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:3px;font:600 10px/1 var(--font-sans);${cell.variant==='success'?'background:#E3FCEF;color:#006844':cell.variant==='info'?'background:var(--b1);color:var(--b7)':cell.variant==='warning'?'background:var(--o1);color:var(--o7)':cell.variant==='danger'?'background:var(--r1);color:var(--r6)':'background:var(--n2);color:var(--n6)'}">${escHtml(cell.value||'')}</span>`;
          if (cell.type === 'avatar-text') return `<span style="font:500 12px var(--font-sans);color:var(--n7)">${escHtml(cell.value||'')}</span>`;
          if (cell.type === 'chip-sm') return `<span style="display:inline-flex;height:18px;padding:0 6px;border-radius:3px;border:1px solid var(--n4);background:var(--n2);font:600 10px/18px var(--font-sans);color:var(--n6)">${escHtml(cell.value||'')}</span>`;
          if (cell.type === 'loading-bar') return `<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:4px;background:var(--n3);border-radius:2px;overflow:hidden"><div style="width:${cell.value||0}%;height:100%;background:var(--b5);border-radius:2px"></div></div><span style="font:400 11px var(--font-sans);color:var(--n5)">${cell.value||0}%</span></div>`;
          if (cell.type === 'actions') return null; // handled separately
          if (cell.type === 'checkbox') return null;
          return escHtml(String(cell.value !== undefined ? cell.value : ''));
        }

        // ── Card view renderer ──
        function renderCards(rows, cols) {
          return rows.map(row => {
            const cells = row.cells || [];
            // col indices (after skipping checkbox col 0)
            // cells[0]=checkbox, cells[1]=link(#ORD), cells[2]=avatar-text(cliente), cells[3]=badge(estado)
            // cells[4]=chip(zona), cells[5]=icon-text(dir), cells[6]=text(conductor), cells[12]=actions
            const orderId   = cells[1]  ? escHtml(String(cells[1].value||'')) : '—';
            const clientTxt = cells[2]  ? cellText(cells[2]) : '—';
            const stateBadge= cells[3]  ? cellText(cells[3]) : '';
            const zona      = cells[4]  ? cellText(cells[4]) : '—';
            const dir       = cells[5]  ? escHtml((cells[5].value||'')) : '—';
            const driver    = cells[6]  ? escHtml(String(cells[6].value||'')) : '—';
            const actCell   = cells[12];
            const acts      = actCell && actCell.type === 'actions'
              ? (actCell.value||[]).slice(0,2).map(a => `<button style="width:28px;height:28px;border-radius:4px;border:none;background:var(--n2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:var(--n6)">${iconSvg(a,13,'currentColor')}</button>`).join('')
              : '';
            const initials = cells[2] ? (cells[2].initials || (cells[2].value||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()) : '?';
            const avatarColor = cells[2] ? (cells[2].color||'var(--b6)') : 'var(--b6)';
            return `<div style="background:#fff;border-radius:8px;border:1px solid var(--n3);overflow:hidden;margin-bottom:8px">
              <div style="padding:10px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--n3)">
                <div style="width:28px;height:28px;border-radius:50%;background:${avatarColor};display:flex;align-items:center;justify-content:center;font:700 10px/1 var(--font-sans);color:#fff;flex-shrink:0">${escHtml(initials)}</div>
                <div style="flex:1;min-width:0">
                  <div style="font:700 12px/1 var(--font-sans);color:var(--b7)">${orderId}</div>
                  <div style="font:500 11px/1 var(--font-sans);color:var(--n7);margin-top:2px">${clientTxt}</div>
                </div>
                ${stateBadge}
              </div>
              <div style="padding:8px 12px;display:flex;flex-direction:column;gap:5px">
                <div style="display:flex;gap:6px;align-items:center"><span style="font:400 10px var(--font-sans);color:var(--n5);width:64px;flex-shrink:0">Zona</span><span style="font:400 12px var(--font-sans);color:var(--n7)">${zona}</span></div>
                <div style="display:flex;gap:6px;align-items:flex-start"><span style="font:400 10px var(--font-sans);color:var(--n5);width:64px;flex-shrink:0">Dirección</span><span style="font:400 12px var(--font-sans);color:var(--n7);flex:1">${dir}</span></div>
                <div style="display:flex;gap:6px;align-items:center"><span style="font:400 10px var(--font-sans);color:var(--n5);width:64px;flex-shrink:0">Conductor</span><span style="font:400 12px var(--font-sans);color:var(--n7)">${driver}</span></div>
              </div>
              ${acts ? `<div style="padding:8px 12px;border-top:1px solid var(--n3);display:flex;justify-content:flex-end;gap:4px">${acts}</div>` : ''}
            </div>`;
          }).join('');
        }

        // ── Priority-columns table (3 key cols visible on mobile) ──
        const priorityCols = [allCols[1], allCols[2], allCols[3]]; // #Orden, Cliente, Estado
        const priorityHead = priorityCols.map(c =>
          `<th style="padding:8px 10px;font:600 11px/1 var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em;text-align:left;white-space:nowrap">${escHtml(c.label||'')}</th>`
        ).join('');
        const priorityBody = cardRows.map(row => {
          const cells = row.cells || [];
          const c1 = cells[1] ? `<td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--b7);white-space:nowrap">${escHtml(String(cells[1].value||''))}</td>` : '<td></td>';
          const c2 = cells[2] ? `<td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n7);white-space:nowrap">${escHtml(cells[2].value||'')}</td>` : '<td></td>';
          const c3 = cells[3] ? `<td style="padding:8px 10px">${cellText(cells[3])}</td>` : '<td></td>';
          return `<tr style="border-top:1px solid var(--n3)">${c1}${c2}${c3}</tr>`;
        }).join('');

        // ── Phone frame helper ──
        function phoneFrame(content, label) {
          return `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px">
            <div style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em;display:flex;align-items:center;gap:6px">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              ${label}
            </div>
            <div style="width:375px;max-width:100%;border:1.5px solid var(--n4);border-radius:12px;overflow:hidden;background:var(--n2);box-shadow:0 2px 12px rgba(19,32,69,.08)">
              <div style="height:6px;background:var(--n3);display:flex;align-items:center;justify-content:center">
                <div style="width:32px;height:3px;border-radius:2px;background:var(--n4)"></div>
              </div>
              <div style="padding:8px">${content}</div>
            </div>
          </div>`;
        }

        // Scroll pattern content
        const scrollMobileContent = `<div style="overflow-x:auto;border-radius:6px;border:1px solid var(--n3);background:#fff">
          <table style="min-width:580px;width:100%;border-collapse:collapse">
            <thead style="background:var(--n2)"><tr>
              ${priorityCols.concat([allCols[4],allCols[5]]).map(c=>`<th style="padding:8px 10px;font:600 11px/1 var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em;text-align:left;white-space:nowrap">${escHtml(c.label||'')}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${cardRows.map(row=>{
                const cells=row.cells||[];
                return `<tr style="border-top:1px solid var(--n3)">
                  <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--b7);white-space:nowrap">${escHtml(String((cells[1]||{}).value||''))}</td>
                  <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n7);white-space:nowrap">${escHtml((cells[2]||{}).value||'')}</td>
                  <td style="padding:8px 10px">${cellText(cells[3])}</td>
                  <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n7);white-space:nowrap">${cellText(cells[4])}</td>
                  <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n7);white-space:nowrap">${escHtml((cells[5]||{}).value||'')}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;

        const cardContent = renderCards(cardRows, cardCols);

        const priorityContent = `<div style="border-radius:6px;border:1px solid var(--n3);background:#fff;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead style="background:var(--n2)"><tr>${priorityHead}</tr></thead>
            <tbody>${priorityBody}</tbody>
          </table>
          <div style="padding:8px 10px;border-top:1px solid var(--n3);font:400 11px var(--font-sans);color:var(--n5);display:flex;align-items:center;gap:4px">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            4 columnas ocultas en mobile
          </div>
        </div>`;

        const snippets = {
          scroll: `/* ── Pattern 1: Horizontal scroll (default) ── */
.tbl-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
/* No extra CSS needed — .tbl-wrap already handles this */`,
          card: `/* ── Pattern 2: Card view ── */
@media (max-width: 639px) {
  .tbl-wrap table { display: none; }          /* hide desktop table */
  .tbl-cards      { display: flex; flex-direction: column; gap: 8px; }
}
.tbl-cards { display: none; }                 /* hidden on desktop */

/* Each card */
.tbl-card { background:#fff; border:1px solid var(--n3);
            border-radius:8px; overflow:hidden; }
.tbl-card-head { padding:10px 12px; display:flex; align-items:center;
                 gap:8px; border-bottom:1px solid var(--n3); }
.tbl-card-body { padding:8px 12px; }
.tbl-card-row  { display:flex; gap:6px; padding:3px 0;
                 font:400 12px var(--font-sans); }
.tbl-card-lbl  { width:64px; flex-shrink:0; color:var(--n5);
                 font-size:10px; padding-top:1px; }`,
          priority: `/* ── Pattern 3: Priority columns ── */
/* Mark columns as low priority in your column definitions */
/* data-priority="low" → hidden below 640px                 */

@media (max-width: 639px) {
  th[data-priority="low"],
  td[data-priority="low"] { display: none; }
}

/* Usage in tblDemoTable columns: */
{ label: 'Conductor', type: 'text', priority: 'low' }
{ label: 'Fecha',     type: 'date', priority: 'low' }
/* Core columns (always visible): # Orden, Cliente, Estado */`
        };

        return `<div style="margin-top:32px">
          <div class="tbl-stitle">Mobile responsive patterns</div>
          <p style="font:400 13px var(--font-sans);color:var(--n5);margin-bottom:20px;line-height:1.6">
            Three patterns depending on table density and use case. All previews are at 375px (iPhone 14 width).
          </p>

          <style>
            .mob-pattern { background:#fff; border:1px solid var(--n3); border-radius:10px; overflow:hidden; margin-bottom:16px; }
            .mob-pattern-head { padding:14px 16px; border-bottom:1px solid var(--n3); display:flex; align-items:center; gap:10px; }
            .mob-pattern-badge { height:20px; padding:0 8px; border-radius:99px; font:700 10px/20px var(--font-sans); }
            .mob-pattern-body { padding:20px 16px; display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start; }
            .mob-pattern-desc { flex:1; min-width:220px; }
            .mob-pattern-code { flex:1; min-width:260px; background:var(--n1); border:1px solid var(--n3); border-radius:6px; padding:12px 14px; font:400 11px/1.7 var(--font-mono); color:var(--n6); overflow-x:auto; white-space:pre; margin-top:12px; }
            .mob-when { font:600 11px var(--font-sans); color:var(--n5); text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px; }
            .mob-pros { list-style:none; margin:0; padding:0; }
            .mob-pros li { font:400 12px var(--font-sans); color:var(--n6); padding:2px 0; display:flex; gap:6px; }
            .mob-pros li:before { content:'✓'; color:var(--g6); font-weight:700; flex-shrink:0; }
          </style>

          <!-- Pattern 1: Scroll -->
          <div class="mob-pattern">
            <div class="mob-pattern-head">
              <span style="font:700 13px var(--font-sans);color:var(--n7)">1 · Horizontal scroll</span>
              <span class="mob-pattern-badge" style="background:var(--g1);color:var(--g7)">Default</span>
              <span style="font:400 12px var(--font-sans);color:var(--n5);margin-left:4px">No extra CSS needed — built into .tbl-wrap</span>
            </div>
            <div class="mob-pattern-body">
              <div class="mob-pattern-desc">
                <div class="mob-when">When to use</div>
                <ul class="mob-pros">
                  <li>All columns are equally important</li>
                  <li>Users need to compare values across columns</li>
                  <li>Table has fewer than 7 columns</li>
                </ul>
                <div style="margin-top:14px">${phoneFrame(scrollMobileContent, 'Mobile · 375px — scrolls horizontally')}</div>
              </div>
              <div style="flex:1;min-width:260px">
                <div class="mob-when">CSS</div>
                <pre class="mob-pattern-code">${escHtml(snippets.scroll)}</pre>
              </div>
            </div>
          </div>

          <!-- Pattern 2: Card view -->
          <div class="mob-pattern">
            <div class="mob-pattern-head">
              <span style="font:700 13px var(--font-sans);color:var(--n7)">2 · Card view</span>
              <span class="mob-pattern-badge" style="background:var(--b1);color:var(--b7)">Recommended for dense tables</span>
            </div>
            <div class="mob-pattern-body">
              <div class="mob-pattern-desc">
                <div class="mob-when">When to use</div>
                <ul class="mob-pros">
                  <li>Table has 6+ columns</li>
                  <li>Row identity is key (orders, deliveries, clients)</li>
                  <li>Users scan per-record rather than compare columns</li>
                </ul>
                <div style="margin-top:14px">${phoneFrame(cardContent, 'Mobile · 375px — card per row')}</div>
              </div>
              <div style="flex:1;min-width:260px">
                <div class="mob-when">CSS + HTML structure</div>
                <pre class="mob-pattern-code">${escHtml(snippets.card)}</pre>
              </div>
            </div>
          </div>

          <!-- Pattern 3: Priority columns -->
          <div class="mob-pattern">
            <div class="mob-pattern-head">
              <span style="font:700 13px var(--font-sans);color:var(--n7)">3 · Priority columns</span>
              <span class="mob-pattern-badge" style="background:var(--o1);color:var(--o7)">Balanced</span>
            </div>
            <div class="mob-pattern-body">
              <div class="mob-pattern-desc">
                <div class="mob-when">When to use</div>
                <ul class="mob-pros">
                  <li>Table has 4–6 columns</li>
                  <li>2–3 columns are critical, others are secondary</li>
                  <li>Actions need to remain visible at all times</li>
                </ul>
                <div style="margin-top:14px">${phoneFrame(priorityContent, 'Mobile · 375px — 3 key columns only')}</div>
              </div>
              <div style="flex:1;min-width:260px">
                <div class="mob-when">CSS</div>
                <pre class="mob-pattern-code">${escHtml(snippets.priority)}</pre>
              </div>
            </div>
          </div>

          <!-- Breakpoints reference -->
          <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px;margin-top:4px">
            <div style="font:600 12px var(--font-sans);color:var(--n7);margin-bottom:10px">Breakpoints reference</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              ${[
                ['Mobile','< 640px','Card view or priority cols'],
                ['Tablet','640–1023px','Scroll or reduced cols'],
                ['Desktop','≥ 1024px','Full table with all columns'],
              ].map(([label,bp,rec])=>`<div style="border:1px solid var(--n3);border-radius:6px;padding:10px 12px">
                <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:2px">${label}</div>
                <div style="font:600 11px var(--font-mono);color:var(--b6);margin-bottom:4px">${bp}</div>
                <div style="font:400 11px var(--font-sans);color:var(--n5)">${rec}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>`;
      })()}`;
  },

  /* ── SIDEBAR ── */
  sidebar(data) {
    const t  = data.tokens || {};
    const mt = data.mobileTokens || {};
    const products = data.products || [];

    const SB_STYLE = `<style>
      .sbx{width:52px;overflow:hidden;transition:width .25s cubic-bezier(.4,0,.2,1);background:#fff;border-radius:0 0 24px 0;box-shadow:0 6px 12px rgba(0,0,0,.15);padding:8px 0;flex-shrink:0;cursor:default}
      .sbx:hover{width:240px}
      .sbx-row{display:flex;align-items:center;height:40px;cursor:pointer}
      .sbx-row:hover .sbx-bg{background:rgba(75,130,250,.04)}
      .sbx-row.sel .sbx-bg{background:rgba(75,130,250,.08)}
      .sbx-bar{width:6px;height:40px;flex-shrink:0;background:transparent}
      .sbx-row.sel .sbx-bar{background:#0052CC}
      .sbx-bg{display:flex;align-items:center;height:40px;flex:1;transition:background .12s}
      .sbx-ico{width:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .sbx-ico svg{display:block}
      .sbx-row .sbx-ico svg{fill:#4B82FA}
      .sbx-row.sel .sbx-ico svg{fill:#0052CC}
      .sbx-lbl{font:400 13px/1 'DM Sans',sans-serif;color:#39414D;white-space:nowrap;opacity:0;transition:opacity .18s .06s;overflow:hidden;flex:1}
      .sbx:hover .sbx-lbl{opacity:1}
      .sbx-row.sel .sbx-lbl{font-weight:600;color:#0052CC}
      .sbx-sep{height:1px;background:#E9ECF2;margin:4px 14px}
      .sbx-static{width:240px;background:#fff;border-radius:0 0 24px 0;box-shadow:0 6px 12px rgba(0,0,0,.15);padding:8px 0;flex-shrink:0}
      .sbx-static .sbx-lbl{opacity:1}
      .sbx-settings{display:inline-flex;box-shadow:0 6px 12px rgba(0,0,0,.15)}

      /* mobile drawer rows — compact touch targets */
      .mob-row{display:flex;align-items:center;height:40px;cursor:pointer;padding:0 14px;gap:12px}
      .mob-row svg{fill:#4B82FA;flex-shrink:0;display:block}
      .mob-row .mob-lbl{font:400 13px/1 'DM Sans',sans-serif;color:#39414D}
      .mob-row.sel{background:rgba(75,130,250,.08);border-left:3px solid #0052CC;padding-left:11px}
      .mob-row.sel svg{fill:#0052CC}
      .mob-row.sel .mob-lbl{font-weight:600;color:#0052CC}
      .mob-sep{height:1px;background:#E9ECF2;margin:3px 12px}
    </style>`;

    function buildItems(items) {
      return (items || []).map(it => {
        if (it.divider) return `<div class="sbx-sep"></div>`;
        const isSel = it.state === 'selected';
        return `<div class="sbx-row${isSel ? ' sel' : ''}">
          <div class="sbx-bar"></div>
          <div class="sbx-bg">
            <div class="sbx-ico">${iconSvg(it.icon, 18)}</div>
            <span class="sbx-lbl">${escHtml(it.label)}</span>
          </div>
        </div>`;
      }).join('');
    }

    function buildMobileItems(items) {
      return (items || []).map(it => {
        if (it.divider) return `<div class="mob-sep"></div>`;
        const isSel = it.state === 'selected';
        return `<div class="mob-row${isSel ? ' sel' : ''}">
          ${iconSvg(it.icon, 20)}
          <span class="mob-lbl">${escHtml(it.label)}</span>
        </div>`;
      }).join('');
    }

    /* Hamburger icon (3 lines) */
    const hamburger = `<svg width="22" height="22" viewBox="0 0 32 32" fill="#fff"><path d="M4 8h24v2H4zM4 15h24v2H4zM4 22h24v2H4z"/></svg>`;
    const closeX = `<svg width="22" height="22" viewBox="0 0 32 32" fill="#39414D"><path d="M24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16z"/></svg>`;

    /* Map sidebar product id → mobile logo path */
    const MOBILE_LOGOS = {
      lastmile:   'sections/assets/logos/lastmile-mobile-white.svg',
      plannerpro: 'sections/assets/logos/plannerpro-mobile-white.svg',
      ondemand:   'sections/assets/logos/ondemand-mobile-white.svg',
    };

    /* Single interactive phone frame: hamburger opens drawer, × closes it */
    function phoneInteractive(product) {
      const items = buildMobileItems(product.items);
      const gid = 'mob-' + (product.id || Math.random().toString(36).slice(2,7));
      // Use product id to look up the real mobile logo
      const logoSrc = MOBILE_LOGOS[product.id] || product.logoWhite || product.logoDesktop || '';
      const logoEl = logoSrc
        ? `<img src="${logoSrc}" height="16" style="display:block;flex-shrink:0" alt="${escHtml(product.name)}">`
        : `<span style="color:#fff;font:700 11px var(--font-sans);white-space:nowrap">${escHtml(product.name)}</span>`;

      // Fix: use display='flex' (not 'block') so flex-direction:column works
      const openDrawer  = `(function(b){var f=b.closest('[data-phone]'),c=f.querySelector('[data-state=closed]'),o=f.querySelector('[data-state=open]');c.style.display='none';o.style.display='flex'})(this)`;
      const closeDrawer = `(function(b){var f=b.closest('[data-phone]'),c=f.querySelector('[data-state=closed]'),o=f.querySelector('[data-state=open]');o.style.display='none';c.style.display='flex'})(this)`;

      return `<div data-phone="${gid}" style="width:240px;background:#1a1a1a;border-radius:28px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.3)">
        <div style="background:var(--n2);border-radius:22px;height:480px;position:relative;overflow:hidden">
          <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:#1a1a1a;border-radius:2px;z-index:5"></div>

          <!-- CLOSED STATE -->
          <div data-state="closed" style="position:absolute;inset:0;display:flex;flex-direction:column">
            <div style="height:22px"></div>
            <div style="flex:1;background:#fff;display:flex;flex-direction:column">
              <!-- Topbar: hamburger LEFT · logo · icons RIGHT -->
              <div style="height:52px;background:#132045;display:flex;align-items:center;padding:0 12px;gap:10px;flex-shrink:0">
                <button onclick="${openDrawer}" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;flex-shrink:0">${hamburger}</button>
                ${logoEl}
                <div style="margin-left:auto;display:flex;align-items:center;gap:14px">
                  <div style="position:relative">${iconSvg('alerts',16,'#fff')}<div style="position:absolute;top:-2px;right:-2px;width:5px;height:5px;border-radius:50%;background:#FF5630"></div></div>
                  ${iconSvg('user',16,'#fff')}
                </div>
              </div>
              <!-- Page content placeholder -->
              <div style="padding:12px;display:flex;flex-direction:column;gap:8px">
                <div style="height:14px;background:var(--n2);border-radius:4px;width:40%"></div>
                <div style="height:10px;background:var(--n2);border-radius:3px;width:70%"></div>
                <div style="height:10px;background:var(--n2);border-radius:3px;width:55%"></div>
                <div style="margin-top:6px;height:80px;background:var(--n2);border-radius:6px"></div>
                <div style="height:10px;background:var(--n2);border-radius:3px;width:80%"></div>
                <div style="height:10px;background:var(--n2);border-radius:3px;width:60%"></div>
              </div>
            </div>
          </div>

          <!-- OPEN STATE (drawer) -->
          <div data-state="open" style="position:absolute;inset:0;display:none;flex-direction:column">
            <div style="height:22px"></div>
            <div style="flex:1;background:#fff;position:relative">
              <!-- Topbar dimmed -->
              <div style="height:52px;background:#132045;display:flex;align-items:center;padding:0 12px;flex-shrink:0">
                ${logoEl}
              </div>
              <!-- Overlay -->
              <div onclick="${closeDrawer}" style="position:absolute;inset:52px 0 0 0;background:rgba(19,32,69,.45);z-index:1;cursor:pointer"></div>
              <!-- Drawer -->
              <div style="position:absolute;top:0;left:0;bottom:0;width:208px;background:#fff;z-index:2;display:flex;flex-direction:column;box-shadow:3px 0 16px rgba(0,0,0,.18)">
                <!-- Drawer header -->
                <div style="height:52px;display:flex;align-items:center;padding:0 12px;gap:10px;background:#132045;flex-shrink:0">
                  <button onclick="${closeDrawer}" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center">${closeX}</button>
                  ${logoEl}
                </div>
                <!-- Nav items -->
                <div style="flex:1;overflow-y:auto;padding:6px 0">
                  ${items}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    function buildSettingsLayout(p) {
      // Icon sidebar: identical items to collapsed sidebar above, Settings selected
      const iconItems = (p.settingsItems || p.items).map(it => {
        if (it.divider) return `<div style="height:1px;background:#E9ECF2;margin:4px 8px"></div>`;
        const isSel = it.state === 'selected';
        return `<div style="display:flex;align-items:center;height:40px;border-left:6px solid ${isSel?'#0052CC':'transparent'}">
          <div style="display:flex;align-items:center;justify-content:center;flex:1;height:40px;${isSel?'background:rgba(75,130,250,.08)':''}">
            ${iconSvg(it.icon, 18, isSel?'#0052CC':'#4B82FA')}
          </div>
        </div>`;
      }).join('');

      const sp = p.settingsPanel;
      let panelHtml = '';
      if (sp && sp.groups) {
        const groupsHtml = sp.groups.map(g => {
          const itemsHtml = (g.items || []).map(it => {
            const isSel = it.state === 'selected';
            const badge = it.count != null
              ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:10px;background:var(--b2);color:var(--b6);font:600 11px/1 var(--font-sans)">${it.count}</span>`
              : '';
            return `<div style="display:flex;align-items:center;justify-content:space-between;height:36px;padding:0 16px 0 14px;border-left:${isSel?'2px solid #0052CC':'2px solid #E9ECF2'};${isSel?'background:rgba(75,130,250,.08);':''}">
              <span style="font:${isSel?'700':'400'} 13px/1 var(--font-sans);color:${isSel?'#0052CC':'var(--n6)'}">${escHtml(it.label)}</span>
              ${badge}
            </div>`;
          }).join('');
          return `<div style="margin-bottom:4px">
            <div style="padding:12px 16px 6px;font:700 14px/1 var(--font-sans);color:var(--n7)">${escHtml(g.label)}</div>
            <div style="margin-left:14px">${itemsHtml}</div>
          </div>`;
        }).join('');
        const ver = sp.version ? `<div style="height:1px;background:#E9ECF2;margin:8px 16px"></div><div style="padding:10px 16px;font:400 11px var(--font-sans);color:var(--n5)">Versión ${escHtml(sp.version)}</div>` : '';
        panelHtml = `<div style="width:224px;flex-shrink:0;background:#fff;border-right:1px solid #E9ECF2;padding:8px 0;align-self:stretch;border-radius:0 0 24px 0;overflow:hidden">${groupsHtml}${ver}</div>`;
      }

      return `<div class="sbx-settings" style="border:1px solid var(--n3);border-radius:0 0 24px 0;overflow:hidden;min-height:600px">
        <div style="width:52px;flex-shrink:0;background:#fff;border-right:1px solid #E9ECF2;padding:8px 0">${iconItems}</div>
        ${panelHtml}
        <div style="width:180px;background:var(--n1);padding:20px;display:flex;align-items:flex-start;border-radius:0 0 24px 0">
          <span style="font:400 12px var(--font-sans);color:var(--n4)">Content pushed right</span>
        </div>
      </div>`;
    }

    const productSections = products.map(p => {
      const interactiveItems = buildItems(p.items);

      return `
        <div style="margin-bottom:40px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
            <span style="font:700 14px var(--font-sans);color:var(--n7)">${escHtml(p.name)}</span>
          </div>

          <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Desktop
          </div>
          <div style="display:flex;flex-direction:column;gap:20px;margin-bottom:20px">
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Collapsed → hover to expand</div>
              <div class="sbx" style="min-height:600px">${interactiveItems}</div>
            </div>
            ${p.settingsPanel || p.settingsItems ? `<div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Settings mode — panel pushes content right</div>
              ${buildSettingsLayout(p)}
            </div>` : ''}
          </div>

          <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Mobile · interactive
          </div>
          <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">
                Tap <strong style="color:var(--n7)">☰</strong> to open · tap overlay or <strong style="color:var(--n7)">×</strong> to close
              </div>
              ${phoneInteractive(p)}
            </div>
            <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:10px;padding-top:24px">
              <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:12px 14px">
                <div style="font:700 12px var(--font-sans);color:var(--n7);margin-bottom:8px">Mobile topbar anatomy</div>
                <div style="display:flex;flex-direction:column;gap:5px;font:400 12px var(--font-sans);color:var(--n5)">
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Hamburger icon — leftmost, 44×44px touch target</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Product logo — after hamburger, height 16px white</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Right icons — only Alerts + User (no apps/help/gear)</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b5);flex-shrink:0;display:inline-block"></span>Company slot — hidden on mobile</div>
                </div>
              </div>
              <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:12px 14px">
                <div style="font:700 12px var(--font-sans);color:var(--n7);margin-bottom:8px">Mobile drawer anatomy</div>
                <div style="display:flex;flex-direction:column;gap:5px;font:400 12px var(--font-sans);color:var(--n5)">
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Slides in from left, width 208px</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Header: indigo bg · × close icon + logo</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Nav rows: 40px height (compact), 13px font</div>
                  <div style="display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--b6);flex-shrink:0;display:inline-block"></span>Overlay: rgba(19,32,69,.45) — tap to close</div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    const mobileTokenRows = Object.entries(mt).filter(([k]) => k !== 'note').map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      ${SB_STYLE}
      ${mt.note ? `<div class="bn in" style="margin-bottom:14px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--b6)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${escHtml(mt.note)}</span>
      </div>` : ''}
      <div class="card" style="background:var(--n2)">
        ${productSections}
      </div>
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Desktop tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Mobile tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody>${mobileTokenRows}</tbody>
        </table>
      </div>`;
  },

  /* ── TOPBAR ── */
  topbar(data) {
    const t = data.tokens || {};

    const icons = (data.iconOrder || []).map(name => {
      const isAlert = name === 'alerts';
      const wrap = isAlert ? `<div class="bell">` : '';
      const wrapEnd = isAlert ? `</div>` : '';
      return `${wrap}${iconSvg(name, 18, '#fff')}${wrapEnd}`;
    }).join('');

    const tokenRows = Object.entries(t).filter(([k]) => k !== 'productColors').map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    const productColors = t.productColors ? Object.entries(t.productColors).map(([name, hex]) => `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:12px;height:12px;border-radius:50%;background:${hex}"></div>
        <span style="font:400 12px var(--font-sans);color:var(--n5)">${name} · ${hex}</span>
      </div>`).join('') : '';

    const bpLabel = { desktop: 'Desktop', tablet: 'Tablet ≥768px', mobile: 'Mobile <768px' };

    const productBars = (data.products || []).map(prod => {
      const variants = prod.variants || [];

      if (variants.length) {
        const hambSvg = `<svg width="20" height="20" viewBox="0 0 32 32" fill="#fff" style="display:block;flex-shrink:0"><path d="M4 8h24v2H4zM4 15h24v2H4zM4 22h24v2H4z"/></svg>`;
        const variantRows = variants.map(v => {
          const isMobile = v.breakpoint === 'mobile';
          const varIcons = v.icons.map(name => {
            const isAlert = name === 'alerts';
            const wrap = isAlert ? `<div class="bell">` : '';
            const wrapEnd = isAlert ? `</div>` : '';
            return `${wrap}${iconSvg(name, 18, '#fff')}${wrapEnd}`;
          }).join('');

          const logoEl = `<img src="${v.logo}" height="${isMobile ? 16 : 18}" alt="${escHtml(prod.name)}" style="display:block;flex-shrink:0">`;
          const slotEl = (!isMobile && v.customerSlot && v.customerSlot.show)
            ? `<div class="slot">${escHtml(v.customerSlot.text || '')}</div>`
            : '';

          const maxW = v.breakpoint === 'desktop' ? '100%' : v.width;
          const bp = v.breakpoint;

          // Mobile: hamburger LEFT, logo, minimal icons, no slot
          const inner = isMobile
            ? `${hambSvg}${logoEl}<div class="acts">${varIcons}</div>`
            : `${logoEl}<div class="acts">${varIcons}</div>${slotEl}`;

          return `<div style="margin-bottom:6px">
            <div style="font:500 9px var(--font-sans);color:var(--n4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">${escHtml(bpLabel[bp] || bp)}</div>
            <div class="tbar${isMobile ? ' tbar--mobile' : ''}" style="max-width:${maxW};${isMobile ? 'gap:10px;padding:0 12px' : ''}">
              ${inner}
            </div>
          </div>`;
        }).join('');

        return `
          <div>
            <div style="font:500 11px var(--font-sans);color:var(--n5);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">${escHtml(prod.name)}</div>
            ${variantRows}
          </div>`;
      }

      // fallback: old structure without variants
      const logoEl = prod.logoDesktop
        ? `<img src="${prod.logoDesktop}" height="18" alt="${escHtml(prod.name)} logo" style="display:block;flex-shrink:0">`
        : `<span style="color:#fff;font:700 12px var(--font-sans)">${escHtml(prod.name)}</span>`;
      const mobileLogoEl = prod.logoMobile
        ? `<img src="${prod.logoMobile}" height="18" alt="${escHtml(prod.name)} logo" style="display:block;flex-shrink:0">`
        : logoEl;
      return `
        <div>
          <div style="font:500 11px var(--font-sans);color:var(--n5);margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em">${escHtml(prod.name)}</div>
          <div class="tbar" style="margin-bottom:6px">
            ${logoEl}
            <div class="acts">${icons}</div>
            <div class="slot">ACME CO</div>
          </div>
          ${prod.logoMobile ? `<div class="tbar tbar--mobile">
            ${mobileLogoEl}
            <div class="acts">${icons}</div>
            <div class="slot">AC</div>
          </div>` : ''}
        </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      <div class="card" style="background:var(--n2);display:flex;flex-direction:column;gap:20px">
        ${productBars || `<div class="tbar">
          <div class="acts">${icons}</div>
          <div class="slot">ACME CO</div>
        </div>`}
      </div>
      <div class="card" style="margin-top:10px;padding:14px">
        <div style="font:400 12px/1.8 var(--font-sans);color:var(--n5)">
          <strong style="color:var(--n7)">Rules:</strong> background always <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">#132045</code> · height 52px · company slot <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">border-radius: 25px 0 0 0</code> · usar logo <strong>white</strong> sobre fondo oscuro
        </div>
        ${data.breakpoints ? `<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">
          ${Object.entries(data.breakpoints).map(([bp, desc]) =>
            `<div style="font:400 11px var(--font-sans);color:var(--n5)"><strong style="color:var(--n7);text-transform:capitalize">${bp}</strong> — ${escHtml(desc)}</div>`
          ).join('')}
        </div>` : ''}
        ${productColors ? `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px">${productColors}</div>` : ''}
      </div>
      <!-- Mobile topbar section -->
      <div style="margin-top:24px">
        <div style="font:700 15px var(--font-sans);color:var(--n7);margin-bottom:4px;display:flex;align-items:center;gap:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          Mobile topbar
        </div>
        <p style="font:400 13px var(--font-sans);color:var(--n5);margin-bottom:16px;line-height:1.6">
          On mobile the topbar removes the company slot and most action icons.
          A <strong style="color:var(--n7)">hamburger icon (☰)</strong> appears at the far left — before the product logo.
          Tapping it slides in the sidebar as a full-height drawer with a dark overlay behind it.
        </p>
        <div class="card" style="background:var(--n2)">
          <!-- Topbar anatomy comparison -->
          <div style="margin-bottom:20px">
            <div style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Desktop topbar</div>
            <div style="background:#132045;height:52px;display:flex;align-items:center;padding:0 20px;border-radius:6px;gap:12px">
              <img src="sections/assets/logos/lastmile-desktop-white.svg" height="18" style="display:block" alt="logo" onerror="this.style.display='none'">
              <div style="margin-left:auto;display:flex;align-items:center;gap:22px">
                ${(data.iconOrder || ['apps','alerts','messages','help','user']).map(n => n === 'alerts'
                  ? `<div style="position:relative">${iconSvg(n,18,'#fff')}<div style="position:absolute;top:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:#FF5630;border:1.5px solid #132045"></div></div>`
                  : iconSvg(n,18,'#fff')).join('')}
              </div>
              <div style="width:88px;height:52px;background:#fff;border-radius:20px 0 0 0;display:flex;align-items:center;justify-content:center;font:700 11px var(--font-sans);color:#132045;flex-shrink:0">ACME CO</div>
            </div>
          </div>
          <div>
            <div style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Mobile topbar — hamburger left · logo · minimal icons</div>
            <div style="max-width:375px;background:#132045;height:52px;display:flex;align-items:center;padding:0 14px;border-radius:6px;gap:10px">
              <!-- Hamburger: leftmost -->
              <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="#fff"><path d="M4 8h24v2H4zM4 15h24v2H4zM4 22h24v2H4z"/></svg>
              </div>
              <img src="sections/assets/logos/lastmile-desktop-white.svg" height="16" style="display:block;flex-shrink:0" alt="logo" onerror="this.style.display='none'">
              <div style="margin-left:auto;display:flex;align-items:center;gap:18px">
                <div style="position:relative">${iconSvg('alerts',18,'#fff')}<div style="position:absolute;top:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:#FF5630;border:1.5px solid #132045"></div></div>
                ${iconSvg('user',18,'#fff')}
              </div>
            </div>
          </div>
        </div>

        <!-- Diff table -->
        <div class="card" style="margin-top:10px;padding:0;overflow:hidden">
          <table class="ttbl">
            <thead><tr><th>Element</th><th>Desktop</th><th>Mobile</th></tr></thead>
            <tbody>
              <tr><td>Hamburger</td><td>—</td><td style="color:var(--g6);font-weight:600">Far left, before logo</td></tr>
              <tr><td>Product logo</td><td>Left, after icon strip</td><td>After hamburger</td></tr>
              <tr><td>Action icons</td><td>Apps · Alerts · Messages · Help · User</td><td>Alerts · User only</td></tr>
              <tr><td>Company slot</td><td>Right edge, 88px</td><td style="color:var(--r6)">Hidden</td></tr>
              <tr><td>Height</td><td>52px</td><td>52px (unchanged)</td></tr>
              <tr><td>Background</td><td>#132045</td><td>#132045 (unchanged)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Design tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>`;
  },

  /* ── MAPPINS ── */
  mappins(data) {
    const base = (data.pinsPath || 'sections/assets/pins/').replace(/\/$/, '');

    // collect all files for the ZIP button
    const allFiles = (data.groups || []).flatMap(g => g.pins.map(p => p.file));

    const PIN_STYLE = `<style>
      .me-section{margin-bottom:36px}
      .me-section-hdr{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--n2)}
      .me-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
      .me-section-label{font:700 15px var(--font-sans);color:var(--n7)}
      .me-count{font:400 12px var(--font-sans);color:var(--n5)}
      .pin-grid{display:flex;flex-wrap:wrap;gap:12px}
      .pin-card{background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px 14px 12px;display:flex;flex-direction:column;align-items:center;gap:10px;width:120px;position:relative;transition:box-shadow .15s}
      .pin-card:hover{box-shadow:0 4px 16px rgba(19,32,69,.1)}
      .pin-card .pin-preview{width:72px;height:72px;display:flex;align-items:center;justify-content:center;background:var(--n1);border-radius:6px}
      .pin-card .pin-preview img{max-width:60px;max-height:64px;width:auto;height:auto;display:block}
      .pin-card .pin-lbl{font:400 11px/1.3 var(--font-sans);color:var(--n5);text-align:center}
      .pin-card .pin-dl{width:100%;height:26px;border:1px solid var(--n3);background:var(--n1);border-radius:4px;font:600 10px var(--font-sans);color:var(--n7);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;text-decoration:none;transition:background .1s}
      .pin-card .pin-dl:hover{background:var(--b1);border-color:var(--b3);color:var(--b7)}
      .me-zip-bar{display:flex;align-items:center;gap:12px;margin-bottom:28px;padding:14px 18px;background:#fff;border:1px solid var(--n3);border-radius:8px}
      .me-zip-info{flex:1;font:400 13px var(--font-sans);color:var(--n5)}
      .me-zip-info strong{color:var(--n7)}
      .me-zip-btn{height:36px;padding:0 18px;background:var(--indigo);color:#fff;border:none;border-radius:6px;font:600 12px var(--font-sans);cursor:pointer;display:flex;align-items:center;gap:7px;flex-shrink:0}
      .me-zip-btn:hover{background:#1a2d5a}
      .me-zip-btn:disabled{opacity:.5;cursor:default}
    </style>`;

    const zipBtn = `
      <div class="me-zip-bar">
        <div class="me-zip-info"><strong>${allFiles.length} SVG files</strong> — Map pins for all states and types</div>
        <button class="me-zip-btn" id="dl-all-pins" onclick="downloadAllPins()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download all as ZIP
        </button>
      </div>`;

    const groups = (data.groups || []).map(g => {
      const cards = (g.pins || []).map(p => {
        const src = `${base}/${p.file}`;
        return `<div class="pin-card">
          <div class="pin-preview"><img src="${src}" alt="${escHtml(p.label)}" loading="lazy"></div>
          <div class="pin-lbl">${escHtml(p.label)}</div>
          <a class="pin-dl" href="${src}" download="${p.file}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            SVG
          </a>
        </div>`;
      }).join('');

      return `<div class="me-section">
        <div class="me-section-hdr">
          <div class="me-dot" style="background:${g.color}"></div>
          <span class="me-section-label">${escHtml(g.label)}</span>
          <span class="me-count">${g.pins.length} variant${g.pins.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="pin-grid">${cards}</div>
      </div>`;
    }).join('');

    const allFilesJson = JSON.stringify(allFiles);
    const zipScript = `<script>
window.__pinFiles = ${allFilesJson};
window.__pinBase  = '${base}';
async function downloadAllPins() {
  const btn = document.getElementById('dl-all-pins');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Building ZIP…';
  try {
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    const zip = new JSZip();
    const folder = zip.folder('dt-map-pins');
    await Promise.all(window.__pinFiles.map(async f => {
      const res = await fetch(window.__pinBase + '/' + f);
      const blob = await res.blob();
      folder.file(f, blob);
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'dt-map-pins.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(e) {
    alert('Could not build ZIP: ' + e.message);
  }
  btn.disabled = false;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download all as ZIP';
}
<\/script>`;

    // Build marker list for the live map: first unselected pin from each group
    const mapMarkers = (data.groups || [])
      .filter(g => g.pins && g.pins.length)
      .map((g, i) => {
        const pin = g.pins.find(p => p.label === 'Unselected') || g.pins[0];
        return { file: `${base}/${pin.file}`, label: g.label, color: g.color };
      });

    // Santiago Centro + offsets per group
    const COORDS = [
      [-33.4372, -70.6506],
      [-33.4512, -70.6741],
      [-33.4438, -70.6598],
      [-33.4560, -70.6630],
      [-33.4620, -70.6580],
    ];

    const markersJson = JSON.stringify(
      mapMarkers.map((m, i) => ({ ...m, latlng: COORDS[i] || [-33.4489 + i * 0.01, -70.6693] }))
    );

    const MAP_STYLE = `<style>
      .me-map-section{margin-top:36px}
      .me-map-hdr{font:700 15px var(--font-sans);color:var(--n7);margin-bottom:6px;display:flex;align-items:center;gap:8px}
      .me-map-desc{font:400 12px var(--font-sans);color:var(--n5);margin-bottom:14px}
      .me-map-wrap{width:100%;border-radius:8px;overflow:hidden;border:1px solid var(--n3);position:relative}
      .me-map{width:100%;height:380px}
      /* form container — same as table-page white card */
      .me-map-form-container{background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;margin-top:16px}
      .me-map-form-demo{display:flex;gap:24px;align-items:flex-start}
      .me-map-form-col{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
      .me-map-form-field{display:flex;flex-direction:column;gap:4px}
      /* label — same font/color as input labels in DS */
      .me-map-form-lbl2{font:400 12px/16px var(--font-sans);color:var(--n7)}
      .me-map-in-form-wrap{border-radius:6px;overflow:hidden;border:1px solid var(--n4);position:relative;flex:1}
      .me-map-in-form{width:100%;min-height:144px;height:100%}
      /* Address autocomplete dropdown */
      .me-addr-dd{display:none;position:absolute;top:calc(100% + 2px);left:0;right:0;background:#fff;border:1px solid var(--n4);border-radius:6px;box-shadow:0 6px 20px rgba(19,32,69,.12);z-index:2000;overflow:hidden}
      .me-addr-dd.on{display:block}
      .me-addr-item{padding:8px 12px;font:400 13px/1.4 var(--font-sans);color:var(--n7);cursor:pointer;border-bottom:1px solid var(--n3);display:flex;align-items:flex-start;gap:8px}
      .me-addr-item:last-child{border-bottom:none}
      .me-addr-item:hover,.me-addr-item.focused{background:var(--b1);color:var(--b7)}
      .me-addr-item svg{flex-shrink:0;margin-top:1px;color:var(--n5)}
      .me-addr-item:hover svg,.me-addr-item.focused svg{color:var(--b6)}
      .me-addr-loading{padding:10px 12px;font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center;gap:8px}
      .leaflet-container{font-family:inherit!important}
      /* Map controls overlay */
      .me-ctrls{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:1000;align-items:center}
      .me-btn{height:32px;padding:0 14px;border-radius:50px;font:700 13px/1 var(--font-sans);background:rgba(255,255,255,.96);color:#39414D;border:1px solid #E1E6ED;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 4px rgba(19,32,69,.12);white-space:nowrap;position:relative}
      .me-btn:hover{background:#fff;border-color:#C5D2E7}
      .me-btn.active{background:#EDF5FF;border-color:#4B82FA;color:#0052CC}
      .me-ver-menu{display:none;position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #E1E6ED;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0;min-width:210px}
      .me-ver-menu.on{display:block}
      .me-ver-opt{height:36px;padding:0 12px;display:flex;align-items:center;gap:9px;font:400 13px var(--font-sans);color:#39414D;cursor:pointer}
      .me-ver-opt:hover{background:#EDF5FF;color:#0052CC}
      .me-ver-opt input{width:14px;height:14px;accent-color:#4B82FA;cursor:pointer;flex-shrink:0}
      /* Lasso */
      .me-lasso-banner{display:none;position:absolute;top:0;left:0;right:0;height:40px;background:#1F60ED;color:#fff;font:400 12px var(--font-sans);align-items:center;gap:10px;padding:0 16px;z-index:1001}
      .me-lasso-banner.on{display:flex}
      .me-lasso-cancel{margin-left:auto;font:700 13px var(--font-sans);color:#fff;background:none;border:0;cursor:pointer;text-decoration:underline}
      .me-lasso-svg{display:none;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:999}
      .me-lasso-svg.on{display:block}
      .me-lasso-layer{display:none;position:absolute;inset:0;cursor:crosshair;z-index:998}
      .me-lasso-layer.on{display:block}
    </style>`;

    // NOTE: scripts injected via innerHTML do NOT execute.
    // All map/lasso/ver logic lives in initMapElements() in index.html,
    // called automatically after the mappins section renders.
    const mapScript = '';

    const mapSection = `
      ${MAP_STYLE}
      <div class="me-map-section">
        <div class="me-map-hdr">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Map · Flexible component
        </div>
        <div class="me-map-desc">Fill-container width standalone. When inside a form: 240px wide (= 1 input column), min-height 144px (= 3 input rows). CartoDB Positron tiles — minimal palette. Center: Santiago.</div>

        <!-- Standalone map + controls -->
        <div class="me-map-wrap">
          <div id="me-map-main" class="me-map"></div>
          <div class="me-ctrls">
            <div style="position:relative">
              <button class="me-btn" id="me-btn-ver" onclick="meToggleVer(event,this,'me-ver-main')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Ver
              </button>
              <div class="me-ver-menu" id="me-ver-main">
                <label class="me-ver-opt"><input type="checkbox" checked> Órdenes en ruta</label>
                <label class="me-ver-opt"><input type="checkbox"> Órdenes sin asignar</label>
                <label class="me-ver-opt"><input type="checkbox"> Geocercas</label>
              </div>
            </div>
            <button class="me-btn" id="me-btn-lasso-main" onclick="meToggleLasso(event,'main')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="10" cy="8" rx="7" ry="5" stroke-dasharray="2.5,1.5"/><path d="M10 13v7M7 18l3 3 3-3"/></svg>
              Seleccionar con lazo
            </button>
          </div>
          <div class="me-lasso-banner" id="me-banner-main">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><ellipse cx="10" cy="8" rx="7" ry="5" stroke-dasharray="2.5,1.5"/><path d="M10 13v7"/></svg>
            <span>Modo lazo activo — dibuja alrededor de las paradas.</span>
            <button class="me-lasso-cancel" onclick="meExitLasso('main')">Cancelar</button>
          </div>
          <svg class="me-lasso-svg" id="me-svg-main" xmlns="http://www.w3.org/2000/svg">
            <path id="me-path-main" fill="rgba(30,96,237,0.12)" stroke="#1F60ED" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" d=""/>
          </svg>
          <div class="me-lasso-layer" id="me-layer-main" onmousedown="meLassoStart(event,'main')"></div>
        </div>

        <!-- Form layout + map — white container matching table-page card -->
        <div class="me-map-form-container">
          <div class="me-map-form-demo">

            <!-- Left: input column -->
            <div class="me-map-form-col">

              <!-- Address with geocode pin button on right -->
              <div class="me-map-form-field">
                <label class="me-map-form-lbl2">Dirección</label>
                <div style="position:relative">
                  <input type="text" id="me-addr" value="Av. Libertador B. O'Higgins 1234"
                    autocomplete="off"
                    style="height:32px;padding:0 36px 0 10px;border:1px solid var(--n5);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                    onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                    onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
                    onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
                    onmouseleave="if(document.activeElement!==this)this.style.background='#fff'"
                    oninput="meAddrInput(this.value)"
                    onkeydown="meAddrKey(event)">
                  <!-- Geocode button -->
                  <button onclick="meGeocode()" title="Geocodificar dirección"
                    style="position:absolute;right:0;top:0;bottom:0;width:34px;background:none;border:none;border-left:1px solid var(--n3);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:0 6px 6px 0;color:var(--n5)"
                    onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b6)';this.style.borderColor='var(--b3)'"
                    onmouseleave="this.style.background='none';this.style.color='var(--n5)';this.style.borderColor='var(--n3)'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </button>
                  <!-- Autocomplete dropdown -->
                  <div id="me-addr-dd" class="me-addr-dd"></div>
                </div>
              </div>

              <!-- Lat / Lng side by side -->
              <div style="display:flex;gap:8px">
                <div class="me-map-form-field" style="flex:1">
                  <label class="me-map-form-lbl2">Latitud</label>
                  <input type="text" id="me-lat" placeholder="-33.449700"
                    style="height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;font:400 13px/20px var(--font-mono);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                    onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                    onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff';meUpdateFromLatLng()"
                    onkeydown="if(event.key==='Enter')meUpdateFromLatLng()">
                </div>
                <div class="me-map-form-field" style="flex:1">
                  <label class="me-map-form-lbl2">Longitud</label>
                  <input type="text" id="me-lng" placeholder="-70.669300"
                    style="height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;font:400 13px/20px var(--font-mono);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                    onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                    onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff';meUpdateFromLatLng()"
                    onkeydown="if(event.key==='Enter')meUpdateFromLatLng()">
                </div>
              </div>

              <div class="me-map-form-field">
                <label class="me-map-form-lbl2">Ciudad</label>
                <input type="text" value="Santiago"
                  style="height:32px;padding:0 10px;border:1px solid var(--n5);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                  onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                  onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
                  onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
                  onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
              </div>
              <div class="me-map-form-field">
                <label class="me-map-form-lbl2">Referencia</label>
                <input type="text" placeholder="Ej: Frente al metro Baquedano"
                  style="height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                  onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                  onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
                  onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
                  onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
              </div>
            </div>

            <!-- Right: map column — same flex:1, label identical to input labels -->
            <div class="me-map-form-col" style="display:flex;flex-direction:column;gap:4px">
              <label class="me-map-form-lbl2">Ubicación en el mapa</label>
              <div class="me-map-in-form-wrap" style="flex:1;min-height:144px;height:200px">
              <div id="me-map-form" class="me-map-in-form"></div>
              <div class="me-ctrls" style="top:6px;right:6px">
                <button class="me-btn" onclick="meToggleVer(event,this,'me-ver-form')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Ver
                </button>
                <div class="me-ver-menu" id="me-ver-form">
                  <label class="me-ver-opt"><input type="checkbox" checked> Órdenes en ruta</label>
                  <label class="me-ver-opt"><input type="checkbox"> Órdenes sin asignar</label>
                  <label class="me-ver-opt"><input type="checkbox"> Geocercas</label>
                </div>
                <button class="me-btn" id="me-btn-lasso-form" onclick="meToggleLasso(event,'form')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="10" cy="8" rx="7" ry="5" stroke-dasharray="2.5,1.5"/><path d="M10 13v7M7 18l3 3 3-3"/></svg>
                  Lazo
                </button>
              </div>
              <div class="me-lasso-banner" id="me-banner-form" style="font-size:11px">
                <span>Modo lazo activo.</span>
                <button class="me-lasso-cancel" onclick="meExitLasso('form')" style="font-size:11px">Cancelar</button>
              </div>
              <svg class="me-lasso-svg" id="me-svg-form" xmlns="http://www.w3.org/2000/svg">
                <path id="me-path-form" fill="rgba(30,96,237,0.12)" stroke="#1F60ED" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d=""/>
              </svg>
              <div class="me-lasso-layer" id="me-layer-form" onmousedown="meLassoStart(event,'form')"></div>
            </div>
          </div><!-- end map col -->

          </div><!-- end me-map-form-demo -->
        </div><!-- end me-map-form-container -->
      </div>
      ${mapScript}`;

    return `${PIN_STYLE}
      ${sectionHeader(data)}
      ${zipBtn}
      <div class="sec">
        <h2 style="font:700 18px var(--font-sans);color:var(--n7);margin:0 0 20px;display:flex;align-items:center;gap:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Map pins
        </h2>
        ${groups}
        ${mapSection}
      </div>
      ${zipScript}`;
  },

  /* ── DATAVIZ ── */
  dataviz(data) {
    const palette = data.palette || [];
    const numbers = palette.map((c, i) =>
      `<div style="font:400 11px var(--font-sans);color:var(--n5);text-align:center;margin-bottom:4px;flex:1">${i+1}</div>`
    ).join('');
    const swatches = palette.map((c, i) => {
      const tc = isLight(c) ? '#39414D' : '#fff';
      return `<div class="color-sw" style="flex:1;padding:14px 10px 12px;min-height:100px;display:flex;flex-direction:column;justify-content:flex-end;background:${c};color:${tc};border-right:1px solid rgba(0,0,0,.07)"
        onclick="copyToClipboard('${c}',this)" title="Copy ${c}">
        <div style="font:400 11px var(--font-sans)">Hex: ${c}</div>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div>
        <div style="display:flex;margin-bottom:0">${numbers}</div>
        <div style="display:flex;overflow:hidden;border:1px solid var(--n3);border-radius:8px">${swatches}</div>
        <div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:10px">Assign in strict order 1 → ${palette.length}. Do not skip or reuse out of sequence.</div>
      </div>`;
  },

  /* ── SERVICE UNITS ── */
  serviceunits(data) {
    const palette = data.palette || [];
    const numbers = palette.map((p, i) =>
      `<div style="font:400 11px var(--font-sans);color:var(--n5);text-align:center;margin-bottom:4px;flex:1">${i+1}</div>`
    ).join('');
    const swatches = palette.map((p, i) => {
      const tc = isLight(p.hex) ? '#39414D' : '#fff';
      return `<div class="color-sw" style="flex:1;padding:14px 10px 12px;min-height:100px;display:flex;flex-direction:column;justify-content:flex-end;background:${p.hex};color:${tc};border-right:1px solid rgba(0,0,0,.07)"
        onclick="copyToClipboard('${p.hex}',this)" title="Copy ${p.hex}">
        <div style="font:400 13px/1.3 var(--font-sans)">${escHtml(p.label)}</div>
        <div style="font:400 11px/1.5 var(--font-sans)">Hex: ${p.hex}</div>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div>
        <div style="display:flex;margin-bottom:0">${numbers}</div>
        <div style="display:flex;overflow:hidden;border:1px solid var(--n3);border-radius:8px">${swatches}</div>
      </div>`;
  },

  /* ── LOGOS ── */
  logos(data) {
    const products = data.products || [];

    const wordmarkSection = data.dtWordmark ? `
      <div style="margin-bottom:24px">
        <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:8px">DispatchTrack Wordmark</div>
        <div class="logo-grid">
          <div class="logo-card dk" style="background:#132045">
            <div class="lc"><img src="${data.dtWordmark}" height="20" alt="DispatchTrack wordmark" style="display:block"></div>
            <div class="lf">
              <div class="ll">White</div>
              <a class="ld" href="${data.dtWordmark}" download>↓ Download</a>
            </div>
          </div>
        </div>
      </div>` : '';

    const productSections = products.map(p => {
      const l = p.logos || {};
      const variants = [];
      if (l.desktopColor) variants.push({ label: 'Desktop · Color', path: l.desktopColor, bg: '#fff', dark: false });
      if (l.desktopWhite) variants.push({ label: 'Desktop · White', path: l.desktopWhite, bg: '#132045', dark: true });
      if (l.mobileColor)  variants.push({ label: 'Mobile · Color',   path: l.mobileColor,  bg: '#fff', dark: false });
      if (l.mobileWhite)  variants.push({ label: 'Mobile · White',   path: l.mobileWhite,  bg: '#132045', dark: true });

      const cards = variants.map(v => `
        <div class="logo-card ${v.dark ? 'dk' : ''}" style="background:${v.bg}">
          <div class="lc"><img src="${v.path}" height="20" alt="${escHtml(p.name)} ${escHtml(v.label)}" style="display:block"></div>
          <div class="lf">
            <div class="ll">${escHtml(v.label)}</div>
            <a class="ld" href="${v.path}" download>↓ Download</a>
          </div>
        </div>`).join('');

      return `
        <div style="margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
            <span style="font:700 13px var(--font-sans);color:var(--n7)">${escHtml(p.name)}</span>
          </div>
          <div class="logo-grid">${cards}</div>
        </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      ${wordmarkSection}
      ${productSections}
      <div class="card" style="margin-top:4px;padding:12px 16px">
        <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0">SVG only. Nunca escalar por debajo de 18px de alto. Usar variante <strong>white</strong> sobre fondos oscuros (#132045) y variante <strong>color</strong> sobre fondos claros.</p>
      </div>`;
  },

  /* ── FIGMA ── */
  figma(data) {
    const files = (data.files || []).map(f => `
      <div class="card" style="display:flex;align-items:center;gap:16px">
        <svg width="36" height="54" viewBox="0 0 38 57"><path fill="#F24E1E" d="M5 28.5A9.5 9.5 0 0 1 14.5 19H24V38H14.5A9.5 9.5 0 0 1 5 28.5z"/><path fill="#FF7262" d="M24 1H33.5A9.5 9.5 0 1 1 33.5 20H24z"/><circle fill="#1ABCFE" cx="33.5" cy="28.5" r="9.5"/><path fill="#0ACF83" d="M5 47.5A9.5 9.5 0 0 1 14.5 38H24v9.5A9.5 9.5 0 1 1 5 47.5z"/><path fill="#A259FF" d="M5 28.5a9.5 9.5 0 0 1 9.5-9.5H24V38H14.5A9.5 9.5 0 0 1 5 28.5z"/></svg>
        <div style="flex:1">
          <div style="font:700 14px var(--font-sans);color:var(--n7)">${escHtml(f.name)}</div>
          <div style="font:400 12px var(--font-sans);color:var(--n5);margin-top:3px">Node ${escHtml(f.nodeId)} · Updated ${escHtml(f.updated)}</div>
          <div style="font:400 11px var(--font-mono);color:var(--n5);margin-top:3px">figma.com/design/${escHtml(f.fileKey)}</div>
        </div>
        <button class="btn pri" onclick="window.open('https://figma.com/design/${encodeURIComponent(f.fileKey)}?node-id=${encodeURIComponent(f.nodeId)}','_blank')">Open in Figma</button>
      </div>`).join('');

    return `${sectionHeader(data)}${files}`;
  },

  /* ── CHANGELOG ── */
  changelog(data) {
    const TYPE_COLOR = { fix: '#C45000', feat: '#1A7F3C', update: '#0052CC' };
    const TYPE_LABEL = { fix: 'Fix', feat: 'New', update: 'Update' };

    const noData = !data || !data.days || data.days.length === 0;
    const desc = (data && data.description) || 'Auto-generated from git history. Updated on every push to main.';

    const body = noData
      ? `<div class="card" style="padding:24px;color:var(--n5)">No entries yet.</div>`
      : data.days.map(day => {
          const d = new Date(day.date + 'T12:00:00Z');
          const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const rows = day.entries.map(e => {
            const color = TYPE_COLOR[e.type] || TYPE_COLOR.update;
            const label = TYPE_LABEL[e.type] || 'Update';
            const avatar = e.author
              ? `<span title="${e.author}" style="width:20px;height:20px;border-radius:50%;background:#E1E6ED;display:inline-flex;align-items:center;justify-content:center;font:700 9px/1 var(--font-sans);color:#67768D;flex-shrink:0">${e.author[0].toUpperCase()}</span>`
              : '';
            return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F0F2F5">
              <span style="font:600 11px/1 var(--font-sans);color:#fff;background:${color};padding:2px 8px;border-radius:4px;flex-shrink:0">${label}</span>
              <span style="font:500 11px/1 var(--font-sans);color:#7B8796;flex-shrink:0;min-width:80px">${e.section}</span>
              <span style="font:400 13px/1.4 var(--font-sans);color:var(--n7);flex:1">${e.message}</span>
              ${avatar}
              <span style="font:500 11px/1 var(--font-sans);color:#A0ABBB;flex-shrink:0;min-width:42px;text-align:right">${e.author || ''}</span>
              <code style="font:400 11px/1 monospace;color:#C5D2E7;flex-shrink:0">${e.hash}</code>
            </div>`;
          }).join('');
          return `<div style="margin-bottom:28px">
            <div style="font:600 12px/1 var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.06em;padding-bottom:10px;border-bottom:2px solid #E9ECF2;margin-bottom:4px">${dateStr}</div>
            ${rows}
          </div>`;
        }).join('');

    return `<h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)">Changelog</h1>
      <p style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px">${desc}</p>
      <div class="card" style="padding:24px 28px">${body}</div>`;
  },


  /* ── SCREEN EXAMPLES ── */
  screenexamples(data) {
    const rows = (data.rows || []).map(r => {
      const statusColors = {
        paid:     { bg:'var(--g1)', fg:'var(--g6)' },
        applied:  { bg:'var(--g1)', fg:'var(--g6)' },
        pending:  { bg:'var(--o1)', fg:'var(--o7)' },
        upcoming: { bg:'var(--n2)', fg:'var(--n7)' },
        overdue:  { bg:'var(--r1)', fg:'var(--r6)' },
      };
      const sc = statusColors[r.status?.toLowerCase()] || statusColors.upcoming;
      const checked = r.checked
        ? `<div class="chk on" style="cursor:pointer"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>`
        : `<div class="chk" style="cursor:pointer"></div>`;
      return `<tr>
        <td style="padding:9px 8px 9px 16px">${checked}</td>
        <td><a class="lnk" style="cursor:pointer">${escHtml(r.document)}</a></td>
        <td><span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font:600 11px var(--font-sans);background:${sc.bg};color:${sc.fg}">${escHtml(r.status)}</span></td>
        <td>${escHtml(r.total)}</td>
        <td>${escHtml(r.pending || '—')}</td>
        <td>${escHtml(r.currency)}</td>
        <td>${escHtml(r.account)}</td>
        <td>${escHtml(r.dueDate || '—')}</td>
      </tr>`;
    }).join('');

    const sideIcons = [
      { path: 'M22 12h-4l-3 9L9 3l-3 9H2', active: true },
      { path: 'M1 3h15v13H1zM16 8l4-2 2 2v9H16V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
      { path: 'M18 20V10M12 20V4M6 20v-6' },
      { path: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
      { path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
      { path: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18' },
    ];

    const sidebarHtml = sideIcons.map(ic => {
      const activeStyle = ic.active
        ? `background:var(--b1);position:relative`
        : ``;
      const indicator = ic.active
        ? `<span style="position:absolute;left:0;top:6px;bottom:6px;width:3px;background:var(--b5);border-radius:0 3px 3px 0"></span>`
        : '';
      const stroke = ic.active ? 'var(--b6)' : 'var(--n5)';
      return `<div style="width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;${activeStyle}">
        ${indicator}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><path d="${ic.path}"/></svg>
      </div>`;
    }).join('');

    return `
      <h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)">${escHtml(data.title)}</h1>
      <p style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px">${escHtml(data.description)}</p>

      <h3 style="font:700 15px var(--font-sans);margin:0 0 12px;color:var(--n7)">${escHtml(data.screenTitle || 'Invoice list')}</h3>

      <div class="card flush" style="border-radius:8px;overflow:hidden">

        <!-- Topbar -->
        <div style="height:52px;background:var(--indigo);display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0">
          <span style="font:700 15px var(--font-sans);color:#fff;letter-spacing:-.01em">DispatchTrack</span>
          <span style="color:rgba(255,255,255,.3);font-size:14px">|</span>
          <span style="font:700 13px var(--font-sans);color:#F27B42">lastmile</span>
          <div style="flex:1"></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <div style="position:relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style="position:absolute;top:-3px;right:-3px;width:7px;height:7px;border-radius:50%;background:var(--r5);border:2px solid var(--indigo)"></span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>

        <!-- Layout -->
        <div style="display:flex;min-height:520px">

          <!-- Sidebar collapsed -->
          <div style="width:52px;flex-shrink:0;background:#fff;border-right:1px solid var(--n3);display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:6px">
            ${sidebarHtml}
            <div style="margin-top:auto;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            </div>
          </div>

          <!-- Main -->
          <div style="flex:1;min-width:0;padding:28px 32px;background:var(--n1)">

            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
              <h1 style="font:700 24px/1.2 var(--font-sans);color:var(--n7);margin:0">${escHtml(data.pageTitle || 'Invoices')}</h1>
              <div style="display:flex;gap:8px">
                <button class="btn sec">${escHtml(data.secondaryBtn || 'Secondary')}</button>
                <button class="btn pri">${escHtml(data.primaryBtn || 'Primary')}</button>
              </div>
            </div>

            <!-- Filters -->
            <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
              <div class="inp" style="flex:1;min-width:130px;max-width:210px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2" class="ic"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Document" style="margin-left:8px">
              </div>
              <div class="inp" style="flex:1;min-width:130px;max-width:210px"><input placeholder="Account"></div>
              <div class="inp" style="flex:1;min-width:120px;max-width:170px;cursor:pointer;justify-content:space-between">
                <span style="color:var(--n5);font-size:13px">Status</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="inp" style="flex:1;min-width:120px;max-width:170px;cursor:pointer;justify-content:space-between">
                <span style="color:var(--n5);font-size:13px">Currency</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <button class="btn sec" style="flex-shrink:0">Filter</button>
              <button class="btn sec" style="flex-shrink:0;padding:8px 10px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Table -->
            <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;overflow:hidden">
              <table class="tbl">
                <thead>
                  <tr>
                    <th style="width:32px;padding:9px 8px 9px 16px"><div class="chk"></div></th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Total amount</th>
                    <th>Pending amount</th>
                    <th>Currency</th>
                    <th>Account</th>
                    <th>Due date</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <!-- Pagination -->
              <div style="display:flex;align-items:center;justify-content:center;gap:4px;padding:12px 16px;border-top:1px solid var(--n3);font:400 13px var(--font-sans);color:var(--n5);flex-wrap:wrap">
                <span style="margin-right:8px">${escHtml(data.paginationLabel || '11 – 20 of 117')}</span>
                <button style="width:28px;height:28px;border:1px solid var(--n3);border-radius:4px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--n5)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button style="width:28px;height:28px;border:none;border-radius:4px;background:var(--b6);color:#fff;font:700 12px var(--font-sans);cursor:pointer">1</button>
                <span style="padding:0 2px;color:var(--n4)">···</span>
                ${[4,5,6,7,8].map(n=>`<button style="width:28px;height:28px;border:1px solid var(--n3);border-radius:4px;background:#fff;font:500 12px var(--font-sans);color:var(--n7);cursor:pointer">${n}</button>`).join('')}
                <span style="padding:0 2px;color:var(--n4)">···</span>
                <button style="width:28px;height:28px;border:1px solid var(--n3);border-radius:4px;background:#fff;font:500 12px var(--font-sans);color:var(--n7);cursor:pointer">12</button>
                <button style="width:28px;height:28px;border:1px solid var(--n3);border-radius:4px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--n5)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

          </div><!-- end main -->
        </div><!-- end layout row -->
      </div><!-- end card -->
    `;
  },

  filters(data) {
    const fields = data.fields || [];
    const BG = '#fff';

    // ── exact chevron from inputs renderer ─────────────────────────────
    const CHEVRON = `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0;pointer-events:none"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
    // ── exact calendar from inputs renderer icon set ───────────────────
    const CALENDAR = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;pointer-events:none;color:var(--n5)"><path d="M26,4h-4V2h-2v2h-8V2h-2v2H6C4.9,4,4,4.9,4,6v20c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C28,4.9,27.1,4,26,4z M26,26H6V12h20V26z M26,10H6V6h4v2h2V6h8v2h2V6h4V10z"/></svg>`;

    // ── base input inline style (exact tokens from inputs.json) ────────
    const inpBase = `width:100%;height:32px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:${BG};color:var(--n7);box-sizing:border-box;outline:none`;
    const onFocus  = `this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'`;
    const onBlur   = `this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='${BG}'`;
    const onMEnter = `if(document.activeElement!==this)this.style.background='var(--n2)'`;
    const onMLeave = `if(document.activeElement!==this)this.style.background='${BG}'`;

    // ── exact dt-drop-wrap from inputs renderer ────────────────────────
    const dtSelect = (placeholder, options) => {
      const items = (options||[]).map(o => {
        const safe = o.replace(/'/g,"&#39;");
        return `<div onclick="dtPickOpt(this)" data-val="${safe}"
          onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
          onmouseleave="this.style.background='';this.style.color='var(--n7)'"
          style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer"
        >${escHtml(o)}</div>`;
      }).join('');
      return `<div class="dt-drop-wrap" style="position:relative;flex:1;min-width:0">
        <div class="dt-dtrigger" data-theme="border"
          onclick="dtDrop(this.parentElement)"
          onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
          onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
          style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
          <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(placeholder)}</span>
          <span style="color:var(--n5);display:flex;flex-shrink:0">${CHEVRON}</span>
        </div>
        <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">
          ${items}
        </div>
      </div>`;
    };

    const renderField = (f) => {
      if (f.type === 'select') {
        return dtSelect(f.placeholder, f.options);
      }
      if (f.type === 'date') {
        // date: text input with calendar icon overlay
        return `<div style="position:relative;flex:1;min-width:0">
          <input type="text" placeholder="${escHtml(f.placeholder)}"
            style="${inpBase};padding:0 34px 0 10px"
            onfocus="${onFocus}" onblur="${onBlur}"
            onmouseenter="${onMEnter}" onmouseleave="${onMLeave}">
          <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;color:var(--n5)">${CALENDAR}</div>
        </div>`;
      }
      // text
      return `<div style="flex:1;min-width:0">
        <input type="text" placeholder="${escHtml(f.placeholder)}"
          style="${inpBase};padding:0 10px"
          onfocus="${onFocus}" onblur="${onBlur}"
          onmouseenter="${onMEnter}" onmouseleave="${onMLeave}">
      </div>`;
    };

    // ── secondary button: exact tokens from buttons.json ───────────────
    const secBtnStyle = `background:#fff;color:#4B82FA;border:1px solid #1F60ED;font:700 14px/20px var(--font-sans);height:32px;padding:0 16px;border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box`;
    const secBtn = (label) =>
      `<button style="${secBtnStyle}"
        onmouseenter="this.style.background='#EDF5FF'"
        onmouseleave="this.style.background='#fff'"
        onmousedown="this.style.background='#D1E0FF'"
        onmouseup="this.style.background='#EDF5FF'"
      >${escHtml(label)}</button>`;

    // ── Exact SVG buttons from Figma (not recreated, embedded as-is) ────
    const SVG_ADD_DEFAULT = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#1F60ED"/><g clip-path="url(#flt-add-clip)"><path d="M21 8.5C21.6875 8.5 22.25 9.0625 22.25 9.75V11H21V9.75H8.5V11.75L13.5 16.75V22.25H16V21H17.25V22.25C17.25 22.9375 16.6875 23.5 16 23.5H13.5C12.8125 23.5 12.25 22.9375 12.25 22.25V17.25L7.625 12.625C7.375 12.375 7.25 12.0625 7.25 11.75V9.75C7.25 9.0625 7.8125 8.5 8.5 8.5H21ZM20.5 12.375V16.4375H24.5625V17.6875H20.5V21.75H19.25V17.6875H15.25V16.4375H19.25V12.375H20.5Z" fill="#1F60ED"/></g><defs><clipPath id="flt-add-clip"><rect width="20" height="20" fill="white" transform="translate(6 6)"/></clipPath></defs></svg>`;
    const SVG_ADD_HOVER   = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#EDF3FF" stroke="#1F60ED"/><g clip-path="url(#flt-addh-clip)"><path d="M21 8.5C21.6875 8.5 22.25 9.0625 22.25 9.75V11H21V9.75H8.5V11.75L13.5 16.75V22.25H16V21H17.25V22.25C17.25 22.9375 16.6875 23.5 16 23.5H13.5C12.8125 23.5 12.25 22.9375 12.25 22.25V17.25L7.625 12.625C7.375 12.375 7.25 12.0625 7.25 11.75V9.75C7.25 9.0625 7.8125 8.5 8.5 8.5H21ZM20.5 12.375V16.4375H24.5625V17.6875H20.5V21.75H19.25V17.6875H15.25V16.4375H19.25V12.375H20.5Z" fill="#1F60ED"/></g><defs><clipPath id="flt-addh-clip"><rect width="20" height="20" fill="white" transform="translate(6 6)"/></clipPath></defs></svg>`;
    const SVG_RES_DEFAULT = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#DE350B"/><path d="M21 8.5C21.3315 8.5 21.6494 8.63179 21.8838 8.86621C22.1182 9.10063 22.25 9.41848 22.25 9.75V11H21V9.75H8.5V11.7314L13.1338 16.3662L13.5 16.7314V22.25H16V21H17.25V22.25C17.25 22.5815 17.1182 22.8994 16.8838 23.1338C16.6494 23.3682 16.3315 23.5 16 23.5H13.5C13.1685 23.5 12.8506 23.3682 12.6162 23.1338C12.3818 22.8994 12.25 22.5815 12.25 22.25V17.25L7.61621 12.6162C7.5001 12.5001 7.40756 12.3617 7.34473 12.21C7.28201 12.0584 7.24999 11.8955 7.25 11.7314V9.75C7.25 9.41848 7.38179 9.10063 7.61621 8.86621C7.85063 8.63179 8.16848 8.5 8.5 8.5H21ZM24.75 13.1338L21.8838 16L24.75 18.8672L23.8672 19.75L21 16.8838L18.1348 19.75L17.25 18.8652L20.1162 16L17.25 13.1338L18.1338 12.25L21 15.1162L23.8662 12.25L24.75 13.1338Z" fill="#DE350B"/></svg>`;
    const SVG_RES_HOVER   = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#FFEBE6" stroke="#DE350B"/><path d="M21 8.5C21.3315 8.5 21.6494 8.63179 21.8838 8.86621C22.1182 9.10063 22.25 9.41848 22.25 9.75V11H21V9.75H8.5V11.7314L13.1338 16.3662L13.5 16.7314V22.25H16V21H17.25V22.25C17.25 22.5815 17.1182 22.8994 16.8838 23.1338C16.6494 23.3682 16.3315 23.5 16 23.5H13.5C13.1685 23.5 12.8506 23.3682 12.6162 23.1338C12.3818 22.8994 12.25 22.5815 12.25 22.25V17.25L7.61621 12.6162C7.5001 12.5001 7.40756 12.3617 7.34473 12.21C7.28201 12.0584 7.24999 11.8955 7.25 11.7314V9.75C7.25 9.41848 7.38179 9.10063 7.61621 8.86621C7.85063 8.63179 8.16848 8.5 8.5 8.5H21ZM24.75 13.1338L21.8838 16L24.75 18.8672L23.8672 19.75L21 16.8838L18.1348 19.75L17.25 18.8652L20.1162 16L17.25 13.1338L18.1338 12.25L21 15.1162L23.8662 12.25L24.75 13.1338Z" fill="#DE350B"/></svg>`;

    // Add/reset buttons with hover swap (exact SVGs, no recreation)
    const btnAdd = `<button title="Agregar filtro" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
      <span class="flt-def">${SVG_ADD_DEFAULT}</span>
      <span class="flt-hov" style="display:none">${SVG_ADD_HOVER}</span>
    </button>`;

    const btnReset = (tableId, barId) => {
      const onclick = `(function(btn){
        var bar=document.getElementById('${barId}');
        if(!bar)return;
        bar.querySelectorAll('input[type=text]').forEach(function(inp){
          inp.value='';inp.style.border='1px solid var(--n3)';inp.style.background='#fff';
        });
        bar.querySelectorAll('.dt-drop-wrap').forEach(function(wrap){
          var lbl=wrap.querySelector('.dt-dlabel');
          if(lbl){lbl.textContent=lbl.dataset.ph||lbl.textContent;lbl.style.color='var(--n6)';lbl.dataset.filled='';}
          wrap.dataset.val='';
          if(typeof dtDropClose==='function')dtDropClose(wrap);
        });
        var tbl=document.getElementById('${tableId}');
        if(tbl)tbl.querySelectorAll('tbody tr').forEach(function(r){r.style.display='';});
      })(this)`.replace(/\s+/g,' ');
      return `<button title="Limpiar filtros" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex" onclick="${onclick.replace(/"/g,'&quot;')}"
          onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
          onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
        <span class="flt-def">${SVG_RES_DEFAULT}</span>
        <span class="flt-hov" style="display:none">${SVG_RES_HOVER}</span>
      </button>`;
    };

    // ── Real table from scrollDemo (table.json) ──────────────────────────
    const tableId = 'flt-demo-tbl', barId = 'flt-demo-bar';

    // Wrap tblDemoTable output with an id we can target for filtering
    const rawTableHtml = tblDemoTable(data.scrollDemo || {});
    const demoTableHtml = rawTableHtml.replace('<div class="tbl-outer">', `<div class="tbl-outer" id="${tableId}">`);

    // Build col index map from fields for the IIFE
    // Each field has colIdx pointing to which <td> to read
    const colMap = (data.fields||[]).map(f => f.colIdx !== undefined ? f.colIdx : -1);

    // ── Filter IIFE (runs on "Filtrar" click) ────────────────────────────
    // Reads inputs by order, maps to column indices from fields[].colIdx
    // Status dropdown: exact match; text inputs: partial case-insensitive
    const onFilter = `(function(){
      var bar=document.getElementById('${barId}');
      var tbl=document.getElementById('${tableId}');
      if(!bar||!tbl)return;
      var inps=bar.querySelectorAll('input[type=text]');
      var statusWrap=bar.querySelector('.dt-drop-wrap[data-val]');
      var statusV=statusWrap?statusWrap.dataset.val:'';
      var colMap=${JSON.stringify(colMap)};
      var textInps=[].slice.call(inps);
      tbl.querySelectorAll('tbody tr').forEach(function(row){
        var cells=row.querySelectorAll('td');
        var show=true;
        var ti=0;
        colMap.forEach(function(ci,fi){
          var f=${JSON.stringify((data.fields||[]).map(f=>f.type))};
          if(f[fi]==='select'){
            if(statusV&&ci>=0){
              var txt=(cells[ci]?cells[ci].textContent:'').trim();
              if(txt!==statusV)show=false;
            }
          } else {
            var val=(textInps[ti]?textInps[ti].value:'').toLowerCase().trim();
            ti++;
            if(val&&ci>=0){
              var txt2=(cells[ci]?cells[ci].textContent:'').toLowerCase();
              if(!txt2.includes(val))show=false;
            }
          }
        });
        row.style.display=show?'':'none';
      });
    })()`.replace(/\s+/g,' ');

    // ── Render filter fields with IDs on text inputs ──────────────────────
    let inputIdx = 0;
    const renderFieldFunctional = (f) => {
      if (f.type === 'select') {
        // dt-drop-wrap stores selected val in data-val on the wrap
        const items = (f.options||[]).map(o => {
          const safe = o.replace(/'/g,"&#39;");
          return `<div onclick="dtPickOpt(this);this.closest('.dt-drop-wrap').dataset.val='${safe}'"
            data-val="${safe}"
            onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
            onmouseleave="this.style.background='';this.style.color='var(--n7)'"
            style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer"
          >${escHtml(o)}</div>`;
        }).join('');
        return `<div class="dt-drop-wrap" data-val="" style="position:relative;flex:1;min-width:0">
          <div class="dt-dtrigger" data-theme="border"
            onclick="dtDrop(this.parentElement)"
            onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
            onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
            style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
            <span class="dt-dlabel" data-ph="${escHtml(f.placeholder)}" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(f.placeholder)}</span>
            <span style="color:var(--n5);display:flex;flex-shrink:0">${CHEVRON}</span>
          </div>
          <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">${items}</div>
        </div>`;
      }
      if (f.type === 'date') {
        return `<div style="position:relative;flex:1;min-width:0">
          <input type="text" placeholder="${escHtml(f.placeholder)}"
            style="${inpBase};padding:0 34px 0 10px"
            onfocus="${onFocus}" onblur="${onBlur}"
            onmouseenter="${onMEnter}" onmouseleave="${onMLeave}">
          <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;color:var(--n5)">${CALENDAR}</div>
        </div>`;
      }
      return `<div style="flex:1;min-width:0">
        <input type="text" placeholder="${escHtml(f.placeholder)}"
          style="${inpBase};padding:0 10px"
          onfocus="${onFocus}" onblur="${onBlur}"
          onmouseenter="${onMEnter}" onmouseleave="${onMLeave}">
      </div>`;
    };

    // ── Functional filter bar + demo table in one container ───────────────
    const filterDemo = `
      <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:20px;margin-bottom:28px">
        <div id="${barId}" style="display:flex;align-items:center;gap:8px">
          ${fields.map(renderFieldFunctional).join('')}
          <button style="${secBtnStyle}" onclick="${onFilter.replace(/"/g,"'")}"
            onmouseenter="this.style.background='#EDF5FF'"
            onmouseleave="this.style.background='#fff'"
            onmousedown="this.style.background='#D1E0FF'"
            onmouseup="this.style.background='#EDF5FF'"
          >${escHtml(data.filterBtnLabel || 'Filtrar')}</button>
          ${btnAdd}
          ${btnReset(tableId, barId)}
        </div>
        <div style="border:1px solid var(--n3);border-radius:6px;overflow:hidden">
          ${demoTableHtml}
        </div>
      </div>`;

    // ── Icon buttons reference ─────────────────────────────────────────────
    const iconRef = `
      <div class="card" style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap;margin-bottom:28px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="display:flex;gap:8px">${SVG_ADD_DEFAULT}${SVG_ADD_HOVER}</div>
          <span style="font:600 11px var(--font-sans);color:var(--n6)">filter--add</span>
          <span style="font:400 10px var(--font-mono);color:var(--n45)">default · hover</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="display:flex;gap:8px">${SVG_RES_DEFAULT}${SVG_RES_HOVER}</div>
          <span style="font:600 11px var(--font-sans);color:var(--n6)">filter--reset</span>
          <span style="font:400 10px var(--font-mono);color:var(--n45)">default · hover</span>
        </div>
      </div>`;

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      <h3 style="font:700 15px var(--font-sans);margin:0 0 10px;color:var(--n7)">Filter bar · live demo</h3>
      ${filterDemo}
      <h3 style="font:700 15px var(--font-sans);margin:0 0 10px;color:var(--n7)">Icon buttons</h3>
      ${iconRef}
      <div class="card flush">
        <div class="card-hdr"><span class="ttl">Tokens</span></div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:6px">
          ${(data.rules||[]).map(r=>`<div style="font:400 13px/1.5 var(--font-sans);color:var(--n6)">${escHtml(r)}</div>`).join('')}
        </div>
      </div>
    `;
  },

  tablepage(data) {
    // ── inject sidebar CSS (same as sidebar renderer) ──────────────────
    const sbStyle = `<style>
      .sbx{width:52px;overflow:hidden;transition:width .25s cubic-bezier(.4,0,.2,1);background:#fff;border-radius:0;box-shadow:none;border-right:1px solid var(--n3);padding:8px 0;flex-shrink:0;cursor:default}
      .sbx:hover{width:240px}
      .sbx-row{display:flex;align-items:center;height:40px;cursor:pointer}
      .sbx-row:hover .sbx-bg{background:rgba(75,130,250,.04)}
      .sbx-row.sel .sbx-bg{background:rgba(75,130,250,.08)}
      .sbx-bar{width:6px;height:40px;flex-shrink:0;background:transparent}
      .sbx-row.sel .sbx-bar{background:#0052CC}
      .sbx-bg{display:flex;align-items:center;height:40px;flex:1;transition:background .12s;overflow:hidden}
      .sbx-ico{width:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .sbx-ico svg{display:block}
      .sbx-row .sbx-ico svg{fill:#4B82FA}
      .sbx-row.sel .sbx-ico svg{fill:#0052CC}
      .sbx-lbl{font:400 13px/1 'DM Sans',sans-serif;color:#39414D;white-space:nowrap;opacity:0;transition:opacity .18s .06s;overflow:hidden;flex:1}
      .sbx:hover .sbx-lbl{opacity:1}
      .sbx-row.sel .sbx-lbl{font-weight:600;color:#0052CC}
      .sbx-sep{height:1px;background:#E9ECF2;margin:4px 14px}
    </style>`;


    // ── DS Sidebar items (Carbon icons, Órdenes selected) ─────────────
    // Last Mile sidebar — from sidebar.json products[id=lastmile].items
    // Active item driven by data.activeNav (defaults to 'document-multiple')
    const activeNav = data.activeNav || 'document-multiple';
    const sbItems = [
      { icon:'report-data',       label:'Resumen' },
      { icon:'dashboard',         label:'Actividad' },
      { icon:'network-3',         label:'Rutas' },
      { icon:'document-multiple', label:'Órdenes' },
      { icon:'delivery',          label:'Flota' },
      { icon:'chart-column',      label:'Estadísticas' },
      { icon:'notification',      label:'Alertas' },
      { icon:'events',            label:'Clientes' },
      { icon:'file-system',       label:'Documentos' },
      { icon:'currency',          label:'Módulo de Costos' },
      { icon:'return',            label:'Logística inversa' },
      { icon:'white-paper',       label:'Rendición de Documentos' },
      { icon:'store',             label:'Retiro en tienda' },
      { icon:'document-import',   label:'Importar' },
      { divider:true },
      { icon:'settings',          label:'Ajustes' },
    ].map(it => ({ ...it, sel: !it.divider && it.icon === activeNav }));

    const sidebarHtml = sbItems.map(it => {
      if (it.divider) return `<div class="sbx-sep"></div>`;
      const sel = it.sel ? ' sel' : '';
      return `<div class="sbx-row${sel}">
        <div class="sbx-bar"></div>
        <div class="sbx-bg">
          <div class="sbx-ico">${iconSvg(it.icon, 18)}</div>
          <span class="sbx-lbl">${escHtml(it.label)}</span>
        </div>
      </div>`;
    }).join('');


    return `
      ${sbStyle}
      <h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)">${escHtml(data.title)}</h1>
      <p style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px">${escHtml(data.description)}</p>

      <div class="card flush" style="border-radius:8px;overflow:hidden">

        <!-- Topbar: exact DS LM desktop component -->
        <div class="tbar" style="border-radius:0;padding:0 0 0 22px">
          <img src="sections/assets/logos/lastmile-desktop-white.svg" height="18" class="logo" alt="LastMile">
          <div class="acts">
            ${iconSvg('apps',18,'#fff')}
            ${iconSvg('help',18,'#fff')}
            ${iconSvg('messages',18,'#fff')}
            <div class="bell">${iconSvg('alerts',18,'#fff')}</div>
            ${iconSvg('user',18,'#fff')}
          </div>
          <div class="slot">ACME CO</div>
        </div>

        <!-- Body -->
        <div style="display:flex;min-height:540px">

          <!-- Sidebar: exact DS sidebar desktop component -->
          <div class="sbx">${sidebarHtml}</div>

          <!-- Main content -->
          <div style="flex:1;padding:20px 24px 16px;min-width:0;display:flex;flex-direction:column;gap:20px;overflow:hidden;background:var(--n2)">

            <!-- Page header -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
              <span style="font:700 22px/1 var(--font-sans);color:var(--n7)">${escHtml(data.pageTitle)}</span>
              <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
                <button style="height:32px;padding:0 12px;border-radius:50px;font:700 14px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-sizing:border-box">${iconSvg('plan',13,'#4B82FA')}${escHtml(data.buttons?.log||'Bitácora')}</button>
                <button style="height:32px;padding:0 12px;border-radius:50px;font:700 14px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-sizing:border-box">${iconSvg('download',13,'#4B82FA')}${escHtml(data.buttons?.export||'Exportar a excel')}</button>
                <button style="height:32px;padding:0 14px;border-radius:50px;font:700 14px/1 var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-sizing:border-box"><svg width="13" height="13" viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="3"><line x1="16" y1="6" x2="16" y2="26"/><line x1="6" y1="16" x2="26" y2="16"/></svg>${escHtml(data.buttons?.create||'Nueva orden')}</button>
              </div>
            </div>

            <!-- Container: filter bar + table -->
            <div style="border-radius:8px;border:1px solid var(--n4);background:#fff;padding:20px;display:flex;flex-direction:column;gap:20px">

              <!-- Filter bar (from Filters component) -->
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;min-width:0">
                  <input type="text" placeholder="Código de orden" style="width:100%;height:32px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;padding:0 10px" onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'" onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'" onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'" onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
                </div>
                <div class="dt-drop-wrap" style="position:relative;flex:1;min-width:0">
                  <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)" onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'" onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'" style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
                    <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">Tipo de fecha para filtrar</span>
                    <span style="color:var(--n5);display:flex;flex-shrink:0"><svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg></span>
                  </div>
                  <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">
                    <div onclick="dtPickOpt(this)" data-val="Fecha de creación" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'" onmouseleave="this.style.background='';this.style.color='var(--n7)'" style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">Fecha de creación</div>
                    <div onclick="dtPickOpt(this)" data-val="Fecha de ruta" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'" onmouseleave="this.style.background='';this.style.color='var(--n7)'" style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">Fecha de ruta</div>
                  </div>
                </div>
                <div style="position:relative;flex:1;min-width:0">
                  <input type="text" placeholder="Seleccionar fecha" style="width:100%;height:32px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;padding:0 34px 0 10px" onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'" onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'" onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'" onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
                  <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;color:var(--n5);pointer-events:none"><svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0"><path d="M26,4h-4V2h-2v2h-8V2h-2v2H6C4.9,4,4,4.9,4,6v20c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C28,4.9,27.1,4,26,4z M26,26H6V12h20V26z M26,10H6V6h4v2h2V6h8v2h2V6h4V10z"/></svg></div>
                </div>
                <div class="dt-drop-wrap" style="position:relative;flex:1;min-width:0">
                  <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)" onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'" onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'" style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
                    <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">Estado</span>
                    <span style="color:var(--n5);display:flex;flex-shrink:0"><svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg></span>
                  </div>
                  <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">
                    <div onclick="dtPickOpt(this)" data-val="Entregado" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'" onmouseleave="this.style.background='';this.style.color='var(--n7)'" style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">Entregado</div>
                    <div onclick="dtPickOpt(this)" data-val="No entregado" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'" onmouseleave="this.style.background='';this.style.color='var(--n7)'" style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">No entregado</div>
                    <div onclick="dtPickOpt(this)" data-val="Por entregar" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'" onmouseleave="this.style.background='';this.style.color='var(--n7)'" style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">Por entregar</div>
                  </div>
                </div>
                <button style="background:#fff;color:#4B82FA;border:1px solid #1F60ED;font:700 14px/20px var(--font-sans);height:32px;padding:0 16px;border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box" onmouseenter="this.style.background='#EDF5FF'" onmouseleave="this.style.background='#fff'" onmousedown="this.style.background='#D1E0FF'" onmouseup="this.style.background='#EDF5FF'">Filtrar</button>
                <button title="Add more filters" style="width:32px;height:32px;border:1px solid var(--b6);border-radius:4px;background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0;box-sizing:border-box">
                  ${iconSvg('filter--add', 24, 'var(--b6)')}
                </button>
                <button title="Reset filters" style="width:32px;height:32px;border:1px solid var(--r6);border-radius:4px;background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0;box-sizing:border-box">
                  ${iconSvg('filter--reset', 24, 'var(--r6)')}
                </button>
              </div>

              <!-- Table: tblDemoTable(data.scrollDemo) from table.json -->
              <div style="border:1px solid var(--n4);border-radius:4px;overflow:hidden">
                ${tblDemoTable(data.scrollDemo || {})}
              </div>

            </div><!-- end container (filter bar + table) -->

            <!-- Pagination -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
              <button style="width:28px;height:28px;border-radius:4px;border:1px solid var(--n3);background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--n6)" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
              <button style="min-width:28px;height:28px;border-radius:4px;border:1px solid var(--b6);background:var(--b6);display:inline-flex;align-items:center;justify-content:center;font:700 12px var(--font-sans);color:#fff;cursor:pointer;padding:0 4px">1</button>
              ${[2,3].map(n=>`<button style="min-width:28px;height:28px;border-radius:4px;border:1px solid var(--n3);background:#fff;display:inline-flex;align-items:center;justify-content:center;font:500 12px var(--font-sans);color:var(--n6);cursor:pointer;padding:0 4px">${n}</button>`).join('')}
              <button style="width:28px;height:28px;border-radius:4px;border:1px solid var(--n3);background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--n6)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
            </div>

          </div><!-- end main -->
        </div><!-- end body -->
      </div><!-- end card -->
    `;
  },

  /* ── FORM PAGE ── */
  formpage(data) {
    // ── Reuse sidebar CSS from tablepage ──────────────────────────────────
    const sbStyle = `<style>
      .fp-sbx{width:52px;overflow:hidden;transition:width .25s cubic-bezier(.4,0,.2,1);background:#fff;border-radius:0;box-shadow:none;border-right:1px solid var(--n3);padding:8px 0;flex-shrink:0;cursor:default}
      .fp-sbx:hover{width:240px}
      .fp-sbx .sbx-row{display:flex;align-items:center;height:40px;cursor:pointer}
      .fp-sbx .sbx-row:hover .sbx-bg{background:rgba(75,130,250,.04)}
      .fp-sbx .sbx-row.sel .sbx-bg{background:rgba(75,130,250,.08)}
      .fp-sbx .sbx-bar{width:6px;height:40px;flex-shrink:0;background:transparent}
      .fp-sbx .sbx-row.sel .sbx-bar{background:#0052CC}
      .fp-sbx .sbx-bg{display:flex;align-items:center;height:40px;flex:1;transition:background .12s;overflow:hidden}
      .fp-sbx .sbx-ico{width:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .fp-sbx .sbx-ico svg{display:block;fill:#4B82FA}
      .fp-sbx .sbx-row.sel .sbx-ico svg{fill:#0052CC}
      .fp-sbx .sbx-lbl{font:400 13px/1 DM Sans,sans-serif;color:#39414D;white-space:nowrap;opacity:0;transition:opacity .18s .06s;flex:1}
      .fp-sbx:hover .sbx-lbl{opacity:1}
      .fp-sbx .sbx-row.sel .sbx-lbl{font-weight:600;color:#0052CC}
      .fp-sbx .sbx-sep{height:1px;background:#E9ECF2;margin:4px 14px}
    </style>`;

    const activeNav = data.activeNav || 'settings';
    const sbItems = [
      {icon:'report-data',label:'Resumen'},{icon:'dashboard',label:'Actividad'},
      {icon:'network-3',label:'Rutas'},{icon:'document-multiple',label:'Órdenes'},
      {icon:'delivery',label:'Flota'},{icon:'chart-column',label:'Estadísticas'},
      {icon:'notification',label:'Alertas'},{icon:'events',label:'Clientes'},
      {icon:'file-system',label:'Documentos'},{icon:'currency',label:'Módulo de Costos'},
      {divider:true},{icon:'settings',label:'Ajustes'},
    ];
    const sidebarHtml = sbItems.map(it => {
      if (it.divider) return `<div class="sbx-sep"></div>`;
      const sel = it.icon === activeNav;
      return `<div class="sbx-row${sel?' sel':''}"><div class="sbx-bar"></div><div class="sbx-bg"><div class="sbx-ico">${iconSvg(it.icon,18)}</div><span class="sbx-lbl">${escHtml(it.label)}</span></div></div>`;
    }).join('');

    // ── Common input token shorthand ──────────────────────────────────────
    const INP = `height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%`;
    const INP_FILLED = `height:32px;padding:0 10px;border:1px solid var(--n5);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%`;
    const CHEVRON_SM = `<svg viewBox="0 0 32 32" width="12" height="12" fill="var(--n5)"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
    const INFO_ICO = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--n4)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`;
    const BACK_ARROW = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;

    // ── Labeled input ─────────────────────────────────────────────────────
    const fpInp = (label, value='', placeholder='', required=false) => `
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">${required?'<span style="color:var(--r6)">*</span>':''}${escHtml(label)}</label>
        <input type="text" ${value?`value="${escHtml(value)}"`:`placeholder="${escHtml(placeholder||label)}"`}
          style="${value?INP_FILLED:INP}"
          onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
          onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'">
      </div>`;

    const fpSelect = (label, placeholder='', required=false) => `
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">${required?'<span style="color:var(--r6)">*</span>':''}${escHtml(label)}</label>
        <div class="dt-drop-wrap" style="position:relative">
          <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
            onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
            onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
            style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
            <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(placeholder)}</span>
            <span style="display:flex;flex-shrink:0">${CHEVRON_SM}</span>
          </div>
          <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0"></div>
        </div>
      </div>`;

    const fpRadio = (name, options, selected=0) => `
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        ${options.map((opt,i)=>`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font:400 14px var(--font-sans);color:var(--n7)">
          <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${i===selected?'var(--b6)':'var(--n4)'};background:${i===selected?'var(--b6)':'#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${i===selected?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
          </div>${escHtml(opt)}
        </label>`).join('')}
      </div>`;

    const fpSwitch = (label, on=false, info=false, indent=false) => `
      <div style="display:flex;align-items:center;gap:8px;padding:${indent?'0 0 0 20px':'0'}">
        <span style="flex:1;font:400 14px var(--font-sans);color:var(--n7)">${escHtml(label)}</span>
        ${info?`<span style="display:flex;align-items:center">${INFO_ICO}</span>`:''}
        <div class="swt${on?' on':''}" onclick="this.classList.toggle('on')" style="flex-shrink:0"></div>
      </div>`;

    const fpHint = (text) => `<p style="margin:2px 0 0;font:400 12px var(--font-sans);color:var(--n5)">${escHtml(text)}</p>`;

    const fpTextarea = (label, placeholder='') => `
      <div style="display:flex;flex-direction:column;gap:4px">
        <label style="font:400 12px/16px var(--font-sans);color:var(--n5)">${escHtml(label)}</label>
        <textarea placeholder="${escHtml(placeholder)}" rows="2"
          style="padding:8px 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px/1.5 var(--font-sans);background:var(--n2);color:var(--n7);box-sizing:border-box;outline:none;width:100%;resize:vertical"
          onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
          onblur="this.style.border='1px solid var(--n3)';this.style.background='var(--n2)'"></textarea>
      </div>`;

    // ── Block renderers ───────────────────────────────────────────────────
    // White card wrapper
    const fpCard = (title, content, style='') =>
      `<div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:16px;${style}">
        ${title?`<div style="font:700 15px var(--font-sans);color:var(--n7);padding-bottom:12px;border-bottom:1px solid var(--n3)">${escHtml(title)}</div>`:''}
        ${content}
      </div>`;

    // BLOCK: two-col
    const blockTwoCol = (leftTitle, leftContent, rightTitle, rightContent) =>
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        ${fpCard(leftTitle, leftContent)}
        ${fpCard(rightTitle, rightContent)}
      </div>`;

    // BLOCK: single
    const blockSingle = (title, content) => fpCard(title, content);

    // BLOCK: input-map (inputs left + map right)
    const blockInputMap = (formContent) =>
      `<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:20px">
        <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:12px">
          ${formContent}
        </div>
        <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);overflow:hidden;min-height:280px;position:relative">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,#e8edf3 25%,#dde3eb 100%)"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--n4)" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span style="font:400 11px var(--font-sans);color:var(--n4)">Map component</span>
          </div>
        </div>
      </div>`;

    // BLOCK: switches
    const blockSwitches = (title, rows, activateAll=false) =>
      fpCard(title, `
        ${activateAll?`<div style="display:flex;justify-content:flex-end;margin-top:-8px"><span style="font:700 13px var(--font-sans);color:var(--b7);cursor:pointer">Activar todo</span></div>`:''}
        <div style="display:flex;flex-direction:column;gap:0">
          ${rows.map((r,i)=>`<div style="padding:10px 0;${i>0?'border-top:1px solid var(--n3)':''}">${fpSwitch(r.label,r.on||false,r.info||false,r.indent||false)}</div>`).join('')}
        </div>`);

    // BLOCK: custom fields
    const blockCustomFields = (title, fieldGroups, addGroupBtn=false) =>
      fpCard(title, `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${fieldGroups.map(f=>f.type==='textarea'?fpTextarea(f.label,f.placeholder):fpSelect(f.label,f.label)).join('')}
        </div>
        ${addGroupBtn?`<div style="padding-top:4px"><button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px var(--font-sans);background:#fff;color:var(--n6);border:1px solid var(--n3);cursor:pointer">Agregar grupo</button></div>`:''}`);

    // BLOCK: file upload
    const blockFileUpload = (label, hint='') =>
      fpCard('', `
        <div style="display:flex;align-items:center;gap:12px">
          <div class="swt on"></div>
          <label style="font:500 13px var(--font-sans);color:var(--n7)">${escHtml(label)}</label>
          <div style="display:flex;align-items:center;gap:8px">
            <button style="height:32px;padding:0 14px;border-radius:50px;font:700 13px var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              Choose File
            </button>
            <span style="font:400 12px var(--font-sans);color:var(--n5)">No file chosen</span>
          </div>
        </div>
        ${hint?fpHint(hint):''}`);

    // ── Form page shell ───────────────────────────────────────────────────
    const formShell = (breadcrumb, title, blocks) => `
      <div class="card flush" style="border-radius:8px;overflow:hidden">
        <div class="tbar" style="border-radius:0;padding:0 0 0 22px">
          <img src="sections/assets/logos/lastmile-desktop-white.svg" height="18" class="logo" alt="LastMile">
          <div class="acts">${iconSvg('apps',18,'#fff')}${iconSvg('help',18,'#fff')}${iconSvg('messages',18,'#fff')}<div class="bell">${iconSvg('alerts',18,'#fff')}</div>${iconSvg('user',18,'#fff')}</div>
          <div class="slot">ACME CO</div>
        </div>
        <div style="display:flex;min-height:600px">
          <div class="fp-sbx">${sidebarHtml}</div>
          <div style="flex:1;padding:20px 24px 24px;min-width:0;display:flex;flex-direction:column;gap:0;overflow:hidden;background:var(--n2)">
            <!-- Breadcrumb -->
            <div style="font:400 12px var(--font-sans);color:var(--n5);margin-bottom:12px;display:flex;align-items:center;gap:4px">
              ${breadcrumb.map((b,i)=>`${i>0?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`:''}
              <span style="${i===breadcrumb.length-1?'color:var(--n6)':''}">${escHtml(b)}</span>`).join('')}
            </div>
            <!-- Page header -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px">
              <div style="display:flex;align-items:center;gap:8px">
                <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n6)">${BACK_ARROW}</button>
                <h2 style="margin:0;font:700 24px/1 var(--font-sans);color:var(--n7)">${escHtml(title)}</h2>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer">Cancelar</button>
                <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer">Guardar</button>
              </div>
            </div>
            <p style="font:400 12px var(--font-sans);color:var(--r6);margin:0 0 16px"><span>* </span>Indica el campo es obligatorio</p>
            <!-- Blocks -->
            <div style="display:flex;flex-direction:column;gap:16px">
              ${blocks}
            </div>
          </div>
        </div>
      </div>`;

    // ── Block catalog ─────────────────────────────────────────────────────
    const blockTypes = data.blocks || [];
    const catalogCards = blockTypes.map(bt => {
      let preview = '';
      if (bt.id === 'two-col') preview = blockTwoCol('Bloque A',
        fpInp('Campo 1','','',true) + fpInp('Campo 2','',''),
        'Bloque B',
        fpInp('Campo 3','','',true) + fpSelect('Campo 4','Seleccionar'));
      else if (bt.id === 'single') preview = blockSingle('Bloque completo',
        `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">${fpInp('Campo 1','','',true)}${fpInp('Campo 2','','',false)}${fpSelect('Campo 3','Seleccionar')}</div>`);
      else if (bt.id === 'input-map') preview = blockInputMap(
        fpInp('Nombre','','',true) + fpSelect('Tipo','Seleccionar tipo',true) + fpRadio('estado',['Activa','Inactiva'],0));
      else if (bt.id === 'switches') preview = blockSwitches('Permisos',[
        {label:'Crear nuevos registros',on:true,info:true},
        {label:'Editar registros',on:true,info:true},
        {label:'Solo dentro de geocerca',on:false,info:true,indent:true},
        {label:'Eliminar registros',on:false,info:true},
      ], true);
      else if (bt.id === 'custom-fields') preview = blockCustomFields('Campos personalizados',[
        {type:'select',label:'Tienda'},{type:'textarea',label:'Cargo',placeholder:''}],true);
      else if (bt.id === 'file-upload') preview = blockFileUpload('Foto de perfil','Tamaño sugerido 224×224px (PNG o JPG)');

      return `<div style="background:#fff;border:1px solid var(--n3);border-radius:10px;overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid var(--n3);display:flex;align-items:center;gap:10px">
          ${bt.icon?`<div style="width:28px;height:28px;border-radius:6px;background:var(--b1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--b7)" stroke-width="2"><path d="${escHtml(bt.icon)}"/></svg></div>`:''}
          <div>
            <div style="font:700 13px var(--font-sans);color:var(--n7)">${escHtml(bt.label)}</div>
            <div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:1px">${escHtml(bt.description)}</div>
          </div>
          <code style="margin-left:auto;font:600 11px var(--font-mono);background:var(--n2);padding:2px 7px;border-radius:4px;color:var(--b7);flex-shrink:0">${escHtml(bt.id)}</code>
        </div>
        <div style="padding:16px;background:var(--n2)">${preview}</div>
      </div>`;
    }).join('');

    // ── Assembled examples ────────────────────────────────────────────────
    const ex1 = formShell(
      ['Usuarios web','Nuevo usuario web'],
      'Nuevo usuario web',
      blockTwoCol(
        'Información de usuario',
        fpInp('Nombre y apellido','Walter Wallace','',true) +
        fpInp('Nombre de usuario','walter.wallace','',true) +
        fpHint('Nombre único para entrar a la plataforma. No debe contener espacios.') +
        fpInp('Email','walter.wallace@email.com','',true) +
        fpInp('Contraseña','','',true) +
        fpInp('Repite contraseña','','',true),
        'Agrupaciones',
        `<p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 12px">Al seleccionar una agrupación el usuario pierde los accesos a ajustes.</p>` +
        fpSelect('Agrupaciones de órdenes','') +
        fpSelect('Agrupaciones de vehículos','')
      ) +
      blockSingle('Permisos',
        `<p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 12px">Selecciona una agrupación de permisos seleccionando un rol o de manera personalizada.</p>` +
        `<div style="display:flex;gap:16px;margin-bottom:12px">${fpRadio('perm-type',['Rol de usuario','Personalizado'],0)}</div>` +
        fpSelect('Seleccionar rol','')
      ) +
      blockCustomFields('Campos personalizados',
        [{type:'select',label:'Tienda'},{type:'select',label:'Cargo'}])
    );

    const ex2 = formShell(
      ['Usuarios móviles','Nuevo usuario móvil'],
      'Nuevo usuario móvil',
      blockTwoCol(
        'Información de usuario',
        fpInp('Nombre y apellido','','example',true) +
        fpInp('Teléfono','','example',true) +
        fpInp('ID','','',false),
        'Datos de acceso a la plataforma',
        fpInp('Usuario','','example',true) +
        fpHint('No se permiten espacios.') +
        fpInp('Contraseña','','example',true) +
        fpHint('Mínimo 4 caracteres.') +
        blockFileUpload('Foto de perfil','Tamaño sugerido de 224×224 (PNG o JPG)')
      ) +
      blockSwitches('Permisos',[
        {label:'Crear órdenes nuevas',on:true,info:true},
        {label:'Agregar órdenes del sistema',on:true,info:true},
        {label:'Solo dentro de geocerca del CD',on:false,info:true,indent:true},
        {label:'Eliminar órdenes',on:true,info:true},
        {label:'Compartir ruta a copiloto',on:true,info:true},
        {label:'Reordenar ruta no iniciada',on:true,info:true},
        {label:'Notificaciones automáticas (pre-entrega)',on:false,info:true},
      ], true) +
      blockCustomFields('Campos personalizados',[
        {type:'textarea',label:'Tienda',placeholder:''},
        {type:'textarea',label:'Cargo',placeholder:''}])
    );

    const ex3 = formShell(
      ['Configuración','Geocerca','Crear Geocerca'],
      'Crear Geocerca',
      blockInputMap(
        `<p style="font:700 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Tipo de geocerca</p>
        <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 10px">Asociativa: define la zona de despacho de un vehículo.<br>Restrictiva: impide el tránsito por una zona.</p>` +
        `<div style="margin-bottom:12px">${fpRadio('geocerca-tipo',['Asociativa','Restrictiva'],1)}</div>` +
        fpInp('Nombre','','',true) +
        fpSelect('Seleccionar geocerca pre-definida','') +
        `<div style="margin-top:4px"><p style="font:400 12px var(--font-sans);color:var(--n7);margin:0 0 8px">Estado</p>${fpRadio('geocerca-estado',['Activa','Inactiva'],0)}</div>`
      )
    );

    return `
      ${sbStyle}
      ${sectionHeader(data)}

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 6px">Page shell</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6">
        Every form page uses the same shell: <strong>Topbar</strong> → <strong>Sidebar</strong> → content area with breadcrumb, ← back + title + <em>Cancelar/Guardar</em> buttons, required field note, and a vertical stack of blocks.
      </p>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:24px 0 6px">Block catalog</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6">
        Compose any form by stacking blocks. Every block is a white card with <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">border-radius:8px · border:1px solid var(--n4) · padding:20px</code>. Blocks stack with <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">gap:16px</code>.
      </p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:36px">${catalogCards}</div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 6px">Example — Nuevo usuario web</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 12px">two-col + single + custom-fields</p>
      <div style="margin-bottom:28px">${ex1}</div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 6px">Example — Nuevo usuario móvil</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 12px">two-col + switches + custom-fields</p>
      <div style="margin-bottom:28px">${ex2}</div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 6px">Example — Crear Geocerca</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 12px">input-map</p>
      <div style="margin-bottom:28px">${ex3}</div>
    `;
  },

  /* ── DRAFTS ── */
  drafts(data) {
    const STORAGE_KEY = 'dt-ds-drafts-v1';
    return `
      ${sectionHeader(data)}
      <style>
        .draft-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:4px}
        .draft-card{background:#fff;border:1.5px dashed var(--o5);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .15s}
        .draft-card:hover{box-shadow:0 4px 16px rgba(19,32,69,.1)}
        .draft-card.approved{border:1.5px solid var(--g5)}
        .draft-card-preview{background:var(--n2);padding:24px;display:flex;align-items:center;justify-content:center;min-height:120px}
        .draft-card-body{padding:14px 16px 10px;display:flex;flex-direction:column;gap:6px;flex:1}
        .draft-badge{display:inline-flex;align-items:center;gap:4px;font:700 9px var(--font-sans);letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px}
        .draft-badge.pending{background:var(--o1);color:#7A4A00}
        .draft-badge.approved{background:var(--g1);color:var(--g7)}
        .draft-card-name{font:700 14px var(--font-sans);color:var(--n7)}
        .draft-card-desc{font:400 12px var(--font-sans);color:var(--n5);line-height:1.5;flex:1}
        .draft-card-footer{display:flex;gap:8px;padding:10px 16px 14px}
        .draft-btn-approve{height:30px;padding:0 14px;border-radius:50px;font:700 12px var(--font-sans);background:var(--g6);color:#fff;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
        .draft-btn-approve:hover{background:var(--g7)}
        .draft-btn-discard{height:30px;padding:0 14px;border-radius:50px;font:700 12px var(--font-sans);background:#fff;color:var(--r6);border:1px solid var(--r6);cursor:pointer;display:inline-flex;align-items:center;gap:5px}
        .draft-btn-discard:hover{background:var(--r1)}
        .draft-empty{grid-column:1/-1;padding:48px 24px;text-align:center;background:#fff;border:1px solid var(--n3);border-radius:8px}
        .draft-empty-icon{width:40px;height:40px;background:var(--n2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
        .draft-empty-title{font:700 14px var(--font-sans);color:var(--n6);margin-bottom:4px}
        .draft-empty-sub{font:400 12px var(--font-sans);color:var(--n5);max-width:320px;margin:0 auto 16px}
        .draft-add-btn{height:32px;padding:0 16px;border-radius:50px;font:700 13px var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
        .draft-add-btn:hover{background:var(--b7)}
        /* Approval modal */
        .draft-modal-bg{position:fixed;inset:0;background:rgba(19,32,69,.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
        .draft-modal{background:#fff;border-radius:12px;width:100%;max-width:460px;box-shadow:0 12px 48px rgba(19,32,69,.2)}
        .draft-modal-head{padding:20px 20px 14px;border-bottom:1px solid var(--n3)}
        .draft-modal-head h4{font:700 15px var(--font-sans);color:var(--n7);margin:0 0 4px}
        .draft-modal-head p{font:400 13px var(--font-sans);color:var(--n5);margin:0}
        .draft-modal-opts{padding:16px 20px;display:flex;flex-direction:column;gap:10px}
        .draft-modal-opt{border:1.5px solid var(--n3);border-radius:8px;padding:12px 14px;cursor:pointer;transition:border-color .12s,background .12s}
        .draft-modal-opt:hover{border-color:var(--b6);background:var(--b1)}
        .draft-modal-opt.sel{border-color:var(--b6);background:var(--b1)}
        .draft-modal-opt-title{font:700 13px var(--font-sans);color:var(--n7)}
        .draft-modal-opt-desc{font:400 12px var(--font-sans);color:var(--n5);margin-top:2px}
        .draft-modal-foot{padding:12px 20px;border-top:1px solid var(--n3);display:flex;justify-content:flex-end;gap:8px}
      </style>

      <!-- Approval modal -->
      <div id="draft-modal-bg" class="draft-modal-bg" style="display:none" onclick="if(event.target===this)closeDraftModal()">
        <div class="draft-modal">
          <div class="draft-modal-head">
            <h4 id="draft-modal-title">Approve component</h4>
            <p>Where do you want to add it to the Design System?</p>
          </div>
          <div class="draft-modal-opts">
            <div class="draft-modal-opt" onclick="selectDraftOpt(this,'new')">
              <div class="draft-modal-opt-title">➕ New section</div>
              <div class="draft-modal-opt-desc">Create a new nav section for this component.</div>
            </div>
            <div class="draft-modal-opt" onclick="selectDraftOpt(this,'existing')">
              <div class="draft-modal-opt-title">📂 Existing section</div>
              <div class="draft-modal-opt-desc">Add it inside an existing DS section.</div>
            </div>
            <div class="draft-modal-opt" onclick="selectDraftOpt(this,'replace')">
              <div class="draft-modal-opt-title">🔄 Replace existing component</div>
              <div class="draft-modal-opt-desc">This draft replaces a previous version of the same component.</div>
            </div>
          </div>
          <div class="draft-modal-foot">
            <button onclick="closeDraftModal()" style="height:32px;padding:0 16px;border-radius:50px;font:700 13px var(--font-sans);background:#fff;color:var(--n6);border:1px solid var(--n3);cursor:pointer">Cancel</button>
            <button id="draft-confirm-btn" onclick="confirmDraftApproval()" disabled style="height:32px;padding:0 16px;border-radius:50px;font:700 13px var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer;opacity:.4">Confirm approval</button>
          </div>
        </div>
      </div>

      <div id="draft-grid" class="draft-grid"></div>

      <script>
      (function(){
        const KEY = '${STORAGE_KEY}';
        let _activeIdx = null, _selectedOpt = null;

        function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; } }
        function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }

        function render(){
          const drafts = load();
          const grid = document.getElementById('draft-grid');
          if (!grid) return;
          // update nav badge
          const badge = document.getElementById('draft-nav-badge');
          const pending = drafts.filter(d=>d.status==='pending').length;
          if (badge){ badge.textContent=pending; badge.style.display=pending?'inline':'none'; }

          if (!drafts.length){
            grid.innerHTML = \`<div class="draft-empty">
              <div class="draft-empty-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
              <div class="draft-empty-title">No draft components</div>
              <div class="draft-empty-sub">When a new component is proposed it will appear here for review before entering the DS.</div>
              <button class="draft-add-btn" onclick="window.__addDraft&&window.__addDraft()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add draft component
              </button>
            </div>\`;
            return;
          }

          grid.innerHTML = drafts.map((d,i) => \`
            <div class="draft-card \${d.status==='approved'?'approved':''}" id="dc-\${i}">
              <div class="draft-card-preview">\${d.preview||'<span style="font:400 12px var(--font-sans);color:var(--n5)">No preview</span>'}</div>
              <div class="draft-card-body">
                <span class="draft-badge \${d.status==='approved'?'approved':'pending'}">\${d.status==='approved'?'✓ Approved':'Pending review'}</span>
                \${d.addedTo?'<span style="font:400 11px var(--font-sans);color:var(--n5)">→ '+d.addedTo+'</span>':''}
                <div class="draft-card-name">\${d.name}</div>
                <div class="draft-card-desc">\${d.description||''}</div>
              </div>
              \${d.status==='pending'?\`
              <div class="draft-card-footer">
                <button class="draft-btn-approve" onclick="openDraftModal(\${i})">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Approve
                </button>
                <button class="draft-btn-discard" onclick="discardDraft(\${i})">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Discard
                </button>
              </div>\`:''}
            </div>
          \`).join('');
        }

        window.openDraftModal = function(idx){
          _activeIdx = idx; _selectedOpt = null;
          const d = load()[idx];
          document.getElementById('draft-modal-title').textContent = 'Approve: ' + d.name;
          document.querySelectorAll('.draft-modal-opt').forEach(o=>o.classList.remove('sel'));
          const btn = document.getElementById('draft-confirm-btn');
          btn.disabled=true; btn.style.opacity='.4';
          document.getElementById('draft-modal-bg').style.display='flex';
        };
        window.closeDraftModal = function(){
          document.getElementById('draft-modal-bg').style.display='none';
          _activeIdx=null; _selectedOpt=null;
        };
        window.selectDraftOpt = function(el, val){
          document.querySelectorAll('.draft-modal-opt').forEach(o=>o.classList.remove('sel'));
          el.classList.add('sel'); _selectedOpt=val;
          const btn=document.getElementById('draft-confirm-btn');
          btn.disabled=false; btn.style.opacity='1';
        };
        window.confirmDraftApproval = function(){
          if(_activeIdx===null||!_selectedOpt) return;
          const labels={new:'New section',existing:'Existing section',replace:'Replace existing'};
          const drafts=load();
          drafts[_activeIdx].status='approved';
          drafts[_activeIdx].addedTo=labels[_selectedOpt];
          save(drafts); closeDraftModal(); render();
        };
        window.discardDraft = function(idx){
          if(!confirm('Discard this draft? It will be removed.')) return;
          const drafts=load(); drafts.splice(idx,1); save(drafts); render();
        };
        // Public API — call from anywhere to propose a new component
        window.addDraft = function(name, description, previewHtml){
          if(!name){ name=prompt('Component name:'); if(!name) return; }
          if(!description){ description=prompt('Short description:',''); }
          const drafts=load();
          drafts.push({name, description:description||'', preview:previewHtml||'', status:'pending'});
          save(drafts); render();
        };
        window.__addDraft = function(){ window.addDraft(); };

        render();
      })();
      <\/script>
    `;
  },

  /* ── BACKLOG ── */
  backlog(data) {
    const items = data.items || [];
    const cards = items.map(item => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#fff;border:1px solid var(--n3);border-radius:8px">
        <div style="width:32px;height:32px;border-radius:6px;background:var(--n2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="3"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:3px">${escHtml(item.label)}</div>
          <div style="font:400 12px var(--font-sans);color:var(--n5);line-height:1.5">${escHtml(item.description || '')}</div>
        </div>
        <span style="flex-shrink:0;height:20px;padding:0 8px;border-radius:99px;background:var(--n2);border:1px solid var(--n3);font:600 10px/20px var(--font-sans);color:var(--n5);white-space:nowrap">Planned</span>
      </div>`).join('');

    return `
      ${sectionHeader(data)}
      <div style="background:var(--o1);border:1px solid var(--o3);border-radius:8px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;margin-bottom:20px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--o7)" stroke-width="2" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div style="font:700 13px var(--font-sans);color:var(--o7);margin-bottom:2px">Componentes planificados — sin especificación aprobada</div>
          <div style="font:400 12px var(--font-sans);color:var(--o7);line-height:1.5">Estos items están en el roadmap del DS pero aún no tienen diseño final ni están disponibles para uso en producción. Para proponer un componente nuevo, usá la sección <strong>Drafts</strong>.</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
        ${cards}
      </div>`;
  },

};
