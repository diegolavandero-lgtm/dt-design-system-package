# DispatchTrack Design System — Session Guide

This file is read automatically by Claude at the start of every session.
Follow this guide to maintain continuity across tickets without re-explaining context.

---

## Project overview

This repo is the **DispatchTrack Design System** for the Lastmile product.
Every session here produces one or more HTML prototypes that are committed, pushed to GitHub,
and auto-deployed via Vercel to `https://dt-design-system-package.vercel.app`.

---

## Established workflow (follow this every ticket)

```
1. READ    → dt-design-system.html + colors_and_type.css + sections/ folder
2. REVIEW  → navigate the live Jira ticket and the production page (if it exists)
3. AUDIT   → use /ux-design-expert to identify layout and flow improvements
4. CONFIRM → propose improvements, wait for user to choose directions
5. BUILD   → create [feature]-[TICKET].html in repo root using DS tokens/components
6. VERIFY  → preview in browser, confirm visual match against production
7. DOCUMENT → create ds-new-components-[TICKET].html with review cards
8. PUSH    → git commit + push → Vercel deploys automatically
9. JIRA    → post comment to the ticket via Jira REST API (browser session)
```

---

## Files to read at every session start

| File | Why |
|---|---|
| `dt-design-system.html` | Complete component library with live CSS — extract exact class names and patterns |
| `colors_and_type.css` | All design tokens — ALWAYS use these, never invent colors |
| `sections/components/*.json` | Component specs |
| `sections/assets/logos/` | Official SVG logos — always use the right lockup |

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
| `notifications-settings-DES824.html` | Notification settings listing page | [view](https://dt-design-system-package.vercel.app/notifications-settings-DES824.html) |
| `notifications-new-DES824.html` | New notification editor | [view](https://dt-design-system-package.vercel.app/notifications-new-DES824.html) |
| `ds-new-components-DES824.html` | DS review document (template) | [view](https://dt-design-system-package.vercel.app/ds-new-components-DES824.html) |

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

- Domain: `https://dt-design-system-package.vercel.app`
- Trigger: any `git push` to `main`
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

## What NOT to do

- ❌ Don't use orange/amber for primary buttons
- ❌ Don't use pill buttons for non-CTA elements
- ❌ Don't use teal for the Email icon (use green `--g1/--g6`)
- ❌ Don't show column headers (DELIVERY STATUS / EMAIL / SMS) when a group is collapsed
- ❌ Don't make toggle interactive if there's nothing configured yet (use `empty-disabled`)
- ❌ Don't treat "disabling a channel" as "disabling the notification" — they're different
- ❌ Don't use generic modal copy ("Are you sure?") — always name the specific item
- ❌ Don't use amber warning banner for neutral system information — use blue info banner
