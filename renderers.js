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

/* ── ICON PATHS (subset for sidebar/topbar previews) ── */
const ICON_PATHS = {
  'activity':   'M22 12 13.5 15.5 8.5 10.5 1 18M17 6 23 6 23 12',
  'package':    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  'truck':      'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21A2.5 2.5 0 1 0 5.5 16A2.5 2.5 0 0 0 5.5 21zM18.5 21A2.5 2.5 0 1 0 18.5 16A2.5 2.5 0 0 0 18.5 21z',
  'bell':       'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  'user':       'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7A4 4 0 1 0 12 15A4 4 0 0 0 12 7Z',
  'settings':   'M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33',
  'chart-bar':  'M18 20 18 10M12 20 12 4M6 20 6 14',
  'route':      'M3 11 3 7 7 3 17 3 17 7M7 3 7 13M17 7 17 17 13 21 3 21 3 17M7 13 13 13M13 13 13 21',
  'search':     'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21 16.65 16.65',
  'grid':       'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  'help-circle':'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4',
  'message':    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

function iconSvg(name, size, color) {
  const p = ICON_PATHS[name] || ICON_PATHS['activity'];
  return `<svg width="${size||14}" height="${size||14}" viewBox="0 0 24 24" fill="none" stroke="${color||'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg>`;
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
    const icons = (data.icons || []).map(([name, path]) => `
      <div class="icon-cell">
        <svg viewBox="0 0 24 24"><path d="${path}" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="ic-lbl">${name.toLowerCase()}</span>
      </div>`).join('');

    const order = (data.topbarOrder || []).map((n,i) =>
      `<span style="font:500 12px var(--font-sans);color:var(--n5)">${i+1} · ${n}</span>`).join('');

    return `
      ${sectionHeader(data)}
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
    const p = data.preview || {};
    const hdr = p.header || {};
    const items = (p.items || []).map(it => {
      if (it.divider) return `<div class="div"></div>`;
      const cls = it.state === 'selected' ? 'it sel' : it.state === 'hover' ? 'it hov' : 'it';
      const iconPath = ICON_PATHS[it.icon] || ICON_PATHS['package'];
      return `<div class="${cls}">
        <svg viewBox="0 0 24 24"><path d="${iconPath}"/></svg>
        ${escHtml(it.label)}
      </div>`;
    }).join('');

    const t = data.tokens || {};
    const tokenRows = Object.entries(t).map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    return `
      ${sectionHeader(data)}
      <div class="card" style="background:var(--n2)">
        <div style="display:flex;gap:14px;align-items:flex-start">
          <div class="sbp">
            <div class="top">${escHtml(hdr.brand || 'DT')}<span>${escHtml(hdr.productName || 'last')}<b>${escHtml(hdr.productAccent || 'mile')}</b></span></div>
            ${items}
          </div>
          <div style="font:400 12px/1.8 var(--font-sans);color:var(--n5);padding:6px">
            <div><b style="color:var(--n7)">Default</b> — white bg, B7 (#0052CC) icon + label.</div>
            <div style="margin-top:8px"><b style="color:var(--n7)">Hover</b> — B1 (#EDF5FF) bg, icons/label stay B7.</div>
            <div style="margin-top:8px"><b style="color:var(--n7)">Selected</b> — B1 bg, bold label, 3px B5 left marker.</div>
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

  /* ── TOPBAR ── */
  topbar(data) {
    const t = data.tokens || {};
    const iconPaths = {
      apps:     'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      help:     'M12 22A10 10 0 1 0 12 2A10 10 0 0 0 12 22ZM9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4',
      messages: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      alerts:   'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
      user:     'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7A4 4 0 1 0 12 15A4 4 0 0 0 12 7Z',
    };

    const icons = (data.iconOrder || []).map((name, i) => {
      const p = iconPaths[name] || '';
      const isAlert = name === 'alerts';
      const wrap = isAlert ? `<div class="bell">` : '';
      const wrapEnd = isAlert ? `</div>` : '';
      return `${wrap}<svg class="tico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${p}"/></svg>${wrapEnd}`;
    }).join('');

    const tokenRows = Object.entries(t).filter(([k]) => k !== 'productColors').map(([k,v]) =>
      `<tr><td><code>${escHtml(k)}</code></td><td><code>${escHtml(String(v))}</code></td></tr>`).join('');

    const products = t.productColors ? Object.entries(t.productColors).map(([name, hex]) => `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:12px;height:12px;border-radius:50%;background:${hex}"></div>
        <span style="font:400 12px var(--font-sans);color:var(--n5)">${name} · ${hex}</span>
      </div>`).join('') : '';

    return `
      ${sectionHeader(data)}
      <div class="card" style="background:var(--n2);display:flex;flex-direction:column;gap:12px">
        <div class="tbar">
          <svg class="logo" height="18" viewBox="0 0 227 20" fill="none">
            <path d="M152 15.7V0H153.9V15.7H152Z" fill="#F27B42"/>
            <path d="M6.9 0H0V15.6H7C9.2 15.6 10.8 14 10.8 11.8V3.9C10.8 1.6 9.2 0 6.9 0ZM8 12.1C8 12.8 7.7 13.1 7 13.1H2.8V2.6H7C7.7 2.6 8 2.9 8 3.6V12.1Z" fill="#0052CC"/>
            <path d="M15.3 4.2H12.5V15.6H15.3V4.2Z" fill="#0052CC"/>
            <path d="M15.3 0.1H12.5V2.7H15.3V0.1Z" fill="#F27B42"/>
            <path d="M92.4 0H82.4V2.5H86V15.6H88.8V2.5H92.4V0Z" fill="#0052CC"/>
          </svg>
          <div class="acts">${icons}</div>
          <div class="slot">ACME CO</div>
        </div>
      </div>
      <div class="card" style="margin-top:10px;padding:14px">
        <div style="font:400 12px/1.8 var(--font-sans);color:var(--n5)">
          <strong style="color:var(--n7)">Rules:</strong> background is always <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">#132045</code> · height 52px · company slot <code style="font:500 11px var(--font-mono);background:var(--n2);padding:1px 5px;border-radius:3px">border-radius: 25px 0 0 0</code> · icon gap desktop 28px / mobile 12px
        </div>
        ${products ? `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px">${products}</div>` : ''}
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
    const lightSvg = `<svg viewBox="0 0 227 20" fill="none">
      <path d="M152 15.7V0H153.9V15.7H152Z" fill="#F27B42"/>
      <path d="M6.9 0H0V15.6H7C9.2 15.6 10.8 14 10.8 11.8V3.9C10.8 1.6 9.2 0 6.9 0ZM8 12.1C8 12.8 7.7 13.1 7 13.1H2.8V2.6H7C7.7 2.6 8 2.9 8 3.6V12.1Z" fill="#0052CC"/>
      <path d="M15.3 4.2H12.5V15.6H15.3V4.2Z" fill="#0052CC"/>
      <path d="M15.3 0.1H12.5V2.7H15.3V0.1Z" fill="#F27B42"/>
      <path d="M92.4 0H82.4V2.5H86V15.6H88.8V2.5H92.4V0Z" fill="#0052CC"/>
      <path d="M165.5 4.9H167.3V15.7H165.5V13.8C164.6 15.3 163.2 16 161.5 16C158.6 16 156.1 13.5 156.1 10.3C156.1 7.1 158.6 4.7 161.5 4.7C163.2 4.7 164.6 5.4 165.5 6.8V4.9ZM161.7 14.2C163.3 14.2 165.5 12.8 165.5 10.3C165.5 7.8 163.3 6.5 161.7 6.5C160.1 6.5 157.9 7.8 157.9 10.3C157.9 12.8 160.1 14.2 161.7 14.2Z" fill="#F27B42"/>
    </svg>`;

    const darkSvg = `<svg viewBox="0 0 227 20" fill="none">
      <g fill="white">
        <path d="M6.9 0H0V15.6H7C9.2 15.6 10.8 14 10.8 11.8V3.9C10.8 1.6 9.2 0 6.9 0ZM8 12.1C8 12.8 7.7 13.1 7 13.1H2.8V2.6H7C7.7 2.6 8 2.9 8 3.6V12.1Z"/>
        <path d="M15.3 4.2H12.5V15.6H15.3V4.2Z"/>
        <path d="M92.4 0H82.4V2.5H86V15.6H88.8V2.5H92.4V0Z"/>
        <path d="M141.9 15.6V4.4H143.5V15.6H141.9Z"/>
      </g>
      <path d="M15.3 0.1H12.5V2.7H15.3V0.1Z" fill="#F27B42"/>
      <path d="M152 15.7V0H153.8V15.7H152Z" fill="#F27B42"/>
      <path d="M165.1 4.9H166.9V15.7H165.1V13.8C164.2 15.3 162.9 16 161.2 16C158.3 16 155.9 13.5 155.9 10.3C155.9 7.1 158.3 4.7 161.2 4.7C162.9 4.7 164.2 5.4 165.1 6.8V4.9ZM161.4 14.2C163 14.2 165.1 12.8 165.1 10.3C165.1 7.8 163 6.5 161.4 6.5C159.8 6.5 157.8 7.8 157.8 10.3C157.8 12.8 159.8 14.2 161.4 14.2Z" fill="#F27B42"/>
    </svg>`;

    const iconSvg = `<svg viewBox="0 0 30 20" fill="none">
      <path d="M6.9 0H0V15.6H7C9.2 15.6 10.8 14 10.8 11.8V3.9C10.8 1.6 9.2 0 6.9 0ZM8 12.1C8 12.8 7.7 13.1 7 13.1H2.8V2.6H7C7.7 2.6 8 2.9 8 3.6V12.1Z" fill="#0052CC"/>
      <path d="M15.3 4.2H12.5V15.6H15.3V4.2Z" fill="#0052CC"/>
      <path d="M15.3 0.1H12.5V2.7H15.3V0.1Z" fill="#F27B42"/>
    </svg>`;

    const cards = [
      { name: 'DT Primary Light', bg: '#fff', svgContent: lightSvg, dark: false },
      { name: 'DT Primary Dark', bg: '#132045', svgContent: darkSvg, dark: true },
      { name: 'DT Icon Only', bg: '#fff', svgContent: iconSvg, dark: false },
    ];

    const logoCards = cards.map(c => `
      <div class="logo-card ${c.dark ? 'dk' : ''}" style="background:${c.bg}">
        <div class="lc">${c.svgContent}</div>
        <div class="lf">
          <div class="ll">${c.name}</div>
          <button class="ld" onclick="copyToClipboard(this.closest('.logo-card').querySelector('svg').outerHTML, this)">↓ Copy SVG</button>
        </div>
      </div>`).join('');

    return `
      ${sectionHeader(data)}
      <div class="logo-grid">${logoCards}</div>
      <div class="card" style="margin-top:12px;padding:12px 16px">
        <p style="font:400 12px var(--font-sans);color:var(--n5);margin:0">SVG only. Never scale below 18px height. Use the dark variant on Indigo (#132045) backgrounds.</p>
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
