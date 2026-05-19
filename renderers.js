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
  const cls = {success:'bg',danger:'br',warning:'bo',info:'bb',neutral:'bn',outline:'bx'}[type] || 'bn';
  return `<span class="badge ${cls}">${label}</span>`;
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
  // aliases for topbar icon order keys
  'alerts':        '<path d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>',
  'messages':      '<path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z"/>',
  'help-circle':   '<path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/><circle cx="16" cy="23.5" r="1.5"/><path d="M17,8H15.5A4.49,4.49,0,0,0,11,12.5V13h2v-.5A2.5,2.5,0,0,1,15.5,10H17a2.5,2.5,0,0,1,0,5H15v4.5h2V17a4.5,4.5,0,0,0,0-9Z"/>',
  'bell':          '<path d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>',
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
      <div class="card">
        <h3 style="margin:0 0 14px;font:700 14px var(--font-sans)">What's inside this repo</h3>
        <div class="prod-grid">${products}</div>
      </div>
      <div class="card flush">
        <div class="card-hdr"><span class="ttl">colors_and_type.css</span><span class="meta">v2.4 · 8.2 KB</span></div>
        <div class="code"><button class="cp" onclick="copyCode(this)">Copy</button><pre><span class="cm">/* Instalar: npm install @beetrack/hp-tokens-style */</span>
<span class="kw">@import</span> <span class="str">'~@beetrack/hp-tokens-style'</span>;

<span class="cm">/* O carga las fuentes directamente */</span>
<span class="kw">@import</span> <span class="str">url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&amp;family=Roboto+Mono&amp;display=swap')</span>;

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
    const semRows = (data.semanticTokens || []).map(t => {
      const tc = isLight(t.hex) ? '#39414D' : '#fff';
      return `<tr>
        <td><div style="width:36px;height:36px;border-radius:4px;background:${t.hex};border:1px solid rgba(19,32,69,.1);cursor:pointer" onclick="copyToClipboard('${t.hex}',this)" title="Copy ${t.hex}"></div></td>
        <td><code>${escHtml(t.name)}</code></td>
        <td><code>${t.hex}</code>${t.sub ? ` <span style="color:var(--n5);font-size:10px">· ${t.sub}</span>` : ''}</td>
        <td style="color:var(--n5)">${t.use}</td>
      </tr>`;
    }).join('');

    const groups = (data.groups || []).map(g => {
      const swatches = g.swatches.map(s => {
        const tc = isLight(s.hex) ? '#39414D' : '#fff';
        return `<div class="sw" style="background:${s.hex};color:${tc}" onclick="copyToClipboard('${s.hex}',this)">
          <b>${escHtml(s.label)}</b><span>${s.hex}</span>
        </div>`;
      }).join('');
      return `<h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">${escHtml(g.label)}</h3>
        <div class="sw-grid">${swatches}</div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:0 0 10px;color:var(--n7)">Semantic tokens — <code>$dt-*</code> variables</h3>
      <table class="ttbl" style="margin-bottom:16px">
        <thead><tr><th style="width:60px">Swatch</th><th>Token</th><th>Hex</th><th>Use</th></tr></thead>
        <tbody>${semRows}</tbody>
      </table>
      ${groups}`;
  },

  /* ── TYPOGRAPHY ── */
  typography(data) {
    const fonts = (data.fonts || []).map(f => `
      <div>
        <div style="font:500 10px var(--font-sans);letter-spacing:.1em;text-transform:uppercase;color:var(--n5);margin-bottom:7px">${f.family} ${f.token ? `— <code>${f.token}</code>` : ''}</div>
        <div style="font:700 32px/1.1 '${f.family}';letter-spacing:-.02em;color:var(--n7)">${f.specimen}</div>
        <div style="font:400 16px/20px '${f.family}';color:var(--n7);margin-top:7px">${f.sample}</div>
        <div style="font:400 11px var(--font-mono);color:var(--n5);margin-top:7px">${f.note}</div>
      </div>`).join('');

    const scaleRows = (data.scale || []).map(s => {
      const fontVal = s.font === 'Roboto Mono' ? `'Roboto Mono'` : `'DM Sans'`;
      return `<tr>
        <td>${s.name}</td>
        <td style="font:${s.weight} ${s.size}px/${s.lineHeight}px ${fontVal};color:var(--n7)">${s.sample}</td>
        <td>${s.size}px / ${s.lineHeight}px · ${s.weight === 700 ? 'Bold' : s.weight === 500 ? 'Medium' : 'Regular'}${s.font === 'Roboto Mono' ? ' · Roboto Mono' : ''}</td>
      </tr>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card" style="margin-bottom:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">${fonts}</div>
      </div>
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Type scale — <code>hp-typography__*</code></h3>
      <div class="card">
        <table class="ts-table">${scaleRows}</table>
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
    const icons = (data.icons || []).map(([name, inner]) => `
      <div class="icon-cell">
        <svg viewBox="0 0 32 32" fill="currentColor">${inner}</svg>
        <span class="ic-lbl">${escHtml(name.toLowerCase())}</span>
      </div>`).join('');

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
      <div class="card">
        <div class="icon-grid">${icons}</div>
      </div>
      <div class="card flush" style="margin-top:10px">
        <div class="card-hdr"><span class="ttl">Topbar icon order (invariable)</span></div>
        <div style="padding:14px;display:flex;gap:20px;align-items:center">${order}</div>
      </div>`;
  },

  /* ── BUTTONS ── */
  buttons(data) {
    const preview = (data.variants || []).map(v => {
      const states = v.states.map(s => {
        const style = [
          `background:${s.bg}`,
          `color:${s.color}`,
          s.border && s.border !== 'none' ? `border:${s.border}` : 'border:none',
          s.underline ? 'text-decoration:underline' : '',
        ].filter(Boolean).join(';');
        return `<button class="btn" style="${style};font:500 16px/16px var(--font-sans);height:40px;padding:0 32px;border-radius:50px;min-width:64px;cursor:pointer;display:inline-flex;align-items:center">${escHtml(s.text)}</button>`;
      }).join('');
      return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span style="width:100px;font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.05em">${escHtml(v.label)}</span>
        ${states}
      </div>`;
    }).join('');

    const tokenRows = Object.entries(data.tokens || {}).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    const previewTab = `<div style="padding:18px;display:flex;flex-direction:column;gap:14px">${preview}</div>`;
    const codeTab = `<div class="code" style="border-radius:0"><button class="cp" onclick="copyCode(this)">Copy</button><pre>${escHtml(data.code || '')}</pre></div>`;

    return `
      ${sectionHeader(data)}
      ${tabCard([{label:'Preview', content: previewTab}, {label:'Code', content: codeTab}])}
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Design tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody>${tokenRows}</tbody>
        </table>
      </div>`;
  },

  /* ── INPUTS ── */
  inputs(data) {
    const IC = {
      search:       'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M21 21 16.65 16.65',
      'x-circle':   'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM15 9l-6 6M9 9l6 6',
      'check-circle':'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM9 12l2 2 4-4',
    };
    const IC_COLOR = { 'x-circle': '#DE350B', 'check-circle': '#00875A' };

    function trailingIcon(name) {
      const p = IC[name] || IC.search;
      const c = IC_COLOR[name] || 'currentColor';
      return `<span class="hp-text-field__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg></span>`;
    }

    const cards = (data.variants || []).map(v => {
      const p = v.props;
      const hasValue  = !!p.value;
      const isFocused = !!p.focused;
      const isActive  = hasValue || isFocused;

      const mods = [
        p.dark      && 'dark',
        isFocused   && 'focused',
        p.textArea  && 'textarea',
        p.fullWidth && 'fullwidth',
        p.error     && 'error',
        p.dense     && 'dense',
        p.disabled  && 'disabled',
        p.readOnly  && 'read-only',
        p.trailingIcon && 'with-trailing-icon',
        !p.label    && 'no-label',
      ].filter(Boolean).map(m => `hp-text-field--${m}`).join(' ');

      const labelActiveCls = isActive ? 'hp-text-field__label--active' : '';
      const labelErrorCls  = p.error  ? 'hp-text-field__label--error'  : '';

      const fieldAttrs = [
        p.disabled ? 'disabled' : '',
        p.readOnly ? 'readonly' : '',
        p.placeholder ? `placeholder="${escHtml(p.placeholder)}"` : '',
        p.textArea && p.rows ? `rows="${p.rows}"` : '',
      ].filter(Boolean).join(' ');

      const fieldHtml = p.textArea
        ? `<textarea class="hp-text-field__input" ${fieldAttrs}>${escHtml(p.value || '')}</textarea>`
        : `<input class="hp-text-field__input" type="text" ${fieldAttrs} value="${escHtml(p.value || '')}">`;

      const labelHtml = p.label
        ? `<label class="hp-text-field__label ${labelActiveCls} ${labelErrorCls}">
            ${p.required ? '<span class="hp-text-field__required-mark">*</span>' : ''}${escHtml(p.label)}
          </label>`
        : '';

      const iconHtml  = p.trailingIcon ? trailingIcon(p.trailingIcon) : '';
      const helperHtml = `<div class="hp-text-field__helper-text">${escHtml(p.helperText || '')}</div>`;
      const wrapStyle = p.dark ? 'background:var(--indigo);padding:14px;border-radius:6px;display:inline-block' : '';

      return `
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="font:600 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">${escHtml(v.label)}</div>
          <div style="${wrapStyle}">
            <div class="hp-text-field ${mods}">
              <div class="hp-text-field__content">
                ${fieldHtml}
                ${labelHtml}
                ${iconHtml}
              </div>
              ${helperHtml}
            </div>
          </div>
          <div style="font:400 11px var(--font-sans);color:var(--n45);line-height:1.4">${escHtml(v.description)}</div>
        </div>`;
    }).join('');

    const tokenRows = Object.entries(data.tokens || {}).map(([k, v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`
    ).join('');

    const previewTab = `<div style="padding:20px;background:var(--n1)"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px 28px">${cards}</div></div>`;
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

  /* ── BANNERS ── */
  banners(data) {
    const typeMap = {
      success: {cls:'ok', iconPath:'M22 12A10 10 0 1 0 2 12A10 10 0 0 0 22 12ZM9 12 11 14 15 10'},
      warning: {cls:'wr', iconPath:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4'},
      danger:  {cls:'er', iconPath:'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM15 9l-6 6M9 9l6 6'},
      info:    {cls:'in', iconPath:'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM12 8h.01M12 12v4'},
    };

    const bns = (data.banners || []).map(b => {
      const t = typeMap[b.type] || typeMap.info;
      const text = b.title ? `<b>${escHtml(b.title)}</b> ${b.text}` : b.text;
      return `<div class="bn ${t.cls}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${b.iconColor}" stroke-width="2"><path d="${t.iconPath}"/></svg>
        <span>${text}</span>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card">${bns}</div>`;
  },

  /* ── MODAL ── */
  modal(data) {
    const p = data.preview || {};
    const fields = (p.fields || []).map(f => {
      const focusCls = f.state === 'focus' ? 'foc' : '';
      const selectArrow = f.type === 'select' ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--n5)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>` : '';
      return `<div class="fld" style="margin-bottom:10px">
        <label>${escHtml(f.label)}${f.required ? ' <span class="req">*</span>' : ''}</label>
        <div class="inp ${focusCls}" style="${f.type === 'select' ? 'justify-content:space-between' : ''}">
          <input value="${escHtml(f.value || '')}" style="width:100%">${selectArrow}
        </div>
        ${f.helper ? `<div class="hlp">${escHtml(f.helper)}</div>` : ''}
      </div>`;
    }).join('');

    const actions = (p.actions || []).map(a => {
      const cls = a.type === 'primary' ? 'btn pri' : 'btn sec';
      return `<button class="${cls}">${escHtml(a.label)}</button>`;
    }).join('');

    const warning = p.warning ? `<div class="bn wr" style="margin-bottom:14px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFAB00" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
      <span>${escHtml(p.warning)}</span>
    </div>` : '';

    const t = data.tokens || {};
    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    return `
      ${sectionHeader(data)}
      <div class="card flush">
        <div class="modal-stage">
          <div class="modal">
            <div class="mh">
              <h1>${escHtml(p.title || '')}</h1>
              <svg style="width:22px;height:22px;color:var(--n5);cursor:pointer;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </div>
            <div class="msub">${escHtml(p.subtitle || '')}</div>
            ${fields}
            ${warning}
            <div class="mfot">${actions}</div>
          </div>
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

  /* ── TABLE ── */
  table(data) {
    const cols = (data.columns || []).map(c => `<th style="${!c ? 'width:22px' : ''}">${escHtml(c)}</th>`).join('');
    const rows = (data.rows || []).map(r => {
      const cls = r.state === 'hover' ? 'hov' : r.state === 'selected' ? 'sel' : '';
      const cells = r.cells.map((c, i) => {
        if (typeof c === 'object' && c.badge) {
          return `<td>${badgeHtml(c.badge, c.type)}</td>`;
        }
        if (i === 1 && c) return `<td class="lnk">${escHtml(String(c))}</td>`;
        return `<td>${escHtml(String(c))}</td>`;
      }).join('');
      return `<tr class="${cls}">${cells}</tr>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card flush">
        <table class="tbl">
          <thead><tr>${cols}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  /* ── SIDEBAR ── */
  sidebar(data) {
    const t = data.tokens || {};
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
    </style>`;

    function buildItems(items) {
      return (items || []).map(it => {
        if (it.divider) return `<div class="sbx-sep"></div>`;
        const isSel = it.state === 'selected';
        const iconPath = ICON_PATHS[it.icon] || ICON_PATHS['package'];
        return `<div class="sbx-row${isSel ? ' sel' : ''}">
          <div class="sbx-bar"></div>
          <div class="sbx-bg">
            <div class="sbx-ico">${iconSvg(it.icon, 18)}</div>
            <span class="sbx-lbl">${escHtml(it.label)}</span>
          </div>
        </div>`;
      }).join('');
    }

    const productSections = products.map(p => {
      const interactiveItems = buildItems(p.items);
      const settingsItems = buildItems(p.settingsItems || p.items);

      return `
        <div style="margin-bottom:32px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
            <div style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
            <span style="font:700 14px var(--font-sans);color:var(--n7)">${escHtml(p.name)}</span>
          </div>
          <div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap">
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Collapsed → hover to expand</div>
              <div class="sbx">${interactiveItems}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:7px">
              <div style="font:500 10px var(--font-sans);color:var(--n5);text-transform:uppercase;letter-spacing:.07em">Settings state</div>
              <div class="sbx-static">${settingsItems}</div>
            </div>
          </div>
        </div>`;
    }).join('');

    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    return `
      ${sectionHeader(data)}
      ${SB_STYLE}
      <div class="card" style="background:var(--n2)">
        ${productSections}
      </div>
      <h3 style="font:700 15px/1.4 var(--font-sans);margin:20px 0 10px;color:var(--n7)">Design tokens</h3>
      <div class="card">
        <table class="ttbl">
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody>${tokenRows}</tbody>
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
    const groups = (data.groups || []).map(g => {
      const pins = (g.pins || []).map(p => {
        return `<div class="pin-cell">
          ${pinSVG(p)}
          <div class="cap">${escHtml(p.cap)}</div>
        </div>`;
      }).join('');
      return `<div class="pin-row">${pins}</div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card flush">
        <div class="pin-stage">${groups}</div>
      </div>`;
  },

  /* ── DATAVIZ ── */
  dataviz(data) {
    const dots = (data.palette || []).map((c, i) => {
      const tc = isLight(c) ? 'rgba(0,0,0,.55)' : '#fff';
      return `<div>
        <div class="dv-dot" style="background:${c};color:${tc}">${i+1}</div>
        <div class="dv-lbl">${c}</div>
      </div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card">
        <div class="dv-row">${dots}</div>
        <div style="font:400 11px var(--font-sans);color:var(--n5);margin-top:10px">Assign in strict order 1 → 11. Do not skip or reuse out of sequence.</div>
      </div>`;
  },

  /* ── SERVICE UNITS ── */
  serviceunits(data) {
    const dots = (data.palette || []).map((p, i) => {
      return `<div class="su-dot" style="background:${p.hex};color:${p.textColor}" title="${escHtml(p.label)} · ${p.hex}">${i+1}</div>`;
    }).join('');

    return `
      ${sectionHeader(data)}
      <div class="card">
        <div class="su-grid">${dots}</div>
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
    return `
      <h1 style="font:700 28px/1.2 var(--font-sans);margin:0 0 6px;color:var(--n7)" data-i18n="changelog.title">Changelog</h1>
      <p class="sub" style="font:400 14px/1.6 var(--font-sans);color:var(--n5);margin:0 0 28px;max-width:660px" data-i18n="changelog.description">Versioned releases. Breaking changes flagged in red.</p>
      <div class="card">
        <div class="cl-filters">
          <input type="search" id="cl-filter-search" placeholder="Buscar en el changelog…" autocomplete="off">
          <select id="cl-filter-component"><option value="">Todos los componentes</option></select>
          <select id="cl-filter-type"><option value="">Todos los tipos</option></select>
        </div>
        <div id="changelog-list"></div>
      </div>`;
  },

};
