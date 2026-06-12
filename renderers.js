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
  // Derive i18n keys from titleKey (e.g. "nav.colors" → "section.colors.desc")
  const titleKey = data.titleKey || '';
  const descKey  = titleKey ? ('section.' + titleKey.replace(/^nav\./, '') + '.desc') : '';
  return `
    <h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)"${titleKey ? ` data-i18n="${titleKey}"` : ''}>${data.title}</h1>
    <p class="sub" style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px"${descKey ? ` data-i18n="${descKey}"` : ''}>${data.description || ''}</p>
  `;
}

function card(content, extra) {
  return `<div class="card" ${extra || ''}>${content}</div>`;
}

function codeBlock(code) {
  return `<div class="code" style="margin-bottom:14px"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(code)}</pre></div>`;
}

function usageCard(snippet) {
  if (!snippet) return '';
  return `<div class="card flush" style="margin-bottom:24px">
    <div class="card-hdr" style="display:flex;align-items:center;gap:8px">
      <svg width="14" height="14" viewBox="0 0 32 32" fill="var(--b6)"><path d="M10,6L8.59,7.41,13.17,12H4v2h9.17L8.59,18.59,10,20l7-7Zm12,8,7,7-1.41,1.41L22.83,18H32V16H22.83l4.76-4.59L26,10Z"/></svg>
      <span class="ttl" data-i18n="ui.howToCall">How to call in pages</span>
    </div>
    <div class="code" style="border-radius:0;margin:0"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(snippet)}</pre></div>
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
  'chevron--left':  '<path d="M10,16,20,6l1.4,1.4L12.8,16l8.6,8.6L20,26Z"/>',
  'chevron--right': '<path d="M22,16,12,26l-1.4-1.4,8.6-8.6L10.6,7.4,12,6Z"/>',
  'menu':           '<rect x="4" y="6" width="24" height="2"/><rect x="4" y="12" width="24" height="2"/><rect x="4" y="18" width="24" height="2"/><rect x="4" y="24" width="24" height="2"/>',
  'phone':          '<path d="M26,29h-.17C6.18,27.87,3.39,11.29,3,6.23A3,3,0,0,1,5.76,3h5.51a2,2,0,0,1,1.86,1.26L14.65,8a2,2,0,0,1-.44,2.16l-2.13,2.15a9.37,9.37,0,0,0,7.58,7.6l2.17-2.15A2,2,0,0,1,24,17.35l3.77,1.51A2,2,0,0,1,29,20.72V26A3,3,0,0,1,26,29ZM6,5A1,1,0,0,0,5,6c.46,5.92,3.41,19.92,20.92,20.92A1,1,0,0,0,27,26V20.72l-3.77-1.51-2.87,2.85L19.88,22A11.36,11.36,0,0,1,10,12.12l-.06-.48,2.84-2.87L11.28,5Z"/>',
  'add':            '<path d="M17 15L17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z"/>',
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
  'arrow-left':        '<path d="M14 26l1.41-1.41L7.83 17H28V15H7.83l7.58-7.59L14 6 4 16l10 10z"/>',
  'camera':            '<path d="M16,11a5,5,0,1,0,5,5A5,5,0,0,0,16,11Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,16,19Z"/><path d="M28,7H22.39L20.79,4.21A2,2,0,0,0,19.06,3H12.94a2,2,0,0,0-1.73,1.21L9.61,7H4a2,2,0,0,0-2,2V25a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V9A2,2,0,0,0,28,7Zm0,18H4V9h6.76l1.6-3h7.28l1.6,3H28Z"/>',
  'pen':               '<path d="M27.87,7.86,23.14,3.13a1,1,0,0,0-1.41,0L4.15,20.71a1,1,0,0,0-.29.71V26a1,1,0,0,0,1,1h4.59a1,1,0,0,0,.7-.29L27.87,9.27A1,1,0,0,0,27.87,7.86ZM9,25H6V22l11-11,3,3ZM21,12.59,18,9.59l4.43-4.43,3,3Z"/>',
  'qr':                '<path d="M2 2h12v12H2zm2 2v8h8V4zm2 2h4v4H6zM18 2h12v12H18zm2 2v8h8V4zm2 2h4v4h-4zM2 18h12v12H2zm2 2v8h8v-8zm2 2h4v4H6zM18 18h4v4h-4zM26 18h4v4h-4zM22 22h4v4h-4zM18 26h4v4h-4zM26 26h4v4h-4z"/>',
  'maximize':          '<path d="M30 18v8a4 4 0 0 1-4 4h-8v-2h8a2 2 0 0 0 2-2v-8zM6 14V6a2 2 0 0 1 2-2h8V2H8a4 4 0 0 0-4 4v8z"/>',
  'gps':               '<path d="M16 9a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z"/><path d="M17 2h-2v4h2zM17 26h-2v4h2zM6 15H2v2h4zM30 15h-4v2h4z"/><circle cx="16" cy="16" r="2"/>',
  'navigation':        '<path d="M16 2 4 28l12-6 12 6z"/>',
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

/* ── MODULE-LEVEL: datepicker input+popover (used in filters + filter bars) ─
   Renders a DS input trigger with calendar icon that opens a datepicker popover.
   Each call generates a unique ID so multiple instances work independently. */
let _dpFilterId = 0;
function dpFilterField(placeholder) {
  const id = 'dpf-' + (++_dpFilterId);
  const cal = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  return `<div style="position:relative;flex:1;min-width:0">
    <div id="${id}-inp" style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box;width:100%"
      onclick="(function(el){var pop=el.nextElementSibling;if(!pop||!pop.hasAttribute('data-popover'))return;var open=pop.style.display!=='none';document.querySelectorAll('[data-popover]').forEach(function(p){p.style.display='none';});if(!open){pop.style.display='block';if(typeof initDateTimePickers==='function'&&!pop._dpInit){pop._dpInit=1;initDateTimePickers();}}})(this)"
      onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='#fff'">
      <span style="flex:1;font:400 14px/1 DM Sans,sans-serif;color:var(--n5)">${escHtml(placeholder)}</span>
      <span style="color:var(--n5);display:flex">${cal}</span>
    </div>
    <div id="${id}-pop" data-dp="" data-month="4" data-year="2025" data-selected="" data-view="day"
      data-popover style="display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(19,32,69,.14);width:300px;overflow:hidden;font-family:DM Sans,sans-serif">
      <div style="padding:10px 12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <button onclick="_dpNav(this,-1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6,#1F60ED);font-size:18px;line-height:1;padding:2px 6px">‹</button>
          <button onclick="_dpViewToggle(this)" data-which="1" style="background:none;border:none;cursor:pointer;font:700 14px/1 DM Sans,sans-serif;color:var(--n7,#39414D);padding:2px 8px;border-radius:4px" onmouseenter="this.style.background='var(--n2,#F0F2F5)'" onmouseleave="this.style.background='none'">
            <span data-month-label="1">Abril 2025</span>
          </button>
          <button onclick="_dpNav(this,1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6,#1F60ED);font-size:18px;line-height:1;padding:2px 6px">›</button>
        </div>
        <div data-grid="1" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px"></div>
        <div data-month-grid="1" style="display:none;grid-template-columns:repeat(3,1fr);gap:4px"></div>
      </div>
      <div style="padding:4px 12px 12px">
        <button data-accept disabled
          onclick="(function(btn){var inp=document.getElementById('${id}-inp').querySelector('span');var dp=btn.closest('[data-dp]');var d=dp.dataset.selected||dp.dataset.start;if(d&&inp){inp.textContent=d.split('-').reverse().join('/');inp.style.color='var(--n7,#39414D)';}btn.closest('[data-popover]').style.display='none';})(this)"
          style="width:100%;height:36px;border-radius:20px;border:none;background:#C5D2E7;color:#fff;font:700 13px/1 DM Sans,sans-serif;cursor:pointer">Aceptar</button>
      </div>
    </div>
  </div>`;
}

/* ── MODULE-LEVEL: settings layout (shared by sidebar + formpage) ─────────
   contentHtml: if provided, replaces the "Content pushed right" placeholder.
   When null/undefined, renders the original placeholder (used by sidebar section).
   activeItem: highlights a settings panel item by label. */
function buildSettingsSidebar(product, activeItem, contentHtml) {
  const items = product.settingsItems || product.items || [];
  const iconItems = items.map(it => {
    if (it.divider) return `<div style="height:1px;background:#E9ECF2;margin:4px 8px"></div>`;
    const isSel = it.state === 'selected';
    return `<div style="display:flex;align-items:center;height:40px;border-left:6px solid ${isSel?'#0052CC':'transparent'}">
      <div style="display:flex;align-items:center;justify-content:center;flex:1;height:40px;${isSel?'background:rgba(75,130,250,.08)':''}">
        ${iconSvg(it.icon, 18, isSel?'#0052CC':'#4B82FA')}
      </div>
    </div>`;
  }).join('');

  const sp = product.settingsPanel;
  let panelHtml = '';
  if (sp && sp.groups) {
    const groupsHtml = sp.groups.map(g => {
      const itemsHtml = (g.items || []).map(it => {
        const isSel = it.state === 'selected' || it.label === activeItem;
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
    panelHtml = `<div style="width:224px;flex-shrink:0;background:#fff;border-right:1px solid #E9ECF2;padding:8px 0;align-self:stretch;overflow-y:auto">${groupsHtml}${ver}</div>`;
  }

  const rightSlot = contentHtml != null
    ? `<div style="flex:1;min-width:0;overflow:hidden">${contentHtml}</div>`
    : `<div style="width:180px;background:var(--n1);padding:20px;display:flex;align-items:flex-start;border-radius:0 0 24px 0"><span style="font:400 12px var(--font-sans);color:var(--n4)">Content pushed right</span></div>`;

  // Use inline display:flex so this works with OR without the .sbx-settings CSS class
  // (SB_STYLE is only injected in sidebar() — not in other renderers like formpage)
  return `<div class="sbx-settings" style="display:flex;width:100%;border:1px solid var(--n3);border-radius:0 0 24px 0;overflow:hidden;min-height:600px">
    <div style="width:52px;flex-shrink:0;background:#fff;border-right:1px solid #E9ECF2;padding:8px 0;overflow-y:auto">${iconItems}</div>
    ${panelHtml}
    ${rightSlot}
  </div>`;
}

/* ── MODULE-LEVEL: Carbon DS close icon — default close for ALL components ──
   Use dsCloseBtn(size, color) everywhere a close/dismiss action is needed.
   Never recreate a custom × — always use this Carbon icon.
   Carbon icon path: 32×32 viewBox, same family as all DS icons. */
function dsCloseIcon(size, color) {
  size  = size  || 16;
  color = color || 'currentColor';
  return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="${color}"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z"/></svg>`;
}
function dsCloseBtn(size, color, extra) {
  size  = size  || 16;
  color = color || 'var(--n5)';
  extra = extra || '';
  return `<button style="background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:4px;color:${color};flex-shrink:0;${extra}"
    onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='none'">${dsCloseIcon(size, color)}</button>`;
}

/* ── MODULE-LEVEL: DS alert/banner — shared by alerts(), modal(), and anywhere
   an alert or banner is needed. Use dsAlert(text, type) everywhere.
   type: 'info' | 'neutral' | 'warning' | 'error' | 'success'
   row can be a string (simple text) or { text, title, paragraphs, hasClose, extraActions }
   This is the canonical DS alert — never recreate custom banners. */
const _ALERT_TC = {
  info:    { bg:'var(--b2)',  bd:'var(--b3)',  fg:'var(--b7)', ic:'var(--b6)',  ip:'<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' },
  neutral: { bg:'var(--n2)', bd:'var(--n3)',   fg:'var(--n6)', ic:'var(--n5)',  ip:'<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' },
  warning: { bg:'var(--o1)', bd:'var(--o3)',   fg:'var(--n7)', ic:'var(--o7)',  ip:'<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
  error:   { bg:'var(--r1)', bd:'#f5c2c7',    fg:'var(--r7)', ic:'var(--r6)',  ip:'<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
  success: { bg:'var(--g1)', bd:'var(--g2)',   fg:'var(--g7)', ic:'var(--g6)',  ip:'<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>' },
};

function dsAlert(row, type) {
  if (typeof row === 'string') row = { text: row, hasClose: false };
  const c = _ALERT_TC[type] || _ALERT_TC.info;
  const base = `background:${c.bg};border:1px solid ${c.bd};border-radius:6px;color:${c.fg}`;
  const ico  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${c.ic}" style="flex-shrink:0;margin-top:1px">${c.ip}</svg>`;
  const xBtn = row.hasClose === false ? '' : `<button style="flex-shrink:0;background:none;border:none;padding:0;cursor:pointer;opacity:.55;display:flex;align-items:center;line-height:0" title="Dismiss"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
  if (row.title) {
    const paras = row.paragraphs || (row.text ? [row.text] : []);
    return `<div style="${base};padding:14px 40px 14px 16px;position:relative">
      ${row.hasClose !== false ? `<div style="position:absolute;top:10px;right:10px">${xBtn}</div>` : ''}
      <strong style="display:block;font:700 14px/1.4 var(--font-sans);margin-bottom:8px">${escHtml(row.title)}</strong>
      ${paras.map(p => `<p style="margin:0 0 6px;font:400 13px/1.5 var(--font-sans)">${escHtml(p)}</p>`).join('')}
    </div>`;
  }
  const lines = (row.text || '').split('\n');
  const textHtml = lines.length > 1 ? lines.map(l => escHtml(l)).join('<br>') : escHtml(row.text || '');
  return `<div style="${base};padding:10px 12px;display:flex;align-items:center;gap:10px">
    ${ico}
    <span style="flex:1;font:400 13px/1.4 var(--font-sans)">${textHtml}</span>
    ${xBtn}
  </div>`;
}

/* ── MODULE-LEVEL: filter icon buttons — exact Figma SVGs, shared everywhere ──
   Used by filters() demo, tablepage(), and any future filter bar. */
const FLT_SVG_ADD_DEF = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#1F60ED"/><g clip-path="url(#ml-add-c)"><path d="M21 8.5C21.6875 8.5 22.25 9.0625 22.25 9.75V11H21V9.75H8.5V11.75L13.5 16.75V22.25H16V21H17.25V22.25C17.25 22.9375 16.6875 23.5 16 23.5H13.5C12.8125 23.5 12.25 22.9375 12.25 22.25V17.25L7.625 12.625C7.375 12.375 7.25 12.0625 7.25 11.75V9.75C7.25 9.0625 7.8125 8.5 8.5 8.5H21ZM20.5 12.375V16.4375H24.5625V17.6875H20.5V21.75H19.25V17.6875H15.25V16.4375H19.25V12.375H20.5Z" fill="#1F60ED"/></g><defs><clipPath id="ml-add-c"><rect width="20" height="20" fill="white" transform="translate(6 6)"/></clipPath></defs></svg>`;
const FLT_SVG_ADD_HOV = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#EDF3FF" stroke="#1F60ED"/><g clip-path="url(#ml-addh-c)"><path d="M21 8.5C21.6875 8.5 22.25 9.0625 22.25 9.75V11H21V9.75H8.5V11.75L13.5 16.75V22.25H16V21H17.25V22.25C17.25 22.9375 16.6875 23.5 16 23.5H13.5C12.8125 23.5 12.25 22.9375 12.25 22.25V17.25L7.625 12.625C7.375 12.375 7.25 12.0625 7.25 11.75V9.75C7.25 9.0625 7.8125 8.5 8.5 8.5H21ZM20.5 12.375V16.4375H24.5625V17.6875H20.5V21.75H19.25V17.6875H15.25V16.4375H19.25V12.375H20.5Z" fill="#1F60ED"/></g><defs><clipPath id="ml-addh-c"><rect width="20" height="20" fill="white" transform="translate(6 6)"/></clipPath></defs></svg>`;
const FLT_SVG_RES_DEF = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#DE350B"/><path d="M21 8.5C21.3315 8.5 21.6494 8.63179 21.8838 8.86621C22.1182 9.10063 22.25 9.41848 22.25 9.75V11H21V9.75H8.5V11.7314L13.1338 16.3662L13.5 16.7314V22.25H16V21H17.25V22.25C17.25 22.5815 17.1182 22.8994 16.8838 23.1338C16.6494 23.3682 16.3315 23.5 16 23.5H13.5C13.1685 23.5 12.8506 23.3682 12.6162 23.1338C12.3818 22.8994 12.25 22.5815 12.25 22.25V17.25L7.61621 12.6162C7.5001 12.5001 7.40756 12.3617 7.34473 12.21C7.28201 12.0584 7.24999 11.8955 7.25 11.7314V9.75C7.25 9.41848 7.38179 9.10063 7.61621 8.86621C7.85063 8.63179 8.16848 8.5 8.5 8.5H21ZM24.75 13.1338L21.8838 16L24.75 18.8672L23.8672 19.75L21 16.8838L18.1348 19.75L17.25 18.8652L20.1162 16L17.25 13.1338L18.1338 12.25L21 15.1162L23.8662 12.25L24.75 13.1338Z" fill="#DE350B"/></svg>`;
const FLT_SVG_RES_HOV = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#FFEBE6" stroke="#DE350B"/><path d="M21 8.5C21.3315 8.5 21.6494 8.63179 21.8838 8.86621C22.1182 9.10063 22.25 9.41848 22.25 9.75V11H21V9.75H8.5V11.7314L13.1338 16.3662L13.5 16.7314V22.25H16V21H17.25V22.25C17.25 22.5815 17.1182 22.8994 16.8838 23.1338C16.6494 23.3682 16.3315 23.5 16 23.5H13.5C13.1685 23.5 12.8506 23.3682 12.6162 23.1338C12.3818 22.8994 12.25 22.5815 12.25 22.25V17.25L7.61621 12.6162C7.5001 12.5001 7.40756 12.3617 7.34473 12.21C7.28201 12.0584 7.24999 11.8955 7.25 11.7314V9.75C7.25 9.41848 7.38179 9.10063 7.61621 8.86621C7.85063 8.63179 8.16848 8.5 8.5 8.5H21ZM24.75 13.1338L21.8838 16L24.75 18.8672L23.8672 19.75L21 16.8838L18.1348 19.75L17.25 18.8652L20.1162 16L17.25 13.1338L18.1338 12.25L21 15.1162L23.8662 12.25L24.75 13.1338Z" fill="#DE350B"/></svg>`;

const FLT_BTN_ADD = `<button title="Agregar filtro" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex"
    onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
    onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
  <span class="flt-def">${FLT_SVG_ADD_DEF}</span>
  <span class="flt-hov" style="display:none">${FLT_SVG_ADD_HOV}</span>
</button>`;

const FLT_BTN_RESET = `<button title="Limpiar filtros" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex"
    onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
    onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
  <span class="flt-def">${FLT_SVG_RES_DEF}</span>
  <span class="flt-hov" style="display:none">${FLT_SVG_RES_HOV}</span>
</button>`;

/* ── MODULE-LEVEL: filter field renderer (shared by filters + tablepage) ─────
   Renders one filter field by type: text → DS input, select → dt-drop-wrap,
   date → dpFilterField (input + datepicker popover).
   Used by both filters() and tablepage() so the bar is identical everywhere. */
const _FILTER_CHEVRON = `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
const _FILTER_INP_BASE = `width:100%;height:32px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none`;

function renderFilterField(f) {
  if (f.type === 'date') {
    return dpFilterField(f.placeholder);
  }
  if (f.type === 'select') {
    const items = (f.options||[]).map(o => {
      const safe = escHtml(o);
      return `<div onclick="dtPickOpt(this);this.closest('.dt-drop-wrap').dataset.val='${escHtml(o)}'"
        data-val="${safe}"
        onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
        onmouseleave="this.style.background='';this.style.color='var(--n7)'"
        style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer"
      >${safe}</div>`;
    }).join('');
    return `<div class="dt-drop-wrap" data-val="" style="position:relative;flex:1;min-width:0">
      <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
        onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
        onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
        style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
        <span class="dt-dlabel" data-ph="${escHtml(f.placeholder)}" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(f.placeholder)}</span>
        <span style="color:var(--n5);display:flex;flex-shrink:0">${_FILTER_CHEVRON}</span>
      </div>
      <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">${items}</div>
    </div>`;
  }
  // text
  return `<div style="flex:1;min-width:0">
    <input type="text" placeholder="${escHtml(f.placeholder)}"
      style="${_FILTER_INP_BASE};padding:0 10px"
      onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
      onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
      onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
      onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
  </div>`;
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
        <div class="code"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre><span class="cm">/* Instalar: npm install @beetrack/hp-tokens-style */</span>
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

    const codeTab = `<div class="code" style="border-radius:0"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;

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

    // ─── Special input variants ─────────────────────────────────────────────
    // Carbon Design icon paths (32×32 viewBox, fill="currentColor")
    const ICO_ADD  = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/></svg>`;
    const ICO_SUB  = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M8 15h16v2H8z"/></svg>`;
    const ICO_VIEW = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M16 7C9.5 7 4 12 4 16s5.5 9 12 9 12-5 12-9S22.5 7 16 7zm0 16c-5.4 0-10-3.8-10-7s4.6-7 10-7 10 3.8 10 7-4.6 7-10 7zm0-12a5 5 0 100 10A5 5 0 0016 11zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>`;
    const ICO_HIDE = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M5.4 6.8L4 8.2l4.4 4.4C6.8 13.7 6 14.8 6 16c0 2.8 2.8 5.5 8 8.5L6.5 28l1.4 1.4 20-20L26.6 8l-4.3 4.3C20.3 10.8 18.2 10 16 10c-1 0-2 .2-2.9.5L5.4 6.8zm7.8 7.8l6.2 6.2A3 3 0 0113 16a3 3 0 01.2-1.4zM16 12c1 0 2 .2 2.9.5l-2.4 2.4A3 3 0 0013 19l-2.4 2.4C9 19.9 8 18 8 16c0-2.4 3.3-4 8-4zm0 14c-4.7 0-8-1.6-8-4h2c0 1.2 2.4 2 6 2s6-.8 6-2h2c0 2.4-3.3 4-8 4z"/></svg>`;
    const ICO_LOCK = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M24 14h-2V8a6 6 0 00-12 0v6H8v16h24V14zm-12-6a4 4 0 018 0v6H12V8zm12 16H10V16h14v8zm-7-7a2 2 0 100 4 2 2 0 000-4z"/></svg>`;
    const ICO_SRCH = `<svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor"><path d="M29 27.6l-7.6-7.6a11 11 0 10-1.4 1.4L27.6 29zM4 13a9 9 0 1118 0A9 9 0 014 13z"/></svg>`;

    // Shared focus/blur/hover handlers for special inputs
    const FCS = `this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'`;
    const BLR = `this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'`;
    const MEN = `if(document.activeElement!==this)this.style.background='var(--n2)'`;
    const MLE = `if(document.activeElement!==this)this.style.background='#fff'`;
    const INP_BASE = `height:32px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);color:var(--n7);background:#fff;box-sizing:border-box;outline:none`;

    const specialItems = (data.specialVariants || []).map(sv => {
      let demo = '';

      if (sv.id === 'number') {
        // ── Number input ──────────────────────────────────────────────────────
        // Use type="text" + inputmode="numeric" to avoid browser native spinner
        const BTN = `width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;color:var(--n5);flex-shrink:0;padding:0`;
        const minVal = sv.min !== undefined ? sv.min : 0;
        demo = `
          <div style="display:inline-flex;align-items:stretch;width:160px;border:1px solid var(--n3);border-radius:6px;overflow:hidden;height:32px;background:#fff"
               onfocusin="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
               onfocusout="this.style.border='1px solid var(--n3)';this.style.background='#fff'">
            <button style="${BTN};border-right:1px solid var(--n3)"
              onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='transparent'"
              onclick="(function(b){var i=b.parentElement.querySelector('input');var v=parseInt(i.value||0)-1;i.value=v<${minVal}?${minVal}:v})(this)"
              aria-label="Decrementar">${ICO_SUB}</button>
            <input type="text" inputmode="numeric" pattern="[0-9]*" value="${sv.defaultValue||0}"
              style="flex:1;min-width:0;height:100%;border:none;outline:none;text-align:center;font:500 14px/1 var(--font-sans);color:var(--n7);background:transparent;padding:0"
              oninput="this.value=this.value.replace(/[^0-9]/g,'')">
            <button style="${BTN};border-left:1px solid var(--n3)"
              onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='transparent'"
              onclick="(function(b){var i=b.parentElement.querySelector('input');i.value=parseInt(i.value||0)+1})(this)"
              aria-label="Incrementar">${ICO_ADD}</button>
          </div>`;
      }

      if (sv.id === 'textarea') {
        // ── Textarea ──────────────────────────────────────────────────────────
        // 4 lines = 4 × 20px line-height + 8px top + 8px bottom = 96px
        demo = `
          <textarea placeholder="${escHtml(sv.placeholder||'Escribe aquí…')}"
            style="width:240px;height:96px;max-height:96px;resize:none;overflow-y:auto;padding:8px 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px/20px var(--font-sans);color:var(--n7);background:#fff;box-sizing:border-box;outline:none"
            onfocus="${FCS}" onblur="${BLR}"
            onmouseenter="${MEN}" onmouseleave="${MLE}"></textarea>`;
      }

      if (sv.id === 'password') {
        // ── Password ──────────────────────────────────────────────────────────
        demo = `
          <div style="position:relative;display:inline-flex;align-items:center;width:240px">
            <input type="password" placeholder="${escHtml(sv.placeholder||'Contraseña')}"
              style="${INP_BASE};width:100%;padding:0 36px 0 10px"
              onfocus="${FCS}" onblur="${BLR}" onmouseenter="${MEN}" onmouseleave="${MLE}">
            <button
              onclick="(function(b){var inp=b.parentElement.querySelector('input');var eon=b.querySelector('.eon');var eoff=b.querySelector('.eoff');if(inp.type==='password'){inp.type='text';eon.style.display='none';eoff.style.display='block'}else{inp.type='password';eon.style.display='block';eoff.style.display='none'}})(this)"
              style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;align-items:center;color:var(--n5);padding:2px;line-height:0"
              onmouseenter="this.style.color='var(--n7)'" onmouseleave="this.style.color='var(--n5)'"
              title="Mostrar / ocultar contraseña" tabindex="-1">
              <span class="eon">${ICO_VIEW}</span><span class="eoff" style="display:none">${ICO_HIDE}</span>
            </button>
          </div>`;
      }

      if (sv.id === 'readonly') {
        // ── Read only ─────────────────────────────────────────────────────────
        demo = `
          <div style="position:relative;display:inline-flex;align-items:center;width:240px">
            <input type="text" readonly value="${escHtml(sv.value||'Valor por defecto')}"
              style="${INP_BASE};width:100%;padding:0 34px 0 10px;color:var(--n5);background:var(--n1);cursor:default"
              title="Campo de solo lectura">
            <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--n4);display:flex;pointer-events:none">${ICO_LOCK}</span>
          </div>`;
      }

      if (sv.id === 'search') {
        // ── Search ────────────────────────────────────────────────────────────
        // On Enter or icon click → triggers the DS global search (doSearch)
        const doSrch = `(function(wrap){var v=wrap.querySelector('input').value.trim();if(!v)return;var gs=document.getElementById('gsearch');if(gs&&typeof doSearch==='function'){gs.value=v;doSearch(v);gs.focus()}})(this.closest('[data-search-wrap]'))`;
        demo = `
          <div data-search-wrap style="position:relative;display:inline-flex;align-items:center;width:240px">
            <input type="search" placeholder="${escHtml(sv.placeholder||'Buscar…')}"
              style="${INP_BASE};width:100%;padding:0 36px 0 10px;-webkit-appearance:none"
              onfocus="${FCS}" onblur="${BLR}" onmouseenter="${MEN}" onmouseleave="${MLE}"
              onkeydown="if(event.key==='Enter'){${doSrch}}">
            <button onclick="${doSrch}"
              style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;align-items:center;color:var(--n5);padding:2px;line-height:0"
              onmouseenter="this.style.color='var(--n7)'" onmouseleave="this.style.color='var(--n5)'"
              title="Buscar">${ICO_SRCH}</button>
          </div>`;
      }

      if (sv.id === 'input-button') {
        // ── Input with button ─────────────────────────────────────────────────
        const btnLbl = escHtml(sv.buttonLabel || 'Aplicar');
        const onApply = `(function(b){var inp=b.parentElement.querySelector('input');if(!inp.value.trim())return;b.textContent='✓';b.style.background='var(--g6)';setTimeout(function(){b.textContent='${btnLbl}';b.style.background='var(--b6)'},1200)})(this)`;
        demo = `
          <div style="position:relative;display:inline-flex;align-items:center;width:260px">
            <input type="text" placeholder="${escHtml(sv.placeholder||'Ingresa un valor…')}"
              style="${INP_BASE};width:100%;padding:0 84px 0 10px"
              onfocus="${FCS}" onblur="${BLR}" onmouseenter="${MEN}" onmouseleave="${MLE}"
              onkeydown="if(event.key==='Enter')this.nextElementSibling.click()">
            <button onclick="${onApply}"
              style="position:absolute;right:5px;top:50%;transform:translateY(-50%);height:22px;padding:0 10px;border-radius:50px;background:var(--b6);color:#fff;border:none;font:700 11px/1 var(--font-sans);cursor:pointer;white-space:nowrap;transition:background .12s"
              onmouseenter="if(this.textContent==='${btnLbl}')this.style.background='var(--b7)'" onmouseleave="if(this.textContent==='${btnLbl}')this.style.background='var(--b6)'">${btnLbl}</button>
          </div>`;
      }

      return `<div style="display:flex;flex-direction:column;gap:6px;min-width:200px">
        <div style="font:600 12px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">${escHtml(sv.label)}</div>
        <div style="font:400 12px/16px var(--font-sans);color:var(--n5);margin-bottom:6px;max-width:260px">${escHtml(sv.description||'')}</div>
        ${demo}
      </div>`;
    });

    const specialSection = specialItems.length
      ? `<div style="margin-bottom:48px">
          ${subHead('Special inputs')}
          <div style="display:flex;flex-wrap:wrap;gap:32px 48px;align-items:flex-start">${specialItems.join('')}</div>
        </div>`
      : '';

    const previewTab = `<div style="padding:24px;background:var(--n1)">
      <div style="margin-bottom:48px">
        ${subHead('Text inputs')}
        ${groupSections}
      </div>
      ${specialSection}
      <div>
        ${subHead('Dropdowns')}
        ${dropInteractive}${selectSection}${multiSection}
      </div>
    </div>`;

    const combinedCode = (data.code || '') + '\n\n\n/* ──────────── DROPDOWNS ──────────── */\n\n' + (data.dropdownCode || '');
    const codeTab = `<div class="code" style="border-radius:0"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(combinedCode)}</pre></div>`;

    const tokensTab = `<div style="padding:16px">
      <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin-bottom:12px">Text inputs</div>
      <table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${inputTokenRows}</tbody></table>
      <div style="font:700 14px/20px var(--font-sans);color:var(--n7);margin:24px 0 12px">Dropdowns</div>
      <table class="ttbl"><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>${dropTokenRows}</tbody></table>
    </div>`;

    /* ── SHARED ICON SVGs ── */
    const CAL_ICO = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const CLK_ICO = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

    // DS-style input trigger — popover is the immediate nextElementSibling of this div
    const triggerInp = (placeholder, icon) =>
      `<div style="position:relative;display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box;width:220px"
        onclick="(function(el){var pop=el.nextElementSibling;if(!pop||!pop.hasAttribute('data-popover'))return;var open=pop.style.display!=='none';document.querySelectorAll('[data-popover]').forEach(function(p){p.style.display='none';});if(!open){pop.style.display='block';if(typeof initDateTimePickers==='function'&&!pop._init){pop._init=1;initDateTimePickers();}};})(this)"
        onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='#fff'">
        <span style="flex:1;font:400 14px/1 var(--font-sans);color:var(--n5)">${escHtml(placeholder)}</span>
        <span style="color:var(--n5);display:flex">${icon}</span>
      </div>`;

    // Range trigger — popover lives in the data-dp-wrap ancestor, not as nextElementSibling
    const rangeInp = (placeholder, icon) =>
      `<div style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box;width:100%"
        onclick="(function(el){var wrap=el.closest('[data-dp-wrap]');var pop=wrap&&wrap.querySelector('[data-popover]');if(!pop)return;var open=pop.style.display!=='none';document.querySelectorAll('[data-popover]').forEach(function(p){p.style.display='none';});if(!open)pop.style.display='block';})(this)"
        onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='#fff'">
        <span style="flex:1;font:400 14px/1 var(--font-sans);color:var(--n5)">${escHtml(placeholder)}</span>
        <span style="color:var(--n5);display:flex">${icon}</span>
      </div>`;

    // Calendar card (single) — with month/year selector
    const dpCalCard = (attrs) =>
      `<div ${attrs} data-view="day" data-popover style="display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(19,32,69,.14);width:300px;overflow:hidden;font-family:var(--font-sans)">
        <div style="padding:10px 12px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <button onclick="_dpNav(this,-1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;line-height:1;padding:2px 6px">‹</button>
            <button onclick="_dpViewToggle(this)" data-which="1" style="background:none;border:none;cursor:pointer;font:700 14px var(--font-sans);color:var(--n7);padding:2px 8px;border-radius:4px" onmouseenter="this.style.background='var(--n2)'" onmouseleave="this.style.background='none'">
              <span data-month-label="1">Abril 2025</span>
            </button>
            <button onclick="_dpNav(this,1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;line-height:1;padding:2px 6px">›</button>
          </div>
          <div data-grid="1" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px"></div>
          <div data-month-grid="1" style="display:none;grid-template-columns:repeat(3,1fr);gap:4px"></div>
        </div>
        <div style="padding:4px 12px 12px">
          <button data-accept disabled onclick="(function(btn){var w=btn.closest('[data-dp-wrap]');if(w){var inp=w.querySelector('[style*=relative] span:first-child');var dp=btn.closest('[data-dp]');var sel=dp.dataset.selected||dp.dataset.start;if(sel&&inp)inp.textContent=sel.split('-').reverse().join('/');}btn.closest('[data-popover]').style.display='none';})(this)"
            style="width:100%;height:36px;border-radius:20px;border:none;background:#C5D2E7;color:#fff;font:700 13px var(--font-sans);cursor:pointer">Aceptar</button>
        </div>
      </div>`;

    /* ── DATEPICKER HTML ── */
    const dpCard = (attrs) => `
      <div ${attrs} style="background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(19,32,69,.12);width:300px;overflow:hidden;font-family:var(--font-sans)">
        <div style="display:flex;align-items:center;justify-content:center;padding:16px 16px 8px;border-bottom:1px solid var(--n3);position:relative">
          <span style="font:600 14px var(--font-sans);color:var(--n7)">Fecha</span>
          <button onclick="_dpClose(this)" style="position:absolute;right:12px;background:none;border:none;cursor:pointer;font-size:18px;color:var(--n5);line-height:1">×</button>
        </div>
        <div style="padding:12px 16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <button onclick="_dpNav(this,-1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;padding:4px 8px">‹</button>
            <span data-month-label="1" style="font:700 15px var(--font-sans);color:var(--n7)">Abril 2025</span>
            <button onclick="_dpNav(this,1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;padding:4px 8px">›</button>
          </div>
          <div data-grid="1" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;min-height:180px"></div>
        </div>
        <div style="padding:8px 16px 16px">
          <button data-accept disabled style="width:100%;height:40px;border-radius:20px;border:none;background:#C5D2E7;color:#fff;font:700 14px var(--font-sans);cursor:pointer">Aceptar</button>
        </div>
      </div>`;

    const dpSingle    = dpCard('data-dp="" data-month="4" data-year="2025" data-selected=""');
    const dpSingleSel = dpCard('data-dp="" data-month="4" data-year="2025" data-selected="2025-04-01"');
    const dpRangeSel  = dpCard('data-dp="" data-month="4" data-year="2025" data-selected="" data-start="2025-04-01" data-end="2025-04-10"');

    const dpRangeCard = `
      <div data-dpr="" data-m1="4" data-y1="2025" data-m2="5" data-y2="2025" data-start="" data-end=""
        style="background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(19,32,69,.12);overflow:hidden;font-family:var(--font-sans)">
        <div style="display:flex;align-items:center;justify-content:center;padding:16px 16px 8px;border-bottom:1px solid var(--n3);position:relative">
          <span style="font:600 14px var(--font-sans);color:var(--n7)">Rango de fechas</span>
          <button onclick="_dpClose(this)" style="position:absolute;right:12px;background:none;border:none;cursor:pointer;font-size:18px;color:var(--n5);line-height:1">×</button>
        </div>
        <div style="display:flex;gap:0;padding:12px 16px">
          <div style="flex:1;padding-right:12px;border-right:1px solid var(--n3)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <button onclick="_dpNav(this,-1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;padding:4px 8px">‹</button>
              <span data-month-label="1" style="font:700 14px var(--font-sans);color:var(--n7)">Abril 2025</span>
              <div style="width:36px"></div>
            </div>
            <div data-grid="1" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
          </div>
          <div style="flex:1;padding-left:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div style="width:36px"></div>
              <span data-month-label="2" style="font:700 14px var(--font-sans);color:var(--n7)">Mayo 2025</span>
              <button onclick="_dpNav(this,1)" data-which="2" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:18px;padding:4px 8px">›</button>
            </div>
            <div data-grid="2" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
          </div>
        </div>
        <div style="padding:8px 16px 16px">
          <button data-accept disabled style="width:100%;height:40px;border-radius:20px;border:none;background:#C5D2E7;color:#fff;font:700 14px var(--font-sans);cursor:pointer">Aceptar</button>
        </div>
      </div>`;

    /* ── TIMEPICKER HTML ── */
    const tpBase = (id, h24, initHour, initAmpm, mode) => {
      const hStr = String(initHour).padStart(2,'0');
      return `
      <div data-tp="${id}" data-hour="${initHour}" data-ampm="${initAmpm}" data-mode="${mode}" data-h24="${h24}"
        style="background:#F0F2F5;border-radius:12px;padding:16px;width:260px;font-family:var(--font-sans)">
        <div style="font:600 13px var(--font-sans);color:var(--n7);margin-bottom:12px">${mode==='clock'?'Seleccionar hora':'Ingresar hora'}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <div style="background:#fff;border:2px solid var(--b6);border-radius:8px;width:72px;height:56px;display:flex;align-items:center;justify-content:center;font:700 32px var(--font-sans);color:var(--n7)">
            <span data-time-h>${hStr}</span>
          </div>
          <span style="font:700 28px var(--font-sans);color:var(--n7)">:</span>
          <div style="background:#fff;border-radius:8px;width:72px;height:56px;display:flex;align-items:center;justify-content:center;font:700 32px var(--font-sans);color:var(--n7)">00</div>
          ${!h24 ? `<div style="display:flex;flex-direction:column;border-radius:8px;overflow:hidden;border:1px solid var(--n3)">
            <button data-ampm-btn="AM" onclick="_tpAmPm(this,'AM')" style="padding:4px 10px;font:600 11px var(--font-sans);border:none;cursor:pointer;background:${initAmpm==='AM'?'var(--b6)':'transparent'};color:${initAmpm==='AM'?'#fff':'var(--n6)'}">AM</button>
            <div style="height:1px;background:var(--n3)"></div>
            <button data-ampm-btn="PM" onclick="_tpAmPm(this,'PM')" style="padding:4px 10px;font:600 11px var(--font-sans);border:none;cursor:pointer;background:${initAmpm==='PM'?'var(--b6)':'transparent'};color:${initAmpm==='PM'?'#fff':'var(--n6)'}">PM</button>
          </div>` : ''}
        </div>
        <div data-clock-face style="display:${mode==='clock'?'block':'none'}">
          <svg data-clock-svg width="220" height="220" viewBox="0 0 220 220" style="display:block;margin:0 auto"></svg>
        </div>
        <div data-text-face style="display:${mode==='text'?'flex':'none'};gap:8px;margin-bottom:8px">
          <div style="display:flex;flex-direction:column;gap:4px">
            <input data-time-h-input type="text" value="${hStr}" maxlength="2"
              style="width:72px;height:56px;text-align:center;font:700 32px var(--font-sans);border:2px solid var(--b6);border-radius:8px;outline:none;background:#fff">
            <span style="font:400 11px var(--font-sans);color:var(--n5);text-align:center">Hora</span>
          </div>
          <div style="font:700 28px var(--font-sans);color:var(--n7);padding-top:14px">:</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <input type="text" value="00" maxlength="2"
              style="width:72px;height:56px;text-align:center;font:700 32px var(--font-sans);border:1px solid var(--n3);border-radius:8px;outline:none;background:#fff"
              onfocus="this.style.border='2px solid var(--b6)'" onblur="this.style.border='1px solid var(--n3)'">
            <span style="font:400 11px var(--font-sans);color:var(--n5);text-align:center">Minuto</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <button data-mode-icon onclick="_tpToggleMode(this)" style="background:none;border:none;cursor:pointer;display:flex;align-items:center">
            ${mode==='clock'
              ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
              : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`}
          </button>
          <div style="display:flex;gap:16px">
            <button data-i18n="ui.cancel" style="background:none;border:none;font:500 13px var(--font-sans);color:var(--n6);cursor:pointer">Cancelar</button>
            <button data-i18n="ui.save" style="background:none;border:none;font:600 13px var(--font-sans);color:var(--b6);cursor:pointer">Guardar</button>
          </div>
        </div>
      </div>`;
    };

    // Compact range picker popover (fits width of 2 inputs ≈ 460px)
    const dpRangePopover = `
      <div data-dpr="" data-m1="4" data-y1="2025" data-m2="5" data-y2="2025" data-start="" data-end=""
        data-popover style="display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(19,32,69,.14);overflow:hidden;font-family:var(--font-sans);width:600px">
        <div style="display:flex">
          <!-- Month 1 -->
          <div style="flex:1;padding:10px 10px 0;border-right:1px solid var(--n3)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <button onclick="_dpNav(this,-1)" data-which="1" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:16px;line-height:1;padding:2px 4px">‹</button>
              <span data-month-label="1" style="font:700 12px var(--font-sans);color:var(--n7)">Abril 2025</span>
              <div style="width:22px"></div>
            </div>
            <div data-grid="1" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px"></div>
          </div>
          <!-- Month 2 -->
          <div style="flex:1;padding:10px 10px 0">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="width:22px"></div>
              <span data-month-label="2" style="font:700 12px var(--font-sans);color:var(--n7)">Mayo 2025</span>
              <button onclick="_dpNav(this,1)" data-which="2" style="background:none;border:none;cursor:pointer;color:var(--b6);font-size:16px;line-height:1;padding:2px 4px">›</button>
            </div>
            <div data-grid="2" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px"></div>
          </div>
        </div>
        <!-- Aceptar same width as single datepicker (300px) centered -->
        <div style="padding:8px 10px 10px;display:flex;justify-content:center">
          <button data-accept disabled onclick="this.closest('[data-popover]').style.display='none'"
            style="width:280px;height:36px;border-radius:20px;border:none;background:#C5D2E7;color:#fff;font:700 13px var(--font-sans);cursor:pointer">Aceptar</button>
        </div>
      </div>`;

    // Timepicker popover — 2-step: select hour → select minutes → Save to close
    const tpPopover = (id, h24, initHour, initAmpm) => {
      const hStr = String(initHour).padStart(2,'0');
      return `<div data-tp="${id}" data-hour="${initHour}" data-minute="0" data-ampm="${initAmpm}" data-mode="clock" data-step="hour" data-h24="${h24}"
        data-popover style="display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:#F0F2F5;border-radius:12px;padding:14px;width:260px;box-shadow:0 4px 24px rgba(19,32,69,.14);font-family:var(--font-sans)">
        <!-- Step label -->
        <div data-tp-step-label style="font:600 13px var(--font-sans);color:var(--n7);margin-bottom:10px">Seleccionar hora</div>
        <!-- Header: clickable hour + minute boxes + AM/PM -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div data-time-h-box onclick="_tpSetStep(this,'hour')"
            style="background:#fff;border:2px solid var(--b6);border-radius:8px;width:64px;height:50px;display:flex;align-items:center;justify-content:center;font:700 28px var(--font-sans);color:var(--n7);cursor:pointer">
            <span data-time-h>${hStr}</span>
          </div>
          <span style="font:700 24px var(--font-sans);color:var(--n7)">:</span>
          <div data-time-m-box onclick="_tpSetStep(this,'minute')"
            style="background:#fff;border:1px solid var(--n3);border-radius:8px;width:64px;height:50px;display:flex;align-items:center;justify-content:center;font:700 28px var(--font-sans);color:var(--n5);cursor:pointer">
            <span data-time-m>00</span>
          </div>
          ${!h24?`<div style="display:flex;flex-direction:column;border-radius:8px;overflow:hidden;border:1px solid var(--n3)">
            <button data-ampm-btn="AM" onclick="_tpAmPm(this,'AM')" style="padding:3px 9px;font:600 10px var(--font-sans);border:none;cursor:pointer;background:${initAmpm==='AM'?'var(--b6)':'transparent'};color:${initAmpm==='AM'?'#fff':'var(--n6)'}">AM</button>
            <div style="height:1px;background:var(--n3)"></div>
            <button data-ampm-btn="PM" onclick="_tpAmPm(this,'PM')" style="padding:3px 9px;font:600 10px var(--font-sans);border:none;cursor:pointer;background:${initAmpm==='PM'?'var(--b6)':'transparent'};color:${initAmpm==='PM'?'#fff':'var(--n6)'}">PM</button>
          </div>`:''}
        </div>
        <div data-clock-face>
          <svg data-clock-svg width="210" height="210" viewBox="0 0 220 220" style="display:block;margin:0 auto"></svg>
        </div>
        <div data-text-face style="display:none;gap:8px;margin-bottom:8px">
          <div style="display:flex;flex-direction:column;gap:3px">
            <input data-time-h-input type="text" value="${hStr}" maxlength="2"
              style="width:64px;height:50px;text-align:center;font:700 28px var(--font-sans);border:2px solid var(--b6);border-radius:8px;outline:none;background:#fff">
            <span style="font:400 10px var(--font-sans);color:var(--n5);text-align:center">Hora</span>
          </div>
          <div style="font:700 24px var(--font-sans);color:var(--n7);padding-top:12px">:</div>
          <div style="display:flex;flex-direction:column;gap:3px">
            <input type="text" value="00" maxlength="2"
              style="width:64px;height:50px;text-align:center;font:700 28px var(--font-sans);border:1px solid var(--n3);border-radius:8px;outline:none;background:#fff"
              onfocus="this.style.border='2px solid var(--b6)'" onblur="this.style.border='1px solid var(--n3)'">
            <span style="font:400 10px var(--font-sans);color:var(--n5);text-align:center">Minuto</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
          <button data-mode-icon onclick="_tpToggleMode(this)" style="background:none;border:none;cursor:pointer;display:flex">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
          <div style="display:flex;gap:14px">
            <button data-i18n="ui.cancel" onclick="this.closest('[data-popover]').style.display='none'" style="background:none;border:none;font:500 13px var(--font-sans);color:var(--n6);cursor:pointer">Cancelar</button>
            <button onclick="(function(btn){var tp=btn.closest('[data-tp]');var h=String(tp.dataset.hour||12).padStart(2,'0');var m=String(tp.dataset.minute||0).padStart(2,'0');var ampm=tp.dataset.h24==='true'?'':(' '+(tp.dataset.ampm||'AM'));var wrap=btn.closest('[style*=relative]')||btn.closest('[style*=position]');var inp=wrap?wrap.querySelector('[style*=cursor]:first-child span:first-child,span[style*=color]'):null;var allInps=wrap?wrap.querySelectorAll('span'):[];allInps.forEach(function(s){if(s.style.color&&s.style.color.includes('n5'))s.textContent=h+':'+m+ampm;});tp.closest('[data-popover]').style.display='none';})(this)"
              style="background:none;border:none;font:600 13px var(--font-sans);color:var(--b6);cursor:pointer">Guardar</button>
          </div>
        </div>
      </div>`;
    };

    const dtSection = `
      <h3 style="font:700 18px var(--font-sans);color:var(--n7);margin:32px 0 6px">Date picker</h3>
      <p class="desc" style="margin-bottom:16px">Click en el input para abrir el calendario. Navega con ‹ ›. Aceptar se activa al seleccionar.</p>
      <div class="card" style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;padding-bottom:320px;margin-bottom:0">
        <div data-dp-wrap style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">Fecha de creación</span>
          ${triggerInp('F. Creación', CAL_ICO)}
          ${dpCalCard('data-dp="" data-month="4" data-year="2025" data-selected=""')}
        </div>
        <div data-dp-wrap style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">Con fecha seleccionada</span>
          ${triggerInp('01/04/2025', CAL_ICO)}
          ${dpCalCard('data-dp="" data-month="4" data-year="2025" data-selected="2025-04-01"')}
        </div>
        <div data-dp-wrap style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">Con rango seleccionado</span>
          ${triggerInp('01/04 – 10/04', CAL_ICO)}
          ${dpCalCard('data-dp="" data-month="4" data-year="2025" data-start="2025-04-01" data-end="2025-04-10"')}
        </div>
      </div>

      <h3 style="font:700 18px var(--font-sans);color:var(--n7);margin:24px 0 6px">Date range picker</h3>
      <p class="desc" style="margin-bottom:16px">Dos inputs (Desde/Hasta) que abren un popover con dos meses continuos — exactamente el ancho de ambos inputs juntos.</p>
      <div class="card" style="padding-bottom:340px;margin-bottom:0">
        <div style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">Rango de fechas</span>
          ${triggerInp('Seleccionar rango', CAL_ICO)}
          ${dpRangePopover}
        </div>
      </div>

      <h3 style="font:700 18px var(--font-sans);color:var(--n7);margin:24px 0 6px">Time picker</h3>
      <p class="desc" style="margin-bottom:16px">Click en el input de hora para abrir el reloj. El ícono inferior alterna entre reloj y texto.</p>
      <div class="card" style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;padding-bottom:420px">
        <div style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">12h — AM/PM</span>
          ${triggerInp('--:-- AM', CLK_ICO)}
          ${tpPopover('tp1',false,7,'AM')}
        </div>
        <div style="display:inline-flex;flex-direction:column;gap:4px;position:relative">
          <span style="font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em">24h</span>
          ${triggerInp('--:--', CLK_ICO)}
          ${tpPopover('tp2',true,20,'')}
        </div>
      </div>`;

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      ${tabCard([
        {label:'Preview', content: previewTab},
        {label:'Code',    content: codeTab},
        {label:'Tokens',  content: tokensTab},
      ])}
      ${dtSection}`;
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

    const subHead = t => `<div style="font:700 18px/24px var(--font-sans);color:var(--n7);padding-bottom:14px;margin-bottom:24px;border-bottom:2px solid var(--n3)">${escHtml(t)}</div>`;
    const cardLabel = t => `<div style="font:600 11px/16px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">${escHtml(t)}</div>`;

    // Tooltip bubble builder — inline absolute, no arrow auto-placement issue
    const tipBubble = (dir) => {
      const ARROW = {
        top:    'top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)',
        bottom: 'bottom:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid var(--n7)',
        left:   'left:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:5px solid var(--n7)',
        right:  'right:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:5px solid var(--n7)',
      };
      const POS = {
        top:    'bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)',
        bottom: 'top:calc(100% + 8px);left:50%;transform:translateX(-50%)',
        left:   'right:calc(100% + 8px);top:50%;transform:translateY(-50%)',
        right:  'left:calc(100% + 8px);top:50%;transform:translateY(-50%)',
      };
      return `<div style="position:absolute;${POS[dir]};background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;z-index:4;pointer-events:none">
        ${escHtml(text)}<div style="position:absolute;${ARROW[dir]};width:0;height:0"></div></div>`;
    };

    // Interactive hover tooltip helper
    const hoverTip = (trigger, dir='top') =>
      `<span style="position:relative;display:inline-flex;align-items:center;cursor:default"
        onmouseenter="var t=this.querySelector('.tt-live');t.style.opacity='1';t.style.visibility='visible';var o=this.querySelector('.ico-out'),f=this.querySelector('.ico-fil');if(o)o.style.display='none';if(f)f.style.display='inline-flex';"
        onmouseleave="var t=this.querySelector('.tt-live');t.style.opacity='0';t.style.visibility='hidden';var o=this.querySelector('.ico-out'),f=this.querySelector('.ico-fil');if(o)o.style.display='inline-flex';if(f)f.style.display='none';">
        ${trigger}
        <div class="tt-live" style="position:absolute;${({'top':'bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)','bottom':'top:calc(100% + 8px);left:50%;transform:translateX(-50%)','left':'right:calc(100% + 8px);top:50%;transform:translateY(-50%)','right':'left:calc(100% + 8px);top:50%;transform:translateY(-50%)'})[dir]};background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;opacity:0;visibility:hidden;transition:opacity .15s;z-index:10;pointer-events:none">
          ${escHtml(text)}<div style="position:absolute;${({'top':'top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)','bottom':'bottom:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid var(--n7)','left':'left:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:5px solid var(--n7)','right':'right:100%;top:50%;transform:translateY(-50%);border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:5px solid var(--n7)'})[dir]};width:0;height:0"></div>
        </div>
      </span>`;

    // ─── Section 1: Info icon states ─────────────────────────────────────────
    const iconSection = `<div style="margin-bottom:40px">
      ${subHead('Info icon')}
      <div style="display:flex;flex-wrap:wrap;gap:16px">

        <!-- Default -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px 20px;display:flex;flex-direction:column;gap:12px">
          ${cardLabel('Default')}
          <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">Label ${icoOut}</div>
        </div>

        <!-- Hover (static preview) -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px 20px;display:flex;flex-direction:column;gap:12px">
          ${cardLabel('Hover')}
          <div style="position:relative;padding-top:74px">
            <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
              Label
              <div style="position:relative;display:inline-flex;align-items:center">
                ${tipBubble('top')}${icoFil}
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px 20px;display:flex;flex-direction:column;gap:12px">
          ${cardLabel('Interactive — hover me')}
          <div style="position:relative;padding-top:74px">
            <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
              Label ${hoverTip(`${icoOutCls}${icoFilCls}`, 'top')}
            </div>
          </div>
        </div>

      </div>
    </div>`;

    // ─── Section 2: Placements — each in its own isolated card ───────────────
    function makeCard(placement) {
      const STAGE_H = { top:160, bottom:160, left:60, right:60 };
      const h = STAGE_H[placement] || 120;
      const iconAlign = {
        top:    'align-items:flex-end;justify-content:center;padding-bottom:20px',
        bottom: 'align-items:flex-start;justify-content:center;padding-top:20px',
        left:   'align-items:center;justify-content:flex-end;padding-right:20px',
        right:  'align-items:center;justify-content:flex-start;padding-left:20px',
      }[placement];
      return `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px 20px;min-width:260px;flex:1">
        ${cardLabel(placement)}
        <div style="position:relative;height:${h}px;display:flex;${iconAlign};overflow:visible">
          <div style="position:relative;display:inline-flex;align-items:center">
            ${tipBubble(placement)}${icoFil}
          </div>
        </div>
      </div>`;
    }

    const placementsSection = `<div style="margin-bottom:40px">
      ${subHead('Placements')}
      <div style="display:flex;flex-wrap:wrap;gap:12px">
        ${['top','bottom','left','right'].map(makeCard).join('')}
      </div>
    </div>`;

    // ─── Section 3: Persistent (with close button) ───────────────────────────
    const persistentSection = `<div style="margin-bottom:40px">
      ${subHead('Persistent (with close)')}
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 20px">Click the icon to open. Tooltip stays visible until the user closes it with ×.</p>
      <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:20px;display:inline-flex">
        <div style="position:relative;padding-top:74px">
          <div style="display:flex;align-items:center;gap:6px;font:400 14px/20px var(--font-sans);color:var(--n7)">
            Label
            <div class="tt-persist-wrap" style="position:relative;display:inline-flex;align-items:center;cursor:pointer"
              onclick="(function(wrap){var tt=wrap.querySelector('.tt-persist');tt.style.display=tt.style.display==='none'?'block':'none';})(this)">
              <div class="tt-persist" style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:10px 28px 10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:200px;white-space:normal;z-index:2">
                ${escHtml(text)}
                <button onclick="event.stopPropagation();this.closest('.tt-persist').style.display='none'"
                  style="position:absolute;top:8px;right:8px;background:transparent;border:none;color:#fff;cursor:pointer;padding:2px;display:flex;align-items:center;opacity:.6;line-height:1"
                  onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.6'">${X_CLOSE}</button>
                <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div>
              </div>
              ${icoOutCls}${icoFilCls}
            </div>
          </div>
        </div>
      </div>
    </div>`;

    // ─── Section 4: Input field + info icon ──────────────────────────────────
    const inputInfoSection = `<div style="margin-bottom:40px">
      ${subHead('Input field + info icon')}
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 20px">Tooltip on the info icon explains the purpose or constraints of the field. Hover the icon to activate.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px">

        <!-- Icon after label -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:20px;flex:1;min-width:260px">
          ${cardLabel('Icon next to label')}
          <div style="display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;align-items:center;gap:5px">
              <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">Nombre de usuario</label>
              ${hoverTip(`${icoOutCls}${icoFilCls}`, 'top')}
            </div>
            <input type="text" placeholder="walter.wallace"
              style="height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
              onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
              onblur="this.style.border='1px solid var(--n3)';this.style.background='#fff'">
            <p style="font:400 11px var(--font-sans);color:var(--n5);margin:2px 0 0">No debe contener espacios.</p>
          </div>
        </div>

        <!-- Icon inside input right side -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:20px;flex:1;min-width:260px">
          ${cardLabel('Icon inside input')}
          <div style="display:flex;flex-direction:column;gap:4px">
            <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">Contraseña</label>
            <div style="position:relative">
              <input type="password" placeholder="••••••••"
                style="height:32px;padding:0 32px 0 10px;border:1px solid var(--n3);border-radius:6px;font:400 14px var(--font-sans);background:#fff;color:var(--n7);box-sizing:border-box;outline:none;width:100%"
                onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
                onblur="this.style.border='1px solid var(--n3)';this.style.background='#fff'">
              <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex">
                ${hoverTip(`${icoOutCls}${icoFilCls}`, 'top')}
              </div>
            </div>
            <p style="font:400 11px var(--font-sans);color:var(--n5);margin:2px 0 0">Mínimo 4 caracteres.</p>
          </div>
        </div>

        <!-- Switch row with info icon -->
        <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:20px;flex:1;min-width:260px">
          ${cardLabel('Switch row')}
          <div style="display:flex;align-items:center;gap:8px">
            <span style="flex:1;font:400 14px var(--font-sans);color:var(--n7)">Crear órdenes nuevas</span>
            ${hoverTip(`${icoOutCls}${icoFilCls}`, 'top')}
            <div class="swt on" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>

      </div>
    </div>`;

    // ─── Section 5: Map pin tooltip ──────────────────────────────────────────
    // Build a simple DT-style teardrop pin using the same path as mappins renderer
    const PB = 'M16.5 1.5C24.78 1.5 31.5 8.22 31.5 16.5C31.5 21.44 29.11 25.82 25.43 28.55C22.61 30.67 18.58 34.04 17.66 39.48C17.56 40.05 17.08 40.5 16.5 40.5C15.92 40.5 15.44 40.05 15.34 39.48C14.42 34.04 10.39 30.67 7.56 28.55C3.88 25.82 1.5 21.44 1.5 16.5C1.5 8.22 8.22 1.5 16.5 1.5Z';
    const pinSvg = (fill, label, num) => `<div style="position:relative;cursor:pointer;display:inline-block;line-height:0;filter:drop-shadow(0 2px 4px rgba(19,32,69,.25))">
      <svg width="33" height="42" viewBox="0 0 33 42"><path d="${PB}" fill="${fill}" stroke="#fff" stroke-width="2"/>
        <text x="16.5" y="17" text-anchor="middle" dominant-baseline="central" font-family="DM Sans,sans-serif" font-weight="700" font-size="13" fill="#fff">${escHtml(num)}</text>
      </svg>
    </div>`;

    const mapPinSection = `<div style="margin-bottom:40px">
      ${subHead('Map pin tooltip')}
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 20px">Tooltip appears above the pin on hover — shows order or stop details without opening a panel.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px">

        <!-- Hover (static) -->
        <div style="background:var(--n2);border:1px solid var(--n3);border-radius:8px;padding:24px 28px;flex:1;min-width:240px">
          ${cardLabel('Hover (static preview)')}
          <div style="display:flex;justify-content:center;padding-top:80px">
            <div style="position:relative;display:inline-flex">
              <div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:180px;white-space:normal;z-index:4">
                <div style="font:700 12px/16px var(--font-sans);margin-bottom:4px">#ORD-4821 · Maya Johnson</div>
                <div style="color:rgba(255,255,255,.75)">Av. Principal 123 · Zona Norte</div>
                <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div>
              </div>
              ${pinSvg('#1F60ED','',4)}
            </div>
          </div>
        </div>

        <!-- Interactive — hover the pin -->
        <div style="background:var(--n2);border:1px solid var(--n3);border-radius:8px;padding:24px 28px;flex:1;min-width:240px">
          ${cardLabel('Interactive — hover the pin')}
          <div style="display:flex;gap:32px;justify-content:center;padding-top:80px">
            ${['#1F60ED|4','#00B8D9|7','#8FA0BA|·'].map(s => {
              const [fill, num] = s.split('|');
              const tipHtml = fill === '#8FA0BA'
                ? `<div style="font:700 12px/16px var(--font-sans);margin-bottom:4px">Sin asignar</div><div style="color:rgba(255,255,255,.75)">Sin conductor</div>`
                : `<div style="font:700 12px/16px var(--font-sans);margin-bottom:4px">#ORD-${3900+parseInt(num)*11} · Parada ${num}</div><div style="color:rgba(255,255,255,.75)">Av. Secundaria ${num}${num}5</div>`;
              return `<span style="position:relative;display:inline-flex;cursor:pointer"
                onclick="(function(el){var tt=el.querySelector('.pin-tt');var vis=tt.style.visibility==='visible';document.querySelectorAll('.pin-tt').forEach(function(t){t.style.opacity='0';t.style.visibility='hidden';});if(!vis){tt.style.opacity='1';tt.style.visibility='visible';}})(this)">
                <div class="pin-tt" style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--n7);color:#fff;padding:10px 12px;border-radius:6px;font:400 12px/16px var(--font-sans);width:180px;white-space:normal;opacity:0;visibility:hidden;transition:opacity .15s;z-index:10;pointer-events:none">
                  ${tipHtml}<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid var(--n7)"></div>
                </div>
                ${pinSvg(fill,'',num)}
              </span>`;
            }).join('')}
          </div>
        </div>

      </div>
    </div>`;

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:32px;background:var(--n1)">${iconSection}${placementsSection}${persistentSection}${inputInfoSection}${mapPinSection}</div>`;
    const codeTab    = `<div class="code" style="border-radius:0"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;
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
    const codeTab    = `<div class="code" style="border-radius:0"><button class="cp" data-i18n="ui.copy" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;
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
      const noFileTxt = disabled ? `<span data-i18n="ui.noFileChosen" style="font:400 12px var(--font-sans);color:var(--n4)">Sin archivo seleccionado</span>` : `<span data-i18n="ui.noFileChosen" style="font:400 12px var(--font-sans);color:var(--n5)">Sin archivo seleccionado</span>`;
      const toggleHtml = hasToggle ? `<div class="swt ${toggleOn ? 'on' : ''}" style="pointer-events:none;flex-shrink:0"></div>` : '';
      const fileArea = hasFile
        ? fuFilePill(filename || 'Example', disabled)
        : `${disabled ? `<button data-i18n="ui.chooseFile" style="${fuBtnDisStyle}">${fuFileIcon}Elegir archivo</button>` : `<button data-i18n="ui.chooseFile" style="${fuBtnStyle}">${fuFileIcon}Elegir archivo</button>`}${noFileTxt}`;
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
          <button data-i18n="ui.copy" onclick="copyCode(this)" style="height:24px;padding:0 10px;border-radius:4px;font:600 11px var(--font-sans);background:var(--n2);color:var(--n6);border:1px solid var(--n3);cursor:pointer">Copy</button>
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
          <button data-i18n="ui.copy" onclick="copyCode(this)" style="height:24px;padding:0 10px;border-radius:4px;font:600 11px var(--font-sans);background:var(--n2);color:var(--n6);border:1px solid var(--n3);cursor:pointer">Copy</button>
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

  /* ── IMAGE UPLOADER ── */
  imageUploader(data) {
    const tokens = data.tokens || {};
    const tokenRows = Object.entries(tokens).map(([k,v]) => `
      <tr style="border-bottom:1px solid var(--n3)">
        <td style="padding:8px 12px;font:600 12px var(--font-sans);color:var(--n7)">${escHtml(k)}</td>
        <td style="padding:8px 12px;font:400 12px var(--font-mono);color:var(--b6)">${escHtml(v)}</td>
      </tr>`).join('');

    const USER_ICON = `<svg viewBox="0 0 32 32" fill="currentColor" width="40" height="40"><path d="M16,4a5,5,0,1,1-5,5,5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,16,2Z"/><path d="M26,30H24V25a5.0055,5.0055,0,0,0-5-5H13a5.0055,5.0055,0,0,0-5,5v5H6V25a7.0082,7.0082,0,0,1,7-7h6a7.0082,7.0082,0,0,1,7,7Z"/></svg>`;
    const CAM_ICON  = `<svg viewBox="0 0 32 32" fill="currentColor" width="18" height="18"><path d="M26,24H6a2,2,0,0,1-2-2V10A2,2,0,0,1,6,8h4l2-3h8l2,3h4a2,2,0,0,1,2,2V22A2,2,0,0,1,26,24ZM6,10V22H26V10ZM16,20a4,4,0,1,1,4-4A4,4,0,0,1,16,20Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,16,14Z"/></svg>`;
    const RENEW_ICON = `<svg viewBox="0 0 32 32" fill="currentColor" width="14" height="14"><path d="M12,10H6.78A11,11,0,0,1,27,16h2A13,13,0,0,0,6,7.68V4H4v8h8Z"/><path d="M20,22h5.22A11,11,0,0,1,5,16H3a13,13,0,0,0,23,8.32V28h2V20H20Z"/></svg>`;

    function avatarWidget({ dragOver = false, overlayVisible = false, hasPhoto = false } = {}) {
      const containerBorder = dragOver ? 'var(--b5)' : 'var(--n3)';
      const containerBg     = dragOver ? 'var(--b1)' : 'var(--n2)';
      const overlayOpacity  = overlayVisible ? '1' : '0';
      const avContent = hasPhoto
        ? `style="width:88px;height:88px;border-radius:50%;background:var(--n3);overflow:hidden;background-image:url('https://i.pravatar.cc/88');background-size:cover;background-position:center"`
        : `style="width:88px;height:88px;border-radius:50%;background:var(--n3);display:flex;align-items:center;justify-content:center;color:var(--n5);overflow:hidden"`;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 20px;background:${containerBg};border-radius:8px;border:1px solid ${containerBorder};transition:border-color .15s,background .15s">
          <div style="position:relative;width:88px;height:88px;border-radius:50%;cursor:pointer">
            <div ${avContent}>${hasPhoto ? '' : USER_ICON}</div>
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(19,32,69,.60);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#fff;font:600 10px var(--font-sans);letter-spacing:.03em;opacity:${overlayOpacity};transition:opacity .18s;pointer-events:none">
              ${CAM_ICON}<span>Cambiar</span>
            </div>
          </div>
          <button style="display:inline-flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:0;font:600 13px var(--font-sans);color:var(--b6)">${RENEW_ICON}Reemplazar imagen</button>
          <p style="font:400 11px var(--font-sans);color:var(--n5);margin:0">Tamaño sugerido 224×224 px (PNG o JPG)</p>
        </div>`;
    }

    const DEMO_ID = `img-up-demo-${Math.floor(Date.now()/1000)}`;

    return `
      <div style="margin-bottom:24px">
        <p style="font:400 14px/1.5 var(--font-sans);color:var(--n6);margin:0 0 24px">${escHtml(data.description||'')}</p>

        <!-- Tokens -->
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:24px">
          <div style="padding:14px 16px;border-bottom:1px solid var(--n3)">
            <span style="font:600 13px var(--font-sans);color:var(--n7)">Design tokens</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font:400 12px var(--font-sans)">
            <thead><tr style="background:var(--n2);border-bottom:1px solid var(--n3)">
              <th style="text-align:left;padding:8px 12px;font:700 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em">Token</th>
              <th style="text-align:left;padding:8px 12px;font:700 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em">Value</th>
            </tr></thead>
            <tbody>${tokenRows}</tbody>
          </table>
        </div>

        <!-- 3 Variant cards -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:1px solid var(--n3)"><span style="font:600 12px var(--font-sans);color:var(--n7)">Empty</span></div>
            <div style="padding:16px">${avatarWidget()}</div>
          </div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:1px solid var(--n3)"><span style="font:600 12px var(--font-sans);color:var(--n7)">Drag over</span></div>
            <div style="padding:16px">${avatarWidget({ dragOver: true })}</div>
          </div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:1px solid var(--n3)"><span style="font:600 12px var(--font-sans);color:var(--n7)">Hover overlay</span></div>
            <div style="padding:16px">${avatarWidget({ overlayVisible: true })}</div>
          </div>
        </div>

        <!-- Interactive demo -->
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:24px">
          <div style="padding:14px 16px;border-bottom:1px solid var(--n3)">
            <span style="font:600 13px var(--font-sans);color:var(--n7)">Interactive demo</span>
            <span style="font:400 12px var(--font-sans);color:var(--n5);margin-left:8px">Click the avatar or drag an image onto the container</span>
          </div>
          <div style="padding:24px;background:var(--n2);display:flex;justify-content:center">
            <div style="width:280px">
              <div id="${DEMO_ID}"
                style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 20px;background:var(--n2);border-radius:8px;border:1px solid var(--n3);transition:border-color .15s,background .15s"
                ondragover="event.preventDefault();this.style.borderColor='var(--b5)';this.style.background='var(--b1)'"
                ondragleave="this.style.borderColor='var(--n3)';this.style.background='var(--n2)'"
                ondrop="event.preventDefault();this.style.borderColor='var(--n3)';this.style.background='var(--n2)';const f=event.dataTransfer.files[0];if(f)window.__applyDsImg('${DEMO_ID}',f)">
                <div style="position:relative;width:88px;height:88px;border-radius:50%;cursor:pointer"
                  onclick="document.getElementById('${DEMO_ID}-inp').click()"
                  onmouseenter="this.querySelector('.ov').style.opacity='1'"
                  onmouseleave="this.querySelector('.ov').style.opacity='0'">
                  <div id="${DEMO_ID}-av" style="width:88px;height:88px;border-radius:50%;background:var(--n3);display:flex;align-items:center;justify-content:center;color:var(--n5);overflow:hidden;background-size:cover;background-position:center">
                    ${USER_ICON}
                  </div>
                  <div class="ov" style="position:absolute;inset:0;border-radius:50%;background:rgba(19,32,69,.60);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#fff;font:600 10px var(--font-sans);letter-spacing:.03em;opacity:0;transition:opacity .18s;pointer-events:none">
                    ${CAM_ICON}<span>Cambiar</span>
                  </div>
                </div>
                <button style="display:inline-flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:0;font:600 13px var(--font-sans);color:var(--b6)"
                  onclick="document.getElementById('${DEMO_ID}-inp').click()">${RENEW_ICON}Reemplazar imagen</button>
                <p style="font:400 11px var(--font-sans);color:var(--n5);margin:0">Tamaño sugerido 224×224 px (PNG o JPG)</p>
                <input type="file" id="${DEMO_ID}-inp" accept="image/jpeg,image/png" style="display:none"
                  onchange="const f=this.files[0];if(f)window.__applyDsImg('${DEMO_ID}',f)">
              </div>
            </div>
          </div>
        </div>

        <!-- Code snippet -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:14px 16px;border-bottom:1px solid var(--n3)">
            <span style="font:600 13px var(--font-sans);color:var(--n7)">Code</span>
          </div>
          <div style="padding:16px;background:#1e1e2e;border-radius:0 0 8px 8px;font:400 12px var(--font-mono);color:#cdd6f4;white-space:pre;overflow-x:auto;line-height:1.6">&lt;<span style="color:#89b4fa">div</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-upload"</span> <span style="color:#a6e3a1">id</span>=<span style="color:#f38ba8">"img-upload-zone"</span>
     <span style="color:#a6e3a1">ondragover</span>=<span style="color:#f38ba8">"imgDragOver(event)"</span>
     <span style="color:#a6e3a1">ondragleave</span>=<span style="color:#f38ba8">"imgDragLeave(event)"</span>
     <span style="color:#a6e3a1">ondrop</span>=<span style="color:#f38ba8">"imgDrop(event)"</span>&gt;
  &lt;<span style="color:#89b4fa">div</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-circle"</span>&gt;
    &lt;<span style="color:#89b4fa">div</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-av"</span> <span style="color:#a6e3a1">id</span>=<span style="color:#f38ba8">"img-av"</span>&gt;&lt;!-- IBM Carbon User 32px --&gt;&lt;/<span style="color:#89b4fa">div</span>&gt;
    &lt;<span style="color:#89b4fa">div</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-overlay"</span>&gt;&lt;!-- IBM Carbon Camera --&gt;&lt;/<span style="color:#89b4fa">div</span>&gt;
  &lt;/<span style="color:#89b4fa">div</span>&gt;
  &lt;<span style="color:#89b4fa">button</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-replace"</span>&gt;Reemplazar imagen&lt;/<span style="color:#89b4fa">button</span>&gt;
  &lt;<span style="color:#89b4fa">p</span> <span style="color:#a6e3a1">class</span>=<span style="color:#f38ba8">"dt-img-hint"</span>&gt;Tamaño sugerido 224×224 px&lt;/<span style="color:#89b4fa">p</span>&gt;
  &lt;<span style="color:#89b4fa">input</span> <span style="color:#a6e3a1">type</span>=<span style="color:#f38ba8">"file"</span> <span style="color:#a6e3a1">id</span>=<span style="color:#f38ba8">"img-input"</span> <span style="color:#a6e3a1">accept</span>=<span style="color:#f38ba8">"image/jpeg,image/png"</span> <span style="color:#a6e3a1">style</span>=<span style="color:#f38ba8">"display:none"</span>&gt;
&lt;/<span style="color:#89b4fa">div</span>&gt;

<span style="color:#6c7086">/* CSS */</span>
<span style="color:#89b4fa">.dt-img-upload</span> { display:flex; flex-direction:column; align-items:center; gap:12px;
  padding:24px 20px; background:var(--n2); border-radius:8px; border:1px solid var(--n3); }
<span style="color:#89b4fa">.dt-img-upload.drag-over</span> { border-color:var(--b5); background:var(--b1); }
<span style="color:#89b4fa">.dt-img-circle</span> { position:relative; width:88px; height:88px; border-radius:50%; cursor:pointer; }
<span style="color:#89b4fa">.dt-img-overlay</span> { position:absolute; inset:0; border-radius:50%; opacity:0; transition:opacity .18s; }
<span style="color:#89b4fa">.dt-img-circle:hover .dt-img-overlay</span> { opacity:1; }</div>
        </div>
      </div>

      <script>
        window.__applyDsImg = function(id, file) {
          if (!file.type.match(/image\\/(jpeg|png)/)) return;
          if (file.size > 2*1024*1024) return;
          const r = new FileReader();
          r.onload = ev => {
            const av = document.getElementById(id + '-av');
            if (!av) return;
            av.innerHTML = '';
            av.style.backgroundImage = 'url(' + ev.target.result + ')';
          };
          r.readAsDataURL(file);
        };
      </script>`;
  },

  /* ── ALERTS / TOASTS ── */
  alerts(data) {
    const TYPES = data.types || ['info', 'neutral', 'warning', 'error', 'success'];

    // Use module-level dsAlert() — same canonical component everywhere
    function actionIcon(name) {
      const paths = {
        eye:      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      };
      return `<button style="flex-shrink:0;background:none;border:none;padding:0;cursor:pointer;opacity:.6;display:flex;align-items:center;line-height:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths[name] || ''}</svg></button>`;
    }

    function renderAlert(row, type) {
      // extraActions aren't in dsAlert — handle them here then delegate
      const extras = (row.extraActions || []).map(actionIcon).join('');
      if (!extras) return dsAlert(row, type);
      // With extra action icons: build inline ourselves using same tokens
      const c = _ALERT_TC[type] || _ALERT_TC.info;
      const ico = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${c.ic}" style="flex-shrink:0;margin-top:1px">${c.ip}</svg>`;
      const lines = (row.text||'').split('\n');
      const textHtml = lines.length > 1 ? lines.map(l=>escHtml(l)).join('<br>') : escHtml(row.text||'');
      return `<div style="background:${c.bg};border:1px solid ${c.bd};border-radius:6px;color:${c.fg};padding:10px 12px;display:flex;align-items:center;gap:10px">
        ${ico}<span style="flex:1;font:400 13px/1.4 var(--font-sans)">${textHtml}</span>${extras}
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

    const MOD_CHEVRON = `<svg viewBox="0 0 32 32" width="12" height="12" fill="currentColor" style="flex-shrink:0;pointer-events:none;color:var(--n5)"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;

    // ── DS input tokens (exact from inputs.json) ──────────────────────────
    function dsInput(f) {
      const isFocused = f.state === 'focus';
      const border = isFocused ? '2px solid var(--b6)' : (f.value ? '1px solid var(--n5)' : '1px solid var(--n3)');
      const bg     = isFocused ? 'var(--b1)' : '#fff';
      return `<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">
        <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">${escHtml(f.label)}${f.required ? `<span style="color:var(--r6);margin-left:2px">*</span>` : ''}</label>
        <input type="text" value="${escHtml(f.value||'')}" placeholder="${escHtml(f.label)}"
          style="height:32px;padding:0 10px;border:${border};border-radius:6px;font:400 14px/20px var(--font-sans);background:${bg};color:var(--n7);box-sizing:border-box;outline:none;width:100%"
          onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
          onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
          onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
          onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
        ${f.helper ? `<p style="font:400 11px var(--font-sans);color:var(--n5);margin:2px 0 0">${escHtml(f.helper)}</p>` : ''}
      </div>`;
    }

    // ── dt-drop-wrap (exact from inputs.json) ─────────────────────────────
    function dsSelect(f) {
      return `<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">
        <label style="font:400 12px/16px var(--font-sans);color:var(--n7)">${escHtml(f.label)}${f.required ? `<span style="color:var(--r6);margin-left:2px">*</span>` : ''}</label>
        <div class="dt-drop-wrap" style="position:relative">
          <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
            onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
            onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
            style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
            <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:${f.value ? 'var(--n7)' : 'var(--n6)'}">${escHtml(f.value || f.label)}</span>
            <span style="display:flex;flex-shrink:0">${MOD_CHEVRON}</span>
          </div>
          <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100%+4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0"></div>
        </div>
        ${f.helper ? `<p style="font:400 11px var(--font-sans);color:var(--n5);margin:2px 0 0">${escHtml(f.helper)}</p>` : ''}
      </div>`;
    }

    function renderFields(fields) {
      return fields.map(f => f.type === 'select' ? dsSelect(f) : dsInput(f)).join('');
    }

    // ── Alert from alerts.json via module-level dsAlert() ────────────────
    const warning = p.warning
      ? `<div style="margin-bottom:16px">${dsAlert({text:p.warning, hasClose:false}, 'warning')}</div>`
      : '';

    // ── Buttons (pill DS tokens) ──────────────────────────────────────────
    // Desktop: right-aligned inline
    // Mobile: inline side-by-side (flex:1 each); if labels are long → full-width stacked
    const PRI_BTN = (label, full='') =>
      `<button style="height:40px;padding:0 24px;border-radius:50px;font:700 14px/1 var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer;${full}display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box"
        onmouseenter="this.style.background='var(--b7)'" onmouseleave="this.style.background='var(--b6)'">${escHtml(label)}</button>`;
    const SEC_BTN = (label, full='') =>
      `<button style="height:40px;padding:0 24px;border-radius:50px;font:700 14px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;${full}display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box"
        onmouseenter="this.style.background='#EDF5FF'" onmouseleave="this.style.background='#fff'">${escHtml(label)}</button>`;

    function renderActions(actions, isMobile) {
      const divider = 'border-top:1px solid var(--n3);padding-top:16px;margin-top:8px';
      if (!isMobile) {
        // Desktop: inline, right-aligned
        const btns = actions.map(a => a.type === 'primary' ? PRI_BTN(a.label) : SEC_BTN(a.label)).join('');
        return `<div style="${divider};display:flex;justify-content:flex-end;gap:8px">${btns}</div>`;
      }
      // Mobile: inline side-by-side (flex:1 each) — fits for short labels like Cancel/Save
      const btns = actions.map(a =>
        a.type === 'primary' ? PRI_BTN(a.label,'flex:1;') : SEC_BTN(a.label,'flex:1;')
      ).join('');
      return `<div style="${divider};display:flex;gap:8px">${btns}</div>`;
    }

    const desktopModal = `
      <div style="background:rgba(19,32,69,.45);padding:32px 24px;border-radius:8px;display:flex;justify-content:center;align-items:center;min-height:520px">
        <div style="width:440px;max-width:100%;background:#fff;border-radius:8px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.18)">
          <div style="display:flex;align-items:flex-start;margin-bottom:6px">
            <div style="flex:1">
              <h1 style="font:700 22px/1.3 var(--font-sans);color:var(--n7);margin:0 0 4px">${escHtml(p.title || '')}</h1>
              <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0">${escHtml(p.subtitle || '')}</p>
            </div>
            <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n5);flex-shrink:0;margin-top:2px">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style="margin-top:16px">
            ${renderFields(p.fields || [])}
            ${warning}
            ${renderActions(p.actions || [], false)}
          </div>
        </div>
      </div>`;

    const mobileModal = `
      <div style="background:rgba(19,32,69,.45);padding:24px 16px;border-radius:8px;display:flex;justify-content:center;align-items:center;min-height:560px">
        <div style="width:296px;background:#1a1a1a;border-radius:28px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.4)">
          <div style="background:#F0F2F5;border-radius:22px;position:relative;overflow:hidden">
            <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:#1a1a1a;border-radius:2px;z-index:2"></div>
            <div style="margin:28px 14px 14px;background:#fff;border-radius:10px;padding:18px 16px;box-shadow:0 4px 12px rgba(0,0,0,.1)">
              <div style="display:flex;align-items:flex-start;margin-bottom:6px">
                <div style="flex:1">
                  <h1 style="font:700 18px/1.3 var(--font-sans);color:var(--n7);margin:0 0 4px">${escHtml(p.title || '')}</h1>
                  <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0">${escHtml(p.subtitle || '')}</p>
                </div>
                <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n5);flex-shrink:0;margin-top:2px">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div style="margin-top:14px">
                ${renderFields(p.fields || [])}
                ${warning}
                ${renderActions(p.actions || [], true)}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td><td><code>${escHtml(String(mt[k] || '—'))}</code></td></tr>`).join('');

    // ── "In use" context preview — table page bg + overlay + modal ───────────
    // Topbar icons (Carbon, fill=currentColor, 32×32)
    const C_APPS  = `<svg viewBox="0 0 32 32" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M8 4H4v4h4V4zm10 0h-4v4h4V4zm10 0h-4v4h4V4zM8 14H4v4h4v-4zm10 0h-4v4h4v-4zm10 0h-4v4h4v-4zM8 24H4v4h4v-4zm10 0h-4v4h4v-4zm10 0h-4v4h4v-4z"/></svg>`;
    const C_BELL  = `<svg viewBox="0 0 32 32" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M28 26H4v-2l2-2V15a10 10 0 017-9.5V5a3 3 0 016 0v.5A10 10 0 0127 15v7l2 2v2zm-12 4a3 3 0 003-3h-6a3 3 0 003 3z"/></svg>`;
    const C_HELP  = `<svg viewBox="0 0 32 32" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M16 2A14 14 0 102 16 14 14 0 0016 2zm0 26A12 12 0 114 16a12 12 0 0112 12zM17 22h-2v-2h2zm0-4h-2v-8h2z"/></svg>`;
    const C_USER  = `<svg viewBox="0 0 32 32" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M16 4a6 6 0 110 12A6 6 0 0116 4zm0 14c6.6 0 12 2.7 12 6v2H4v-2c0-3.3 5.4-6 12-6z"/></svg>`;

    // Sidebar mini-icons (faded blue)
    const sideIcons = [
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--b5)"><path d="M16 2L2 12v2h3v14h10v-8h2v8h10V14h3v-2z"/></svg>`,
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--b5)"><path d="M12 4H4v8h8V4zm16 0h-8v8h8V4zM12 20H4v8h8v-8zm16 0h-8v8h8v-8z"/></svg>`,
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--b5)"><path d="M28 6H4v2h24V6zM4 14h24v-2H4v2zm24 6H4v2h24v-2z"/></svg>`,
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--b5)"><path d="M26 6H6a2 2 0 00-2 2v16a2 2 0 002 2h20a2 2 0 002-2V8a2 2 0 00-2-2zm0 4H6V8h20v2zm0 14H6V13h20v11z"/></svg>`,
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--n4)"><path d="M27 16.76V16a11 11 0 10-11 11h.76a5.6 5.6 0 002.24 2H16A13 13 0 113 16a13 13 0 0113-13h.76z"/></svg>`,
      `<svg viewBox="0 0 32 32" width="18" height="18" fill="var(--n4)"><path d="M27 16.8V16a11 11 0 10-11 11h.8a5.6 5.6 0 012.2 2H16A13 13 0 113 16a13 13 0 0113-13h.8z"/></svg>`,
    ];

    // Simplified table rows for background
    const mkRow = (ord, name, ini, clr, badge, badgeClr, zone, date, progress) => `
      <tr style="border-bottom:1px solid var(--n3)">
        <td style="padding:8px 10px;width:16px"><input type="checkbox" style="pointer-events:none;accent-color:var(--b6)"></td>
        <td style="padding:8px 10px;font:400 13px var(--font-sans);color:var(--b6)">${ord}</td>
        <td style="padding:8px 10px">
          <div style="display:flex;align-items:center;gap:7px">
            <div style="width:24px;height:24px;border-radius:50%;background:${clr};display:flex;align-items:center;justify-content:center;font:700 9px var(--font-sans);color:#fff;flex-shrink:0">${ini}</div>
            <span style="font:400 13px var(--font-sans);color:var(--n7)">${name}</span>
          </div>
        </td>
        <td style="padding:8px 10px"><span style="background:${badgeClr};color:#fff;padding:2px 8px;border-radius:99px;font:600 11px var(--font-sans)">${badge}</span></td>
        <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n7)">${zone}</td>
        <td style="padding:8px 10px;font:400 12px var(--font-sans);color:var(--n5)">${date}</td>
        <td style="padding:8px 10px">
          <div style="background:var(--n3);border-radius:99px;height:6px;width:80px;overflow:hidden">
            <div style="background:var(--b5);height:100%;width:${progress}%;border-radius:99px"></div>
          </div>
        </td>
      </tr>`;

    const bgRows =
      mkRow('#ORD-4821','Maya Johnson','MJ','#1F60ED','Entregado','#00875A','Zona Norte','10-10-25 14:00',100) +
      mkRow('#ORD-3917','Lucas Martínez','LM','#8777D9','En tránsito','#1F60ED','Zona Sur','—',52) +
      mkRow('#ORD-5102','Aisha Patel','AP','#00B8D9','Pendiente','#FFAB00','Zona Este','10-10-25 16:00',20) +
      mkRow('#ORD-2856','Liam Smith','LS','#36B37E','Cancelado','#DE350B','Zona Centro','08-10-25 11:00',0) +
      mkRow('#ORD-6631','Sara López','SL','#F27B42','Entregado','#00875A','Zona Norte','11-10-25 09:30',100);

    const bgTablePage = `
      <!-- Topbar -->
      <div style="height:52px;background:#132045;display:flex;align-items:center;padding:0 16px 0 16px;gap:0;flex-shrink:0">
        <img src="sections/assets/logos/lastmile-desktop-white.svg" height="16" alt="LastMile" style="margin-right:auto">
        <div style="display:flex;align-items:center;gap:18px;margin-right:12px">
          ${C_APPS}${C_BELL}${C_HELP}${C_USER}
        </div>
        <div style="width:72px;height:52px;background:#fff;border-radius:14px 0 0 0;display:flex;align-items:center;justify-content:center;font:700 10px var(--font-sans);color:#132045">ACME CO</div>
      </div>
      <!-- Body -->
      <div style="display:flex;flex:1;min-height:0">
        <!-- Sidebar collapsed -->
        <div style="width:52px;flex-shrink:0;background:#fff;border-right:1px solid var(--n3);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:6px">
          ${sideIcons.map((ico,i) => `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:6px${i===3?';background:rgba(75,130,250,.08)':''}">${ico}</div>`).join('')}
        </div>
        <!-- Main content -->
        <div style="flex:1;padding:16px 18px;overflow:hidden;background:var(--n2)">
          <!-- Page header -->
          <div style="display:flex;align-items:center;margin-bottom:14px">
            <span style="font:700 20px/1 var(--font-sans);color:var(--n7);flex:1">Órdenes</span>
            <div style="display:flex;gap:8px">
              <button style="height:28px;padding:0 12px;border-radius:50px;border:1px solid #1F60ED;background:#fff;color:#4B82FA;font:700 12px var(--font-sans);cursor:default">Exportar</button>
              <button style="height:28px;padding:0 12px;border-radius:50px;border:none;background:var(--b6);color:#fff;font:700 12px var(--font-sans);cursor:default">+ Nueva orden</button>
            </div>
          </div>
          <!-- White card: filter bar + table -->
          <div style="background:#fff;border-radius:8px;border:1px solid var(--n3);padding:14px;overflow:hidden">
            <!-- Filter bar -->
            <div style="display:flex;gap:8px;margin-bottom:12px">
              <div style="flex:1;height:28px;border:1px solid var(--n3);border-radius:6px;padding:0 8px;font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center">Cliente</div>
              <div style="flex:1;height:28px;border:1px solid var(--n3);border-radius:6px;padding:0 8px;font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center;justify-content:space-between">Estado <svg viewBox="0 0 32 32" width="10" height="10" fill="var(--n5)"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg></div>
              <div style="flex:1;height:28px;border:1px solid var(--n3);border-radius:6px;padding:0 8px;font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center">F. Creación</div>
              <button style="height:28px;padding:0 12px;border-radius:50px;border:1px solid #1F60ED;background:#fff;color:#4B82FA;font:700 12px var(--font-sans);cursor:default">Filtrar</button>
            </div>
            <!-- Table -->
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:var(--n2);border-bottom:1px solid var(--n3)">
                  <th style="padding:6px 10px;width:16px"></th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)"># Orden</th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)">Cliente</th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)">Estado</th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)">Zona</th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)">F. Entrega</th>
                  <th style="padding:6px 10px;text-align:left;font:700 11px var(--font-sans);color:var(--n5)">Progreso</th>
                </tr>
              </thead>
              <tbody>${bgRows}</tbody>
            </table>
          </div>
        </div>
      </div>`;

    // ── Modal content (reuse same p data) ─────────────────────────────────────
    const ctxModal = `
      <div style="width:440px;max-width:calc(100% - 48px);background:#fff;border-radius:8px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.35)">
        <div style="display:flex;align-items:flex-start;margin-bottom:6px">
          <div style="flex:1">
            <h1 style="font:700 22px/1.3 var(--font-sans);color:var(--n7);margin:0 0 4px">${escHtml(p.title || '')}</h1>
            <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0">${escHtml(p.subtitle || '')}</p>
          </div>
          <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n5);flex-shrink:0;margin-top:2px"
            onmouseenter="this.style.color='var(--n7)'" onmouseleave="this.style.color='var(--n5)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="margin-top:16px">
          ${renderFields(p.fields || [])}
          ${warning}
          ${renderActions(p.actions || [], false)}
        </div>
      </div>`;

    const inContextCard = `
      <div style="margin-bottom:20px">
        <div style="font:700 11px var(--font-sans);color:var(--n7);margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
          In use — modal sobre tabla page
          <span style="font-weight:400;color:var(--n5);margin-left:auto">Overlay rgba(19,32,69,.45) · modal 440px centrado</span>
        </div>
        <div class="card flush" style="overflow:hidden">
          <div style="position:relative;height:500px;display:flex;flex-direction:column;overflow:hidden">
            ${bgTablePage}
            <!-- Dark overlay -->
            <div style="position:absolute;inset:0;background:rgba(19,32,69,.45);pointer-events:none"></div>
            <!-- Modal centered -->
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:none">
              <div style="pointer-events:auto">${ctxModal}</div>
            </div>
          </div>
        </div>
      </div>`;

    return `
      ${sectionHeader(data)}
      ${inContextCard}
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
            <span style="font-weight:400;color:var(--n5);margin-left:auto">inline actions · stacked if labels are long</span>
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

    // Use module-level buildSettingsSidebar — see top of file
    function buildSettingsLayout(p) { return buildSettingsSidebar(p, null, null); }

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
        return dpFilterField(f.placeholder);
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

    // Use module-level SVG constants — same buttons as tablepage and everywhere
    const SVG_ADD_DEFAULT = FLT_SVG_ADD_DEF, SVG_ADD_HOVER = FLT_SVG_ADD_HOV;
    const SVG_RES_DEFAULT = FLT_SVG_RES_DEF, SVG_RES_HOVER = FLT_SVG_RES_HOV;
    const btnAdd = FLT_BTN_ADD;

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

    // ── Render filter fields — delegates to module-level renderFilterField ──
    const renderFieldFunctional = (f) => renderFilterField(f);

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

    /* ── FILTER BAR VARIANTS ─────────────────────────────────────────────
       Static display variants — all use DS tokens, no functional wiring.
       Rules:
       · Up to 4 filters: show inline, no overflow button
       · 5+ filters: max 4 in main bar + "add more" button for overflow
       · Active filters in overflow: red dot badge on "add more" button */

    // Shared static input (display-only, flex:1)
    const sInp = (label='Label') =>
      `<div style="flex:1;min-width:0;display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;box-sizing:border-box">
        <span style="font:400 14px var(--font-sans);color:var(--n5)">${escHtml(label)}</span>
      </div>`;

    // Shared static select (display-only, flex:1)
    const sChevron = `<svg viewBox="0 0 32 32" width="11" height="11" fill="var(--n5)" style="flex-shrink:0"><path d="M16 22L4 10l1.5-1.5L16 19l10.5-10.5L28 10z"/></svg>`;
    const sSel = (label='Label') =>
      `<div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:space-between;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;box-sizing:border-box;cursor:pointer;gap:6px">
        <span style="flex:1;font:400 14px var(--font-sans);color:var(--n5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(label)}</span>
        ${sChevron}
      </div>`;

    // Filtrar button (static)
    const sFiltrar = `<button style="height:32px;padding:0 16px;border-radius:50px;font:700 14px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;flex-shrink:0">Filtrar</button>`;

    // Add more button with optional red-dot badge
    const sAddMore = (badge=false) =>
      `<button style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex;position:relative"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
        <span class="flt-def">${FLT_SVG_ADD_DEF}</span>
        <span class="flt-hov" style="display:none">${FLT_SVG_ADD_HOV}</span>
        ${badge ? `<span style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:var(--r6);border:2px solid #fff"></span>` : ''}
      </button>`;

    // Reset button (static)
    const sReset =
      `<button style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
        <span class="flt-def">${FLT_SVG_RES_DEF}</span>
        <span class="flt-hov" style="display:none">${FLT_SVG_RES_HOV}</span>
      </button>`;

    // Filter bar wrapper
    const fBar = (fields, extra='') =>
      `<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#fff;border-radius:8px;border:1px solid var(--n4)">
        ${fields}${extra}
      </div>`;

    // Overflow dropdown panel
    const overflowPanel = (count, rows, active=false) => {
      const cells = rows.map(r => `<div style="display:flex;gap:8px">${r.map(()=>sInp()).join('')}</div>`).join('');
      return `<div style="margin-top:4px;background:#fff;border-radius:8px;border:1px solid var(--n4);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;height:18px;margin-bottom:8px">
          <span style="font:700 13px/1 var(--font-sans);color:var(--b7);letter-spacing:.04em;text-transform:uppercase">Otros filtros (${count})</span>
          <button style="background:none;border:none;padding:0;cursor:pointer;line-height:0;color:var(--n5);display:flex;align-items:center">${dsCloseIcon(14,'var(--n5)')}</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">${cells}</div>
      </div>`;
    };

    const variantSection = `
      <h3 style="font:700 15px var(--font-sans);margin:24px 0 6px;color:var(--n7)">Filter bar variants</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6">
        La barra muestra hasta <strong>4 filtros</strong> en línea. Si hay más de 4, los adicionales se agrupan en el panel de overflow activado con el botón <em>Agregar filtros</em>.
        Si hay filtros activos en el overflow, aparece un punto rojo sobre ese botón.
      </p>
      <div class="card" style="display:flex;flex-direction:column;gap:20px">

        <!-- 1 filter -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">1 filtro</span>
          ${fBar(`${sInp()}`, `${sFiltrar}${sReset}`)}
        </div>

        <!-- 2 filters -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">2 filtros</span>
          ${fBar(`${sInp()}${sSel()}`, `${sFiltrar}${sReset}`)}
        </div>

        <!-- 3 filters -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">3 filtros</span>
          ${fBar(`${sInp()}${sSel()}${sInp()}`, `${sFiltrar}${sReset}`)}
        </div>

        <!-- 4 filters (max without overflow) -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">4 filtros — máximo visible sin overflow</span>
          ${fBar(`${sInp()}${sSel()}${sInp()}${sSel()}`, `${sFiltrar}${sReset}`)}
        </div>

        <!-- 5+ filters → overflow button appears -->
        <div style="display:flex;flex-direction:column;gap:4px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">5+ filtros — botón overflow sin filtros activos en el panel</span>
          ${fBar(`${sInp()}${sSel()}${sInp()}${sSel()}`, `${sFiltrar}${sAddMore(false)}${sReset}`)}
        </div>

        <!-- 5+ filters with active overflow -->
        <div style="display:flex;flex-direction:column;gap:4px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">5+ filtros — hay filtros activos en el panel (punto rojo)</span>
          ${fBar(`${sInp()}${sSel()}${sInp()}${sSel()}`, `${sFiltrar}${sAddMore(true)}${sReset}`)}
        </div>

        <!-- Overflow panel open (8 extra filters in 2 rows of 4) -->
        <div style="display:flex;flex-direction:column;gap:4px">
          <span style="font:600 12px var(--font-sans);color:var(--n5)">Panel de overflow abierto — 8 filtros adicionales</span>
          ${fBar(`${sInp()}${sSel()}${sInp()}${sSel()}`, `${sFiltrar}${sAddMore(true)}${sReset}`)}
          ${overflowPanel(8, [['','','',''],['','','','']])}
        </div>

      </div>`;

    /* ── LIVE 5+ DEMO ────────────────────────────────────────────────────
       Functional demo: 4 main fields + 3 overflow fields.
       Add-more opens the overflow panel. Reset clears everything.
       Red dot appears when overflow has active inputs. */
    const live5Id = 'flt5-bar', live5OvId = 'flt5-ov', live5TblId = 'flt5-tbl', live5BtnId = 'flt5-addbtn', live5BadgeId = 'flt5-badge';

    // Overflow fields (extra beyond the 4 in main bar)
    const ovFields = [
      {type:'select', placeholder:'Zona', colIdx:4,
        options:['Zona Norte','Zona Sur','Zona Este','Zona Centro']},
      {type:'select', placeholder:'Calificación', colIdx:10,
        options:['5 estrellas','4 estrellas','3 estrellas','1-2 estrellas']},
      {type:'text',   placeholder:'Código de orden', colIdx:1},
    ];

    // Combine main + overflow for filter IIFE
    const allFields5 = [...(data.fields||[]), ...ovFields];
    const colMap5 = allFields5.map(f => f.colIdx !== undefined ? f.colIdx : -1);
    const types5  = allFields5.map(f => f.type);

    // Filter IIFE — reads main bar + overflow panel
    const onFilter5 = `(function(){
      var bar=document.getElementById('${live5Id}');
      var ov=document.getElementById('${live5OvId}');
      var tbl=document.getElementById('${live5TblId}');
      if(!bar||!tbl)return;
      var colMap=${JSON.stringify(colMap5)};
      var types=${JSON.stringify(types5)};
      var allInps=[].slice.call(bar.querySelectorAll('input[type=text]')).concat(ov?[].slice.call(ov.querySelectorAll('input[type=text]')):[]);
      var allWraps=[].slice.call(bar.querySelectorAll('.dt-drop-wrap[data-val]')).concat(ov?[].slice.call(ov.querySelectorAll('.dt-drop-wrap[data-val]')):[]);
      var ti=0,si=0;
      tbl.querySelectorAll('tbody tr').forEach(function(row){
        var cells=row.querySelectorAll('td');
        var show=true;
        colMap.forEach(function(ci,fi){
          if(types[fi]==='select'){
            var v=allWraps[si]?allWraps[si].dataset.val:''; si++;
            if(v&&ci>=0&&(cells[ci]?cells[ci].textContent:'').trim()!==v)show=false;
          } else if(types[fi]==='text'){
            var v2=(allInps[ti]?allInps[ti].value:'').toLowerCase().trim(); ti++;
            if(v2&&ci>=0&&!(cells[ci]?cells[ci].textContent:'').toLowerCase().includes(v2))show=false;
          } else { if(types[fi]!=='date'&&types[fi]!=='select'){ti++;} }
        });
        row.style.display=show?'':'none';
      });
    })()`.replace(/\s+/g,' ');

    // Check if overflow has any active input → update badge
    const checkBadge5 = `(function(){
      var ov=document.getElementById('${live5OvId}');
      var badge=document.getElementById('${live5BadgeId}');
      if(!badge)return;
      var hasActive=ov&&([].slice.call(ov.querySelectorAll('input[type=text]')).some(function(i){return i.value.trim();})||[].slice.call(ov.querySelectorAll('.dt-drop-wrap')).some(function(w){return w.dataset.val;}));
      badge.style.display=hasActive?'block':'none';
    })()`;

    // Reset IIFE — clears main + overflow + table
    const onReset5 = `(function(){
      var bar=document.getElementById('${live5Id}');
      var ov=document.getElementById('${live5OvId}');
      var tbl=document.getElementById('${live5TblId}');
      [bar,ov].forEach(function(el){if(!el)return;
        el.querySelectorAll('input[type=text]').forEach(function(i){i.value='';i.style.border='1px solid var(--n3)';i.style.background='#fff';});
        el.querySelectorAll('.dt-drop-wrap').forEach(function(w){var l=w.querySelector('.dt-dlabel');if(l){l.textContent=l.dataset.ph||l.textContent;l.style.color='var(--n6)';l.dataset.filled='';}w.dataset.val='';if(typeof dtDropClose==='function')dtDropClose(w);});
      });
      if(tbl)tbl.querySelectorAll('tbody tr').forEach(function(r){r.style.display='';});
      document.getElementById('${live5BadgeId}').style.display='none';
    })()`.replace(/\s+/g,' ');

    // Toggle overflow panel
    const toggleOv5 = `(function(btn){
      var ov=document.getElementById('${live5OvId}');
      if(!ov)return;
      ov.style.display=ov.style.display==='none'?'block':'none';
    })(this)`;

    // Add-more btn with badge
    const addMore5 = `<button id="${live5BtnId}" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex;position:relative" onclick="${toggleOv5}"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
      <span class="flt-def">${FLT_SVG_ADD_DEF}</span>
      <span class="flt-hov" style="display:none">${FLT_SVG_ADD_HOV}</span>
      <span id="${live5BadgeId}" style="display:none;position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:var(--r6);border:2px solid #fff;pointer-events:none"></span>
    </button>`;

    // Reset btn (triggers reset + hides overflow)
    const reset5Btn = `<button style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex" onclick="${onReset5};document.getElementById('${live5OvId}').style.display='none'"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
      <span class="flt-def">${FLT_SVG_RES_DEF}</span>
      <span class="flt-hov" style="display:none">${FLT_SVG_RES_HOV}</span>
    </button>`;

    // Overflow panel fields (rendered with onchange → badge update)
    const ovFieldsHtml = ovFields.map(f => {
      if (f.type === 'select') {
        const items = (f.options||[]).map(o => {
          const safe = escHtml(o);
          return `<div onclick="dtPickOpt(this);this.closest('.dt-drop-wrap').dataset.val='${safe}';${checkBadge5}"
            data-val="${safe}" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
            onmouseleave="this.style.background='';this.style.color='var(--n7)'"
            style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">${safe}</div>`;
        }).join('');
        return `<div class="dt-drop-wrap" data-val="" style="position:relative;flex:1;min-width:0">
          <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
            onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
            onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
            style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
            <span class="dt-dlabel" data-ph="${escHtml(f.placeholder)}" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(f.placeholder)}</span>
            <span style="color:var(--n5);display:flex;flex-shrink:0">${_FILTER_CHEVRON}</span>
          </div>
          <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;z-index:110;padding:4px 0">${items}</div>
        </div>`;
      }
      return `<div style="flex:1;min-width:0">
        <input type="text" placeholder="${escHtml(f.placeholder)}"
          style="${_FILTER_INP_BASE};padding:0 10px"
          onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
          onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff';${checkBadge5}"
          oninput="${checkBadge5}">
      </div>`;
    }).join('');

    const rawTable5 = tblDemoTable(data.scrollDemo || {});
    const demoTable5 = rawTable5.replace('<div class="tbl-outer">', `<div class="tbl-outer" id="${live5TblId}">`);

    // Shared overflow panel close button — no height override, icon only
    const closePanelBtn = (panelId) =>
      `<button style="background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;line-height:0;color:var(--n5);flex-shrink:0"
        onclick="document.getElementById('${panelId}').style.display='none'"
        onmouseenter="this.style.color='var(--n7)'" onmouseleave="this.style.color='var(--n5)'">${dsCloseIcon(14,'var(--n5)')}</button>`;

    // Overflow panel card — same style as static variant
    const ovPanelCard = (panelId, count, fieldsHtml) =>
      `<div id="${panelId}" style="display:none;background:#fff;border-radius:8px;border:1px solid var(--n4);padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;height:18px;margin-bottom:8px">
          <span style="font:700 13px/1 var(--font-sans);color:var(--b7);text-transform:uppercase;letter-spacing:.04em">Otros filtros (${count})</span>
          ${closePanelBtn(panelId)}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${fieldsHtml}
        </div>
      </div>`;

    // Overflow fields in 1 row (desktop) or stacked (mobile)
    const ovRow = `<div style="display:flex;gap:8px">${ovFieldsHtml}</div>`;

    // ── Mobile version IDs
    const mobBarId = 'flt5m-bar', mobOvId = 'flt5m-ov', mobBadgeId = 'flt5m-badge';

    // Mobile overflow = main bar fields [1..3] + all ovFields
    const mobileFields = (data.fields||[]).slice(1); // all except first
    const allMobFields = [...mobileFields, ...ovFields];
    const mobColMap = allMobFields.map(f => f.colIdx !== undefined ? f.colIdx : -1);
    const mobTypes  = allMobFields.map(f => f.type);

    // Mobile: only first field in main bar
    const firstField = (data.fields||[])[0];
    const mobFirstHtml = firstField ? renderFilterFunctionalFor(firstField, mobBadgeId) : '';

    // Helper: render a field with badge check on change
    function renderFilterFunctionalFor(f, badgeId) {
      if (f.type === 'date') return dpFilterField(f.placeholder);
      if (f.type === 'select') {
        const items = (f.options||[]).map(o => {
          const safe = escHtml(o);
          return `<div onclick="dtPickOpt(this);this.closest('.dt-drop-wrap').dataset.val='${safe}'"
            data-val="${safe}" onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
            onmouseleave="this.style.background='';this.style.color='var(--n7)'"
            style="height:36px;padding:0 12px;display:flex;align-items:center;font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">${safe}</div>`;
        }).join('');
        return `<div class="dt-drop-wrap" data-val="" style="position:relative;flex:1;min-width:0">
          <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
            onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
            onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
            style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
            <span class="dt-dlabel" data-ph="${escHtml(f.placeholder)}" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">${escHtml(f.placeholder)}</span>
            <span style="color:var(--n5);display:flex;flex-shrink:0">${_FILTER_CHEVRON}</span>
          </div>
          <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid var(--n3);border-radius:6px;z-index:110;padding:4px 0">${items}</div>
        </div>`;
      }
      return `<div style="flex:1;min-width:0">
        <input type="text" placeholder="${escHtml(f.placeholder)}"
          style="${_FILTER_INP_BASE};padding:0 10px"
          onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
          onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'">
      </div>`;
    }

    // Mobile overflow fields — 1 field per line
    const mobOvHtml = allMobFields.map(f =>
      `<div style="display:flex">${renderFilterFunctionalFor(f, mobBadgeId)}</div>`
    ).join('');

    // Mobile filter IIFE
    const onMobFilter = `(function(){
      var bar=document.getElementById('${mobBarId}');
      var ov=document.getElementById('${mobOvId}');
      var tbl=document.getElementById('${live5TblId}');
      if(!bar||!tbl)return;
      var mainInps=[].slice.call(bar.querySelectorAll('input[type=text]'));
      var mainW=bar.querySelector('.dt-drop-wrap[data-val]');
      var ovInps=ov?[].slice.call(ov.querySelectorAll('input[type=text]')):[];
      var ovWraps=ov?[].slice.call(ov.querySelectorAll('.dt-drop-wrap[data-val]')):[];
      var f1Val=(mainInps[0]?mainInps[0].value:'').toLowerCase().trim();
      tbl.querySelectorAll('tbody tr').forEach(function(row){
        var cells=row.querySelectorAll('td');
        var show=true;
        if(f1Val&&!(cells[${(data.fields||[])[0]?.colIdx||2}]?cells[${(data.fields||[])[0]?.colIdx||2}].textContent:'').toLowerCase().includes(f1Val))show=false;
        var ti=0,si=0;
        ${JSON.stringify(mobColMap)}.forEach(function(ci,fi){
          var t=${JSON.stringify(mobTypes)}[fi];
          if(t==='select'){var v=ovWraps[si]?ovWraps[si].dataset.val:'';si++;if(v&&ci>=0&&(cells[ci]?cells[ci].textContent:'').trim()!==v)show=false;}
          else if(t==='text'){var v2=(ovInps[ti]?ovInps[ti].value:'').toLowerCase().trim();ti++;if(v2&&ci>=0&&!(cells[ci]?cells[ci].textContent:'').toLowerCase().includes(v2))show=false;}
        });
        row.style.display=show?'':'none';
      });
    })()`.replace(/\s+/g,' ');

    // Mobile add-more btn + badge
    const mobAddMore = `<button id="flt5m-addbtn" style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex;position:relative"
        onclick="(function(btn){var ov=document.getElementById('${mobOvId}');ov.style.display=ov.style.display==='none'?'block':'none';})(this)"
        onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
        onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
      <span class="flt-def">${FLT_SVG_ADD_DEF}</span>
      <span class="flt-hov" style="display:none">${FLT_SVG_ADD_HOV}</span>
      <span id="${mobBadgeId}" style="display:none;position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:var(--r6);border:2px solid #fff;pointer-events:none"></span>
    </button>`;

    const live5SectionFixed = `
      <h3 style="font:700 15px var(--font-sans);margin:24px 0 6px;color:var(--n7)">5+ filtros · live preview</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6">
        Todos los inputs y botones son funcionales. <strong>Desktop</strong>: 4 campos visibles + overflow.
        <strong>Mobile</strong>: solo el primer campo visible; todos los demás van al panel de overflow.
      </p>

      <!-- Desktop -->
      <div style="margin-bottom:8px;font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em;display:flex;align-items:center;gap:6px">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>Desktop
      </div>
      <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
        <div id="${live5Id}" style="display:flex;align-items:center;gap:8px">
          ${(data.fields||[]).map(renderFieldFunctional).join('')}
          <button style="${secBtnStyle}" onclick="${onFilter5.replace(/"/g,"'")}"
            onmouseenter="this.style.background='#EDF5FF'" onmouseleave="this.style.background='#fff'"
            onmousedown="this.style.background='#D1E0FF'" onmouseup="this.style.background='#EDF5FF'"
          >${escHtml(data.filterBtnLabel||'Filtrar')}</button>
          ${addMore5}${reset5Btn}
        </div>
        ${ovPanelCard(live5OvId, ovFields.length, ovRow)}
        <div style="border:1px solid var(--n4);border-radius:4px;overflow:hidden">${demoTable5}</div>
      </div>

      <!-- Mobile -->
      <div style="margin-bottom:8px;font:600 11px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.04em;display:flex;align-items:center;gap:6px">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>Mobile — solo el primer campo en la barra; todos los demás en el panel
      </div>
      <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:12px;max-width:400px">
        <div id="${mobBarId}" style="display:flex;align-items:center;gap:8px">
          ${mobFirstHtml}
          <button style="${secBtnStyle}" onclick="${onMobFilter.replace(/"/g,"'")}"
            onmouseenter="this.style.background='#EDF5FF'" onmouseleave="this.style.background='#fff'"
          >${escHtml(data.filterBtnLabel||'Filtrar')}</button>
          ${mobAddMore}
          <button style="width:32px;height:32px;background:none;border:none;padding:0;cursor:pointer;flex-shrink:0;display:inline-flex"
            onclick="(function(){var bar=document.getElementById('${mobBarId}');var ov=document.getElementById('${mobOvId}');[bar,ov].forEach(function(el){if(!el)return;el.querySelectorAll('input[type=text]').forEach(function(i){i.value='';i.style.border='1px solid var(--n3)';i.style.background='#fff';});el.querySelectorAll('.dt-drop-wrap').forEach(function(w){var l=w.querySelector('.dt-dlabel');if(l){l.textContent=l.dataset.ph||l.textContent;l.style.color='var(--n6)';l.dataset.filled='';}w.dataset.val='';if(typeof dtDropClose==='function')dtDropClose(w);});});document.getElementById('${mobBadgeId}').style.display='none';document.getElementById('${live5TblId}').querySelectorAll('tbody tr').forEach(function(r){r.style.display='';});ov.style.display='none';})()"
            onmouseenter="this.querySelector('.flt-def').style.display='none';this.querySelector('.flt-hov').style.display='inline'"
            onmouseleave="this.querySelector('.flt-def').style.display='inline';this.querySelector('.flt-hov').style.display='none'">
            <span class="flt-def">${FLT_SVG_RES_DEF}</span>
            <span class="flt-hov" style="display:none">${FLT_SVG_RES_HOV}</span>
          </button>
        </div>
        ${ovPanelCard(mobOvId, allMobFields.length, mobOvHtml)}
      </div>`;

    return `
      ${sectionHeader(data)}
      ${usageCard(data.pageUsage)}
      <h3 style="font:700 15px var(--font-sans);margin:0 0 10px;color:var(--n7)">Filter bar · live demo</h3>
      ${filterDemo}
      ${variantSection}
      ${live5SectionFixed}
      <h3 style="font:700 15px var(--font-sans);margin:24px 0 10px;color:var(--n7)">Icon buttons</h3>

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


    // ── Shared main content (used in both sidebar variants) ───────────────
    const mainContent = `
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

              <!-- Filter bar — exact same fields as filters.json via renderFilterField() -->
              <div style="display:flex;align-items:center;gap:8px">
                ${(data.filterFields||[]).map(renderFilterField).join('')}
                <button style="background:#fff;color:#4B82FA;border:1px solid #1F60ED;font:700 14px/20px var(--font-sans);height:32px;padding:0 16px;border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box" onmouseenter="this.style.background='#EDF5FF'" onmouseleave="this.style.background='#fff'" onmousedown="this.style.background='#D1E0FF'" onmouseup="this.style.background='#EDF5FF'">${escHtml(data.filterBtnLabel||'Filtrar')}</button>
                ${FLT_BTN_ADD}
                ${FLT_BTN_RESET}
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

      </div>`; // end mainContent

    const tbar = `<div class="tbar" style="border-radius:0;padding:0 0 0 22px">
      <img src="sections/assets/logos/lastmile-desktop-white.svg" height="18" class="logo" alt="LastMile">
      <div class="acts">${iconSvg('apps',18,'#fff')}${iconSvg('help',18,'#fff')}${iconSvg('messages',18,'#fff')}<div class="bell">${iconSvg('alerts',18,'#fff')}</div>${iconSvg('user',18,'#fff')}</div>
      <div class="slot">ACME CO</div>
    </div>`;

    return `
      ${sbStyle}
      ${sectionHeader(data)}

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 8px" data-i18n="ui.standardSidebar">Sidebar estándar</h3>
      <div class="card flush" style="border-radius:8px;overflow:hidden;margin-bottom:28px">
        ${tbar}
        <div style="display:flex;min-height:540px">
          <div class="sbx">${sidebarHtml}</div>
          ${mainContent}
        </div>
      </div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 8px" data-i18n="ui.settingsSidebar">Sidebar de ajustes</h3>
      <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 12px" data-i18n="ui.settingsSidebarDesc">Misma tabla — panel de ajustes empuja el contenido a la derecha.</p>
      <div class="card flush" style="border-radius:8px;overflow:hidden;margin-bottom:28px">
        ${tbar}
        ${buildSettingsSidebar(data.lmProduct || {}, null, mainContent)}
      </div>
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

    // BLOCK: input-map (inputs left + real Leaflet map right)
    let _fpMapId = 0;
    const blockInputMap = (formContent, mapId) => {
      const mid = mapId || ('fp-map-' + (++_fpMapId));
      return `<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:20px">
        <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px;display:flex;flex-direction:column;gap:12px">
          ${formContent}
        </div>
        <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);overflow:hidden;min-height:300px;position:relative">
          <div id="${mid}" style="width:100%;height:100%;min-height:300px"></div>
        </div>
      </div>`;
    };

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

    // ── Settings form shell — uses module-level buildSettingsSidebar ─────
    // Passes actual form content as contentHtml so the panel pushes it right
    const lmProduct = data.lmProduct || {};  // LM settings data from form-page.json
    const formShellSettings = (breadcrumb, title, blocks, activeItem) => {
      const formContent = `<div style="flex:1;padding:20px 24px 24px;min-width:0;display:flex;flex-direction:column;gap:16px;overflow:hidden;background:var(--n2)">
        <div style="font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center;gap:4px">
          ${breadcrumb.map((b,i)=>`${i>0?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`:''}
          <span style="${i===breadcrumb.length-1?'color:var(--n6)':''}">${escHtml(b)}</span>`).join('')}
        </div>
        <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px 24px 24px;display:flex;flex-direction:column;gap:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n6)">${BACK_ARROW}</button>
              <h2 style="margin:0;font:700 24px/1 var(--font-sans);color:var(--n7)">${escHtml(title)}</h2>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
              <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer">Cancelar</button>
              <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer">Guardar</button>
            </div>
          </div>
          <p style="font:400 12px var(--font-sans);color:var(--r6);margin:0"><span>* </span>Indica el campo es obligatorio</p>
          <div style="display:flex;flex-direction:column;gap:16px">${blocks}</div>
        </div>
      </div>`;
      return `<div class="card flush" style="border-radius:8px;overflow:hidden">
        <div class="tbar" style="border-radius:0;padding:0 0 0 22px">
          <img src="sections/assets/logos/lastmile-desktop-white.svg" height="18" class="logo" alt="LastMile">
          <div class="acts">${iconSvg('apps',18,'#fff')}${iconSvg('help',18,'#fff')}${iconSvg('messages',18,'#fff')}<div class="bell">${iconSvg('alerts',18,'#fff')}</div>${iconSvg('user',18,'#fff')}</div>
          <div class="slot">ACME CO</div>
        </div>
        <!-- buildSettingsSidebar is width:100% flex row: icon(52) + panel(224) + content(flex:1) -->
        ${buildSettingsSidebar(lmProduct, activeItem, formContent)}
      </div>`;
    };

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
          <div style="flex:1;padding:20px 24px 24px;min-width:0;display:flex;flex-direction:column;gap:16px;overflow:hidden;background:var(--n2)">

            <!-- Breadcrumb — outside the white container, top-left -->
            <div style="font:400 12px var(--font-sans);color:var(--n5);display:flex;align-items:center;gap:4px">
              ${breadcrumb.map((b,i)=>`${i>0?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`:''}
              <span style="${i===breadcrumb.length-1?'color:var(--n6)':''}">${escHtml(b)}</span>`).join('')}
            </div>

            <!-- White form container — same tokens as table-page container -->
            <div style="background:#fff;border-radius:8px;border:1px solid var(--n4);padding:20px 24px 24px;display:flex;flex-direction:column;gap:20px">

              <!-- Page header inside container -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                <div style="display:flex;align-items:center;gap:8px">
                  <button style="background:none;border:none;cursor:pointer;padding:2px;display:flex;color:var(--n6)">${BACK_ARROW}</button>
                  <h2 style="margin:0;font:700 24px/1 var(--font-sans);color:var(--n7)">${escHtml(title)}</h2>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                  <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer">Cancelar</button>
                  <button style="height:32px;padding:0 16px;border-radius:50px;font:700 13px/1 var(--font-sans);background:var(--b6);color:#fff;border:none;cursor:pointer">Guardar</button>
                </div>
              </div>

              <p style="font:400 12px var(--font-sans);color:var(--r6);margin:0"><span>* </span>Indica el campo es obligatorio</p>

              <!-- Form blocks — gap:16px between them -->
              <div style="display:flex;flex-direction:column;gap:16px">
                ${blocks}
              </div>

            </div><!-- end white form container -->
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

    const ex3 = formShellSettings(
      ['Configuración','Geocerca','Crear Geocerca'],
      'Crear Geocerca',
      blockInputMap(
        `<p style="font:700 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Tipo de geocerca</p>
        <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 10px">Asociativa: define la zona de despacho de un vehículo.<br>Restrictiva: impide el tránsito por una zona.</p>` +
        `<div style="margin-bottom:12px">${fpRadio('geocerca-tipo',['Asociativa','Restrictiva'],1)}</div>` +
        fpInp('Nombre','','',true) +
        fpSelect('Seleccionar geocerca pre-definida','') +
        `<div style="margin-top:4px"><p style="font:400 12px var(--font-sans);color:var(--n7);margin:0 0 8px">Estado</p>${fpRadio('geocerca-estado',['Activa','Inactiva'],0)}</div>`,
        'fp-map-geocerca'
      ),
      'Geocercas'
    );

    // Settings sidebar examples
    const ex4 = formShellSettings(
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
        `<div style="display:flex;gap:16px;margin-bottom:12px">${fpRadio('perm-type2',['Rol de usuario','Personalizado'],0)}</div>` +
        fpSelect('Seleccionar rol','')
      ) +
      blockCustomFields('Campos personalizados',
        [{type:'select',label:'Tienda'},{type:'select',label:'Cargo'}]),
      'Usuarios web'
    );

    const ex5 = formShellSettings(
      ['Vehículos','Nuevo vehículo'],
      'Nuevo vehículo',
      blockTwoCol(
        'Información del vehículo',
        fpInp('Identificador','','',true) +
        `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${fpInp('Capacidad 1','')}${fpInp('Capacidad 2','')}${fpInp('Capacidad 3','')}</div>` +
        fpSelect('Grupos','') +
        fpSelect('Tipo de camión','',true) +
        fpSelect('Asociar usuario móvil',''),
        'Otras configuraciones',
        `<div style="font:600 13px var(--font-sans);color:var(--n7);margin-bottom:8px">Horas de trabajo</div>` +
        fpInp('Turno de trabajo','') +
        fpInp('Tiempo de descanso','') +
        `<div style="font:600 13px var(--font-sans);color:var(--n7);margin:8px 0">Origen y destino</div>` +
        fpSelect('Centro de despacho de origen','',true) +
        `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><div class="swt" onclick="this.classList.toggle('on')"></div><span style="font:400 13px var(--font-sans);color:var(--n7)">Auto-iniciar ruta</span></div>` +
        fpSelect('Centro de despacho de destino','') +
        `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><div class="swt" onclick="this.classList.toggle('on')"></div><span style="font:400 13px var(--font-sans);color:var(--n7)">Auto-finalizar ruta</span></div>`
      ) +
      blockTwoCol(
        'Restricciones',
        fpInp('Límite de dinero','') + fpSelect('Velocidad promedio','') + fpInp('Tiempo de recarga en CD','') + fpInp('Tiempo máximo de conducción','') + fpInp('Distancia máxima por ruta (km)','') + fpInp('Máximas paradas por ruta','') + fpInp('Máximas rutas',''),
        'Costos',
        fpInp('Costos de salida','') + fpInp('Costo por kilómetro','') + fpInp('Costo por viaje','') + fpInp('Costo por hora','')
      ) +
      blockSingle('Etiquetas',
        fpSelect('Grupo de etiquetas','') + fpInp('Etiquetas','')
      ),
      'Vehículos'
    );

    return `
      ${sbStyle}
      ${sectionHeader(data)}

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 6px" data-i18n="ui.pageShell">Page shell</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6" data-i18n="ui.pageShellDesc">
        Every form page uses the same shell: <strong>Topbar</strong> → <strong>Sidebar</strong> → content area with breadcrumb, ← back + title + <em>Cancelar/Guardar</em> buttons, required field note, and a vertical stack of blocks.
      </p>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:24px 0 6px" data-i18n="ui.blockCatalog">Block catalog</h3>
      <p style="font:400 13px var(--font-sans);color:var(--n5);margin:0 0 16px;line-height:1.6" data-i18n="ui.blockCatalogDesc">
        Compose any form by stacking blocks. Every block is a white card with <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">border-radius:8px · border:1px solid var(--n4) · padding:20px</code>. Blocks stack with <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">gap:16px</code>.
      </p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:36px">${catalogCards}</div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 4px">Sidebar estándar</h3>
      <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 16px">Colapsable — para páginas operativas (órdenes, rutas, flota)</p>

      <h4 style="font:600 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Nuevo usuario web — two-col + single + custom-fields</h4>
      <div style="margin-bottom:20px">${ex1}</div>

      <h4 style="font:600 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Nuevo usuario móvil — two-col + switches + custom-fields</h4>
      <div style="margin-bottom:28px">${ex2}</div>

      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 4px">Sidebar de ajustes</h3>
      <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0 0 16px">Siempre expandido — para páginas de configuración (usuarios, vehículos, geocercas…)</p>

      <h4 style="font:600 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Crear Geocerca — input-map con mapa Leaflet</h4>
      <div style="margin-bottom:20px">${ex3}</div>

      <h4 style="font:600 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Nuevo usuario web — two-col + single + custom-fields</h4>
      <div style="margin-bottom:20px">${ex4}</div>

      <h4 style="font:600 13px var(--font-sans);color:var(--n7);margin:0 0 4px">Nuevo vehículo — two-col × 2 + single</h4>
      <div style="margin-bottom:28px">${ex5}</div>
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

/* ================================================================
   MOBILE DS (Drivers App) — helpers + renderers
   Prefijo de componentes: DTM (DispatchTrack Mobile)
================================================================ */

/* Marco de teléfono para previews móviles (360px de ancho de referencia) */
function mPhone(content, opts = {}) {
  const w = opts.width || 360;
  return `<div style="width:${w}px;max-width:100%;flex-shrink:0;background:var(--n1);border:1px solid var(--n3);border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(19,32,69,.08);display:flex;flex-direction:column${opts.height ? `;height:${opts.height}px` : ''}">${content}</div>`;
}

/* Escenario gris para mostrar componentes sueltos */
function mStage(inner, opts = {}) {
  return `<div style="background:var(--n1);border:1px solid var(--n3);border-radius:8px;padding:${opts.pad || '20px'};display:flex;gap:${opts.gap || '16px'};flex-wrap:wrap;align-items:${opts.align || 'flex-start'};${opts.col ? 'flex-direction:column;' : ''}margin-bottom:14px">${inner}</div>`;
}

/* Etiqueta de bloque (caption uppercase) */
function mLabel(t) {
  return `<div style="font:700 11px var(--font-sans);letter-spacing:.07em;text-transform:uppercase;color:var(--n5);margin:18px 0 10px">${t}</div>`;
}

/* Tabla de especificaciones para developers iOS/Android */
function mSpecTable(rows) {
  const tr = rows.map(r => `<tr>
    <td style="padding:7px 12px;border-bottom:1px solid var(--n2);font:600 12px var(--font-sans);color:var(--n7);white-space:nowrap">${escHtml(r[0])}</td>
    <td style="padding:7px 12px;border-bottom:1px solid var(--n2);font:400 12px/1.5 var(--font-mono,monospace);color:var(--n6)">${escHtml(r[1])}</td>
  </tr>`).join('');
  return `<div style="border:1px solid var(--n3);border-radius:8px;overflow:hidden;margin-bottom:14px"><table style="width:100%;border-collapse:collapse;background:#fff">${tr}</table></div>`;
}

/* Card de componente: título + tag + preview + specs */
function mComponentCard(name, tag, previewHtml, specRows, notes) {
  const TAGS = { NEW: ['#E3FCEF', '#006844'], EXTENDED: ['#EDF5FF', '#0052CC'], RULE: ['#FFFAE6', '#7A4A00'] };
  const tc = TAGS[tag] || TAGS.NEW;
  return `<div class="card" style="margin-bottom:20px">
    <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 12px;display:flex;align-items:center;gap:8px">${escHtml(name)}
      <span style="background:${tc[0]};color:${tc[1]};font:700 9px/1 var(--font-sans);letter-spacing:.04em;border-radius:99px;padding:4px 8px">${tag}</span>
    </h3>
    ${previewHtml}
    ${specRows && specRows.length ? mSpecTable(specRows) : ''}
    ${notes ? `<div style="font:400 12px/1.6 var(--font-sans);color:var(--n5)">${notes}</div>` : ''}
  </div>`;
}

/* ── Piezas móviles reutilizables entre previews ── */
function mIconBtn(icon, size = 20, color = 'var(--n7)') {
  return `<button style="width:48px;height:48px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${iconSvg(icon, size, color)}</button>`;
}

function mTopAppBar() {
  return `<div style="height:56px;background:#fff;border-bottom:1px solid var(--n3);display:flex;align-items:center;padding:0 4px;flex-shrink:0">
    ${mIconBtn('menu')}
    <div style="flex:1;display:flex;justify-content:center;min-width:0"><img src="sections/assets/logos/lastmile-mobile-color.svg" height="20" alt="LastMile"></div>
    ${mIconBtn('refresh')}
  </div>`;
}

function mDateNav(label) {
  const chev = (ic) => `<button style="width:24px;height:24px;border:none;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(19,32,69,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">${iconSvg(ic, 14, 'var(--n6)')}</button>`;
  return `<div style="margin:12px;height:32px;background:var(--n2);border-radius:99px;display:flex;align-items:center;justify-content:space-between;padding:0 4px">
    ${chev('chevron--left')}
    <span style="font:500 12px var(--font-sans);color:var(--n7)">${escHtml(label)}</span>
    ${chev('chevron--right')}
  </div>`;
}

function mPickupSelect(label) {
  return `<div style="margin:12px 12px 0;height:40px;background:#fff;border:1px solid var(--n3);border-radius:6px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer">
    <span style="font:400 14px var(--font-sans);color:var(--n6)">${escHtml(label)}</span>
    ${iconSvg('chevron--down', 16, 'var(--n5)')}
  </div>`;
}

/* ── DTMButton: variant = primary|outline|ghost|danger · state = default|pressed|disabled ── */
function mBtn(label, variant = 'primary', state = 'default', extra = '') {
  const V = {
    primary:  { default: 'background:var(--b6);color:#fff;border:none',
                pressed: 'background:var(--b7);color:#fff;border:none',
                disabled:'background:var(--n4);color:#fff;border:none' },
    outline:  { default: 'background:#fff;color:var(--b6);border:1px solid var(--b6)',
                pressed: 'background:var(--b1);color:var(--b6);border:1px solid var(--b6)',
                disabled:'background:#fff;color:var(--n4);border:1px solid var(--n4)' },
    ghost:    { default: 'background:transparent;color:var(--b6);border:none',
                pressed: 'background:var(--b1);color:var(--b6);border:none',
                disabled:'background:transparent;color:var(--n4);border:none' },
    danger:   { default: 'background:var(--r6);color:#fff;border:none',
                pressed: 'background:var(--r7);color:#fff;border:none',
                disabled:'background:var(--n4);color:#fff;border:none' },
  };
  const s = (V[variant] || V.primary)[state] || V.primary.default;
  return `<button style="height:40px;padding:0 20px;border-radius:100px;font:700 14px/1 var(--font-sans);${s};cursor:${state === 'disabled' ? 'not-allowed' : 'pointer'};display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;${extra}">${label}</button>`;
}

/* ── DTMTextInput (estático para previews): state = default|focus|filled|error|valid|disabled ── */
function mInput(label, value, state = 'default', helper = '', opts = {}) {
  const S = {
    default: 'border:1px solid var(--n3);background:#fff',
    focus:   'border:2px solid var(--b6);background:var(--b1)',
    filled:  'border:1px solid var(--n5);background:#fff',
    error:   'border:1px solid var(--r6);background:#fff',
    valid:   'border:1px solid var(--g5);background:#fff',
    disabled:'border:1px solid var(--n3);background:var(--n1)',
  };
  const isPlaceholder = state === 'default' || state === 'focus' || state === 'disabled';
  const right = state === 'valid' ? iconSvg('checkmark-filled', 16, 'var(--g6)') : (opts.rightIcon ? iconSvg(opts.rightIcon, 16, 'var(--n5)') : '');
  return `<div style="margin-bottom:14px">
    ${label ? `<div style="font:500 12px var(--font-sans);color:var(--n6);margin-bottom:5px">${escHtml(label)}</div>` : ''}
    <div style="height:44px;border-radius:6px;${S[state] || S.default};display:flex;align-items:center;justify-content:space-between;padding:0 12px;box-sizing:border-box">
      <span style="font:400 14px var(--font-sans);color:${isPlaceholder ? 'var(--n6)' : 'var(--n7)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(value)}</span>${right}
    </div>
    ${helper ? `<div style="font:400 12px var(--font-sans);color:${state === 'error' ? 'var(--r6)' : 'var(--n5)'};margin-top:4px">${escHtml(helper)}</div>` : ''}
  </div>`;
}

/* ── DTMStepper: trash=true muestra basurero en el mínimo ── */
function mStepper(value, opts = {}) {
  const btn = (inner, danger) => `<button style="width:32px;height:32px;border:1px solid ${danger ? 'var(--r6)' : 'var(--n3)'};border-radius:6px;background:${danger ? 'var(--r6)' : '#fff'};display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font:500 16px var(--font-sans);color:var(--n6)">${inner}</button>`;
  const minus = opts.trash ? btn(iconSvg('delete', 14, '#fff'), true) : btn('−');
  return `<span style="display:inline-flex;align-items:center;gap:0;border-radius:6px">${minus}<span style="min-width:40px;text-align:center;font:500 14px var(--font-sans);color:var(--n7)">${value}</span>${btn('+')}</span>`;
}

/* ── Pin numerado de orden (pastilla cuadrada, radio 4) ──
   default  = orden actual: fondo var(--b6), número blanco
   outline  = otras órdenes: fondo blanco, borde 1px var(--b6), número var(--b6) */
function mPin(num, variant = 'default') {
  const V = {
    default: 'background:var(--b6);color:#fff;border:1px solid var(--b6)',
    outline: 'background:#fff;color:var(--b6);border:1px solid var(--b6)',
    muted:   'background:var(--n4);color:#fff;border:1px solid var(--n4)',
  };
  if (variant === 'error') return `<span style="width:22px;height:22px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--r6)">${iconSvg('close-filled', 14, '#fff')}</span>`;
  return `<span style="width:22px;height:22px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font:700 12px var(--font-sans);${V[variant] || V.default}">${num}</span>`;
}

/* ── Icono de estado de gestión (círculo) ── */
function mStatusIcon(state) {
  const M = {
    delivered: ['var(--g6)', 'checkmark-filled'],
    partial:   ['var(--o5)', 'warning'],
    failed:    ['var(--r6)', 'close-filled'],
  };
  const m = M[state];
  if (!m) return '';
  return `<span style="flex-shrink:0">${iconSvg(m[1], 20, m[0])}</span>`;
}

/* metadata con icono pequeño */
function mMeta(icon, text) {
  return `<span style="display:inline-flex;align-items:center;gap:3px;color:var(--n5);font:400 12px var(--font-sans)">${iconSvg(icon, 14, 'var(--n5)')}${escHtml(text)}</span>`;
}

/* ── Chip de campo personalizado (pill gris con dot) ── */
function mCustomFieldChip(label = 'Campo personalizado') {
  return `<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:2px 8px;border-radius:4px;background:var(--n2);font:600 11px var(--font-sans);color:var(--n6);white-space:nowrap">
    <span style="width:6px;height:6px;border-radius:50%;background:var(--n5)"></span>${escHtml(label)}</span>`;
}

/* ── DTMOrderCard ──
   o = {num, addr, order, person, time, items, custom, state, selected, pin} ·
   pin: 'default' (orden actual, azul) | 'outline' (otras órdenes) */
function mOrderCard(o = {}) {
  const state = o.state || 'default';
  const errored = state === 'error';
  const selected = o.selected;
  const border = selected ? '2px solid var(--b6)' : '1px solid var(--n3)';
  const pinVariant = errored ? 'error' : (o.pin || 'default');
  const leftIcon = ['delivered', 'partial', 'failed'].includes(state) ? mStatusIcon(state) : mPin(o.num != null ? o.num : 1, pinVariant);
  const checkbox = selected != null
    ? `<span style="width:18px;height:18px;border-radius:4px;flex-shrink:0;${selected ? 'background:var(--b6);border:none' : 'background:#fff;border:1.5px solid var(--n4)'};display:inline-flex;align-items:center;justify-content:center">${selected ? iconSvg('check', 12, '#fff') : ''}</span>`
    : '';
  const badges = `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:6px 0">
    ${o.statusBadge !== false ? badgeHtml('Entrega', 'info') : ''}
    ${o.custom !== false ? mCustomFieldChip() : ''}
  </div>`;
  const meta = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    ${o.person ? mMeta('user', o.person) : ''}
    ${o.time ? mMeta('time', o.time) : ''}
    ${o.items != null ? mMeta('package', String(o.items)) : ''}
  </div>`;
  return `<div style="background:#fff;border:${border};border-radius:8px;padding:12px;display:flex;gap:10px;align-items:flex-start">
    ${leftIcon}
    <div style="flex:1;min-width:0">
      <div style="font:700 14px/1.35 var(--font-sans);color:${errored ? 'var(--r6)' : 'var(--n7)'}">${escHtml(o.addr || '')}</div>
      ${o.order ? `<div style="font:600 11px var(--font-sans);color:var(--n6);margin-top:2px">${escHtml(o.order)}</div>` : ''}
      ${errored ? `<div style="font:600 12px var(--font-sans);color:var(--r6);margin-top:4px;display:flex;align-items:center;gap:5px">${iconSvg('warning', 14, 'var(--r6)')}Dirección no verificada</div>` : badges}
      ${!errored ? meta : ''}
    </div>
    ${checkbox}
  </div>`;
}

/* ── Pestañas En ruta / Terminadas ── */
function mRouteTabs(active = 0, enroute = 12, done = 0) {
  const tab = (on, icon, label) => `<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:40px;font:${on ? 700 : 400} 14px var(--font-sans);color:${on ? 'var(--b6)' : 'var(--n5)'};border-bottom:2px solid ${on ? 'var(--b6)' : 'transparent'}">${iconSvg(icon, 16, on ? 'var(--b6)' : 'var(--n5)')}${label}</div>`;
  return `<div style="display:flex;border-bottom:1px solid var(--n2);background:#fff">
    ${tab(active === 0, 'truck', `En ruta: ${enroute}`)}
    ${tab(active === 1, 'task-complete', `Terminadas: ${done}`)}
  </div>`;
}

/* ── Chip genérico (grupo / filtro) ── */
function mChip(label, opts = {}) {
  const sel = opts.selected;
  const colors = {
    blue:  ['var(--b6)', '#fff'],
    amber: ['var(--o1)', 'var(--o7)'],
  };
  if (sel) {
    const [bg, fg] = colors[opts.tone || 'blue'];
    return `<span style="height:28px;padding:0 10px;border-radius:6px;background:${bg};color:${fg};font:500 12px var(--font-sans);display:inline-flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0">${escHtml(label)}<span style="opacity:.8">✕</span></span>`;
  }
  return `<span style="height:28px;padding:0 10px;border-radius:6px;background:#fff;border:1px solid var(--n3);color:var(--n6);font:500 12px var(--font-sans);display:inline-flex;align-items:center;white-space:nowrap;flex-shrink:0">${escHtml(label)}</span>`;
}

/* fila scrolleable de chips */
function mChipRow(chips) {
  return `<div style="display:flex;gap:6px;overflow-x:auto;padding:10px 12px;background:#fff">${chips}</div>`;
}

/* separador de lista */
function mDivider(text, tone = 'gray') {
  const bg = tone === 'blue' ? 'var(--b1)' : 'var(--n1)';
  return `<div style="padding:6px 12px;background:${bg};font:700 12px var(--font-sans);color:var(--n6)">${text}</div>`;
}

/* etiqueta de sincronización */
function mSyncLabel(state) {
  if (state === 'syncing') return `<span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:4px;background:var(--g1);color:var(--g7);font:600 11px var(--font-sans)">${iconSvg('refresh', 12, 'var(--g7)')}Sincronizando</span>`;
  return `<span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:4px;background:var(--n2);color:var(--n5);font:600 11px var(--font-sans)">${iconSvg('ban', 12, 'var(--n5)')}Sin sincronizar</span>`;
}

/* ── Fondo de mapa simulado (reutilizado en sheets y maps) ── */
function mMapBg(h = 160) {
  return `<div style="height:${h}px;background:
    repeating-linear-gradient(0deg,#E8EAED 0 1px,transparent 1px 28px),
    repeating-linear-gradient(90deg,#E8EAED 0 1px,transparent 1px 28px),
    linear-gradient(135deg,#EDEFF2,#E3E6EB);position:relative;overflow:hidden">
    <div style="position:absolute;top:30%;left:-5%;width:60%;height:5px;background:var(--b5);border-radius:3px;transform:rotate(18deg)"></div>
    <div style="position:absolute;top:55%;left:25%;width:55%;height:5px;background:var(--b5);border-radius:3px;transform:rotate(-12deg)"></div>
    <div style="position:absolute;top:40%;left:35%;width:30%;height:5px;background:var(--o5);border-radius:3px;transform:rotate(40deg)"></div>
  </div>`;
}

/* ── Pin de mapa en forma de gota (numerado / estado) ── */
function mMapPin(label, opts = {}) {
  const bg = opts.bg || 'var(--b6)';
  const sel = opts.selected;
  const size = sel ? 34 : 26;
  return `<span style="position:relative;display:inline-flex;flex-direction:column;align-items:center">
    <span style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:2px solid #fff;box-shadow:0 1px 3px rgba(19,32,69,.3);display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);color:#fff;font:700 ${sel ? 13 : 11}px var(--font-sans);display:flex;align-items:center;justify-content:center">${opts.icon ? iconSvg(opts.icon, 14, '#fff') : label}</span>
    </span>
  </span>`;
}

/* ── Toggle switch ── */
function mToggle(on) {
  return `<span style="width:36px;height:20px;border-radius:99px;background:${on ? 'var(--b6)' : 'var(--n4)'};position:relative;display:inline-block;flex-shrink:0">
    <span style="position:absolute;top:2px;${on ? 'right:2px' : 'left:2px'};width:16px;height:16px;border-radius:50%;background:#fff"></span>
  </span>`;
}

/* ── Header de ruta del bottom sheet ── */
function mRouteHeader(opts = {}) {
  const handle = `<div style="display:flex;justify-content:center;padding:8px 0 4px"><span style="width:36px;height:4px;border-radius:99px;background:var(--n3)"></span></div>`;
  const lead = opts.back
    ? iconSvg('arrow-left', 20, 'var(--n7)')
    : `<div><div style="font:400 11px var(--font-sans);color:var(--n5)">Ruta</div><div style="font:700 14px var(--font-sans);color:var(--n7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${escHtml(opts.title || '332131491204912')}</div></div>`;
  return `${handle}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 12px 8px;gap:8px">
      <div style="flex:1;min-width:0;display:flex;align-items:center;gap:10px">${opts.back ? lead + `<span style="font:700 14px var(--font-sans);color:var(--n7)">${escHtml(opts.title || '')}</span>` : lead}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">${iconSvg('search', 20, 'var(--n6)')}${iconSvg('overflow-menu-vertical', 20, 'var(--n6)')}</div>
    </div>
    ${opts.meta !== false ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 12px 10px">${mMeta('package', '12 órdenes')}${mMeta('package', '200 items')}${mMeta('time', '8:00 – 17:00')}${mMeta('time', '4hrs 19min')}</div>` : ''}`;
}

/* ── Toast oscuro flotante ── */
function mToast(text, tone = 'success', close = true) {
  const C = { success: ['checkmark-filled', 'var(--g4)'], error: ['close-filled', 'var(--r4)'], warning: ['warning', 'var(--o5)'], info: ['help-circle', 'var(--b4)'] };
  const c = C[tone] || C.success;
  return `<div style="background:var(--n7);border-radius:8px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;box-shadow:0 4px 16px rgba(19,32,69,.24)">
    ${iconSvg(c[0], 16, c[1])}
    <span style="flex:1;font:400 12px/1.4 var(--font-sans);color:#fff">${escHtml(text)}</span>
    ${close ? iconSvg('close-filled', 14, 'var(--n4)') : ''}
  </div>`;
}

/* ── Banner inline (warning / info) ── */
function mBanner(text, tone = 'warning') {
  const C = { warning: ['var(--o1)', 'var(--o7)', 'warning', 'var(--o5)'], info: ['var(--b1)', 'var(--n7)', 'help-circle', 'var(--b6)'] };
  const c = C[tone] || C.warning;
  return `<div style="background:${c[0]};border-radius:6px;padding:12px;display:flex;align-items:flex-start;gap:8px">
    ${iconSvg(c[2], 16, c[3])}
    <span style="flex:1;font:400 12px/1.5 var(--font-sans);color:${c[1]}">${escHtml(text)}</span>
  </div>`;
}

/* ── Fila de requisito (acordeón de gestión / PoD) ──
   o = {icon, label, sub, state:'required'|'done'|'default', preview} */
function mReqRow(o = {}) {
  const right = o.state === 'done'
    ? iconSvg('checkmark-filled', 18, 'var(--g6)')
    : (o.state === 'required' ? badgeHtml('Requerido', 'warning') : iconSvg('chevron--right', 16, 'var(--n5)'));
  return `<div style="display:flex;align-items:center;gap:12px;padding:14px 12px;border-bottom:1px solid var(--n2)">
    ${o.icon ? iconSvg(o.icon, 18, 'var(--n6)') : ''}
    <div style="flex:1;min-width:0">
      <div style="font:700 14px var(--font-sans);color:var(--n7)">${escHtml(o.label || '')}</div>
      ${o.sub ? `<div style="font:400 12px var(--font-sans);color:var(--n5);margin-top:2px">${escHtml(o.sub)}</div>` : ''}
    </div>
    ${o.preview || ''}
    ${right}
  </div>`;
}

/* ── Tira de thumbnails de foto con contador ── */
function mPhotoStrip(count = 4, max = 10) {
  const thumbs = Array.from({ length: count }, (_, i) => `<span style="width:44px;height:44px;border-radius:6px;background:linear-gradient(135deg,#C8D0DC,#9aa7b8);position:relative;flex-shrink:0">${i === count - 1 ? `<span style="position:absolute;top:-4px;right:-4px">${iconSvg('checkmark-filled', 14, 'var(--g6)')}</span>` : ''}</span>`).join('');
  return `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
    <span style="width:44px;height:44px;border-radius:6px;border:1.5px dashed var(--n4);display:flex;align-items:center;justify-content:center;flex-shrink:0">${iconSvg('camera', 18, 'var(--n5)')}</span>
    ${thumbs}
    <span style="font:600 12px var(--font-sans);color:var(--n5);margin-left:4px">${count}/${max}</span>
  </div>`;
}

/* ── Trazo de firma simulado ── */
function mSignatureStroke(color = 'var(--b6)') {
  return `<svg viewBox="0 0 200 70" style="width:140px;height:50px"><path d="M8,50 C20,10 30,60 42,38 C52,20 60,55 72,40 C88,20 96,58 110,35 C120,18 128,52 140,40 C150,30 160,46 175,22 L172,40 L185,30" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ── Selector de estado (segmented de 3/2 partes conectadas) ──
   options = [{label, icon, tone}], selectedIndex · alto 64px, texto en una línea ── */
function mStatusSelector(options, selectedIndex) {
  const TONE = {
    g: ['var(--g1)', 'var(--g5)', 'var(--g7)'],
    o: ['var(--o1)', 'var(--o5)', 'var(--o7)'],
    r: ['var(--r1)', 'var(--r6)', 'var(--r6)'],
  };
  const seg = options.map((opt, i) => {
    const sel = i === selectedIndex;
    const t = TONE[opt.tone] || TONE.g;
    // divisor entre segmentos: solo si ni este ni el siguiente están seleccionados
    const showDivider = i < options.length - 1 && !sel && (i + 1) !== selectedIndex;
    const base = 'flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-sizing:border-box';
    if (sel) {
      return `<div style="${base};margin:-1px;border:1.5px solid ${t[1]};background:${t[0]};border-radius:12px">
        ${iconSvg(opt.icon, 18, t[2])}
        <span style="font:600 13px/1 var(--font-sans);color:${t[2]};white-space:nowrap">${escHtml(opt.label)}</span>
      </div>`;
    }
    return `<div style="${base};${showDivider ? 'border-right:1px solid var(--n3)' : ''}">
      ${iconSvg(opt.icon, 18, 'var(--n4)')}
      <span style="font:400 13px/1 var(--font-sans);color:var(--n6);white-space:nowrap">${escHtml(opt.label)}</span>
    </div>`;
  }).join('');
  return `<div style="display:flex;height:64px;border:1px solid var(--n3);border-radius:12px;background:#fff">${seg}</div>`;
}

/* Lista de reglas (viñetas) para secciones móviles */
function mRules(rules) {
  if (!rules || !rules.length) return '';
  return `<div class="card" style="margin-bottom:20px">
    <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 10px">Reglas de uso</h3>
    <ul style="margin:0;padding-left:18px">${rules.map(r => `<li style="font:400 13px/1.7 var(--font-sans);color:var(--n6);margin-bottom:4px">${escHtml(r)}</li>`).join('')}</ul>
  </div>`;
}

Object.assign(renderers, {

  /* ── App móvil · Introducción ── */
  mOverview(data) {
    const principles = (data.principles || []).map(p => `
      <div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px">
        <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:5px">${escHtml(p.title)}</div>
        <div style="font:400 12px/1.6 var(--font-sans);color:var(--n5)">${escHtml(p.desc)}</div>
      </div>`).join('');

    const tokenRows = (data.tokens || []).map(t => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid var(--n2);font:400 12px var(--font-sans);color:var(--n7)">${escHtml(t.use)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid var(--n2);font:500 12px var(--font-mono,monospace);color:var(--b7)">${escHtml(t.token)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid var(--n2)"><span style="display:inline-flex;align-items:center;gap:7px;font:400 12px var(--font-mono,monospace);color:var(--n6)"><span style="width:14px;height:14px;border-radius:4px;border:1px solid var(--n3);background:${t.value}"></span>${escHtml(t.value)}</span></td>
    </tr>`).join('');

    const platforms = (data.platformNotes || []).map(p => `
      <div style="flex:1;min-width:260px;background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px">
        <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:5px">${escHtml(p.platform)}</div>
        <div style="font:400 12px/1.6 var(--font-sans);color:var(--n5)">${escHtml(p.notes)}</div>
      </div>`).join('');

    const sections = (data.sections || []).map(s => `
      <a href="#${s.id}" onclick="navigate('${s.id}');return false" style="display:block;background:#fff;border:1px solid var(--n3);border-radius:8px;padding:14px 16px;text-decoration:none;transition:border-color .12s" onmouseenter="this.style.borderColor='var(--b6)'" onmouseleave="this.style.borderColor='var(--n3)'">
        <div style="font:700 13px var(--font-sans);color:var(--b7);margin-bottom:3px">${escHtml(s.label)}</div>
        <div style="font:400 12px/1.5 var(--font-sans);color:var(--n5)">${escHtml(s.desc)}</div>
      </a>`).join('');

    return `
      ${sectionHeader(data)}
      ${mLabel('Principios')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-bottom:10px">${principles}</div>
      ${mLabel('Tokens — uso en móvil')}
      <div style="border:1px solid var(--n3);border-radius:8px;overflow:hidden;margin-bottom:10px"><table style="width:100%;border-collapse:collapse;background:#fff">
        <tr><th style="text-align:left;padding:8px 12px;background:var(--n1);font:700 11px var(--font-sans);color:var(--n5);letter-spacing:.05em">USO</th><th style="text-align:left;padding:8px 12px;background:var(--n1);font:700 11px var(--font-sans);color:var(--n5);letter-spacing:.05em">TOKEN</th><th style="text-align:left;padding:8px 12px;background:var(--n1);font:700 11px var(--font-sans);color:var(--n5);letter-spacing:.05em">VALOR</th></tr>
        ${tokenRows}
      </table></div>
      ${mLabel('Plataformas')}
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px">${platforms}</div>
      ${mLabel('Secciones del DS móvil')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-bottom:24px">${sections}</div>`;
  },

  /* ── App móvil · Top app bar ── */
  mTopbar(data) {
    const c = data.components || {};
    const phoneBody = (extra) => mPhone(`${mTopAppBar()}${extra || ''}<div style="height:120px"></div>`, { width: 300 });

    const variants = mStage(`
      <div>${mLabel('Base')}${phoneBody('')}</div>
      <div>${mLabel('Con navegador de fecha')}${phoneBody(mDateNav('Rutas de hoy 01-01-24'))}</div>
      <div>${mLabel('Con punto de retiro')}${phoneBody(mPickupSelect('Selecciona tu punto de retiro') + mDateNav('Rutas de hoy 01-01-24'))}</div>
    `);

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.appBar.name, 'NEW', variants, c.appBar.specs,
        'El app bar vive solo en el Home de rutas y pantallas de primer nivel. Dentro de una ruta, el header del bottom sheet toma su lugar.')}
      ${mComponentCard(c.dateNav.name, 'NEW', mStage(`<div style="width:300px;background:var(--n1)">${mDateNav('Rutas de hoy 01-01-24')}</div>`), c.dateNav.specs,
        'Navega entre días de operación. El label siempre indica el contexto: «Rutas de hoy» + fecha corta.')}
      ${mComponentCard(c.pickupSelect.name, 'EXTENDED', mStage(`<div style="width:300px;background:var(--n1);padding-bottom:12px">${mPickupSelect('Selecciona tu punto de retiro')}</div>`), c.pickupSelect.specs,
        'Variante móvil del dropdown del DS (dt-drop-wrap). Aparece solo en cuentas con múltiples puntos de retiro.')}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Menú lateral ── */
  mNav(data) {
    const c = data.components || {};
    const ICONS = {
      'Agregar ruta': 'add', 'Crear ruta': 'add', 'Agregar orden': 'add',
      'Sincronizar datos': 'refresh', 'Historial de recaudo': 'receipt',
      'Historial de rutas por recepcionar': 'return',
      'Chat supervisor': 'message', 'Llamada de emergencia': 'phone',
      'Solicitudes co-piloto': 'group', 'Configuración': 'settings',
    };
    const item = (label, dot) => `<div style="height:48px;display:flex;align-items:center;gap:12px;padding:0 16px;cursor:pointer" onmouseenter="this.style.background='var(--n1)'" onmouseleave="this.style.background=''">
      ${iconSvg(ICONS[label] || 'document', 20, 'var(--n6)')}
      <span style="font:400 14px var(--font-sans);color:var(--n7)">${escHtml(label)}</span>
      ${dot ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--r6)"></span>' : ''}
    </div>`;
    const groupDivider = '<div style="height:1px;background:var(--n2);margin:8px 0"></div>';

    const profile = (expanded) => `
      <div style="padding:24px 16px 16px;border-bottom:1px solid var(--n2)">
        <img src="sections/assets/logos/lastmile-desktop-color.svg" height="18" alt="DispatchTrack LastMile" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--b1);display:flex;align-items:center;justify-content:center;font:700 13px var(--font-sans);color:var(--b7);flex-shrink:0">DT</div>
          <div style="flex:1;min-width:0">
            <div style="font:700 14px var(--font-sans);color:var(--n7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Diego Tapia – Wal…</div>
            <div style="font:400 12px var(--font-sans);color:var(--n5)">Código de negocio · 1234</div>
          </div>
          ${iconSvg(expanded ? 'chevron--down' : 'chevron--right', 16, 'var(--n5)')}
        </div>
        ${expanded ? `
          <div style="margin-top:10px;border-top:1px solid var(--n2)">
            ${['Perfil de usuario', 'Cambiar usuario'].map(l => `<div style="height:44px;display:flex;align-items:center;justify-content:space-between;font:400 14px var(--font-sans);color:var(--n7);cursor:pointer">${l}${iconSvg('chevron--right', 14, 'var(--n5)')}</div>`).join('')}
          </div>` : ''}
      </div>`;

    /* groups = array de grupos (cada grupo es un array de labels); divider entre grupos */
    const menuBody = (groups) => groups.map(g =>
      g.map(l => item(l, l === 'Solicitudes co-piloto')).join('')
    ).join(groupDivider) + groupDivider;

    /* Drawer al 75% del viewport + overlay 25% (rgba indigo .45) */
    const drawer = (groups, cta, expanded) => mPhone(`
      <div style="display:flex;height:640px;background:rgba(19,32,69,.45)">
        <div style="width:76.94%;background:#fff;display:flex;flex-direction:column">
          ${profile(expanded)}
          <div style="flex:1;padding:4px 0;overflow:hidden">${menuBody(groups)}</div>
          <div style="padding:16px 16px 24px">
            <button style="width:100%;height:40px;border-radius:99px;border:1px solid var(--b6);background:#fff;color:var(--b6);font:700 14px var(--font-sans);cursor:pointer">${cta}</button>
          </div>
        </div>
        <div style="flex:1"></div>
      </div>`, { width: 340 });

    const menus = data.menus || {};
    const variants = mStage(`
      <div>${mLabel('Sin ruta iniciada')}${drawer(menus.noRoute || [], 'Cerrar sesión', false)}</div>
      <div>${mLabel('Con ruta activa')}${drawer(menus.onRoute || [], 'Finalizar ruta', false)}</div>
      <div>${mLabel('Perfil expandido')}${drawer((menus.onRoute || []).slice(0, 2), 'Finalizar ruta', true)}</div>
    `);

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.drawer.name, 'NEW', variants, c.drawer.specs,
        'Los iconos son IBM Carbon 20px. El orden de los ítems es fijo y está definido por producto — no se reordena por cuenta.')}
      ${mComponentCard(c.profile.name, 'NEW', '', c.profile.specs,
        'El bloque de perfil soporta multi-cuenta: al expandir se accede a «Perfil de usuario» y «Cambiar usuario» (lista de empresas con logo y código de negocio).')}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Botones ── */
  mButtons(data) {
    const c = data.components || {};

    /* Matriz variante × estado */
    const VARIANTS = [['primary', 'Primario'], ['outline', 'Secundario'], ['ghost', 'Ghost'], ['danger', 'Danger']];
    const STATES = [['default', 'Default'], ['pressed', 'Pressed'], ['disabled', 'Disabled']];
    const matrix = `<div style="display:grid;grid-template-columns:90px repeat(3,1fr);gap:10px;align-items:center;background:#fff;border:1px solid var(--n3);border-radius:8px;padding:16px;margin-bottom:14px;max-width:560px">
      <span></span>${STATES.map(s => `<span style="font:700 10px var(--font-sans);letter-spacing:.06em;color:var(--n5);text-align:center">${s[1].toUpperCase()}</span>`).join('')}
      ${VARIANTS.map(v => `<span style="font:600 12px var(--font-sans);color:var(--n7)">${v[1]}</span>` + STATES.map(s => `<div style="text-align:center">${mBtn('Cancelar', v[0], s[0])}</div>`).join('')).join('')}
    </div>`;

    /* Full width + par */
    const layouts = mStage(`
      <div style="width:300px">
        ${mLabel('Full width — CTA de pantalla')}
        <div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${mBtn('Iniciar ruta', 'primary', 'default', 'width:100%')}</div>
        ${mLabel('Par de acciones')}
        <div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px;display:flex;gap:12px">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Confirmar', 'primary', 'default', 'flex:1')}</div>
        ${mLabel('Par con primario deshabilitado (formulario incompleto)')}
        <div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px;display:flex;gap:12px">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Confirmar', 'primary', 'disabled', 'flex:1')}</div>
      </div>`);

    /* Botones de icono circulares */
    const circle = (style, icon, color) => `<button style="width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;${style}">${iconSvg(icon, 20, color)}</button>`;
    const iconBtns = mStage(`
      ${circle('background:var(--b6);border:none', 'planner-route', '#fff')}
      ${circle('background:#fff;border:1px solid var(--b6)', 'planner-route', 'var(--b6)')}
      ${circle('background:#fff;border:none;box-shadow:0 1px 4px rgba(19,32,69,.18)', 'location', 'var(--n6)')}
      ${circle('background:var(--r6);border:none', 'close-filled', '#fff')}
      ${circle('background:var(--n3);border:none;cursor:not-allowed', 'planner-route', 'var(--n4)')}
    `, { align: 'center' });

    /* Chips de acción rápida */
    const chip = (icon, label) => `<button style="height:32px;padding:0 12px;border-radius:99px;background:#fff;border:1px solid var(--n3);display:inline-flex;align-items:center;gap:6px;font:500 12px var(--font-sans);color:var(--b6);cursor:pointer">${iconSvg(icon, 14, 'var(--b6)')}${label}</button>`;
    const chips = mStage(`${chip('phone', 'Llamar')}${chip('location', 'Llegando')}${chip('time', 'Atrasado')}`, { align: 'center' });

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.button.name, 'EXTENDED', matrix, c.button.specs,
        'Misma forma pill y tokens del botón de escritorio, con alto 40dp para target táctil móvil. El estado pressed reemplaza al hover.')}
      ${mComponentCard(c.pair.name, 'NEW', layouts, c.pair.specs)}
      ${mComponentCard(c.iconButton.name, 'NEW', iconBtns, c.iconButton.specs,
        'De izquierda a derecha: primario relleno, outline, ghost con sombra (sobre mapa), danger y disabled.')}
      ${mComponentCard(c.quickChip.name, 'NEW', chips, c.quickChip.specs,
        'Viven bajo la información de entrega en el detalle de orden. Disparan acciones de un toque sin abrir formularios.')}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Cards ── */
  mCards(data) {
    const c = data.components || {};
    const addr = 'Martín de Zamora 5760, 7560969, Las Condes, Región Metropolitana';
    const wrap = (label, inner) => `<div style="width:320px">${mLabel(label)}${inner}</div>`;

    /* Order card — estados */
    const orderStates = mStage(`
      ${wrap('Orden actual (pin azul)', mOrderCard({ num: 1, addr, order: 'Orden #3829183901234564', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 }))}
      ${wrap('Otra orden (pin borde azul)', mOrderCard({ num: 2, pin: 'outline', addr, order: 'Orden #3829183901234564', person: 'Ana López', time: '9:00 – 9:30', items: 1 }))}
      ${wrap('Seleccionada', mOrderCard({ num: 3, pin: 'outline', addr, order: 'Orden #3829183901234564', person: 'Ana Álvarez', time: '8:00 – 17:00', items: 3, selected: true }))}
      ${wrap('Sin georeferencia (error)', mOrderCard({ addr: 'Lux 45, Las Condes, Región Metropolitana', order: 'Orden #3829183901234564', state: 'error' }))}
    `);

    /* Lista de órdenes — gap 8 entre cards, orden actual + otras */
    const orderList = mStage(wrap('Lista de órdenes (gap 8 · 1 actual + otras)', `<div style="display:flex;flex-direction:column;gap:8px">
      ${mOrderCard({ num: 1, addr, order: 'Orden #3829183901234564', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 })}
      ${mOrderCard({ num: 2, pin: 'outline', addr: 'Av. Las Condes 8977 Casa A, Las Condes, Región Metropolitana', order: 'Orden #3829183901840564', person: 'Ana López', time: '9:00 – 9:30', items: 1 })}
      ${mOrderCard({ num: 3, pin: 'outline', addr, order: 'Orden #3829183901471454571', person: 'Pedro Gómez', time: '9:00 – 10:00', items: 3 })}
    </div>`));
    const orderStatus = mStage(`
      ${wrap('Terminada · Entregado', mOrderCard({ state: 'delivered', addr, order: 'Orden #3829183901234564', person: 'Ana Álvarez', time: '8:00 – 17:00', items: 3 }))}
      ${wrap('Terminada · Parcial', mOrderCard({ state: 'partial', addr, order: 'Orden #3829183901234564', person: 'Pedro Pérez', time: '8:00 – 17:00', items: 10 }))}
      ${wrap('Terminada · No entregado', mOrderCard({ state: 'failed', addr, order: 'Orden #3829183901234564', person: 'Pedro Pérez', time: '8:00 – 17:00', items: 10 }))}
    `);

    /* Route card */
    const routeCard = (opts) => {
      const muted = opts.muted;
      const tc = muted ? 'var(--n5)' : 'var(--n7)';
      return `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:14px">
        <div style="font:400 11px var(--font-sans);color:var(--n5)">Ruta</div>
        <div style="font:700 14px var(--font-sans);color:${tc};display:flex;align-items:center;gap:8px">${escHtml(opts.title)}${muted ? badgeHtml('Sin iniciar', 'neutral') : ''}</div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 ${opts.cta ? '14px' : '0'}">
          ${mMeta('truck', 'VEH 123')}${mMeta('package', '12 órdenes')}${mMeta('package', '200 items')}${muted ? mMeta('location', '50 km') : ''}${mMeta('time', '8:00 – 17:00')}
        </div>
        ${opts.cta ? mBtn('Iniciar ruta', 'primary', 'default', 'width:100%') : ''}
      </div>`;
    };
    const routes = mStage(`
      ${wrap('Con CTA Iniciar', routeCard({ title: '332131491204912', cta: true }))}
      ${wrap('Nombre asignado', routeCard({ title: 'Sector oriente 2040 mañana', cta: true }))}
      ${wrap('Sin iniciar (deshabilitada)', routeCard({ title: '332131491204912', muted: true }))}
    `);

    /* Item card */
    /* check = null (sin checkbox) | false (vacío) | true (marcado) ·
       con checkbox: checkbox arriba-derecha + lápiz editar abajo-derecha */
    const itemCard = (check) => {
      const hasCheck = check !== null && check !== undefined;
      const checkbox = check === true
        ? `<span style="width:18px;height:18px;border-radius:4px;background:var(--b6);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${iconSvg('check', 12, '#fff')}</span>`
        : (check === false ? `<span style="width:18px;height:18px;border-radius:4px;border:1.5px solid var(--n4);background:#fff;flex-shrink:0"></span>` : '');
      return `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="font:700 13px/1.3 var(--font-sans);color:var(--n7)">ZAPATILLAS HOOPS 3.0 LOW CLASSIC VINTAGE</div>
          ${hasCheck ? checkbox : iconSvg('edit', 16, 'var(--b6)')}
        </div>
        <div style="font:400 12px var(--font-sans);color:var(--n5);margin:4px 0">SKU: 9AS-345345 -234234</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
          <span style="font:500 12px var(--font-sans);color:var(--n6)">Cantidad <b style="color:var(--n7)">12</b>&nbsp;&nbsp;Entregado <b style="color:var(--n7)">12</b></span>
          ${hasCheck ? iconSvg('edit', 16, 'var(--b6)') : ''}
        </div>
      </div>`;
    };
    const items = mStage(`
      ${wrap('Con editar', itemCard(null))}
      ${wrap('Seleccionada (escaneo)', itemCard(true))}
    `);

    /* Collect card */
    const collectRow = (id, amount, positive) => `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="font:500 12px var(--font-sans);color:var(--n7)">${id}</div>
      <div style="font:700 14px var(--font-sans);color:${positive ? 'var(--g6)' : 'var(--r6)'};margin:4px 0">$ ${positive ? '+' : '−'} ${amount} clp</div>
      <div style="display:inline-flex;align-items:center;gap:4px;font:400 12px var(--font-sans);color:var(--n5)">${iconSvg('calendar', 14, 'var(--n5)')}2026-10-24 · 17:00</div>
    </div>`;
    const collect = mStage(wrap('Historial de recaudo', collectRow('1. #2453453452345343…', '40.000', true) + collectRow('2. #3453453452345343…', '19.000', false)));

    /* Group card */
    const groupCard = `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;overflow:hidden">
      <div style="background:var(--b1);padding:6px 12px;font:700 12px var(--font-sans);color:var(--n7)">4 órdenes</div>
      <div style="padding:12px">
        <div style="font:700 13px var(--font-sans);color:var(--n7);margin-bottom:6px">Categoría A</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          ${mCustomFieldChip()}${mCustomFieldChip('Otro campo')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          ${mMeta('user', 'Raúl Ríos, Marta Morales, Camilo C…')}
          ${mMeta('package', '22')}
        </div>
      </div>
    </div>`;
    const group = mStage(wrap('Agrupación', groupCard));

    /* Service unit */
    const su = `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;overflow:hidden">
      <div style="padding:12px">
        <div style="font:700 14px var(--font-sans);color:var(--n7);margin-bottom:8px">Service Unit 1</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${mMeta('location', '245 Cooper Square, New York, NY, 1…')}
          <div style="display:flex;gap:10px">${mMeta('truck', 'VEH 123')}${mMeta('location', '3 stops')}${mMeta('package', '12 orders')}</div>
          ${mMeta('time', '8:00 – 17:00')}
        </div>
      </div>
      <div style="background:var(--n1);padding:8px 12px;border-top:1px solid var(--n2);display:inline-flex;align-items:center;gap:5px;width:100%;box-sizing:border-box;font:500 12px var(--font-sans);color:var(--n6)">${iconSvg('time', 14, 'var(--n6)')}Scheduled Departure 9:00 AM</div>
    </div>`;
    const serviceUnit = mStage(wrap('Service unit', su));

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.orderCard.name, 'NEW', orderStates + orderList + orderStatus, c.orderCard.specs,
        'Unidad base de la operación. El pin refleja la parada; el icono de estado solo aparece en órdenes ya gestionadas. La selección usa checkbox + borde azul.')}
      ${mComponentCard(c.routeCard.name, 'NEW', routes, c.routeCard.specs)}
      ${mComponentCard(c.itemCard.name, 'NEW', items, c.itemCard.specs)}
      ${mComponentCard(c.collectCard.name, 'NEW', collect, c.collectCard.specs)}
      ${mComponentCard(c.groupCard.name, 'NEW', group, c.groupCard.specs)}
      ${mComponentCard(c.serviceUnit.name, 'NEW', serviceUnit, c.serviceUnit.specs)}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Mapa ── */
  mMaps(data) {
    const c = data.components || {};
    const wrap = (label, inner, w) => `<div style="width:${w || 300}px">${mLabel(label)}${inner}</div>`;

    /* Pins */
    const pinStage = mStage(`
      <div style="display:flex;align-items:flex-end;gap:18px">
        <div style="text-align:center">${mMapPin('3')}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Numerado</div></div>
        <div style="text-align:center">${mMapPin('1', { selected: true })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Seleccionado</div></div>
        <div style="text-align:center">${mMapPin('5', { bg: 'var(--n4)' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Inactivo</div></div>
        <div style="text-align:center">${mMapPin('2', { bg: 'var(--o5)' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Actual</div></div>
        <div style="text-align:center">${mMapPin('', { icon: 'location' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Start</div></div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:18px;margin-top:18px">
        <div style="text-align:center">${mMapPin('', { bg: 'var(--g6)', icon: 'checkmark-filled' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Entregado</div></div>
        <div style="text-align:center">${mMapPin('', { bg: 'var(--o5)', icon: 'ban' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Parcial</div></div>
        <div style="text-align:center">${mMapPin('', { bg: 'var(--r6)', icon: 'close-filled' })}<div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">No entregado</div></div>
        <div style="text-align:center"><span style="width:30px;height:30px;border-radius:50%;background:var(--b6);border:2px solid #fff;box-shadow:0 1px 3px rgba(19,32,69,.3);color:#fff;font:700 12px var(--font-sans);display:inline-flex;align-items:center;justify-content:center">12</span><div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:6px">Cluster</div></div>
      </div>
    `, { align: 'flex-start', col: true });

    /* FABs sobre mapa */
    const fab = (bg, icon, color) => `<span style="width:44px;height:44px;border-radius:50%;background:${bg};box-shadow:0 2px 6px rgba(19,32,69,.2);display:flex;align-items:center;justify-content:center">${iconSvg(icon, 20, color)}</span>`;
    const mapWithFabs = mPhone(`<div style="position:relative">${mMapBg(280)}
      <div style="position:absolute;right:12px;bottom:12px;display:flex;flex-direction:column;gap:10px">
        ${fab('#fff', 'gps', 'var(--n6)')}
        ${fab('#fff', 'maximize', 'var(--n6)')}
        ${fab('var(--b6)', 'navigation', '#fff')}
      </div>
      <div style="position:absolute;left:30%;top:35%">${mMapPin('1', { selected: true })}</div>
      <div style="position:absolute;left:55%;top:25%">${mMapPin('2')}</div>
      <div style="position:absolute;left:45%;top:60%">${mMapPin('3', { bg: 'var(--n4)' })}</div>
    </div>`, { width: 280 });
    const fabsStage = mStage(wrap('FABs y pins sobre el mapa', mapWithFabs, 280));

    /* Nav widget */
    const navWidget = `<div style="background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(19,32,69,.18);overflow:hidden">
      <div style="padding:12px;display:flex;gap:10px;align-items:flex-start">
        ${mPin(1)}
        <div style="flex:1;min-width:0">
          <div style="font:700 13px/1.35 var(--font-sans);color:var(--n7)">Av. Las Condes 8977 Casa A, Las Condes, 7753425, Región Metro…</div>
          <div style="display:flex;gap:8px;margin-top:6px">${badgeHtml('Entrega', 'info')}<span style="display:inline-flex;align-items:center;gap:4px;font:400 12px var(--font-sans);color:var(--n6)"><span style="width:6px;height:6px;border-radius:50%;background:var(--r6)"></span>Prioridad: Alta</span></div>
          <div style="display:flex;gap:10px;margin-top:6px">${mMeta('time', '8:00 – 9:00')}${mMeta('package', '3')}</div>
        </div>
        ${iconSvg('overflow-menu-vertical', 18, 'var(--n5)')}
      </div>
      <div style="padding:0 12px 12px">${mBtn('Llegué', 'primary', 'default', 'width:100%')}</div>
    </div>`;
    const navStage = mStage(wrap('Widget de navegación (sobre Waze / Google Maps)', `<div style="background:#cfe0c8;border-radius:12px;padding:14px">${navWidget}</div>`, 320));

    /* Georef modal */
    const georef = `<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(19,32,69,.2);padding:20px;width:280px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font:700 15px var(--font-sans);color:var(--n7)">Órdenes sin georeferencia</span>${iconSvg('close-filled', 16, 'var(--n5)')}</div>
      <div style="font:400 13px/1.5 var(--font-sans);color:var(--n5);margin-bottom:18px">Tienes 2 órdenes sin georeferencia. Al continuar considera que no aparecerán dentro del mapa.</div>
      <div style="display:flex;gap:10px">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Continuar', 'primary', 'default', 'flex:1')}</div>
    </div>`;
    const georefStage = mStage(wrap('Modal — órdenes sin georeferencia', georef, 300));

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.pins.name, 'NEW', pinStage, c.pins.specs,
        'El color del pin es semántico, igual que en las cards: azul activo, gris inactivo, naranja en gestión, verde/amber/rojo según resultado.')}
      ${mComponentCard(c.routeLine.name, 'NEW', mStage(wrap('Línea de ruta (azul recorrido / naranja activo)', mPhone(mMapBg(180), { width: 280 }), 280)), c.routeLine.specs)}
      ${mComponentCard(c.fabs.name, 'NEW', fabsStage, c.fabs.specs)}
      ${mComponentCard(c.navWidget.name, 'NEW', navStage, c.navWidget.specs)}
      ${mComponentCard(c.georefModal.name, 'NEW', georefStage, c.georefModal.specs)}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Gestión de órdenes ── */
  mOrderManagement(data) {
    const c = data.components || {};
    const wrap = (label, inner, w) => `<div style="width:${w || 300}px">${mLabel(label)}${inner}</div>`;
    const sheet = (inner) => `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;overflow:hidden">${inner}</div>`;
    const delivery = [
      { label: 'No entregado', icon: 'close-filled', tone: 'r' },
      { label: 'Parcial', icon: 'ban', tone: 'o' },
      { label: 'Entregado', icon: 'checkmark-filled', tone: 'g' },
    ];
    const pickup = [
      { label: 'No recogida', icon: 'close-filled', tone: 'r' },
      { label: 'Parcial', icon: 'ban', tone: 'o' },
      { label: 'Recogida', icon: 'checkmark-filled', tone: 'g' },
    ];

    /* Status selector */
    const status = mStage(`
      ${wrap('Entrega · Entregado', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${mStatusSelector(delivery, 2)}</div>`, 360)}
      ${wrap('Entrega · Parcial', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${mStatusSelector(delivery, 1)}</div>`, 360)}
      ${wrap('Entrega · No entregado', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${mStatusSelector(delivery, 0)}</div>`, 360)}
      ${wrap('Recogida (variante)', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${mStatusSelector(pickup, 2)}</div>`, 360)}
    `);

    /* Substatus */
    const substatus = mStage(wrap('Subestado buscable', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">
      ${mInput('*Subestado', 'Selecciona un subestado', 'default', '', { rightIcon: 'chevron--down' })}
      <div style="border:1px solid var(--n3);border-radius:6px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.12)">
        <div style="padding:8px 12px;border-bottom:1px solid var(--n2);display:flex;align-items:center;gap:8px">${iconSvg('search', 14, 'var(--n5)')}<span style="font:400 13px var(--font-sans);color:var(--n6)">Buscar subestado</span></div>
        ${['Sin moradores', 'Producto dañado', 'Producto faltante', 'Dirección errónea'].map(o => `<div style="height:40px;display:flex;align-items:center;padding:0 12px;font:400 14px var(--font-sans);color:var(--n7)">${o}</div>`).join('')}
      </div>
    </div>`));

    /* Management accordion */
    const accordion = sheet(`
      ${mReqRow({ label: 'Información de entrega', state: 'default' })}
      <div style="padding:14px 12px;text-align:center;border-bottom:1px solid var(--n2)">
        <div style="font:400 13px var(--font-sans);color:var(--n5);margin-bottom:8px">Para gestionar confirma que llegaste al punto de entrega</div>
        ${mBtn('Llegué', 'primary', 'default', 'width:60%')}
      </div>
      ${mReqRow({ label: 'Estado', state: 'required' })}
      ${mReqRow({ label: 'Ítems', sub: '0 de 3 entregado', state: 'default' })}
      ${mReqRow({ label: 'Pruebas de entrega', sub: '0 de 3 completado', state: 'required' })}
      ${mReqRow({ label: 'Recaudo', sub: '0 de 150.000', state: 'required' })}
      <div style="padding:12px;display:flex;gap:10px">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Confirmar gestión', 'primary', 'default', 'flex:1')}</div>
    `);
    const accordionStage = mStage(wrap('Acordeón de gestión', accordion, 320));

    /* Milestones */
    const milestone = (label, done) => `<div style="padding:14px 12px;border-bottom:1px solid var(--n2)">
      <div style="display:flex;align-items:center;justify-content:space-between"><span style="font:700 14px var(--font-sans);color:var(--n7)">${label}</span>${done ? iconSvg('checkmark-filled', 18, 'var(--g6)') : badgeHtml('Requerido', 'warning')}</div>
      ${done
        ? `<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px"><button style="height:30px;padding:0 12px;border-radius:99px;background:#fff;border:1px solid var(--b6);color:var(--b6);font:600 12px var(--font-sans)">Marcar como no confirmado</button><span style="font:400 12px var(--font-sans);color:var(--n5)">Confirmado a las 09:30</span></div>`
        : `<button style="height:30px;padding:0 12px;border-radius:99px;background:var(--b6);border:none;color:#fff;font:600 12px var(--font-sans);margin-top:8px">Marcar como confirmado</button>`}
    </div>`;
    const milestones = sheet(`
      ${milestone('Arrival at client', true)}
      ${milestone('Start download', false)}
      <div style="padding:12px">${mBanner('Marca el hito en tiempo real, tal como aparece la hora en el registro.', 'warning')}</div>
    `);
    const milestonesStage = mStage(wrap('Hitos de operación', milestones, 320));

    /* Bulk management */
    const addr = 'Martín de Zamora 5760, 7560969, Las Condes';
    const bulk = sheet(`
      <div style="padding:10px 12px;background:var(--n1);font:700 13px var(--font-sans);color:var(--n7)">4 órdenes</div>
      <div style="padding:12px;display:flex;flex-direction:column;gap:8px">
        ${mOrderCard({ num: 1, addr, order: 'Orden #382918390', person: 'Ana Álvarez', items: 3, selected: true, custom: false })}
        ${mOrderCard({ num: 2, addr, order: 'Orden #382918390', person: 'Ana Álvarez', items: 3, selected: false, custom: false })}
      </div>
      <div style="padding:12px;display:flex;gap:10px">${mBtn('Gestionar selección', 'outline', 'default', 'flex:1')}${mBtn('Gestionar todas (4)', 'primary', 'default', 'flex:1')}</div>
    `);
    const qrModal = `<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(19,32,69,.2);padding:20px;width:240px;text-align:center">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font:700 14px var(--font-sans);color:var(--n7)">Entrega código QR</span>${iconSvg('close-filled', 16, 'var(--n5)')}</div>
      <div style="font:400 12px/1.5 var(--font-sans);color:var(--n5);margin-bottom:14px">Comparte las órdenes gestionadas mediante este código para que sea escaneado.</div>
      <div style="display:flex;justify-content:center;margin-bottom:14px">${iconSvg('qr', 96, 'var(--n7)')}</div>
      ${mBtn('Cerrar', 'primary', 'default', 'width:100%')}
    </div>`;
    const bulkStage = mStage(`
      ${wrap('Selección múltiple', bulk, 320)}
      ${wrap('Comprobante QR', qrModal, 260)}
    `);

    /* Cash collection */
    const cash = sheet(`
      <div style="padding:16px">
        <div style="background:var(--b1);border-radius:8px;padding:14px;text-align:center;margin-bottom:14px">
          <div style="font:400 12px var(--font-sans);color:var(--n6)">Total a recaudar</div>
          <div style="font:700 22px var(--font-sans);color:var(--b7)">$134.500 <span style="font:400 12px var(--font-sans)">CLP</span></div>
        </div>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:14px;font:400 13px var(--font-sans);color:var(--n7)"><span style="width:18px;height:18px;border:1.5px solid var(--n4);border-radius:4px;display:inline-block"></span>Considerar saldo anterior</label>
        ${mInput('*Medio de transacción', 'Efectivo', 'filled', '', { rightIcon: 'chevron--down' })}
        <div style="font:500 12px var(--font-sans);color:var(--n6);margin:4px 0 10px">Detalle billetes/monedas recibidos</div>
        ${['2.000', '5.000', '10.000', '20.000'].map(v => `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><span style="font:400 14px var(--font-sans);color:var(--n7)">${v}</span>${mStepper(0)}</div>`).join('')}
      </div>
      <div style="padding:12px;display:flex;gap:10px;border-top:1px solid var(--n2)">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Confirmar', 'primary', 'default', 'flex:1')}</div>
    `);
    const confirmAmount = `<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(19,32,69,.2);padding:20px;width:260px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font:700 15px var(--font-sans);color:var(--n7)">Confirmar monto</span>${iconSvg('close-filled', 16, 'var(--n5)')}</div>
      <div style="font:400 13px/1.5 var(--font-sans);color:var(--n5);margin-bottom:8px">El monto recaudado no coincide con los precios de los ítems.</div>
      <div style="font:700 18px var(--font-sans);color:var(--r6);text-align:center;margin-bottom:16px">$35.000 / $245.000 CLP</div>
      <div style="display:flex;gap:10px">${mBtn('Finalizar', 'danger', 'default', 'flex:1')}${mBtn('Cancelar', 'outline', 'default', 'flex:1')}</div>
    </div>`;
    const cashStage = mStage(`
      ${wrap('Recaudo (cash on delivery)', cash, 320)}
      ${wrap('Confirmar monto (discrepancia)', confirmAmount, 280)}
    `);

    /* Success screen — 360×640, icono y texto centrados */
    const successCheck = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" stroke="#fff" stroke-width="6"/>
      <path d="M38 61 L53 77 L83 43" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const success = mPhone(`<div style="background:var(--b6);width:360px;height:640px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">
      ${successCheck}
      <div style="font:700 24px var(--font-sans);color:#fff">Gestión finalizada</div>
    </div>`, { width: 360 });
    const successStage = mStage(wrap('Pantalla de éxito (360×640)', success, 360));

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.statusSelector.name, 'NEW', status, c.statusSelector.specs,
        'El color del estado seleccionado es semántico: verde entregado, amber parcial, rojo no entregado.')}
      ${mComponentCard(c.substatus.name, 'NEW', substatus, c.substatus.specs)}
      ${mComponentCard(c.managementAccordion.name, 'NEW', accordionStage, c.managementAccordion.specs)}
      ${mComponentCard(c.milestones.name, 'NEW', milestonesStage, c.milestones.specs)}
      ${mComponentCard(c.bulkManagement.name, 'NEW', bulkStage, c.bulkManagement.specs)}
      ${mComponentCard(c.cashCollection.name, 'NEW', cashStage, c.cashCollection.specs)}
      ${mComponentCard(c.successScreen.name, 'NEW', successStage, c.successScreen.specs)}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Pruebas de entrega ── */
  mPod(data) {
    const c = data.components || {};
    const wrap = (label, inner, w) => `<div style="width:${w || 300}px">${mLabel(label)}${inner}</div>`;
    const sheet = (inner) => `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;overflow:hidden">${inner}</div>`;

    /* Requirement rows */
    const reqRows = sheet(`
      ${mReqRow({ icon: 'package', label: 'Escanea ítems', sub: '0 de 64 entregado', state: 'required' })}
      ${mReqRow({ icon: 'pen', label: 'Agregar firma', state: 'required' })}
      ${mReqRow({ icon: 'camera', label: 'Foto de entrega', sub: '4/10', state: 'done', preview: mPhotoStrip(4) })}
      ${mReqRow({ icon: 'time', label: 'Agregar hora', sub: '18:00', state: 'done' })}
    `);
    const requirements = mStage(wrap('Filas de requisito (pendiente / completo)', reqRows));

    /* Photo capture */
    const cameraView = mPhone(`
      <div style="background:#1b1b1f;flex:1;display:flex;flex-direction:column;height:380px">
        <div style="display:flex;justify-content:space-between;padding:12px 14px">${iconSvg('arrow-left', 20, '#fff')}<span style="font:600 13px var(--font-sans);color:#fff">Agregar foto</span>${iconSvg('camera', 20, '#fff')}</div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center"><div style="width:200px;height:130px;background:linear-gradient(135deg,#3a3a40,#26262b);border-radius:6px"></div></div>
        <div style="display:flex;justify-content:center;padding:20px"><span style="width:56px;height:56px;border-radius:50%;background:#fff;border:4px solid rgba(255,255,255,.4)"></span></div>
      </div>`, { width: 240 });
    const photo = mStage(`
      ${wrap('Cámara', cameraView, 240)}
      ${wrap('Tira de evidencia (en formulario)', sheet(`<div style="padding:16px">${mPhotoStrip(4)}</div>`), 300)}
    `);

    /* Signature */
    const sigEmpty = sheet(`<div style="padding:24px;text-align:center">${iconSvg('pen', 28, 'var(--n5)')}<div style="font:700 15px var(--font-sans);color:var(--n7);margin:10px 0 4px">Firma acá</div><div style="font:400 12px/1.5 var(--font-sans);color:var(--n5)">Después de firmar, puedes apretar el botón para intentarlo de nuevo.</div></div>`);
    const sigDone = sheet(`<div style="padding:24px 16px;text-align:center"><div style="display:flex;justify-content:center;margin-bottom:10px">${mSignatureStroke()}</div><button style="background:none;border:none;color:var(--r6);font:500 13px var(--font-sans);cursor:pointer;display:inline-flex;align-items:center;gap:5px">${iconSvg('delete', 14, 'var(--r6)')}Borrar</button></div><div style="padding:0 16px 16px">${mInput('*RUT de quien recibe', '16.999.999-9', 'filled')}</div>`);
    const signature = mStage(`
      ${wrap('Vacío', sigEmpty)}
      ${wrap('Firmado + RUT', sigDone)}
    `);

    /* Scanner */
    const scannerView = mPhone(`
      <div style="background:#1b1b1f;flex:1;display:flex;flex-direction:column;height:380px;position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px">${iconSvg('arrow-left', 20, '#fff')}<span style="background:rgba(255,255,255,.15);border-radius:99px;padding:3px 10px;font:600 12px var(--font-sans);color:#fff">30s</span><span style="color:#fff;font:600 12px var(--font-sans)">⚡</span></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center"><div style="width:170px;height:110px;border:2px solid #fff;border-radius:10px;box-shadow:0 0 0 2000px rgba(0,0,0,.35)"></div></div>
        <div style="padding:0 14px 10px">${mToast('Código 9AS-345345 -234234 exitoso.', 'success', false)}</div>
        <div style="display:flex;gap:10px;padding:12px 14px;background:#fff">${mBtn('Cancelar', 'outline', 'default', 'flex:1')}${mBtn('Fin del escaneo', 'primary', 'default', 'flex:1')}</div>
      </div>`, { width: 240 });
    const scanner = mStage(`
      ${wrap('Escáner (código de barras)', scannerView, 240)}
      ${wrap('Resultados', `<div style="display:flex;flex-direction:column;gap:10px">${mToast('Código 9AS-345345 -234234 exitoso.', 'success', false)}${mToast('Código no encontrado dentro de tus órdenes.', 'error', false)}</div>`, 300)}
    `);

    /* Load validation */
    const lvRow = (label, count, tone) => `<div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--n2)">
      ${iconSvg(tone === 'g' ? 'checkmark-filled' : tone === 'o' ? 'warning' : 'close-filled', 18, tone === 'g' ? 'var(--g6)' : tone === 'o' ? 'var(--o5)' : 'var(--r6)')}
      <span style="flex:1;font:400 14px var(--font-sans);color:var(--n7)">${label}</span>
      <span style="font:600 13px var(--font-sans);color:var(--n6)">${count}</span>
      ${iconSvg('chevron--down', 16, 'var(--n5)')}
    </div>`;
    const loadVal = sheet(`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--n1)"><span style="font:700 14px var(--font-sans);color:var(--n7)">Estado</span><span style="display:flex;align-items:center;gap:6px;font:400 12px var(--font-sans);color:var(--n5)">64 de 64 completado ${iconSvg('checkmark-filled', 16, 'var(--g6)')}</span></div>
      ${lvRow('Orden #12321312', '40/40', 'g')}
      ${lvRow('Orden #22321312', '39/40', 'o')}
      ${lvRow('Orden #22321312', '0/40', 'r')}
    `);
    const loadValidation = mStage(wrap('Validación de carga (semáforo por orden)', loadVal));

    /* Start form */
    const startForm = sheet(`
      <div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--n2)">${iconSvg('arrow-left', 20, 'var(--n7)')}<span style="flex:1;font:700 14px var(--font-sans);color:var(--n7)">Formulario de inicio</span><span style="font:400 12px var(--font-sans);color:var(--n5)">4/9</span></div>
      ${mReqRow({ icon: 'camera', label: 'Foto de facturas', sub: '4/10', state: 'done', preview: mPhotoStrip(4) })}
      ${mReqRow({ icon: 'package', label: 'Escanear ítems', sub: '8/10 ítems escaneados', state: 'done' })}
      ${mReqRow({ icon: 'pen', label: 'Agregar firma', state: 'done', preview: `<span style="margin-right:8px">${mSignatureStroke()}</span>` })}
      ${mReqRow({ icon: 'time', label: 'Agregar hora', state: 'required' })}
      ${mReqRow({ icon: 'receipt', label: 'Escanear la factura', state: 'required' })}
      <div style="padding:12px">${mBtn('Continuar', 'primary', 'default', 'width:100%')}</div>
    `);
    const start = mStage(wrap('Formulario de inicio (stepper)', startForm));

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.requirementRow.name, 'NEW', requirements, c.requirementRow.specs,
        'Base de todos los formularios de gestión y PoD. Badge «Requerido» mientras está pendiente; check verde + preview al completar.')}
      ${mComponentCard(c.photoCapture.name, 'NEW', photo, c.photoCapture.specs)}
      ${mComponentCard(c.signature.name, 'NEW', signature, c.signature.specs)}
      ${mComponentCard(c.scanner.name, 'NEW', scanner, c.scanner.specs)}
      ${mComponentCard(c.loadValidation.name, 'NEW', loadValidation, c.loadValidation.specs)}
      ${mComponentCard(c.startForm.name, 'NEW', start, c.startForm.specs)}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Toasts y banners ── */
  mToasts(data) {
    const c = data.components || {};
    const wrap = (label, inner, w) => `<div style="width:${w || 320}px">${mLabel(label)}${inner}</div>`;

    const toasts = mStage(`
      ${wrap('Éxito', mToast('Orden agregada a la gestión masiva.', 'success'))}
      ${wrap('Error', mToast('Código no encontrado dentro de tus órdenes.', 'error'))}
      ${wrap('Bloqueo (no se puede finalizar)', mToast('No puedes finalizar ruta hasta que se sincronicen todas las órdenes.', 'warning'))}
    `);

    /* Barra de sincronización */
    const syncBar = (label, barColor, fill, dark) => `<div style="border-radius:8px;overflow:hidden;${dark ? 'background:var(--n7)' : 'background:#fff;border:1px solid var(--n3)'}">
      <div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;font:600 12px var(--font-sans);color:${dark ? '#fff' : 'var(--n7)'}">
        <span style="display:flex;align-items:center;gap:6px">${iconSvg(dark ? 'ban' : 'refresh', 14, dark ? '#fff' : barColor)}${label}</span>
      </div>
      <div style="height:4px;background:${dark ? 'rgba(255,255,255,.2)' : 'var(--n2)'}"><div style="height:100%;width:${fill};background:${barColor}"></div></div>
    </div>`;
    const sync = mStage(`
      ${wrap('Sin conexión', syncBar('Estás desconectado. Las órdenes se actualizarán al reconectar.', 'var(--n4)', '0%', true))}
      ${wrap('Conexión intermitente', syncBar('Conexión intermitente · Pendientes 7/10', 'var(--o5)', '30%', false))}
      ${wrap('En línea', syncBar('Sincronizando órdenes', 'var(--g6)', '75%', false))}
    `);

    const banners = mStage(`
      ${wrap('Advertencia (acción requerida)', mBanner('Debes escanear para acceder a los estados Parcial y Entregado. Por defecto solo podrás seleccionar No entregado.', 'warning'))}
      ${wrap('Info (neutra)', mBanner('Sin items faltantes, entrega completa.', 'info'))}
    `);

    /* Modal de confirmación */
    const confirmModal = (title, body, btns) => `<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(19,32,69,.2);padding:20px;width:300px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="font:700 15px var(--font-sans);color:var(--n7)">${title}</div>
        ${iconSvg('close-filled', 18, 'var(--n5)')}
      </div>
      <div style="font:400 14px/1.5 var(--font-sans);color:var(--n5);margin-bottom:18px">${body}</div>
      <div style="display:flex;gap:10px">${btns}</div>
    </div>`;
    const modals = mStage(`
      <div>${mLabel('Confirmación (VoLTE)')}${confirmModal('Modo VoLTE activado', 'Para que la aplicación funcione correctamente, necesitas desactivar el modo VoLTE en la configuración de tu teléfono.', mBtn('Ahora no', 'outline', 'default', 'flex:1') + mBtn('Ir a ajustes', 'primary', 'default', 'flex:1'))}</div>
      <div>${mLabel('Destructiva (nombra el item)')}${confirmModal('Eliminar orden', 'Al eliminar la orden, perderás su información y no se podrá recuperar. ¿Estás seguro de querer eliminarla?', mBtn('Cancelar', 'outline', 'default', 'flex:1') + mBtn('Confirmar', 'danger', 'default', 'flex:1'))}</div>
    `);

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.toast.name, 'NEW', toasts, c.toast.specs,
        'Confirma acciones puntuales. Éxito en verde, error en rojo; nunca un toast de advertencia para una acción exitosa.')}
      ${mComponentCard(c.syncBar.name, 'NEW', sync, c.syncBar.specs,
        'Comunica el estado de conexión y el progreso de sincronización. No se puede finalizar ruta con órdenes sin sincronizar.')}
      ${mComponentCard(c.warningBanner.name, 'EXTENDED', banners, c.warningBanner.specs)}
      ${mComponentCard(c.confirmModal.name, 'EXTENDED', modals, c.confirmModal.specs,
        'Siempre nombra la acción o el item específico. Nunca usa copy genérico como «¿Estás seguro?».')}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Bottom sheets ── */
  mBottomSheets(data) {
    const c = data.components || {};
    const addr = 'Martín de Zamora 5760, 7560969, Las Condes, Región Metropolitana';
    const wrap = (label, inner) => `<div style="width:300px">${mLabel(label)}${inner}</div>`;

    /* ── Estáticos sincronizados con el demo funcional ──
       W=300, H=533 (300/360 × 640).
       Los mapas se inicializan con Leaflet real en initMobileSheetDemo (index.html). */
    const W = 300, H = 533;

    // Contenedor de mapa vacío — Leaflet lo llenará tras el render (mismo CARTO light)
    const sMapDiv = (id) => `<div id="${id}" style="position:absolute;inset:0;z-index:1"></div>`;

    // Tabs y chips con fondo gris (igual que el demo funcional tras aplicar override JS)
    const sTabs = `<div style="display:flex;border-bottom:1px solid var(--n3);background:var(--n1)">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:40px;font:700 14px var(--font-sans);color:var(--b6);border-bottom:2px solid var(--b6)">${iconSvg('truck',16,'var(--b6)')}En ruta: 12</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:40px;font:400 14px var(--font-sans);color:var(--n5)">${iconSvg('task-complete',16,'var(--n5)')}Terminadas: 0</div>
    </div>`;
    const sChips = `<div style="display:flex;gap:6px;overflow:hidden;padding:10px 12px;background:var(--n1)">${[mChip('Group A',{selected:true}),mChip('Grupo B'),mChip('Grupo C')].join('')}</div>`;
    const sList = (cards) => `<div style="padding:12px;display:flex;flex-direction:column;gap:8px;background:var(--n1)">${cards}</div>`;

    // Frame genérico: div de mapa con ID + sheet desde `top` px
    const sPhone = (mapId, top, inner) => mPhone(`
      <div style="position:relative;height:${H}px">
        ${sMapDiv(mapId)}
        <div style="position:absolute;left:0;right:0;top:${top}px;bottom:0;z-index:2;background:var(--n1);border-radius:16px 16px 0 0;box-shadow:0 -2px 12px rgba(19,32,69,.18);overflow:hidden">
          ${inner}
        </div>
      </div>`, {width:W, height:H});

    // COL_TOP: el route header mide 106px reales (no escala con el ancho) → usar H-111 fijo
    const COL_TOP  = H - 111;             // 422px → 111px visibles = route header completo + 5px gap
    const MID_TOP  = Math.round(H / 2);  // 267px → mitad del teléfono
    const FULL_TOP = Math.round(H * 48 / 640); // ~40px → lista completa

    const collapsed = sPhone('dtm-smap-col', COL_TOP, mRouteHeader({ title: '332131491204912' }));

    const mid = sPhone('dtm-smap-mid', MID_TOP, `
      ${mRouteHeader({ title: '332131491204912' })}
      ${sTabs}
      ${sChips}
      ${sList(mOrderCard({ num: 1, addr, order: 'Orden #3829183901234564', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 }))}`);

    const full = sPhone('dtm-smap-full', FULL_TOP, `
      ${mRouteHeader({ title: '332131491204912' })}
      ${sTabs}
      ${sChips}
      ${sList([
        mOrderCard({ num: 1, addr, order: 'Orden #3829183901234564', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 }),
        mOrderCard({ num: 2, addr: 'Av. Las Condes 8977 Casa A, Las Condes', order: 'Orden #3829183901840564', person: 'Ana López', time: '9:00 – 9:30', items: 1, pin: 'outline' }),
      ].join(''))}`);

    const heights = mStage(`
      ${wrap('Colapsado', collapsed)}
      ${wrap('Media (default)', mid)}
      ${wrap('Completa', full)}
    `);

    /* ── Demo funcional: mapa real + sheet arrastrable de 3 estados ──
       La lógica de gestos y el mapa Leaflet se inicializan en
       initMobileSheetDemo() (index.html) tras el render. */
    const demoOrders = [
      { num: 1, addr, order: 'Orden #3829183901234564', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 },
      { num: 2, addr: 'Av. Las Condes 8977 Casa A, Las Condes', order: 'Orden #3829183901840564', person: 'Ana López', time: '9:00 – 9:30', items: 1, pin: 'outline' },
      { num: 3, addr: 'Av. Apoquindo 4501, Las Condes', order: 'Orden #3829183901112233', person: 'Pedro Soto', time: '9:30 – 10:00', items: 2, pin: 'outline' },
      { num: 4, addr: 'Camino El Alba 9500, Las Condes', order: 'Orden #3829183901445566', person: 'María Pérez', time: '10:00 – 11:00', items: 5, pin: 'outline' },
      { num: 5, addr: 'Av. Kennedy 5413, Las Condes', order: 'Orden #3829183901778899', person: 'Jorge Díaz', time: '11:00 – 11:30', items: 1, pin: 'outline' },
      { num: 6, addr: 'Isidora Goyenechea 3000, Las Condes', order: 'Orden #3829183901990011', person: 'Carla Muñoz', time: '11:30 – 12:00', items: 4, pin: 'outline' },
    ].map(o => mOrderCard(o)).join('');

    const demoPhone = `<div style="width:360px;height:640px;max-width:100%;flex-shrink:0;position:relative;overflow:hidden;background:var(--n1);border:1px solid var(--n3);border-radius:18px;box-shadow:0 1px 3px rgba(19,32,69,.08)">
      <div id="dtm-sheet-map" style="position:absolute;inset:0;z-index:1"></div>
      <div id="dtm-sheet-badge" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:600;background:var(--n7);color:#fff;font:600 11px var(--font-sans);padding:4px 10px;border-radius:99px;pointer-events:none;opacity:.92;white-space:nowrap">Media (default)</div>
      <div id="dtm-sheet" style="position:absolute;left:0;right:0;top:0;height:640px;z-index:500;background:#fff;border-radius:16px 16px 0 0;box-shadow:0 -2px 12px rgba(19,32,69,.18);transform:translateY(320px);transition:transform .28s cubic-bezier(.2,.8,.3,1);display:flex;flex-direction:column;overflow:hidden;user-select:none;-webkit-user-select:none">
        <div id="dtm-sheet-grab" style="cursor:grab;touch-action:none;flex-shrink:0;background:#fff">
          ${mRouteHeader({ title: '332131491204912' })}
          ${mRouteTabs(0, 12, 0)}
          ${mChipRow([mChip('Group A', { selected: true }), mChip('Grupo B'), mChip('Grupo C')].join(''))}
        </div>
        <div id="dtm-sheet-list" style="flex:1;overflow-y:hidden;padding:12px;display:flex;flex-direction:column;gap:8px;background:var(--n1);touch-action:pan-y">
          ${demoOrders}
        </div>
      </div>
    </div>`;
    const demoHint = `<div style="font:400 12px/1.6 var(--font-sans);color:var(--n5);max-width:280px">
      <div style="font:700 11px var(--font-sans);letter-spacing:.07em;text-transform:uppercase;color:var(--n5);margin-bottom:10px">Cómo probarlo</div>
      Arrastra el sheet hacia arriba o abajo (mouse o touch).<br><br>
      · Inicia en altura <b>media</b> (default).<br>
      · Swipe up → <b>lista completa</b>.<br>
      · Swipe down → <b>mapa completo</b>.<br>
      · Desde lista completa o mapa completo, el gesto contrario vuelve a la altura media — nunca salta dos estados.<br><br>
      El mapa es el mismo tipo de Map elements (CARTO light) con pins de gota numerados.</div>`;
    const demo = mStage(`${demoPhone}${demoHint}`, { gap: '24px' });

    /* Header solo */
    const headerOnly = mStage(`
      ${wrap('Header de ruta', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;overflow:hidden">${mRouteHeader({ title: 'Sector oriente 2040 mañana' })}</div>`)}
      ${wrap('Header en detalle de orden (back)', `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;overflow:hidden">${mRouteHeader({ back: true, title: 'Martín de Zamora 5760, Las Condes', meta: false })}</div>`)}
    `);

    /* Menú de acciones */
    const menuItem = (icon, label) => `<div style="height:44px;display:flex;align-items:center;gap:12px;padding:0 14px;font:400 14px var(--font-sans);color:var(--n7)">${iconSvg(icon, 18, 'var(--n6)')}${label}</div>`;
    const menuToggle = (label, on) => `<div style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font:400 14px var(--font-sans);color:var(--n7)"><span style="display:flex;align-items:center;gap:12px">${iconSvg('route', 18, 'var(--n6)')}${label}</span>${mToggle(on)}</div>`;
    const menuCard = `<div style="background:#fff;border:1px solid var(--n3);border-radius:10px;box-shadow:0 4px 16px rgba(19,32,69,.14);overflow:hidden;width:240px">
      ${menuItem('refresh', 'Actualizar')}
      ${menuItem('planner-route', 'Optimizar ruta')}
      ${menuItem('group', 'Gestión masiva')}
      ${menuItem('phone', 'Llamada de emergencia')}
      ${menuItem('message', 'Mensaje de emergencia')}
      <div style="border-top:1px solid var(--n2)"></div>
      ${menuToggle('Línea del mapa', true)}
      ${menuToggle('Dígitos del mapa', true)}
    </div>`;
    const menu = mStage(`<div>${mLabel('Menú contextual (versión mapa)')}${menuCard}</div>`);

    /* Modal cambios sin guardar */
    const modal = (title, body, btns) => `<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(19,32,69,.2);padding:20px;width:280px">
      <div style="font:700 15px var(--font-sans);color:var(--n7);margin-bottom:6px">${title}</div>
      <div style="font:400 13px/1.5 var(--font-sans);color:var(--n5);margin-bottom:16px">${body}</div>
      <div style="display:flex;gap:10px">${btns}</div>
    </div>`;
    const modals = mStage(`
      <div>${mLabel('Variante salir')}${modal('Cambios sin guardar', '¿Estás seguro de cerrar la gestión y perder los cambios?', mBtn('Cancelar', 'outline', 'default', 'flex:1') + mBtn('Salir', 'danger', 'default', 'flex:1'))}</div>
      <div>${mLabel('Variante seguir')}${modal('Cambios sin guardar', '¿Estás seguro de cerrar la gestión y perder los cambios?', mBtn('Confirmar', 'outline', 'default', 'flex:1') + mBtn('Seguir gestionando', 'primary', 'default', 'flex:1'))}</div>
    `);

    const navRules = `<div class="card" style="margin-bottom:20px">
      <h3 style="font:700 15px var(--font-sans);color:var(--n7);margin:0 0 10px">Reglas de navegación</h3>
      <ul style="margin:0;padding-left:18px">${(data.navigationRules || []).map(r => `<li style="font:400 13px/1.7 var(--font-sans);color:var(--n6);margin-bottom:4px">${escHtml(r)}</li>`).join('')}</ul>
    </div>`;

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.sheet.name, 'NEW', heights, c.sheet.specs,
        'Tres alturas con snap: colapsada (máximo mapa), media (default) y completa (lista con scroll).')}
      ${c.sheetDemo ? mComponentCard(c.sheetDemo.name, 'NEW', demo, c.sheetDemo.specs,
        'Demo interactivo: el sheet responde a arrastre con mouse o touch y hace snap a la altura siguiente según la dirección del gesto.') : ''}
      ${mComponentCard(c.routeHeader.name, 'NEW', headerOnly, c.routeHeader.specs)}
      ${mComponentCard(c.actionMenu.name, 'NEW', menu, c.actionMenu.specs)}
      ${mComponentCard(c.unsavedModal.name, 'NEW', modals, c.unsavedModal.specs)}
      ${navRules}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Listas y filtros ── */
  mLists(data) {
    const c = data.components || {};
    const addr = 'Martín de Zamora 5760, 7560969, Las Condes, Región Metropolitana';
    const wrap = (label, inner, w) => `<div style="width:${w || 320}px">${mLabel(label)}${inner}</div>`;
    const sheetTop = (inner) => `<div style="background:#fff;border:1px solid var(--n3);border-radius:12px;overflow:hidden">${inner}</div>`;

    const tabs = mStage(`
      ${wrap('En ruta activa', sheetTop(mRouteTabs(0, 12, 0)))}
      ${wrap('Terminadas activa', sheetTop(mRouteTabs(1, 8, 4)))}
    `);

    const groupChips = mStage(wrap('Chips de grupo (scroll horizontal)', sheetTop(
      mChipRow([mChip('Group A', { selected: true }), mChip('Grupo B'), mChip('Grupo C'), mChip('Grupo D'), mChip('Grupo E')].join(''))
    )));

    const statusChips = mStage(wrap('Filtros de estado (pestaña Terminadas)', sheetTop(
      mChipRow([
        `<span style="height:28px;padding:0 10px;border-radius:6px;background:#fff;border:1px solid var(--n3);color:var(--n6);font:500 12px var(--font-sans);display:inline-flex;align-items:center;gap:6px;flex-shrink:0">${iconSvg('checkmark-filled', 13, 'var(--g6)')}Entregado (1)</span>`,
        mChip('Parcial (1)', { selected: true, tone: 'amber' }),
        `<span style="height:28px;padding:0 10px;border-radius:6px;background:#fff;border:1px solid var(--n3);color:var(--n6);font:500 12px var(--font-sans);display:inline-flex;align-items:center;gap:6px;flex-shrink:0">${iconSvg('close-filled', 13, 'var(--r6)')}No entregado (1)</span>`,
      ].join(''))
    )));

    const dividers = mStage(`
      ${wrap('Separador de conteo', sheetTop(mDivider('3 órdenes') + `<div style="padding:12px">${mOrderCard({ num: 3, addr, order: 'Orden #3829183954324', custom: false })}</div>`))}
      ${wrap('Banner tienda solicitante', sheetTop(mDivider('Tienda solicitante: Bodega 1', 'blue') + `<div style="padding:12px">${mOrderCard({ num: 1, addr, order: 'Orden #3829183901471454571', person: 'Raúl Ríos', time: '8:00 – 9:00', items: 3 })}</div>`))}
    `);

    const syncCard = (label) => `<div style="background:#fff;border:1px solid var(--n3);border-radius:8px;padding:12px;display:flex;gap:10px;align-items:flex-start">
      ${mPin(1)}
      <div style="flex:1;min-width:0">${label}
        <div style="font:700 14px/1.35 var(--font-sans);color:var(--n7);margin-top:4px">${addr}</div>
        <div style="font:400 12px var(--font-sans);color:var(--n5)">Orden #3829183901234564</div>
      </div>
    </div>`;
    const sync = mStage(`
      ${wrap('Sin sincronizar', syncCard(mSyncLabel('idle')))}
      ${wrap('Sincronizando', syncCard(mSyncLabel('syncing')))}
    `);

    const empty = mStage(wrap('Estado vacío — Terminadas', sheetTop(`
      <div style="padding:40px 24px;text-align:center">
        ${iconSvg('location', 32, 'var(--n5)')}
        <div style="font:400 14px/1.5 var(--font-sans);color:var(--n6);margin-top:12px">Aquí podrás encontrar y ver el detalle de tus órdenes ya gestionadas.</div>
      </div>`)));

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.tabs.name, 'NEW', tabs, c.tabs.specs)}
      ${mComponentCard(c.groupChips.name, 'NEW', groupChips, c.groupChips.specs)}
      ${mComponentCard(c.statusFilters.name, 'NEW', statusChips, c.statusFilters.specs)}
      ${mComponentCard(c.sectionDivider.name, 'NEW', dividers, c.sectionDivider.specs)}
      ${mComponentCard(c.syncLabel.name, 'NEW', sync, c.syncLabel.specs,
        'Comunican el estado offline de cada orden. Ver detalle del flujo completo en Toasts y banners → barra de sincronización.')}
      ${mComponentCard(c.emptyState.name, 'NEW', empty, c.emptyState.specs)}
      ${mRules(data.rules)}`;
  },

  /* ── App móvil · Inputs ── */
  mInputs(data) {
    const c = data.components || {};
    const col = (inner, w) => `<div style="width:${w || 260}px;background:#fff;border:1px solid var(--n3);border-radius:12px;padding:16px">${inner}</div>`;

    /* Estados del input de texto */
    const textStates = mStage(`
      ${col(`
        ${mInput('Texto', 'Escribir', 'default')}
        ${mInput('*Monto', 'Ingresa monto', 'focus', '*Requerido. Valor con opción decimal, ej. $500,67')}
        ${mInput('*Monto', '$35.000', 'filled')}
      `)}
      ${col(`
        ${mInput('*RUT de quien recibe', '16.999.99-9', 'error', 'RUT inválido')}
        ${mInput('Dirección', 'Av. Las Condes 8977, Región Met…', 'valid')}
        ${mInput('Número', 'No editable', 'disabled')}
      `)}
    `);

    /* Search bar */
    const searchBar = (content, focus) => `<div style="height:44px;border-radius:6px;border:${focus ? '2px solid var(--b6)' : '1px solid var(--n3)'};background:#fff;display:flex;align-items:center;gap:8px;padding:0 12px;box-sizing:border-box">
      ${iconSvg('search', 16, 'var(--n5)')}
      <span style="flex:1;font:400 14px var(--font-sans);color:${content ? 'var(--n7)' : 'var(--n6)'}">${content || ''}</span>
      ${content ? iconSvg('close-filled', 16, 'var(--n5)') : ''}
      ${iconSvg('document-import', 18, 'var(--n6)')}
    </div>`;
    const search = mStage(`
      ${col(`${mLabel('Default')}${searchBar('', false)}${mLabel('Con búsqueda activa')}${searchBar('5544', true)}`, 280)}
      ${col(`${mLabel('Estado vacío del sheet de búsqueda')}
        <div style="text-align:center;padding:18px 10px">
          ${iconSvg('location', 24, 'var(--n5)')}
          <div style="font:400 13px/1.5 var(--font-sans);color:var(--n6);margin:10px 0 14px">Puedes buscar una orden por dirección, número de orden, cliente o ítem.</div>
          ${mBtn(`${iconSvg('document-import', 16, 'var(--b6)')} Abrir escáner`, 'outline')}
        </div>`, 280)}
    `);

    /* PIN input */
    const pinRow = (digits, state) => {
      const B = { empty: 'var(--n3)', focus: 'var(--b6)', error: 'var(--r6)', ok: 'var(--g5)' };
      return `<div style="display:flex;gap:8px;justify-content:center;margin-bottom:8px">${digits.map((d, i) => {
        const isFocus = state === 'empty' && i === 0;
        return `<div style="width:40px;height:50px;border-radius:6px;border:${isFocus ? '2px solid var(--b6)' : `1px solid ${B[state]}`};background:#fff;display:flex;align-items:center;justify-content:center;font:700 20px var(--font-sans);color:var(--n7)">${d}</div>`;
      }).join('')}</div>`;
    };
    const pinMsg = (t, color) => `<div style="text-align:center;font:500 12px var(--font-sans);color:${color};margin-bottom:14px">${t}</div>`;
    const pin = mStage(col(`
      ${mLabel('Vacío / focus')}${pinRow(['', '', '', '', '', ''], 'empty')}
      ${mLabel('Error')}${pinRow(['3', '2', '1', '4', '8', '0'], 'error')}${pinMsg('Código incorrecto', 'var(--r6)')}
      ${mLabel('Desbloqueado por supervisor')}${pinRow(['*', '*', '*', '*', '*', '*'], 'ok')}${pinMsg('Desbloqueado por supervisor', 'var(--g6)')}
      ${mLabel('Ingresado correctamente')}${pinRow(['3', '2', '1', '4', '8', '0'], 'ok')}${pinMsg('Ingresado correctamente', 'var(--g6)')}
      <div style="text-align:center;font:400 12px var(--font-sans);color:var(--n6)">Si el cliente no puede proporcionar el código contacta a tu <span style="font-weight:700;color:var(--b6)">Supervisor.</span></div>
    `, 320));

    /* Stepper */
    const stepRow = (label, stepper) => `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font:400 14px var(--font-sans);color:var(--n7)">${label}</span>${stepper}</div>`;
    const steppers = mStage(col(`
      ${stepRow('Entregado', mStepper(0))}
      ${stepRow('Ítem A', mStepper(1, { trash: true }))}
      ${mInput('Razón (etiqueta)', 'Selecciona razón', 'default', '', { rightIcon: 'chevron--down' })}
    `, 300));

    /* Dropdown + textarea */
    const dropTextarea = mStage(`
      ${col(`
        ${mInput('*Medio de transacción', 'Selecciona medio de transacción', 'default', '', { rightIcon: 'chevron--down' })}
        ${mInput('Medio de transacción', 'Efectivo', 'filled', '', { rightIcon: 'chevron--down' })}
        <div style="border:1px solid var(--n3);border-radius:6px;background:#fff;margin-top:2px;box-shadow:0 4px 16px rgba(0,0,0,.12);overflow:hidden">
          ${['Efectivo', 'Transferencia', 'Cheque', 'Redcompra'].map((o, i) => `<div style="height:44px;display:flex;align-items:center;padding:0 12px;font:400 14px var(--font-sans);color:var(--n7);${i === 0 ? 'background:var(--b1);color:var(--b7)' : ''}">${o}</div>`).join('')}
        </div>
      `, 270)}
      ${col(`
        <div style="font:500 12px var(--font-sans);color:var(--n6);margin-bottom:5px">Observaciones</div>
        <div style="height:96px;border:1px solid var(--n3);border-radius:6px;background:#fff;padding:10px 12px;font:400 14px var(--font-sans);color:var(--n6);box-sizing:border-box">Texto adicional</div>
      `, 270)}
    `);

    return `
      ${sectionHeader(data)}
      ${mComponentCard(c.textInput.name, 'EXTENDED', textStates, c.textInput.specs,
        'Mismos tokens que el input de escritorio, con alto 44dp. La validación es por campo, inline, nunca en toast.')}
      ${mComponentCard(c.searchBar.name, 'NEW', search, c.searchBar.specs)}
      ${mComponentCard(c.pinInput.name, 'NEW', pin, c.pinInput.specs,
        'Verificación de identidad del receptor. El link «Supervisor» abre el chat para solicitar desbloqueo remoto.')}
      ${mComponentCard(c.stepper.name, 'NEW', steppers, c.stepper.specs,
        'Para cantidades de ítems entregados y detalle de billetes en recaudo. Al combinarse con razones, cada razón lleva su propio stepper.')}
      ${mComponentCard(c.dropdown.name, 'EXTENDED', dropTextarea, c.dropdown.specs)}
      ${mComponentCard(c.textarea.name, 'EXTENDED', '', c.textarea.specs)}
      <div class="card" style="margin-bottom:20px;background:var(--b1);border-color:var(--b3)">
        <h3 style="font:700 14px var(--font-sans);color:var(--b7);margin:0 0 6px">Regla — pickers nativos</h3>
        <div style="font:400 13px/1.6 var(--font-sans);color:var(--n7)">${escHtml(data.nativeRule || '')}</div>
      </div>
      ${mRules(data.rules)}`;
  },

});
