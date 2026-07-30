# Visual design pass — progress and handoff

Sessions of 2026-07-29 and 2026-07-30. Art direction and typographic
hierarchy, not ornament. **All chunks are done and pushed.**

Constraints that held throughout and still hold: no unnecessary gradients,
no oversized shadows, no decorative religious icons, no excessive
animation. `/schedule` server-renders the whole programme so it works
offline and before hydration, so nothing may add per-row DOM, per-row
animation or per-row components. Style what is already there.

---

## Session 1 (2026-07-29)

### Hero, first pass (`c049f4b`)

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
already uses here.

### Header over the hero (`c3517e2`)

- Fully transparent at scroll 0 on the home page only. Glass past a 96px
  threshold. Unchanged from the first pixel on every other route.
- Threshold is an `IntersectionObserver` on a sentinel pinned to the
  document origin (`position: absolute` against the initial containing
  block, contributing nothing to layout). No per-scroll callback.
- State resolves during SSR too, so the first paint over the photograph is
  already correct.
- Over the photograph the lockup, nav and theme toggle go **pure white**
  and the active link gains **weight**, not colour.
- The border is always present and only changes colour, so the header
  cannot change height when the state flips.

`--spacing-header` (5rem) is a named token because two places must agree.
`box-border` keeps the 1px rule inside that height.

### One page-header pattern (`36e381f`)

`src/components/page-header.tsx` is the OG card's structure as a real
component: eyebrow, display-face title, hairline rule, meta line, plus a
`media` slot and a `children` slot. Applied to all thirteen routes.
`src/lib/page-identity.ts` holds one definition per page; the page header,
the share card and `generateMetadata` all read it.

---

## Session 2 (2026-07-30)

### Hero scrims, second pass (`8eb66ed`)

The lower frame read as a blue cast. Three changes, none of them lowering
the alpha, which would have failed AA.

**The ink is near-black `#0b0f14`, not `--color-navy-900`.** Black is
darker, so it protects type at a lower alpha, and it darkens without
tinting so the photograph keeps its own colour. Alpha needed over a
pure-white pixel before white type reaches 4.5:1:

| ink | alpha | ratio |
| --- | --- | --- |
| navy `#052252` | 0.62 | 4.60:1 |
| `#0b0f14` | 0.57 | 4.55:1 |
| `#0b0f14` | **0.58** | **4.71:1**, the floor used |
| pure black | 0.54 | 4.61:1 |

0.58 rather than 0.57 so the margin is not one rounding step wide.
`#0b0f14` rather than `#000` so the scrim keeps a trace of the navy's hue
where it meets the flat `--color-navy-900` fallback band, which costs 0.03
of alpha.

**Both scrims are sized to the box they protect and no further.** The
bottom one was `max(45%, 26rem)` and is now a flat `26rem`. A percentage
of the frame is the wrong unit: what the scrim covers is the text block,
and a text block is type, so its height is pixels set by the breakpoint,
not a fraction of the viewport. Measured footprints, frame bottom to the
top of the `h1`, including the block's own bottom padding:

| width | 390 | 768 | 1024 | 1440 | 1920 | 2560 |
| --- | --- | --- | --- | --- | --- | --- |
| footprint | 290px | 236px | 325px | 352px | 352px | 352px |

26rem (416px) covers the worst case with 64px left for the fade. Compact
phase: `45%` to `15rem`, against a footprint of at most 180px. The saving
is largest where the old rule was most wrong — at 2560 it painted 648px of
scrim to protect 352px of type.

Coverage as a fraction of the frame, before and after:

| width | before | after |
| --- | --- | --- |
| 390x844 | 49% | 49% |
| 768x1024 | 45% | 41% |
| 1024x768 | 54% | 54% |
| 1440x900 | 46% | 46% |
| 1920x1080 | 45% | 39% |
| 2560x1440 | 45% | 29% |

**Stated plainly: the "roughly the lower 30%" target was not reached at
every width, and could not be without moving the text.** The type's own
footprint is 352px, so a scrim that protects it cannot be shorter than
352px plus a fade, and on a 768px-tall frame that is 54% whatever unit it
is expressed in. 30% is reached at 2560 and approached at 1920. What
actually removed the blue cast was the ink and the alpha — 0.95 navy at
the bottom edge became 0.62 near-black — not the coverage.

**Gradient stops.** Ink `rgba(11, 15, 20, a)` throughout.

- top, 176px element, behind the header only:
  `0.62 0px, 0.60 80px, 0.44 104px, 0.24 128px, 0.10 150px, 0 176px`
- bottom, `to top`, 26rem element (15rem compact):
  `0.62 0%, 0.60 60%, 0.58 85%, 0.42 90%, 0.24 94%, 0.10 97%, 0 100%`

85% is where the footprint reaches. The fade above it is concave on
purpose: a straight ramp to zero terminates with a derivative change that
reads as a band edge across the photograph, whereas dropping fast and then
trailing puts the last and most noticeable part of the transition below
0.10 alpha where nothing can be seen.

**The crop is unchanged, and that is a measured result.**
`tools/perf/crop-sweep.mjs` sweeps eleven horizontal and five vertical
`object-position` values and reports the brightest **raw** photographic
pixel inside the text block at each. The default centre crop and the best
available crop, as luminance:

| width | 390 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| centre (`50% 50%`) | 0.936 | 0.720 | **0.992** | 0.991 | 0.989 |
| best of 19 crops | 0.803 | 0.720 | **0.992** | 0.983 | 0.974 |

At 1024, 1440 and 1920 nothing moves: every crop leaves a pixel at 0.97 or
above. There is no crop of this photograph that puts the title over
anything but white, so the 0.58 floor is required whatever the crop, and
changing it would only cost art direction for nothing.

**Measured contrast, built page, white against the brightest composited
pixel in the text region, type hidden so the backdrop is what is sampled.**

Full-bleed phase (`before`):

| viewport | worst backdrop pixel | white |
| --- | --- | --- |
| 390x844 | rgb(102,107,113) | 5.38:1 |
| 768x1024 | rgb(86,86,89) | 7.31:1 |
| 1024x768 | rgb(103,106,113) | 5.42:1 |
| 1440x900 | rgb(109,112,115) | 4.98:1 |
| 1920x1080 | rgb(111,114,117) | 4.84:1 |
| 2560x1440 | rgb(113,114,117) | **4.81:1** (worst) |

Compact phase (`during` / `after`): 5.46, 5.34, 5.48, 5.24, 5.14,
**5.05:1** at the same six widths.

Every width passes. No width had to be deepened. The margin at 2560 is
0.31 above the 4.5 floor and that is deliberate — the brief asked for more
of the photograph, and this is what more of the photograph costs.

**Two bugs the measurement turned up, both fixed in the same commit.**

1. **The compact hero height never applied.** `COMPACT_HERO_HEIGHT` used a
   `group-data-` variant on the element that carries the attribute.
   `group-data-` compiles to a descendant selector, so it matched nothing
   and the band stayed at `h-svh` in every phase — the `during` phase
   measured 844px tall where it should have been 506px. Now a plain
   `data-` variant. Every other compact rule is on a descendant and was
   always correct.
2. **`verify-hero.mjs` was reporting 1.00:1 for the header in both
   states.** See the harness section below.

### Schedule (`19a2f02`)

Times move into a real left column at `sm` and up: tabular, light weight,
muted ink, one line, never wrapping. The gutter is 9.5rem rather than the
7rem the times alone need, because the save control shares the line.
Stacked under the time it made the rail the tallest thing in row one,
which pushed every ministry chip 38px clear of its title. `row-span-full`
looks like the fix and is not — it compiles to `grid-row: 1 / -1`, and
with no explicit row template `-1` resolves back to line 1.

The column is a grid variant on the card, not a wrapper element:
`sm:[&>*:not(:first-child)]:col-start-2`. The `:not(:first-child)` is
load-bearing. Written `[&>*]:col-start-2` it also matches the time rail,
and `.parent > *` and `.sm\:col-start-1` have identical specificity, so the
tie broke on stylesheet order, column 2 won, and every card rendered with
an empty gutter and its time where the title belongs. The grid string is
exported once as `ENTRY_GRID` and used by all four entry shapes.

- **Titles** take the weight: semibold ink, top of the card.
- **Block headings** are dividers in the display face with a rule under.
- **One rail per block**, a 2px border on the `<ol>`, not a segment per row.
- **Featured sessions** take a featured-coloured ring and a 4% wash,
  alongside the star and its `sr-only` label rather than instead of them.
- **The now card** takes a 2px accent ring, a tinted surface and a larger
  title, on top of the live dot in its heading. Four cues, no shadow.
- **All-block activities** keep the dashed outline and now say "No set
  time" in the column where a session's time would be, so they line up
  with their neighbours while staying visibly a different kind of thing.
- **The day rail** is navigation: day number, weekday and date per tile,
  sticky under the site header. Current day distinguished by fill, weight
  and border together, never colour alone, with `aria-current="page"`.

**Ministry tags: four families, not seventeen hues.**
`src/features/schedule/lib/ministry-tone.ts` groups the seventeen tags by
what they are for — devotion, word, care, community — because seventeen
hues are not distinguishable at chip size and would say nothing. The four
are one oklch lightness and one chroma with the hue rotated, so they read
as a set. Measured ink on its own tint:

| family | light | dark |
| --- | --- | --- |
| devotion | 7.62:1 | 7.85:1 |
| word | 7.86:1 | 7.84:1 |
| care | 7.23:1 | 7.87:1 |
| community | 7.73:1 | 7.80:1 |

Every chip carries its ministry name as text, so the tint is a second cue
and never the only one.

### Remaining pages (`9da0c9e`)

- **`/speakers`**: one column on a phone, two at `sm`, four at `lg`. Cards
  range left. The initials avatar is letter-spaced, given an inset
  hairline and set in the display face, so it reads as a monogram rather
  than as a missing image.
- **`/ministries`**: the "More ministries" rows carry the same four family
  tints as a swatch beside the label, so the families are learned once.
- **`/about`, `/faq`, `/downloads`, `/contact`**: set as documents.
  `src/lib/typography.ts` holds the four constants — a 68ch measure,
  `leading-7` body, the display heading, the section rhythm — in one place
  so four pages cannot drift into four slightly different documents.
- **Reveal** extended to those four plus the second section of
  `/ministries`. Sections only. `<section>` elements are kept *inside*
  Reveal rather than replaced by its `<div>`. `/prayer-requests` is
  deliberately left alone: it is the one page with a no-analytics,
  nothing-persisted constraint and did not need the motion.

---

## Gate

### Build, types, lint

`pnpm build`, `npx tsc --noEmit` and `pnpm lint` all pass on `9da0c9e`.

### Header contrast, both states

The earlier 1.00:1 reading was invalid and has been replaced. Each state
is now measured against the colour its type actually is: white against the
**brightest** backdrop pixel when transparent, `--color-ink` against the
**darkest** when glass. Measuring white against both would score a colour
that is never used there.

| viewport | transparent (white) | glass (ink) |
| --- | --- | --- |
| 390x844 | 5.10:1 | 10.49:1 |
| 768x1024 | 5.11:1 | 10.31:1 |
| 1024x768 | 5.11:1 | 10.50:1 |
| 1440x900 | 5.10:1 | 10.31:1 |
| 1920x1080 | 5.05:1 | 10.31:1 |
| 2560x1440 | 5.05:1 | 10.51:1 |

### Reduced motion

Verified in a browser, not by code path, with
`tools/perf/reduced-motion.mjs`. It emulates the preference *before* the
document runs, then per route takes eight screenshots over two seconds and
byte-compares them, asserts `document.getAnimations()` is empty, and
reports any element left holding a non-identity transform or a sub-1
opacity from an entrance that never finished.

All eight routes: **zero running animations, zero stalled transforms.**
Seven are pixel-identical across all eight frames. `/schedule` changes 13
pixels once, in a 3x30 region that resolves to the native `<select>` in
the filter bar repainting on hydration. That is a control repaint, not
motion, and it predates this pass.

### Performance

**Baseline re-taken on `8eb66ed`**, after chunks 1-3 of session 1 and the
hero work, because the old table predated all of it. Median of 5.

| metric | `/schedule` baseline | after | range (baseline / after) |
| --- | --- | --- | --- |
| forced style+layout | **6.55 ms** | **0.80 ms** | 6.30-6.65 / 0.80-0.90 |
| long-task total, 4x throttle | 1,985 ms | 1,103 ms | 1889-2531 / 990-1455 |
| style+layout+paint | 1,547 ms | 795 ms | 1224-1860 / 754-813 |
| CLS | 0.0000 | 0.0000 | max 0.0114 / max 0.0012 |
| elements | 4,773 | 4,790 | identical every run |
| document height | 34,076 px | 27,971 px | identical every run |

`/` baseline: forced style+layout 0.00 ms (range 0.00-0.10), 203 elements,
1,692 px. That is below the instrument's resolution, which is the correct
answer for a 203-element page — it is recorded so a future regression has
something to fail against.

**TBT did not regress; it roughly halved.** The brief's "cut it if TBT
regresses by more than 50ms" threshold is still below this machine's noise
floor — the long-task range is ±600ms — but the movement here is an order
of magnitude larger than the noise and in the right direction.

### content-visibility: KEPT

A/B'd on **one build**, the rule injected and not, so the two readings are
not separated by a rebuild on a machine whose load moves. Five pages each,
forced style+layout of the whole programme:

| | median | range |
| --- | --- | --- |
| without | **7.30 ms** | 6.70 - 7.70 |
| with | **0.90 ms** | 0.80 - 1.10 |

An 88% reduction. Kept.

Note what the "without" number says: the styling pass on its own took
`/schedule` from 6.55 ms to 7.30 ms, a **0.75 ms regression** from the
grid, the block rails and the chips. `content-visibility` did not merely
cover that, it removed eight times more than it.

`contain-intrinsic-size` carries the `auto` keyword and a per-day estimate
derived from block and entry counts rather than a flat guess, so the
scrollbar is honest before anything has been rendered: 27,971 px estimated
against 27,678 px real, an error of 1%. A flat `4000px` per day
overshot by 6,000 px.

Caveats worth knowing: `content-visibility` is ignored where unsupported,
which degrades to today's behaviour rather than breaking. Content stays in
the DOM and in the accessibility tree, so the offline and pre-hydration
reading the whole server-render exists for is unaffected.

---

## Harness fixes — read this before trusting an old number

Three of the five instruments were wrong. Two produced numbers that were
quoted in the previous handoff.

**`layout-cost.mjs` was measuring nothing.** It selected `main > div` and
set `width`. The programme sits inside an `mx-auto max-w-3xl` container,
so its used width does not depend on that wrapper, and Chrome correctly
skipped the subtree. It returned **0.80 ms for a 4,773-element page** and
would have returned 0.80 ms for any change made to it. It now walks down
from `main` to the deepest element still holding ~90% of the tree,
alternates `max-width` rather than `width`, and prints which element it
measured so a future silent miss is visible.

**`verify-hero.mjs` was reporting 1.00:1 for the header in both states.**
It hid the type with `visibility: hidden` and screenshotted immediately.
`visibility` is a transitionable property and every shadcn `Button`
carries `transition-all`, so the theme toggle's white icon was still
painted 150ms later and *was* the brightest "backdrop" pixel it found. It
now injects `transition: none !important` before hiding anything, hides
every descendant rather than a tag list, and waits two frames.

**`hero-contrast.mjs`'s header block was 52px tall** where the real header
is 80px, so it sampled only the densest part of the top scrim and passed
too easily. Now 5rem, matching `--spacing-header`.

Two harnesses were added: `crop-sweep.mjs` (brightest raw pixel per
`object-position`) and `reduced-motion.mjs`.

---

## Not asked for, done anyway

Called out so they can be reverted cleanly.

1. **The compact hero height bug** (`group-data-` on the group element).
   Out of the brief's scope, but it meant the hero's phase behaviour did
   not exist, and the chunk 1 measurements would have been measuring a
   phase that never renders.
2. **The three harness fixes above.** Unavoidable: the gate asks for
   numbers, and these instruments could not produce true ones.
3. **`ENTRY_GRID` extracted** and the same grid string removed from four
   components that had each copied it.
4. **`ministryDotClasses`** added alongside `ministryChipClasses`, for the
   `/ministries` swatches, because a chip tint is far too pale to read as
   a 10px mark on its own.
5. **`/ministries` counts** moved to tabular figures.
6. **`verify-hero.mjs` screenshot filenames** now carry the phase, because
   two runs into one directory left the second phase's shots labelled as
   the first's.

---

## Environment, read before starting

- **`pnpm` is not on PATH.** Every call needs
  `$env:Path = "C:\Users\user\AppData\Roaming\npm;$env:Path"` first.
  `gh` is absent too; use plain `git`.
- **Do not use `2>&1` on `pnpm`.** PowerShell 5.1 wraps native stderr in an
  ErrorRecord and reports failure on a successful build.
- **Commit messages: use `git commit -F <file>`.**
- **The build fails nondeterministically, roughly one run in two**, always
  alongside `Slow filesystem detected`. Retrying clears it. Almost
  certainly Defender scanning `.next` mid-write. The exclusion needs
  admin, which this session did not have:

      Add-MpPreference -ExclusionPath "C:\Users\user\Desktop\projects\campmeeting-2026"

- **The perf scripts resolve `node_modules` from their own directory**, not
  the working directory, so the README's "install in a throwaway dir and
  run the scripts from there" does not work as written. Copy the `.mjs`
  files into that directory and run them there.

## Still open with the committee

- **A larger hero photograph.** The file is 1634x962 and upscales 1.18x at
  a 1920 viewport and 1.57x at 2560, before device pixel ratio. Next.js is
  also serving a 1089px-wide variant at 2560, so the real upscale there is
  2.35x. This is the one remaining thing that visibly limits the hero.
- Event theme text for the hero (still absent from the hero on purpose).
- Friday evening service, Sunday Medical Camp times, closing Sabbath
  15:00-16:00 gap.
- Speaker photos and bios. All four avatars are monograms today.
