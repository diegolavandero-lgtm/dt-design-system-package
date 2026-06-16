# Video Onboarding & Learning — Strategy

DispatchTrack desktop app · Strategy document (pre-build)
Lenses: UX architecture · UI/visual system · UX copy
Status: **Strategy only** — no prototype built yet. Decisions below gate the build.

---

## Decisions locked

| Decision | Choice | Implication for design |
|---|---|---|
| Hosting | **Not decided yet** | UI is designed **player-agnostic**; an embedded (Vimeo/Loom/YT) or self-hosted backend plugs into the same player slot later. |
| Audience | **Dispatchers + Supervisors** | One shared library, **two role-filtered playlists**. Drivers are out of scope (they live in the mobile app). |
| This deliverable | **Strategy doc only** | Build sequence proposed at the end; nothing prototyped yet. |

---

## 1. Core principle — two jobs, one content source

The request conflates two distinct user jobs. Keeping them separate is the most important decision in this document.

| | **Onboarding** | **Help / Learning library** |
|---|---|---|
| Trigger | First login / first time in a module | Any time, on demand |
| Shape | Sequenced, progress-tracked, finite | Indexed, searchable, permanent |
| Tone | "Let's get you set up" | "Find the answer now" |
| Lifecycle | Completes, then recedes | Never expires |
| User | New hire, day 1 | **Replacement hire, confused veteran, supervisor pointing a report somewhere** |

**One content source, two access patterns.** Build the **persistent library first** as the source of truth; onboarding is just a *curated, sequenced view into it*. This is what makes the replacement-user scenario work automatically — the library was always permanent; onboarding merely borrowed from it.

The library's structure **mirrors the existing sidebar/module IA** (Jakob's Law): users navigate help the same way they navigate the product.

---

## 2. Non-interference — the overlay model (critical constraint)

> Requirement: summonable from any section, closable, and on close the platform looks **exactly as today**.

This rules out making onboarding a page/route that swaps the main content. It must be an **overlay layer** rendered on top of the current screen, holding **zero layout space** when closed and leaving **no residue** on close. All progress lives **server-side per user**, so closing never loses state.

**Recommended container hierarchy:**

```
Persistent launcher (topbar "help" icon + optional FAB, bottom-right)
        │  available in EVERY section
        ▼
Right-side DRAWER  ── "Centro de aprendizaje"  (home: library + progress + playlists)
        │  overlays content; user still sees their work behind it; closes clean
        ▼
VIDEO step (inside the drawer)  ── player + transcript
        │
        ▼
QUIZ step  ── focused modal moment  (2–3 single-choice questions)
        │
        ▼
Completion  ── video flips to "Aprendido", progress ring updates, drawer stays open
```

**Why a drawer as the home, not a modal:** a full modal halts all work — wrong for the persistent home of a non-blocking system. A right drawer lets a dispatcher keep their route/board visible, glance back, and dismiss instantly. The **quiz** is the one place a focused modal is correct, because comprehension deserves momentary full attention — and it's short and explicitly entered.

**Non-interference invariants (never violate):**
- Closing any onboarding surface restores the screen pixel-for-pixel to its pre-open state.
- Onboarding never blocks, gates, or delays a real task. No forced tours.
- The launcher is the only permanent footprint; everything else is summoned.
- State is per-user and server-persisted — survives logout, device change, and the user being replaced.

---

## 3. Surfaces — same videos, three entry points

1. **Centro de ayuda / aprendizaje (the library)** — reached from the topbar `help` icon (DS topbar order: apps · help · messages · alerts · user). Permanent, for everyone, forever. Organized by module, searchable, with *Visto* / *Aprendido* / *Nuevo* indicators.
2. **Primeros pasos (onboarding playlist)** — a role-filtered, sequenced subset of the library, surfaced on first login inside the drawer. Tracks progress. Dismissible with "Más tarde" and **always recoverable** from the help menu — never a one-shot.
3. **Contextual entry** — a quiet `Ver cómo funciona` / `?` in each feature header that opens the same drawer scoped to *that feature's* video. Serves veterans at the moment of need, not just day-1 hires.

---

## 4. User flows

**New hire (day 1):** login → welcome card in drawer → role playlist → watch video → quiz → *Aprendido*, ring updates → next item. Can close anytime; resumes where they left off.

**Replacement hire (veteran left):** opens topbar help → library is fully populated and permanent → filters by their role or searches the exact task → watches + (optionally) takes the check → progress tracked under *their own* account from zero.

**Confused veteran mid-task:** on an unfamiliar screen → clicks `Ver cómo funciona` → drawer opens that one video → closes → screen is exactly as before, task uninterrupted.

**Supervisor:** same as dispatcher for their own learning, **plus** a team-completion view (see §5) to see who has completed which topics.

---

## 5. Gamification model

The reward for watching is **proven comprehension**, not just a play count.

**Two completion states per video:**

| State | Meaning | Counts toward onboarding %? |
|---|---|---|
| `Visto` | Played, quiz not yet passed | No (partial credit shown, not counted) |
| `Aprendido` | Passed the 2–3 question check | **Yes** |
| `Nuevo` | Added since the user's last visit | — |

Driving the overall percentage off **Aprendido** is what makes the progress meaningful and prevents "scrub to the end" gaming.

**Progress aggregation:**
- Per video → per **module** → per **role playlist** → **overall platform onboarding %**.
- Surfaced as a **progress ring + "n de N temas aprendidos"** in the drawer header.

**Restraint principles (B2B logistics — avoid patronizing professionals):**
- **Non-punitive:** no fail screens, no negative scoring, unlimited free retries. A wrong answer shows the correct point and offers to rewatch — never blocks.
- **No leaderboards / competition** for individual dispatchers. The *only* social layer is the **supervisor team-completion view** (a role responsibility, not a game).
- **Subtle rewards:** progress ring, completion checkmarks, module-completion badge, and an optional **platform-completion "certificate" moment**. No confetti storms, no points economy.
- **Optional, never gating:** a user can use the whole platform with 0% onboarding. Gamification motivates; it never obstructs.

**Supervisor team view (role-specific):** a simple roster — team member × module — showing *Aprendido* coverage, so a supervisor can see gaps and point a new hire to the right topics. Read-only, no ranking framing.

---

## 6. Quiz spec (handoff format)

**Structure**
- 2–3 single-choice questions per video, one question per screen (progressive disclosure).
- One question visible at a time; `Pregunta 1 de 3` indicator.
- Each question: stem + 2–4 radio options.

**Behavior**
- Select an option → `Comprobar` → immediate formative feedback (correct / "revisa este punto" + the explanation).
- Wrong answer → can re-answer freely; optional `Volver al video` deep-links to the relevant moment if timestamps exist.
- Pass criteria: **all questions answered correctly**, but with unlimited retries — so it's a comprehension nudge, not an exam. No pass/fail screen; you simply can't reach `Aprendido` until each is correct, and you can always keep trying.
- Mid-quiz close → position saved; resumes on reopen.
- Re-take anytime — a learned video can be re-watched and re-quizzed (refresher / replacement user).

**Quiz states (don't skip):** unanswered · selected · checking · correct · incorrect-retry · question-complete · quiz-complete · resumed-from-saved.

**Content**
- Questions are **formative, not trick** — they reinforce the one task the video taught.
- Tied to the chunk: one concept per video → questions about that concept only.

---

## 7. Content & curation

- **Chunk hard:** one concept per video, **60–120s**. Better onboarding *and* better reference. No 20-min "full tour."
- **Captions + transcripts always:** noisy/audio-off warehouse floors, WCAG 2.2, and makes videos searchable by content. Non-negotiable.
- **Two role playlists from one library:**
  - *Dispatcher playlist* — daily operational tasks (the dispatcher's core jobs-to-be-done).
  - *Supervisor playlist* — KPIs, exceptions, oversight, plus the team-completion view itself.
  - Exact video lists require the module inventory from `sections/components/sidebar.json` (products[id].items) — to be mapped at build time.
- **Instrument it:** track watch/drop-off and quiz-miss rates per video to learn which content to fix. Onboarding content is a product that iterates.

---

## 8. States to design (full set)

| State | Where | Handling |
|---|---|---|
| Empty | Module with no videos yet | "Pronto agregaremos tutoriales para esta sección" + link to full library |
| Loading / buffering | Player | Skeleton + spinner, set expectation |
| Error (CDN/load fail) | Player | Retry + transcript fallback |
| Offline | Library / player | Disable play, surface transcript, "Sin conexión" notice |
| Partial progress | Playlist | "3 de 8 temas aprendidos" + resume |
| Quiz incomplete | Drawer | "Mira el video y responde para completar este tema" |
| Completed (module) | Playlist | Module badge, light success toast, then recede |
| Completed (platform) | Drawer | Certificate moment, then recede — no nagging |
| New content | Library item | "Nuevo" badge since last visit |

---

## 9. UI components & DS tokens (all to **Drafts** first, per DS rule)

| Component | Structure | Key tokens |
|---|---|---|
| `LearningLauncher` | Topbar `help` entry + optional FAB bottom-right; opens drawer | uses existing topbar icon slot; FAB radius `50%`, `--b6` |
| `LearningDrawer` | Right side drawer: header (progress ring + title), playlist/library body, search + module filter (`dt-drop-wrap`) | extends `modal.json` drawer; bg `#fff`, overlay scrim; container gaps `20px` |
| `VideoCard/Default · /Visto · /Aprendido · /Nuevo` | 16:9 thumbnail + play overlay, title (`subheading`), duration chip, state badge | radius `8px`, border `1px var(--n3)`, chip radius `4px`/`weight 600`, *Aprendido* ✓ `--g6`, *Nuevo* badge `--b6` |
| `ProgressRing + counter` | Overall "n de N temas aprendidos" | ring accent `--b6`, track `--n3`; reuse ds-review progress-ring pattern |
| `VideoPlayer` (player-agnostic slot) | Controls, captions toggle, transcript tab, keyboard-accessible | focus ring `2px var(--b6)`; controls ≥44px target |
| `QuizModal` | Focused modal: `Pregunta n de N`, radio options, feedback, CTA | radio selected `--b6`; correct `--g6`; retry hint `--n5` (color never the sole signifier — pair with icon/text) |
| `CompletionBadge / Certificate` | Module + platform milestone | success `--g6`; restrained, no confetti |
| `Coachmark/Tooltip` | First-time feature spotlight → links to video | extends `tooltip.json` |
| `SupervisorCoverageTable` | member × module *Aprendido* grid | `tblDemoTable()` — never custom `<table>` |

Genuinely new: `LearningDrawer`, `VideoPlayer`, `QuizModal`, `ProgressRing`, certificate. → **Drafts section + approval workflow** before permanent. No new fonts, no new colors — every value traces to an existing token.

---

## 10. Copy (neutral LATAM Spanish — B2B operativo)

| Element | Copy |
|---|---|
| Launcher / library name | `Centro de aprendizaje` |
| Welcome title | `Te damos la bienvenida a DispatchTrack` |
| Welcome sub | `Mira videos cortos y comprueba lo que aprendiste, a tu ritmo.` |
| Onboarding section | `Primeros pasos` |
| Progress counter | `5 de 12 temas aprendidos` |
| Watch CTA | `Ver video` · Resume: `Continuar` |
| Dismiss (non-destructive) | `Más tarde` |
| Contextual link in feature | `Ver cómo funciona` |
| Search placeholder | `Buscar tutoriales` |
| Quiz intro | `Pon a prueba lo que aprendiste` |
| Question indicator | `Pregunta 1 de 3` |
| Quiz CTAs | `Comprobar` → `Siguiente` → `Finalizar` |
| Correct feedback | `¡Correcto!` |
| Incorrect feedback | `No exactamente. Repasa este punto.` |
| Back to video | `Volver al video` |
| Video learned | `Completaste este tema` |
| Empty (module) | `Aún no hay tutoriales para esta sección. Mientras tanto, explora el Centro de aprendizaje.` |
| Offline | `Sin conexión. Puedes leer la transcripción mientras se restablece.` |
| Platform complete | `Completaste tu capacitación. Puedes volver a cualquier video desde el Centro de aprendizaje.` |

**Notes:** "Centro de aprendizaje" (over "onboarding"/"bienvenida") signals permanence and on-demand access — the exact mental model the replacement-user scenario needs. Avoid anglicisms ("tour", "walkthrough", "quiz" in UI → use "comprobación"/"preguntas"). "Más tarde" instead of a dismiss-X keeps onboarding recoverable, not destructive.

---

## 11. Build sequence (when approved)

1. **Library first** (source of truth): `LearningDrawer` + `VideoCard` states + search/filter + progress ring, player-agnostic slot.
2. **Quiz layer:** `QuizModal` + Visto→Aprendido state machine + progress aggregation.
3. **Onboarding view:** `Primeros pasos` role playlists drawing from the library.
4. **Contextual entry + coachmarks** per feature header.
5. **Supervisor coverage view.**
6. **DS review doc** (`ds-new-components-*.html`) for all new components → Drafts approval.

**Open items to resolve at build time:**
- Hosting backend (defines the player slot's real implementation, captions/transcript source, offline behavior).
- Module-to-video mapping from `sidebar.json` for the two role playlists.
- Where quiz questions + correct answers are authored/stored.
- Whether timestamps exist for `Volver al video` deep-links.
