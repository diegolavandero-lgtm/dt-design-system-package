#!/usr/bin/env node
// Auto-generates sections/changelog.json from git history.
// Run: node scripts/gen-changelog.js
// Called automatically by .github/workflows/update-changelog.yml on every push to main.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../sections/changelog.json');

const SKIP = [
  'merge pull request', 'merge branch', 'chore: auto-update changelog',
  'add cloudflare', 'add vercel', 'cloudflare', 'wrangler',
];

const TYPE_PREFIXES = {
  fix:    ['fix', 'hotfix', 'revert'],
  feat:   ['add', 'initial commit', 'create', 'new'],
  update: ['update', 'rebuild', 'switch', 'replace', 'refactor', 'improve',
           'sincronization', 'sync', 'change', 'move', 'rename', 'clean'],
};

const SECTION_KEYWORDS = {
  'Sidebar':      ['sidebar'],
  'Topbar':       ['topbar', 'top bar', 'top-bar'],
  'Iconography':  ['iconograph', 'icon-cell', 'carbon icon', 'icon library'],
  'Icons':        [' icon ', 'icons'],
  'Inputs':       ['input', 'text-field', 'form'],
  'Logos':        ['logo', 'logos'],
  'Typography':   ['typography', 'font', 'type scale'],
  'Colors':       ['color', 'colour', 'palette'],
  'Buttons':      ['button'],
  'Badges':       ['badge', 'tag'],
  'Banners':      ['banner'],
  'Modal':        ['modal'],
  'Tables':       ['table'],
  'Map pins':     ['map pin', 'mappins'],
  'Changelog':    ['changelog'],
  'Overview':     ['design system', 'modular', 'overview', 'readme'],
};

function classifyType(msg) {
  const lower = msg.toLowerCase();
  for (const [type, prefixes] of Object.entries(TYPE_PREFIXES)) {
    if (prefixes.some(p => lower.startsWith(p) || lower.includes(p))) return type;
  }
  return 'update';
}

function extractSection(msg) {
  const lower = msg.toLowerCase();
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return section;
  }
  return 'General';
}

function shouldSkip(msg) {
  const lower = msg.toLowerCase();
  return SKIP.some(p => lower.includes(p));
}

const raw = execSync('git log --pretty=format:"%H|%ad|%an|%ae|%s" --date=short', { encoding: 'utf8' });
const lines = raw.trim().split('\n').filter(Boolean);

// Map email/name fragments → display name
const AUTHOR_MAP = {
  'diego':     'Diego',
  'carlos':    'Carlos',
  'cristina':  'Cristina',
  'github-actions': null, // hide bot commits
};

function resolveAuthor(name, email) {
  const key = (name + ' ' + email).toLowerCase();
  for (const [frag, display] of Object.entries(AUTHOR_MAP)) {
    if (key.includes(frag)) return display;
  }
  // Fall back to first name from git name
  return name.split(' ')[0];
}

const byDate = {};
for (const line of lines) {
  const parts = line.split('|');
  const hash   = parts[0];
  const date   = parts[1];
  const aName  = parts[2];
  const aEmail = parts[3];
  const msg    = parts.slice(4).join('|'); // message may contain |

  if (shouldSkip(msg)) continue;

  const author = resolveAuthor(aName, aEmail);
  if (author === null) continue; // skip bot commits

  if (!byDate[date]) byDate[date] = [];
  byDate[date].push({
    hash:    hash.slice(0, 7),
    type:    classifyType(msg),
    section: extractSection(msg),
    message: msg,
    author,
  });
}

const days = Object.entries(byDate)
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([date, entries]) => ({ date, entries }));

const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

const out = {
  title:       'Changelog',
  titleKey:    'nav.changelog',
  description: existing.description || 'Auto-generated from git history. Updated on every push to main.',
  generated:   new Date().toISOString(),
  days,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`✓ changelog.json — ${days.length} days, ${lines.length} commits processed`);
