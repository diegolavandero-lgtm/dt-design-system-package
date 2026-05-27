/* ================================================================
   renderers.js — DT Design System
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

    function renderStates(states, height, padding, fontSize) {
      return states.map(s => {
        const style = [
          `background:${s.bg}`,
          `color:${s.color}`,
          s.border && s.border !== 'none' ? `border:${s.border}` : 'border:none',
          s.underline ? 'text-decoration:underline' : '',
        ].filter(Boolean).join(';');
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px">
          <button style="${style};font:500 ${fontSize}/${fontSize} var(--font-sans);height:${height};padding:${padding};border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center">${escHtml(s.text)}</button>
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
            ${renderStates(v.states, t.height || '40px', t.padding || '0 32px', t.fontSize || '16px')}
          </div>
        </td>
        <td style="padding:14px;vertical-align:middle;border-left:1px solid var(--n3);background:#F5F6FA">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
            ${renderStates(v.states, mt.height || '48px', mt.padding || '0 24px', mt.fontSize || '14px')}
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
                Desktop <span style="font-weight:400;color:var(--n5);margin-left:4px">40px · 16px · 0 32px</span>
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
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}`;
  },

  /* ── INPUTS ── */
  inputs(data) {
    const ICONS = {
      search:  `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/></svg>`,
      error:   `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--r6)"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M15,8h2v12h-2V8z M16,24c-0.8,0-1.5-0.7-1.5-1.5S15.2,21,16,21s1.5,0.7,1.5,1.5S16.8,24,16,24z"/></svg>`,
      success: `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" style="flex-shrink:0;color:var(--g5)"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M14,21.5L8.5,16l1.4-1.4L14,18.6l8.1-8.1l1.4,1.4L14,21.5z"/></svg>`,
      info:    `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0;color:var(--n5)"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M17,22h-2v-8h2V22z M16,9.5c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S16.6,9.5,16,9.5z"/></svg>`,
    };

    function renderVariant(v, hasLabel) {
      const isDisabled = v.state === 'disabled';
      const isFocused  = v.state === 'focused';
      const isFilled   = v.state === 'filled';
      const isError    = v.state === 'error';
      const isValid    = v.state === 'valid';

      let border = '1px solid var(--n3)';
      if (isFocused)  border = '2px solid var(--b6)';
      if (isFilled)   border = '1px solid var(--n5)';
      if (isError)    border = '1px solid var(--r6)';
      if (isValid)    border = '1px solid var(--g5)';
      if (isDisabled) border = '1px solid var(--n3)';

      const bg     = isDisabled ? 'var(--n1)' : '#fff';
      const dimmed = isDisabled ? 'opacity:.55;cursor:not-allowed;' : '';

      const inputText = v.value ? escHtml(v.value) : (v.placeholder ? escHtml(v.placeholder) : 'Placeholder');
      const textColor = v.value ? 'var(--n7)' : 'var(--n6)';

      const infoTip = v.labelTooltip
        ? `<span style="position:relative;display:inline-flex;align-items:center;cursor:default"
            onmouseenter="let t=this.querySelector('.inp-tt');t.style.opacity='1';t.style.visibility='visible'"
            onmouseleave="let t=this.querySelector('.inp-tt');t.style.opacity='0';t.style.visibility='hidden'">
            ${ICONS.info}
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
        <div style="display:flex;align-items:center;height:32px;padding:0 10px;border:${border};border-radius:6px;background:${bg};gap:6px;${dimmed}">
          <span style="font:400 14px/20px var(--font-sans);color:${textColor};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inputText}</span>
          ${ICONS[v.trailingIcon] || ''}
        </div>
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

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:24px;background:var(--n1)">${groupSections}</div>`;
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

  /* ── TOOLTIP ── */
  tooltip(data) {
    const text = data.content || 'Tooltip content';

    function makeCard(placement) {
      const isTop    = placement === 'top';
      const isBottom = placement === 'bottom';
      const isLeft   = placement === 'left';

      let tipPos, arrowPos, spacer;
      if (isTop) {
        tipPos   = 'bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)';
        arrowPos = 'top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)';
        spacer   = 'padding-top:68px';
      } else if (isBottom) {
        tipPos   = 'top:calc(100% + 8px);left:50%;transform:translateX(-50%)';
        arrowPos = 'bottom:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid var(--n7)';
        spacer   = 'padding-bottom:68px';
      } else if (isLeft) {
        tipPos   = 'right:calc(100% + 8px);top:50%;transform:translateY(-50%)';
        arrowPos = 'left:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:5px solid var(--n7)';
        spacer   = 'padding-left:160px';
      } else {
        tipPos   = 'left:calc(100% + 8px);top:50%;transform:translateY(-50%)';
        arrowPos = 'right:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:5px solid var(--n7)';
        spacer   = 'padding-right:160px';
      }

      return `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
        <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">${escHtml(placement)}</div>
        <div style="${spacer}">
          <div style="position:relative;display:inline-block">
            <div style="position:absolute;${tipPos};background:var(--n7);color:#fff;padding:8px 10px;border-radius:6px;font:400 12px/16px var(--font-sans);width:150px;white-space:normal;z-index:1">
              ${escHtml(text)}
              <div style="position:absolute;${arrowPos};width:0;height:0"></div>
            </div>
            <button style="height:32px;padding:0 14px;border:1px solid var(--n3);border-radius:6px;background:#fff;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:default;white-space:nowrap">Trigger</button>
          </div>
        </div>
      </div>`;
    }

    const staticCards = ['top','bottom','left','right'].map(p => makeCard(p)).join('');

    const interactive = `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Interactive</div>
      <div style="padding-top:68px">
        <div style="position:relative;display:inline-block"
          onmouseenter="let t=this.querySelector('.tt-live');t.style.opacity='1';t.style.visibility='visible'"
          onmouseleave="let t=this.querySelector('.tt-live');t.style.opacity='0';t.style.visibility='hidden'">
          <div class="tt-live" style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:8px 10px;border-radius:6px;font:400 12px/16px var(--font-sans);width:150px;white-space:normal;opacity:0;visibility:hidden;transition:opacity .15s;z-index:1;pointer-events:none">
            ${escHtml(text)}
            <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div>
          </div>
          <button style="height:32px;padding:0 14px;border:1px solid var(--n3);border-radius:6px;background:#fff;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer;white-space:nowrap">Hover me</button>
        </div>
      </div>
    </div>`;

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:32px;background:var(--n1)"><div style="display:flex;flex-wrap:wrap;gap:32px 48px;align-items:flex-start">${staticCards}${interactive}</div></div>`;
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

    return `
      ${sectionHeader(data)}
      <div class="card">${rows}</div>`;
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
      </div>`;
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

      /* mobile drawer rows — bigger touch targets */
      .mob-row{display:flex;align-items:center;height:48px;cursor:pointer;padding:0 16px;gap:14px}
      .mob-row svg{fill:#4B82FA;flex-shrink:0;display:block}
      .mob-row .mob-lbl{font:400 15px/1 'DM Sans',sans-serif;color:#39414D}
      .mob-row.sel{background:rgba(75,130,250,.08);border-left:4px solid #0052CC;padding-left:12px}
      .mob-row.sel svg{fill:#0052CC}
      .mob-row.sel .mob-lbl{font-weight:600;color:#0052CC}
      .mob-sep{height:1px;background:#E9ECF2;margin:6px 16px}
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

    /* Phone frame with closed state (hamburger visible) */
    function phoneClosed(product) {
      return `
        <div style="width:240px;background:#1a1a1a;border-radius:28px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.4)">
          <div style="background:#F0F2F5;border-radius:22px;height:440px;position:relative;overflow:hidden">
            <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:#1a1a1a;border-radius:2px"></div>
            <div style="position:absolute;inset:30px 0 0 0;background:#fff">
              <div style="height:52px;background:#132045;display:flex;align-items:center;padding:0 14px;gap:12px">
                ${hamburger}
                <span style="color:#fff;font:700 12px var(--font-sans)">DispatchTrack</span>
                <div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:${product.color}"></div>
              </div>
              <div style="padding:14px;font:400 11px var(--font-sans);color:var(--n5);text-align:center;margin-top:30px">
                <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:4px">${escHtml(product.name)}</div>
                Tap hamburger to open menu
              </div>
            </div>
          </div>
        </div>`;
    }

    /* Phone frame with drawer open */
    function phoneOpen(product) {
      const items = buildMobileItems(product.items);
      return `
        <div style="width:240px;background:#1a1a1a;border-radius:28px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.4)">
          <div style="background:#F0F2F5;border-radius:22px;height:440px;position:relative;overflow:hidden">
            <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:#1a1a1a;border-radius:2px;z-index:3"></div>
            <div style="position:absolute;inset:30px 0 0 0;background:#fff">
              <div style="height:52px;background:#132045"></div>
            </div>
            <div style="position:absolute;inset:30px 0 0 0;background:rgba(19,32,69,.5);z-index:1"></div>
            <div style="position:absolute;top:30px;left:0;bottom:0;width:200px;background:#fff;z-index:2;display:flex;flex-direction:column;box-shadow:2px 0 12px rgba(0,0,0,.15)">
              <div style="height:56px;display:flex;align-items:center;padding:0 14px;gap:10px;border-bottom:1px solid #E9ECF2">
                <div style="width:6px;height:6px;border-radius:50%;background:${product.color}"></div>
                <span style="font:700 13px var(--font-sans);color:var(--n7);flex:1">${escHtml(product.name)}</span>
                ${closeX}
              </div>
              <div style="flex:1;overflow-y:auto;padding:8px 0">
                ${items}
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

      return `<div class="sbx-settings" style="border:1px solid var(--n3);border-radius:0 0 24px 0;overflow:hidden">
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
              <div class="sbx">${interactiveItems}</div>
            </div>
            ${p.settingsPanel || p.settingsItems ? `<div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Settings mode — panel pushes content right</div>
              ${buildSettingsLayout(p)}
            </div>` : ''}
          </div>

          <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Mobile
          </div>
          <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Closed · hamburger visible</div>
              ${phoneClosed(p)}
            </div>
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Open · drawer with overlay</div>
              ${phoneOpen(p)}
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
        const variantRows = variants.map(v => {
          const varIcons = v.icons.map(name => {
            const isAlert = name === 'alerts';
            const wrap = isAlert ? `<div class="bell">` : '';
            const wrapEnd = isAlert ? `</div>` : '';
            return `${wrap}${iconSvg(name, 18, '#fff')}${wrapEnd}`;
          }).join('');

          const logoEl = `<img src="${v.logo}" height="18" alt="${escHtml(prod.name)}" style="display:block;flex-shrink:0">`;
          const slotEl = v.customerSlot.show
            ? `<div class="slot">${escHtml(v.customerSlot.text || '')}</div>`
            : '';

          const maxW = v.breakpoint === 'desktop' ? '100%' : v.width;
          const bp = v.breakpoint;

          return `<div style="margin-bottom:6px">
            <div style="font:500 9px var(--font-sans);color:var(--n4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">${escHtml(bpLabel[bp] || bp)}</div>
            <div class="tbar${bp === 'mobile' ? ' tbar--mobile' : ''}" style="max-width:${maxW}">
              ${logoEl}
              <div class="acts">${varIcons}</div>
              ${slotEl}
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

    return `${PIN_STYLE}
      ${sectionHeader(data)}
      ${zipBtn}
      <div class="sec">
        <h2 style="font:700 18px var(--font-sans);color:var(--n7);margin:0 0 20px;display:flex;align-items:center;gap:8px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Map pins
        </h2>
        ${groups}
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

};
