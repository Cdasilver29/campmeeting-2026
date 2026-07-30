# Visual design pass — progress and handoff

Session of 2026-07-29. Art direction and typographic hierarchy, not
ornament. Five chunks were briefed; **three are done and pushed, two
remain.**

Constraints that held throughout and still hold: no unnecessary gradients,
no oversized shadows, no decorative religious icons, no excessive
animation. `/schedule` server-renders the whole programme so it works
offline and before hydration, so nothing may add per-row DOM, per-row
animation or per-row components. Style what is already there.

---

## Done

### Chunk 1 — hero (`c049f4b`)

- The "Seventh-day Adventist Church Newlife" line is gone. The header
  lockup carries it, and so does the green sign in the photograph itself.
- Height follows the event phase: full bleed (`h-svh`) before the event,
  `60svh` during and after. `svh`, not `vh` or `dvh`, so mobile browser
  chrome cannot resize the band mid-scroll.
- The flat navy wash is gone, replaced by two localised scrims with the
  middle of the frame untouched.
- Text block moved to bottom-left, inside the bottom scrim.

**Phase resolution, and why it is not `getTodayState`.** Every page is
statically generated, so the server cannot know the viewer's clock — which
is exactly why `useNow()` returns `undefined` on first render and
`TodayView` paints a skeleton. Sizing the hero from that hook would change
the band's height on mount, a layout shift of 40% of the viewport. So the
phase is one `data-hero-phase` attribute on the section, resolved twice and
never on mount: at build time as the rendered value, then corrected before
first paint by a small inline script that re-reads the Africa/Nairobi date
(`src/features/home/lib/hero-phase.ts`). Same technique next-themes
already uses here. Everything phase-dependent inside reads it through
`group-data` variants, so there is one attribute to correct and no
descendant can hold a stale copy.

**Measured contrast** — white against the *brightest* composited pixel in
the text region, type hidden so the backdrop is what is sampled:

| viewport | worst backdrop pixel | white |
| --- | --- | --- |
| 390x844 | rgb(42,67,108) | 9.92:1 |
| 768x1024 | rgb(22,48,92) | 13.03:1 |
| 1024x768 | rgb(49,72,109) | 9.22:1 |
| 1440x900 | rgb(79,100,130) | **6.04:1** (worst) |
| 1920x1080 | rgb(49,74,114) | 8.92:1 |
| 2560x1440 | rgb(28,55,98) | 11.85:1 |

**Gradient stops**, navy `rgb(5,34,82)` (`--color-navy-900`):

- top, 176px tall, behind the header only:
  `0.85 0px, 0.82 48px, 0.72 76px, 0.40 120px, 0 176px`
- bottom: `0.95 0%, 0.93 42%, 0.88 64%, 0.76 78%, 0.44 90%, 0 100%`,
  element height `max(45%, 26rem)` full-bleed and `45%` compact

**The alpha floor is 0.63, derived not chosen.** Navy over a pure-white
pixel needs that before white reaches 4.5:1 (0.60 gives 4.33:1). It is
required because the lower frame *averages* only 0.13-0.19 luminance but
contains pixels at 1.0: there is a white sedan, a chrome bumper and a white
number plate in the car park. Sizing a scrim off the average fails behind a
glyph that lands on the car.

**Two things worth knowing about the photograph.** Sampled per decile of
height: 0-20% is bright sky (mean 0.41-0.45, 10-19% of pixels over 0.75),
40-60% is the building and sign (mean 0.06-0.08, the most legible band),
60-100% is the car park. Darkening the lower band is therefore better art
direction as well as legibility — it suppresses parked cars so the building
reads.

**Softness.** Source is 1634x962. `object-cover` upscale is **1.175x at
1920** and **1.567x at 2560**, before device pixel ratio (2.35x and 3.13x
at DPR 2). 1.175x will not read soft; 1.567x will; 3.13x clearly will. The
file was deliberately not upscaled to hide it. **A larger source is worth
asking the committee for** — this is an open item.

### Chunk 2 — header over the hero (`c3517e2`)

- Fully transparent at scroll 0 on the home page only. Glass past a 96px
  threshold. Unchanged from the first pixel on every other route, since
  nothing else has a hero behind it.
- Threshold is an `IntersectionObserver` on a sentinel pinned to the
  document origin (`position: absolute` against the initial containing
  block, contributing nothing to layout). No per-scroll callback, no
  `scrollY` read, nothing that can thrash layout.
- State resolves during SSR too, so the first paint over the photograph is
  already correct.
- Over the photograph the lockup, nav and theme toggle go **pure white**
  and the active link gains **weight**, not colour. `text-ink-muted` fails
  on the top scrim, and dimming white to signal "inactive" fails for the
  same reason the hero never uses `white/80`.
- The border is always present and only changes colour, so the header
  cannot change height when the state flips.
- `supports-backdrop-filter` fallback: the solid branch resolves to
  `bg-surface/95`, so the glass state is never transparent type over a
  photograph.

`--spacing-header` (5rem) is a named token because two places must agree:
the header sets its height, the hero pulls itself up by exactly the same
amount. `box-border` keeps the 1px rule inside that height — without it the
header was 81px, the hero started 1px down, and a hairline of page
background showed above the photograph.

### Chunk 3 — one page-header pattern (`36e381f`)

`src/components/page-header.tsx` is the OG card's structure as a real
component: eyebrow, display-face title, hairline rule, meta line. Plus a
`media` slot (speaker portrait only) and a `children` slot for the pages
whose extra sentence carries markup.

Applied to all thirteen routes and verified in the served HTML:
`/schedule`, `/schedule/[day]`, `/speakers`, `/speakers/[id]`,
`/ministries`, `/ministries/[tag]`, `/about`, `/contact`, `/faq`,
`/downloads`, `/announcements`, `/livestream`, `/prayer-requests`.

The strings are not duplicated. `src/lib/page-identity.ts` holds one
definition per page; the page header, the share card and `generateMetadata`
all read it. `pageMetadata` needed no signature change — it takes
`{ title, description, path }` and TypeScript passes the extra fields
through when given a variable rather than an object literal.

The three dynamic share cards now build their strings from the same
functions as their pages, so that duplication is gone too. Not briefed, but
the same defect.

**Deviations, both easy to revert:**

1. Two metadata titles now match their `h1`, because agreement was the
   point: `About` -> `About Camp Meeting`, `FAQ` -> `Frequently Asked
   Questions`.
2. The speaker profile is no longer centred; it uses the shared
   left-aligned pattern, role moved into the eyebrow where the share card
   already put it, avatar in the `media` slot.

---

## Remaining

### Chunk 4 — schedule visual pass (the expensive one)

Hierarchy only, no ornament, **no new DOM per row**.

- Times: tabular figures, lighter weight, muted ink, forming a scannable
  left column.
- Titles: the load-bearing element. Give them the weight.
- Block headers ("Morning Service", "Divine Service"): real section
  dividers in the display face, not just bold text.
- A single vertical rail connecting sessions within a block, drawn with a
  **border on the container**, not an element per row.
- Ministry tags: restrained colour mapping derived from the brand tokens.
  Muted, related hues. Not a rainbow, and never colour as the only signal.
- Featured sessions and the current session need real visual weight; the
  now-card should be unmistakable.
- Day rail: a proper navigation element. Day number, weekday, date. Sticky.
  Current day distinguished.
- The untimed all-block activities (Sunday's Medical Camp, Friday's Sabbath
  Preparation) must read as deliberate, distinct from a session with a
  missing time. `all-block-card.tsx` already does this with a dashed
  outline; keep that intent.
- Try `content-visibility: auto` with `contain-intrinsic-size` per day
  section. Keep it only if it measurably helps.

Files: `program-view.tsx`, `session-card.tsx`, `all-block-card.tsx`,
`day-rail.tsx`, `now-card.tsx`, `schedule-shell.tsx`.

### Chunk 5 — remaining pages (the cheap one, 20-30 min)

- `/speakers`: make the index a real grid; the initials avatar should look
  intentional rather than like a missing image.
- `/ministries`: same treatment.
- `/about`, `/faq`, `/downloads`, `/contact`: text pages that should read
  like well-set documents. Constrain line length, real heading hierarchy,
  spaced rhythm. No decoration.
- Extend the existing `Reveal` to the pages that lack it, so the motion
  reads as consistent rather than half-applied. **Major sections only,
  never rows.**

---

## Verification backlog

Three gate items are **not** answered yet.

1. **Header contrast in the transparent and glass states.** The one
   measurement taken (1.00:1) was invalid: it caught the 1px sliver of page
   background above the photograph caused by the `border-b` sitting outside
   `h-header`. That bug is fixed (`box-border`) but the measurement was not
   repeated. Run `tools/perf/verify-hero.mjs`, which already measures the
   header box in both states.
2. **Reduced motion produces a static page.** Not verified. The global
   `prefers-reduced-motion` rule in `globals.css` is untouched and the new
   header state change is scroll-driven rather than animated, but confirm
   it.
3. **`/schedule` TBT and CLS, before and after chunk 4.**

## Baseline numbers

Measured on `/schedule` **before** any of chunks 1-3. Chunk 3 added a
`PageHeader` to that route, so **re-measure the "before" on current HEAD
(`36e381f`) at the start of chunk 4** rather than comparing against this
table. Rebuild and A/B the same URL back to back.

| metric | median | range |
| --- | --- | --- |
| elements | **4,766** | identical every run |
| document height | **34,004 px** | identical every run |
| forced style+layout (primary instrument) | **10.15 ms** | 8.65 - 12.00 |
| CDP long-task total, 4x throttle | 37,639 ms | 31,717 - 44,634 |
| CDP style+layout+paint | 13,682 ms | 12,045 - 16,375 |
| CDP recalc / layout / paint | 3,759 / 8,273 / 1,861 ms | |
| CLS | ~0.0000 | max 0.0004 |
| Lighthouse TBT (unusable, see below) | 11,266 ms | 10,438 - 13,252 |

**The brief's "cut it if TBT regresses more than 50ms" threshold is two
orders of magnitude below this machine's noise floor.** Lighthouse returned
a 2,800 ms spread on unchanged code. Use
`tools/perf/layout-cost.mjs` instead: it is stable to a few percent and
measures exactly what a styling pass moves. `content-visibility` should
move it substantially if it helps at all, so it remains measurable.

## Environment, read before starting

- **`pnpm` is not on PATH.** Every call needs
  `$env:Path = "C:\Users\user\AppData\Roaming\npm;$env:Path"` first.
  `gh` is absent too; use plain `git`.
- **Do not use `2>&1` on `pnpm`.** PowerShell 5.1 wraps native stderr in an
  ErrorRecord and reports failure on a successful build.
- **Commit messages: use `git commit -F <file>`.** A here-string with
  embedded double quotes gets split into pathspecs.
- **The build fails nondeterministically, roughly one run in two**, always
  alongside `Slow filesystem detected`. Seen: `routesManifest.dataRoutes is
  not iterable`, sixteen routes 404ing while their HTML sat on disk,
  `Cannot find module for page: /_document`, `Cannot find module for page:
  /faq`. Retrying the build clears it. Almost certainly Defender scanning
  `.next` mid-write. **Fixing this first will make chunk 4 much cheaper:**

      Add-MpPreference -ExclusionPath "C:\Users\user\Desktop\projects\campmeeting-2026"

## Still open with the committee

Unchanged from `CLAUDE.md`, plus one new item:

- **A larger hero photograph.** 1634x962 upscales 1.57x at 2560 and 3.13x
  at DPR 2.
- Event theme text for the hero (still absent from the hero on purpose).
- Friday evening service, Sunday Medical Camp times, closing Sabbath
  15:00-16:00 gap.
- Speaker photos and bios.
