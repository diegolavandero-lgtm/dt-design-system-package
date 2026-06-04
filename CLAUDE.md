# DispatchTrack Design System — Session Guide

This file is read automatically by Claude at the start of every session.
Follow this guide to maintain continuity across tickets without re-explaining context.

---

## Project overview

This repo is the **DispatchTrack Design System** for the Lastmile product.
Every session here produces one or more HTML prototypes that are committed, pushed to GitHub,
and auto-deployed via Cloudflare Pages to `https://dt-design-system-package.pages.dev`.

---

## Established workflow (follow this every ticket)

```
1. READ    → ALL sections/*.json specs + dt-design-system.html + colors_and_type.css (see "Files to read" table below)
2. REVIEW  → navigate the live Jira ticket and the production page (if it exists)
3. AUDIT   → use /ux-design-expert to identify layout and flow improvements
4. CONFIRM → propose improvements, wait for user to choose directions
5. BUILD   → create [feature]-[TICKET].html in repo root using DS tokens/components
6. VERIFY  → preview in browser, confirm visual match against production
7. DOCUMENT → create ds-new-components-[TICKET].html with review cards
8. PUSH    → git commit + push → Cloudflare Pages deploys automatically (pages.dev, NOT vercel)
9. JIRA    → post comment to the ticket via Jira REST API (browser session)
```

---

## Files to read at every session start

**CRITICAL: Always read ALL of these before designing anything. This is the source of truth.**

### Foundations
| File | What it defines |
|---|---|
| `colors_and_type.css` | All color tokens — NEVER invent colors |
| `sections/foundations/colors.json` | Color palette + semantic tokens |
| `sections/foundations/typography.json` | Font sizes, weights, line-heights per element |
| `sections/foundations/spacing.json` | Spacing scale (4px base unit) |
| `sections/foundations/shadows.json` | Shadow values per elevation level |
| `sections/foundations/radii.json` | Border-radius per component type |
| `sections/foundations/iconography.json` | **IBM Carbon icons** — always use these, never Feather/Heroicons |

### Components
| File | What it defines |
|---|---|
| `sections/components/buttons.json` | Height 32px, radius 50px, primary=#4B82FA default/#1F60ED hover |
| `sections/components/inputs.json` | Height 32px, radius 6px, focus=2px #1F60ED + bg #EDF5FF |
| `sections/components/chips.json` | Radius 4px (NOT pill), font-weight 600, padding 2px 6px |
| `sections/components/badges.json` | Badge/pill component specs |
| `sections/components/sidebar.json` | White bg, 52px collapsed, Carbon icons, selected=rgba(75,130,250,.08) |
| `sections/components/topbar.json` | 52px, #132045, icon order: apps·help·messages·alerts·user, slot 100px |
| `sections/components/modal.json` | Modal/drawer specs |
| `sections/components/tooltip.json` | Tooltip specs |
| `sections/components/banners.json` | Info/warning banner specs |
| `sections/components/alerts.json` | Alert component specs |
| `sections/components/dropdowns.json` | Dropdown menu specs |
| `sections/components/table.json` | Table/matrix specs |
| `sections/components/filters.json` | Filter builder specs |
| `sections/components/selection.json` | Selection/checkbox specs |

### Assets
| File | What it defines |
|---|---|
| `sections/assets/logos/lastmile-desktop-white.svg` | Official LastMile logo — always use for topbar |
| `sections/assets/logos/` | All product logos (never create custom logos) |
| `sections/assets/pins/` | Map pin assets |

### Pages & Patterns
| File | What it defines |
|---|---|
| `dt-design-system.html` | Full live component library with CSS classes |
| `sections/pages/table-page.json` | Table page shell pattern |
| `sections/patterns/screen-examples.json` | Full screen examples |

### Key spec values (memorize these)
- **Icons**: IBM Carbon, `viewBox="0 0 32 32"`, `fill="currentColor"` (never stroke)
- **Topbar**: 52px, `#132045`, icon order = apps · help · messages · alerts · user
- **Primary button**: bg `#4B82FA` default, `#1F60ED` hover, `#0052CC` active, radius 50px, h 32px
- **Input**: h 32px, radius 6px, focus = `2px solid #1F60ED` + bg `#EDF5FF`
- **Chip**: radius `4px` (NOT 999px), `font-weight: 600`, padding `2px 6px`
- **Topbar slot**: 100px wide, `border-radius: 25px 0 0 0`
- **Sidebar**: white bg, 52px collapsed, selected = `rgba(75,130,250,.08)` + 3px `#4B82FA` left border

---

## Design system conventions (critical)

### Topbar
- Always `height: 52px`, `background: #132045` (var(--indigo))
- Logo: `sections/assets/logos/lastmile-desktop-white.svg` (height 20px)
- Icon order: apps · bell (with red dot badge) · chat · help · gear · user
- Company slot: `width: 88px`, `border-radius: 20px 0 0 0`, white bg, indigo text

### Sidebar
- Two-part: narrow icon strip (44px, `#132045`) + text nav (212px, white)
- Active item: `background: #EDF5FF`, `border-left: 2px solid #0052CC`, bold blue text
- Group labels: bold, sentence case — NOT all-caps small

### Buttons
- **All buttons are pill-shaped**: `border-radius: 100px`
- Primary: `background: #1F60ED`, `color: #fff`, `height: 32px`, `font-weight: 700`
- Outline: `border: 1px solid #1F60ED`, `color: #1F60ED`, white bg
- Hover primary: `#0052CC`
- **Never use orange or teal for primary CTAs** — those are warning/accent colors

### Color tokens (most used)
```
--indigo: #132045   topbar only
--n2: #F0F2F5       page background
--n3: #E1E6ED       borders
--n5: #67768D       secondary text
--n7: #39414D       primary text
--b6: #1F60ED       primary blue (buttons, active states)
--b7: #0052CC       links, hover
--g1: #E3FCEF       success light bg
--g6: #00875A       success green
--r6: #DE350B       danger/error
--o5: #FFAB00       warning amber (paused state, never for CTAs)
```

### Typography
- Primary font: `DM Sans` (400/500/700)
- Mono: `Roboto Mono` (code, tokens, labels)
- Page title: `22–28px / 700`
- Section labels: ALL CAPS, `10–11px / 700`, letter-spacing `.07em`

### Banners
- **Blue** (`.bn.in`): informational, system messages, feature info
- **Amber** (`.bn.wr`): action required NOW, data loss warnings
- Never use amber for passive/neutral information

### Modals
- Title = action (specific, names the item)
- Body = consequence (what happens, reassurance)
- Never generic "Are you sure?" — always name what's being affected

### Toasts
- Success (green `#00875A`): completed actions, saves, activations, deactivations
- Never use warning toast for successful actions

---

## Existing prototypes (use as style reference)

| File | Description | Live URL |
|---|---|---|
| `notifications-settings-DES824.html` | Notification settings listing page | [view](https://dt-design-system-package.pages.dev/notifications-settings-DES824.html) |
| `notifications-new-DES824.html` | New notification editor | [view](https://dt-design-system-package.pages.dev/notifications-new-DES824.html) |
| `ds-new-components-DES824.html` | DS review document (template) | [view](https://dt-design-system-package.pages.dev/ds-new-components-DES824.html) |
| `alerts-settings-DES825.html` | Alerts Settings redesign | [view](https://dt-design-system-package.pages.dev/alerts-settings-DES825.html) |
| `alerts-drawer-DES825.html` | Notifications drawer with Alerts tab | [view](https://dt-design-system-package.pages.dev/alerts-drawer-DES825.html) |
| `ds-new-components-DES825.html` | DS review document DES-825 | [view](https://dt-design-system-package.pages.dev/ds-new-components-DES825.html) |

These represent the current baseline. New prototypes should match this level of fidelity.

---

## File naming conventions

```
[feature-name]-[JIRA-TICKET].html        # prototype
ds-new-components-[JIRA-TICKET].html     # DS review document
```

Examples:
- `notifications-settings-DES824.html`
- `ds-new-components-DES824.html`

---

## DS review document standard

Every ticket that produces new UI components must generate a `ds-new-components-[TICKET].html`.
This file:
- Documents each new/extended/rule component with a live preview
- Wraps each component in a collapsible review card
- Has **✓ Add to DS** / **✗ Skip** decision buttons
- Has a **Notes & justification** textarea
- Persists decisions to `localStorage`
- Has a summary bar (progress ring + counts + "Copy decisions" export)

Tag each component as: `NEW` / `EXTENDED` / `RULE`

---

## Skills to use

| Task | Skill/tool |
|---|---|
| UX audit of existing screen | `/ux-design-expert` |
| Inspect live production page | Claude in Chrome → navigate → screenshot/JS |
| Check exact CSS values | `mcp__Control_Chrome__execute_javascript` → `getComputedStyle` |
| Post/update Jira comment | `mcp__Control_Chrome__execute_javascript` → Jira REST API `/rest/api/3/issue/{KEY}/comment` |
| Deploy prototype | `git commit + push` → Vercel auto-deploys |

---

## Vercel deployment

- Domain: `https://dt-design-system-package.pages.dev`
- Trigger: any `git push` to `main` (deployed via Cloudflare Pages, NOT Vercel)
- All `.html` files in root are served at their filename path
- No build step required — static HTML only

---

## Jira workflow

At the end of every ticket:
1. Use `mcp__Control_Chrome__get_current_tab` to confirm you're on the right ticket
2. Post comment via `fetch('/rest/api/3/issue/{KEY}/comment', {method:'POST', ...})`
3. Use Atlassian Document Format (ADF) — `{type:'doc', version:1, content:[...]}`
4. Include: summary of work + acceptance criteria table
5. Add prototype links as a final table block

---

## Production environment

- Live app: `https://demo-cluster.dispatchtrack.com`
- Always verify real component behavior before designing
- Use `getComputedStyle` to extract exact CSS values from production (button radius, colors, fonts)

---

## Page templates

When the user says **"use the table page as basis"** or **"use this as a template"**,
reproduce the **exact layout, structure, paddings, and gaps** — only swap the content.
Never invent a new layout. The template lives in:

- Renderer : `tablepage(data)` in `renderers.js`
- Data file : `sections/pages/table-page.json`

---

### Table page template — full layout spec

```
┌─────────────────────────────────────────────────────────┐
│ TOPBAR  .tbar  height:52px  background:#132045          │
├────┬────────────────────────────────────────────────────┤
│    │  background:var(--n2)                              │
│ S  │  padding: 20px 24px 16px                           │
│ I  │  display:flex  flex-direction:column  gap:20px     │
│ D  │                                                    │
│ E  │  ① PAGE HEADER  height:32px                        │
│ B  │     justify-content:space-between                  │
│ A  │     · Title   font:700 22px/1 var(--font-sans)     │
│ R  │     · Button bar  gap:12px  (secondary + primary)  │
│    │                                                    │
│.sbx│  ② WHITE CONTAINER  ← gap:20px below header       │
│52px│     border-radius:8px                              │
│    │     border:1px solid var(--n4)                     │
│    │     background:#fff                                │
│    │     padding:20px                                   │
│    │     display:flex  flex-direction:column  gap:20px  │
│    │                                                    │
│    │     ② a  FILTER BAR  display:flex  gap:8px         │
│    │          · inputs (flex:1, height:32px)            │
│    │          · dt-drop-wrap dropdowns (flex:1)         │
│    │          · Filtrar secondary btn                   │
│    │          · filter--add  32×32px  B6                │
│    │          · filter--reset  32×32px  R6              │
│    │                                                    │
│    │     ② b  TABLE  ← gap:20px below filter            │
│    │          border:1px solid var(--n4)                │
│    │          border-radius:4px  overflow:hidden        │
│    │          tblDemoTable(data.scrollDemo || {})       │
│    │                                                    │
│    │  ③ PAGINATION  ← gap:20px below container          │
│    │     justify-content:flex-end  gap:4px              │
│    │     28×28px buttons  border-radius:4px             │
└────┴────────────────────────────────────────────────────┘
```

**Topbar ↔ Sidebar pairing rule (critical):**
Topbar and sidebar must always be the **same product**. Never mix products.
| Product | Topbar logo | Sidebar items source |
|---|---|---|
| Last Mile | `lastmile-desktop-white.svg` | `sidebar.json → products[id=lastmile].items` |
| Planner Pro | `plannerpro-desktop-white.svg` | `sidebar.json → products[id=plannerpro].items` |
| On Demand | `ondemand-desktop-white.svg` | `sidebar.json → products[id=ondemand].items` |

Active nav item: set via `data.activeNav` (icon name, e.g. `"document-multiple"` for Órdenes).

**Invariant rules (never change these):**
- Topbar: always `.tbar` with matching product logo + icons + company slot
- Sidebar: always `.sbx` with full product item list from `sidebar.json` (hover-expand, 52px collapsed)
- Main content outer gap: `20px` between every block
- Main content padding: `20px 24px 16px`
- White container: always wraps filter bar + table together
- Filter bar: always first inside the white container, `gap:8px`
- Table: always `tblDemoTable(data.scrollDemo || {})` — never custom `<table>`
- Pagination: always below the white container, right-aligned

**What changes between screens:**
- `data.pageTitle` — page title text
- `data.buttons` — button labels (log, export, create)
- Filter bar labels and dropdown options
- `data.scrollDemo` — the table definition (columns + rows from table.json structure)

---

## What NOT to do

- ❌ Don't use orange/amber for primary buttons
- ❌ Don't use pill buttons for non-CTA elements
- ❌ Don't use teal for the Email icon (use green `--g1/--g6`)
- ❌ Don't show column headers (DELIVERY STATUS / EMAIL / SMS) when a group is collapsed
- ❌ Don't make toggle interactive if there's nothing configured yet (use `empty-disabled`)
- ❌ Don't treat "disabling a channel" as "disabling the notification" — they're different
- ❌ Don't use generic modal copy ("Are you sure?") — always name the specific item
- ❌ Don't use amber warning banner for neutral system information — use blue info banner

---

## Standard components — always call from JSON, never recreate

This project is vanilla HTML + `renderers.js`. There are no React imports.
Every component lives in a JSON file under `sections/components/`.
**Never write custom HTML for these — always call the function or copy the exact pattern below.**

---

### Topbar
**Source:** `sections/components/topbar.json` · renderer: `renderers.topbar(data)`

For page templates, use the `.tbar` CSS class with this exact structure:
```html
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
```

---

### Sidebar
**Source:** `sections/components/sidebar.json` · renderer: `renderers.sidebar(data)`

For page templates, inject the `.sbx` CSS block and use this structure:
```html
<!-- inject sbStyle (copy from tablepage renderer in renderers.js) -->
<div class="sbx">${sidebarHtml}</div>
```
`sidebarHtml` is built by mapping `sbItems` (icon + label + sel flag) using `iconSvg()`.
See the `tablepage()` renderer for the exact CSS injection and HTML pattern.

---

### Button
**Source:** `sections/components/buttons.json`

Use **full inline styles** — do NOT use `.btn` CSS class in page templates (causes alignment issues).
Copy these exact token values from `buttons.json`:

```javascript
// Secondary
style="height:32px;padding:0 16px;border-radius:50px;font:700 14px/1 var(--font-sans);
       background:#fff;color:#4B82FA;border:1px solid #1F60ED;cursor:pointer;
       display:inline-flex;align-items:center;gap:5px;box-sizing:border-box"

// Primary
style="height:32px;padding:0 16px;border-radius:50px;font:700 14px/1 var(--font-sans);
       background:var(--b6);color:#fff;border:none;cursor:pointer;
       display:inline-flex;align-items:center;gap:5px;box-sizing:border-box"
```

Hover/active handlers (inline, secondary example):
```
onmouseenter="this.style.background='#EDF5FF'"
onmouseleave="this.style.background='#fff'"
onmousedown="this.style.background='#D1E0FF'"
onmouseup="this.style.background='#EDF5FF'"
```

---

### Input
**Source:** `sections/components/inputs.json` · renderer: `renderers.inputs(data)`

**Text input** — exact tokens from `inputs.json`:
```html
<input type="text" placeholder="..."
  style="width:100%;height:32px;border:1px solid var(--n3);border-radius:6px;
         font:400 14px/20px var(--font-sans);background:#fff;color:var(--n7);
         box-sizing:border-box;outline:none;padding:0 10px"
  onfocus="this.style.border='2px solid var(--b6)';this.style.background='var(--b1)'"
  onblur="this.style.border=this.value?'1px solid var(--n5)':'1px solid var(--n3)';this.style.background='#fff'"
  onmouseenter="if(document.activeElement!==this)this.style.background='var(--n2)'"
  onmouseleave="if(document.activeElement!==this)this.style.background='#fff'">
```

**Dropdown select** — use the `dt-drop-wrap` component (NOT a `<select>` element).
This is the interactive dropdown from `inputs.json`. See `dtSelect()` helper in `filters()` renderer:
```html
<div class="dt-drop-wrap" style="position:relative;flex:1;min-width:0">
  <div class="dt-dtrigger" data-theme="border" onclick="dtDrop(this.parentElement)"
    onmouseenter="if(!this.parentElement.classList.contains('dt-open'))this.style.background='var(--n2)'"
    onmouseleave="if(!this.parentElement.classList.contains('dt-open'))this.style.background='#fff'"
    style="display:flex;align-items:center;height:32px;padding:0 10px;border:1px solid var(--n3);
           border-radius:6px;background:#fff;cursor:pointer;gap:6px;box-sizing:border-box">
    <span class="dt-dlabel" style="flex:1;font:400 14px/20px var(--font-sans);color:var(--n6)">Placeholder</span>
    <span style="color:var(--n5);display:flex;flex-shrink:0">[CHEVRON SVG]</span>
  </div>
  <div class="dt-dmenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;
       background:#fff;border:1px solid var(--n3);border-radius:6px;
       box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;padding:4px 0">
    <div onclick="dtPickOpt(this)" data-val="Option 1"
      onmouseenter="this.style.background='var(--b1)';this.style.color='var(--b7)'"
      onmouseleave="this.style.background='';this.style.color='var(--n7)'"
      style="height:36px;padding:0 12px;display:flex;align-items:center;
             font:400 14px/20px var(--font-sans);color:var(--n7);cursor:pointer">Option 1</div>
  </div>
</div>
```

---

### Table
**Source:** `sections/components/table.json` · module-level function: `tblDemoTable(def)`

`tblDemoTable()` is defined at module level in `renderers.js` and available to all renderers.
To use it in a page template:
1. Add a table definition to the page's JSON file (or copy `scrollDemo` from `table.json`)
2. Call `tblDemoTable(data.myTableKey)` in the renderer — one line, no custom HTML

```javascript
// In table-page.json: add "scrollDemo" key copied from table.json
// In tablepage renderer:
${tblDemoTable(data.scrollDemo || {})}
```

The table definition format is the `columns` / `rows` / `cells` structure used in `table.json`.
Never write `<table>`, `<tr>`, `<td>` manually for DS tables.

---

### Pills / Badges
**Source:** `sections/components/badges.json` · module-level function: `badgeHtml(label, variant)`

`badgeHtml()` is defined at module level in `renderers.js`. Always use it for status labels:
```javascript
badgeHtml('Entregado',    'success')  // green
badgeHtml('No entregado', 'danger')   // red
badgeHtml('En tránsito',  'warning')  // amber
badgeHtml('Asignada',     'info')     // blue
badgeHtml('Ingresada',    'neutral')  // gray
badgeHtml('Label',        'outline')  // gray border, white bg
```

---

### Filter bar
**Source:** `sections/components/filters.json` · renderer: `renderers.filters(data)`

For page templates, replicate the filter bar from the `filters()` renderer:
- Text inputs: exact Input pattern above with `flex:1`
- Dropdowns: `dt-drop-wrap` pattern above with `flex:1`
- "Filtrar" button: exact Secondary button tokens above
- filter--add button: `32×32px`, `border-radius:4px`, `1px solid var(--b6)`, icon 24px B6
- filter--reset button: `32×32px`, `border-radius:4px`, `1px solid var(--r6)`, icon 24px R6

Icons via `iconSvg('filter--add', 24, 'var(--b6)')` and `iconSvg('filter--reset', 24, 'var(--r6)')`.

The filter bar container wrapping filter + table:
```
border-radius:8px · border:1px solid var(--n4) · background:#fff · padding:20px · gap:20px
```