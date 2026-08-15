# Visual design pass — progress and handoff

Sessions of 2026-07-29, 2026-07-30 and 2026-08-05. Art direction and
typographic hierarchy, then the layout system underneath it, then the
photography. **All chunks are done and pushed.**

Session 3 is the layout system, responsiveness and interaction pass and is
written up after the two art-direction sessions. If you are only reading
one part, read that one: it contains the width system every page now
depends on.

Session 4 is the photography pass — speaker portraits and header bands —
and is at the very bottom.

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
  Session 3 removed the phone from this problem entirely — see the crop
  section below — so it is now a desktop-only concern.
- Event theme text for the hero (still absent from the hero on purpose).
- Friday evening service, Sunday Medical Camp times, closing Sabbath
  15:00-16:00 gap.
- Speaker photos and bios. All four avatars are monograms today.

---

# Session 3 (2026-07-30) — layout system, responsiveness, interaction

Four commits: `14f32c0`, `7683d83`, `33baead`, and the final one this
document is part of.

## The width system (`14f32c0`)

### The bug

The site had four competing widths. Eleven page wrappers were `max-w-3xl`
(768px), two were `max-w-2xl` (672px), the styleguide was `max-w-4xl`, and
the header, the footer and the hero were `max-w-5xl` (1024px). Nothing
shared an alignment grid. On a 1920px viewport the content column was
768px with 576px of dead margin either side, and the header lockup began
128px to the left of every page title.

### What replaced it

Two tokens in `globals.css`, in `:root` rather than `@theme`, and three
utilities that are their only interface:

```
--width-shell    80rem    the outer grid everything aligns to
--width-prose    68ch     a measure, nested inside the shell
--shell-gutter   1.25rem / 2rem at md / 2.5rem at lg
```

`shell` is carried by the header inner, the footer inner, the hero text
block and all twenty page wrappers. `shell-bleed` lets the sticky day rail
paint to the column edge while reading the same gutter variable.
`prose-column` caps body copy — applied to the column that holds the
prose, not to each paragraph, so headings, rules and text share one left
and right edge.

**Not in `@theme`, deliberately.** They generate no utilities, and a
`@theme` variable that no generated utility references can be tree-shaken
out of the built stylesheet. `:root` always emits. Verified by grepping
the built CSS chunk, not assumed.

80rem rather than the 64rem the shell used to run at, because the
programme is a four-part row — time, title, presenter, ministry — and
768px was starving it.

### Measured alignment

`tools/perf/align.mjs` is new. It reads the x position of the header
lockup and of the page `h1` at five widths on seventeen routes and
requires them equal. **85 route x width combinations, all pass.**

| viewport | 390 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| header lockup x | 20 | 32 | 40 | 120 | 360 |
| page h1 x | **20** | **32** | **40** | **120** | **360** |
| content width | 350 | 704 | 944 | 1200 | 1200 |
| gutter | 20 | 32 | 40 | 40 | 40 |

### No raw `max-w-*` on any page wrapper

Confirmed by grep. What is left, and why each is not a wrapper:

- `components/ui/sheet.tsx` — `sm:max-w-sm` on the shadcn drawer panel.
- `styleguide/page.tsx` — `max-w-md` / `max-w-sm` on component specimens.
  The page exists to show primitives at their own sizes.
- `hero.tsx` — `max-w-2xl` on the hero title block. A measure inside the
  shell, the same role `prose-column` plays elsewhere, at display size.
- `live-embed.tsx` — `max-w-sm` on an error message inside the player.
- `lib/typography.ts` — `max-w-(--width-prose)`, which is the token.

## Bands and rhythm (`7683d83`)

Every page was one column of one width on one white surface with `py-16`
between everything, so nothing grouped. That uniformity, not the palette,
is what made the pages read as one long undifferentiated document.

`src/components/band.tsx` spans the viewport and puts its contents on the
shell, so the background breaks the column without moving a character
sideways. Adjacent bands alternate `surface` and `surface-muted`, two or
three per page maximum. Flat colour only — no image, no gradient, no
pattern, in any band. A plain `div`, not a `section`: an unlabelled
`section` is either ignored by assistive technology or announced as an
anonymous region, and the pages already carry labelled sections inside.

Three rhythm tokens replaced the flat `py-16`:

| token | mobile | md | role |
| --- | --- | --- | --- |
| `--space-band` | 3rem | 4rem | a band's own top and bottom |
| `--space-section` | 2rem | 2.5rem | between sections in one band |
| `--space-item` | 0.75rem | 1rem | a heading and its own items |

Roughly 4 : 2.5 : 1 at md, so a section opening always has visibly more
above it than its contents have between them. Two adjacent bands put twice
`--space-band` between their contents, which is right: a band boundary is
the biggest break on a page and it also changes surface colour.
`DOC_SECTION` and `DOC_STACK` in `lib/typography.ts` read the same tokens.

`/contact` got the most out of it: three bands, and the address and the
map now sit side by side from `lg`. That is the one place on that page
where 80rem buys something — the map stops being a 288px letterbox under a
short list.

**The home page has one band below the hero, not two, and that is
deliberate.** The photograph is already the strongest surface change on
the site, and everything under it is `TodayView`, whose internal sections
are clock-dependent and painted client-side; banding those would put a
surface change on markup that is a skeleton at first paint, which is the
layout shift the hero's phase attribute exists to avoid. A second band
would have meant inventing content for it. It was not invented.

## The day rail (`33baead`)

### The bug

`flex gap-2 overflow-x-auto` at every width inside a 768px column, so on a
1920px screen the rail still scrolled and the closing Sabbath sat off the
right-hand end — a navigation control hiding the day most readers were
looking for.

### After

Nine equal columns from `md`, nothing scrolls. Measured, `tools/perf/responsive.mjs`:

| viewport | 360 | 390 | 414 | 768 | 820 | 1024 | 1280 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tiles | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 |
| result | scrolls | scrolls | scrolls | fits | fits | **fits** | fits | **fits** | **fits** |

Nine tiles in the 704px content box at `md` means "Wednesday" does not fit
at 14px semibold, so the weekday is abbreviated between `md` and `lg` and
written out again from `lg`, where the box is 944px. Two spans per tile,
eighteen elements in total — this is navigation, not the 237-entry
programme, and the per-row rules do not apply to it.

Below `md` it still scrolls, and that is now designed rather than
overflowing: scroll-snap per tile, an edge mask on whichever side has
content behind it, and the selected day scrolled into view on load.

The mask is keyed off a `data-overflow` attribute rather than painted
unconditionally, so a rail scrolled to its end does not fade out the last
tile — which is exactly when the reader most needs to see it. It is a
mask, not a gradient overlay, so it works on any background and there is
no colour to keep in step with the surface token underneath.

The sticky offset and the day sections' `scroll-margin` are both derived
from the measured header and rail (`day-rail-behaviour.tsx`) rather than
from `top-header` and a hardcoded `scroll-mt-40`.

**Scrolling into view is written as `scrollLeft`, not `scrollIntoView`.**
`scrollIntoView` walks up every scrollable ancestor, and this rail is
sticky inside a 28,000px document, so it can and does scroll the page as
well as the rail.

### The entry grid at full width

From `lg` the presenter and ministry chips move up beside the title into
columns three and four of the same row. Placed by `data-entry` attributes
rather than by position, because which children exist varies per entry —
notices, presenters, ministry and note are each optional — and by element
type two pairs collide (notices and presenters are both `ul`, ministry and
note are both `p`).

Written as `:not()` exclusions on the `sm` rule rather than as `lg`
overrides of it. `.parent > *:not(:first-child)` and
`.parent > [data-entry=x]` have identical specificity, so an override
would have been settled by Tailwind's sort order — the same tie that once
put every time in the title's place. Taking the two elements out of the
general rule removes the conflict instead of betting on it.

## The hero on a phone (`33baead`)

### Why a crop could not fix it

The source is 1634x962, a 1.70:1 landscape photograph. A 390x844 portrait
viewport is 0.46:1, so `object-fit: cover` kept **27% of the image's
width** — the middle third, roof and tarmac, with the building's own edges
outside the frame. There is no `object-position` that survives that, and
letterboxing a hero is not an answer.

### What was done

Below `md` the frame stops being driven by the viewport and takes a 4:3
ratio of its own, and the text block moves off the photograph onto the
page surface. One text block positioned differently by breakpoint, not two
copies — two copies is two `h1` elements, which is a real structured-data
and accessibility fault rather than a tidiness preference.

Measured, `tools/perf/phone-hero.mjs`:

| viewport | frame | ratio | keeps | window | title |
| --- | --- | --- | --- | --- | --- |
| 360 | 360x270 | 1.33:1 | 78.5% of width | x 8.2%-86.7% | below, ink |
| 390 | 390x293 | 1.33:1 | 78.4% | x 8.2%-86.6% | below, ink |
| 414 | 414x311 | 1.33:1 | 78.4% | x 8.2%-86.6% | below, ink |
| 768 | 768x844 | 0.91:1 | 53.6% | x 23.2%-76.8% | over, white |

The crop no longer varies with the device, because the frame's shape no
longer does. From `md` the phase-driven `svh` behaviour is untouched.

**`object-position: 38% 50%` below md.** The vertical half is inert at 4:3
— cover takes 22% off the width and nothing off the height — and is
written only because the property needs both. 38% rather than 50% moves
the kept window from x 11%-89% to x 8%-87%, trading the right-hand edge of
the neighbouring tower block for the church's own left-hand roofline. The
green sign sits at x 24%-44% and is inside every possible window, so it
was never the thing at risk.

**What is visible at 390 and 414:** the whole church — the full pitched
roof and its clerestory vents, the green "NEWLIFE SDA CHURCH, NAIROBI"
sign, the glazed frontage end to end, the stone base course — plus the
front row of the car park with the red pickup, and sky above the roofline.
Lost at both widths: a sliver of the neighbouring tower block on the right
and the parked cars at the far left edge. At 414 slightly more of the
right-hand awning survives than at 390 because the frame is taller in
absolute terms, not because the crop fraction differs.

### Contrast, every width, both phases

`tools/perf/verify-hero.mjs` against the real built page. **Every width
passes.**

Full-bleed phase (`before`):

| viewport | type | worst backdrop pixel | ratio |
| --- | --- | --- | --- |
| 390x844 | ink | rgb(255,255,255) | **16.56:1** |
| 768x1024 | white | rgb(98,96,99) | 6.23:1 |
| 1024x768 | white | rgb(103,106,113) | 5.42:1 |
| 1440x900 | white | rgb(109,112,115) | 4.98:1 |
| 1920x1080 | white | rgb(111,114,117) | 4.84:1 |
| 2560x1440 | white | rgb(113,114,117) | **4.81:1** (worst) |

Compact phase (`during` / `after`): 16.56, 5.34, 5.48, 5.34, 5.14,
**5.05:1** at the same six widths.

390 went from 5.38:1 to 16.56:1 because the title is no longer over a
photograph at all. The other five widths are within 0.1 of the previous
session's readings, which is the expected result: nothing above `md`
changed.

Header, both states, unchanged and passing: transparent 5.05-5.11:1,
glass 10.31-13.42:1 across all six widths.

`tools/perf/hero-contrast.mjs` was also re-run at both phases as asked.
Worth knowing what it does and does not now cover: it builds a **mock** of
the hero rather than loading the site, and its mock is full-bleed at every
width, so its 390 row now models a hero shape the site does not render.
It is still the right instrument for iterating on gradient stops without a
rebuild; `verify-hero.mjs` is the one that measures what ships, and that
is the table above.

### Would a portrait-cropped second source help?

**No, and the numbers now say so.** At 390 the frame is 390x293 CSS px and
the file is 1634x962, so the image is **downsampled 3.3x** — 0.61x even at
device pixel ratio 2. There are no pixels missing on a phone; there is a
surplus. A portrait crop would supply fewer pixels for the same box and
would have to re-solve a composition that the 4:3 frame already gets
right. Do not commission one.

The upscale problem is now desktop-only, and it is worst where it always
was: 1.18x at 1920 and 1.57x at 2560 against the file, and 2.35x at 2560
against the 1089px variant Next actually serves. One further finding: at
768x1024 the served variant is 768w for a box that needs 1738px of source
width, a **2.27x** upscale — the worst on the site. That is a `sizes`
problem, not a source problem: `sizes="100vw"` describes the box's width
while `object-cover` on a tall frame is driven by its height. It predates
this session and is left as found.

## Responsiveness audit

Nine widths x seventeen routes = 153 combinations, `tools/perf/responsive.mjs`.
**Findings went from 153 of 153 to 33 of 153**, and every one of the 33 is
at 1024 or above.

| route | width | what broke | fixed |
| --- | --- | --- | --- |
| **every route** | 768, 820 | Desktop nav overflowed the document by **126px / 74px** — a horizontal scrollbar on every page of the site at tablet width | Nav moved from `md:flex` to `lg:flex`, gap steps `lg:gap-4 xl:gap-6` |
| `/faq` | 360 | Document 25px past the viewport from an unbreakable long token in one answer. No element rect exceeded the viewport, which is why it read as "overflow with no offender" | `break-words` on `DOC_BODY` |
| `/styleguide` | 360, 390, 414 | `whitespace-nowrap` type-scale labels pushed the document out by 110 / 80 / 56px | Label allowed to wrap |
| **every route** | all | Theme toggle and mobile menu 32x32 | 44px hit area from a pseudo-element; painted size unchanged, because growing it would push the header past `--spacing-header`, which the hero's `-mt-header` and the rail's sticky offset both read |
| **every route** | all | Footer nav links 20px tall | `min-h-11 min-w-11` |
| **every route** | all | Footer brand lockup 379x40 — under the floor *and* a full-width mis-hit band that sent any click to the home page | `w-fit min-h-11 min-w-11` |
| all forms | ≤ 820 | Every `Input` 32px, contact select 32px, submit buttons 36px | `h-11` up to `lg` |
| `/schedule` | ≤ 820 | Filter selects 36px, view-switch chips 32px, "Clear filters" 32px | `h-11` / `min-h-11` up to `lg` |
| `/schedule` | all | Bookmark toggle 24x24 | 44px hit area from a pseudo-element — a 44px control on each of 237 rows would set the row height |
| `/ministries` | all | "More ministries" rows 38px | `min-h-11` |
| `/prayer-requests` | all | Identity radios measured 40px | `min-h-11 py-1` on the labels, which are the real targets |
| `/livestream`, `/downloads` | all | Action links stretched to the full column (694px, 217px) as flex items | `w-fit` on `ACTION_LINK` |
| `/schedule` | 768 | Filter row was `md:flex-row`, giving search a third of a starved column | Grid: `sm:grid-cols-2`, `lg:grid-cols-[2fr_1fr_1fr]` |
| `/schedule` | all | Three stacked full-width control rows above the programme | View switch and result count share one line from `sm`; day rail moved above them |

**Nothing collides, nothing clips, and no route requires a horizontal
scroll** at any of the nine widths. The only horizontal scroller left is
the day rail below `md`, which is intentional and now has snap points and
an edge fade.

### The 33 remaining findings, and why they stay

All are at 1024 and above, where a mouse does the pointing:

- Form inputs 32px, selects 36px, submit buttons 36px, action links 32px.
  This is the `lg:` compact size and it is the deliberate line: **44px up
  to `lg`, the original compact size above it.** The split is at `lg`, not
  `sm` — that was a correction during this session. 768 and 820 are tablet
  portrait, which is a finger, and at `sm` every form control on the site
  still measured 32px there. All of these clear WCAG 2.2 AA target size
  (24x24); 44px is the AAA bar.
- `/styleguide` buttons at 58x32 at every width. That page's job is to
  show the Button primitive at its declared `sm` and `xs` sizes.

## Interaction

Everything is under 200ms on the existing `--duration-fast` /
`--ease-out-soft` tokens, and no state change is carried by colour alone.

- **Nav links** gain an underline on hover as well as an ink change, and
  `min-h-11` for the target without taking horizontal room the desktop bar
  does not have.
- **Speaker and ministry cards** get three states, deliberately identical
  to each other: hover is a tint plus a 1px lift, active puts the lift
  back and deepens the ring to 2px accent, focus-visible is the accent
  outline. The ring moving is what makes the change legible without
  colour — the tint alone is a 2% shift many screens will not show.
- **Day rail tiles** get hover, a pressed state and the same focus ring.
- **Session rows** get a hover on the hairline only. A row is not a link
  and must not pretend to be one; what the hover is for is that the one
  interactive thing in the row is a 16px bookmark icon, and it gains
  contrast on the same hover so it can be found.
- **The bookmark** confirms a press with a scale on the icon, driven by
  `group-active` on the button rather than `active:` on the icon: the hit
  area is a pseudo-element well outside the icon, so a press landing on it
  never makes the icon the active element and a bare `active:` variant
  would silently do nothing for most of the target.
- **The live dot** replaced Tailwind's `animate-ping` with a 2.4s
  `live-pulse` that reaches 1.6x and a 0.45 alpha ceiling. `ping` goes to
  2x and zero opacity in one second, which at indicator size reads as a
  notification badge. On the dot, never the card.
- **The sticky rail marks which day is on screen**, from one
  IntersectionObserver over the eight day sections — not one per row and
  not a scroll handler. Deliberately not `aria-current`: that already
  means "the day you are on", and two attributes claiming two kinds of
  "current" in one control is worse than not marking it.

Nothing new uses Framer. No dynamic feature import was reintroduced.

## Gate

### Build, types, lint

`npx tsc --noEmit`, `pnpm lint` and `pnpm build` all pass.

### Reduced motion, verified in a browser

`tools/perf/reduced-motion.mjs`, preference emulated before the document
runs, eight screenshots over two seconds per route, byte-compared.

**Seven of eight routes are pixel-identical across all eight frames. Zero
running animations and zero stalled transforms on all eight.**

`/schedule` changes once, at frame 1: **35 pixels in a 620x3 region over
`select#schedule-ministry`**. That is the native select repainting on
hydration — the harness now reports the diff region and the element under
it, so this is identified rather than assumed. It is a control repaint,
not motion, and the same finding the previous session recorded (it was
13px in a 3x30 region then; the select is full-width now, hence the
different shape).

`.live-pulse` under the preference: **`display: none`, its own
`getAnimations()` empty.** The global reduced-motion block alone stops the
movement but leaves the ring painted at its first keyframe — a permanent
45% halo — so there is a rule that removes it, and this is what verifies
that rule.

### `/schedule` performance

Median of 5, 4x CPU throttle. Baseline is `7525893`, the commit this
session started from, measured before any change.

| metric | baseline | after | range (baseline / after) |
| --- | --- | --- | --- |
| forced style+layout | 0.90 ms | **0.80 ms** | 0.80-1.80 / 0.80-0.80 |
| long-task total | 1,061 ms | **1,237 ms** | 714-1,393 / 1,177-2,999 |
| style+layout+paint | 732 ms | 827 ms | 507-1,353 / 764-1,996 |
| CLS | 0.0001 | **0.0000** | max 0.0018 / max 0.0061 |
| elements | 4,790 | 4,843 | identical every run |
| document height | 27,971 px | **27,961 px** | identical every run |

**Long-task total is up 16.6% on the median, which is above the brief's
10% line. Stating it plainly rather than filing it under noise.**

What the width itself costs: **nothing measurable.** A/B'd on one build,
`.shell` forced back to 48rem and not, five pages each:

| | median | range |
| --- | --- | --- |
| shell at 80rem | 0.80 ms | 0.80 - 0.80 |
| shell forced to 48rem | 0.70 ms | 0.70 - 1.00 |

A tenth of a millisecond on a 4,843-element page, with element count and
document height identical either way. The wider column is not what moved
the long-task number.

What did move it, measured by removing it: **the day rail's behaviour
component costs about 55 ms.** Built once with `<DayRailBehaviour />`
present and once without, same code otherwise:

| | long-task median | range |
| --- | --- | --- |
| with rail behaviour | 1,237 / 1,217 / 1,218 ms | 1,117 - 2,999 |
| without it | **1,166 ms** | 1,061 - 1,819 |

Three independent 5-run passes on the final build gave long-task medians
of 1,237, 1,217 and 1,218 ms — reproducible to about 2%, so the
instrument was not drifting while this was measured. The baseline's own
five runs spread 714-1,393, so **1,061 is the less trustworthy of the two
numbers**, and separating "the page got heavier" from "the machine was
quieter that hour" would need the old commit rebuilt in a worktree, which
was not done.

**What I would trade, in order.** The day-in-view IntersectionObserver in
`DayRailBehaviour` is the only part of that component that is a nicety
rather than a fix — the sticky offset and the edge fade are both
correctness — and dropping it recovers most of the 55 ms. I would not
trade the width: it costs 0.1 ms and it is the thing the whole session was
for. I would not trade the CSS states: they are paint-time, and
style+layout+paint moved 732 → 827 ms inside ranges that overlap almost
entirely.

## Not asked for, done anyway

Called out so they can be reverted cleanly.

1. **`src/lib/link-styles.ts`.** Six files carried a byte-identical copy
   of one call-to-action link class string and three more carried another.
   All six measured 32px tall. Fixing that in six places was the
   alternative.
2. **Four harness corrections, all of which produced or would have
   produced wrong numbers.**
   - `verify-hero.mjs` measured the hero text as white against the
     brightest pixel unconditionally. Below `md` the title is ink on the
     page surface, so it would have reported 1.00:1 for a hero that is
     fine — the identical mistake its own header block documents. It now
     reads the title's computed colour. Its scrim query was `:scope >
     div[aria-hidden]` and silently returned `[]` once the scrims moved
     inside the frame element.
   - `reduced-motion.mjs`'s new `.live-pulse` check first asserted on
     `document.getAnimations()`, which returns everything on the page: it
     reported "4 running" for an element that is `display: none` and can
     have none, and failed a rule that works. Now scoped to the element.
   - `responsive.mjs` needed three false-positive filters before it was
     worth reading: `sr-only` subtrees (126 rows of "CLIPPED by 346px" for
     markup working exactly as intended), the off-screen spam honeypot,
     and pseudo-element hit areas — without that last one it reports a
     correctly-sized 44px control as a 32px failure and sends you off to
     inflate a control that is already right.
   - It also could not see the `/faq` overflow, because the offending
     element's own box fits and only its content overflows. It now falls
     back to leaf elements whose `scrollWidth` exceeds their `clientWidth`,
     which turned "OVERFLOW +25px []" into a named element.
3. **Two new harnesses**: `align.mjs` and `responsive.mjs`. The gate asks
   for an alignment proof and a route-by-route table; neither existed.
4. **`/contact` restructured** into three bands with the address and map
   side by side at `lg`, rather than left as four sections in one column.
5. **`ScheduleShell` reordered**: the day rail moved above the results bar
   (it is navigation, and it is the sticky element), and the view switch
   and the result count now share one line from `sm`.
6. **The footer copyright bar** moved onto the shell, so the line of type
   starts where the lockup above it does. Its rule still spans the
   viewport.
7. **The hero CTA is a primary-filled button below `md`.** A white button
   on the white page surface would have been an outline of nothing.
8. **`break-words` on `DOC_BODY`**, which is the `/faq` overflow fix but
   applies to every document page.

## Environment notes to add to the ones above

- **Do not run `pnpm build` while `pnpm start` is serving `.next`.** Two of
  the build failures this session were `PageNotFoundError: Cannot find
  module for page: /about` and similar across six routes, alongside the
  usual `Slow filesystem detected`. Stopping the server first made them
  stop.
- **PowerShell 5.1's `Get-Content` mangles UTF-8.** A bulk edit run through
  `Get-Content` without `-Raw` (which this shell rejects anyway) turned
  every em dash in fourteen files into `â€"` and added BOMs. Use `node` for
  scripted edits to source files; it reads and writes UTF-8 correctly.
- **PowerShell paths containing `[...]` need `-LiteralPath`.** Every
  `src/app/schedule/[day]/` path fails silently with wildcard globbing
  otherwise; the Read tool and `node` handle them fine.

---

# Session 4 (2026-08-05) — the photographs

Three commits: `ba70067`, `d39ba56`, `4dbe5a4`. The site had no photography
outside the home hero: eight monogram avatars and thirteen header bands on
flat `--color-surface-muted`. It has both now.

Two converters are checked in alongside the harnesses, for the same reason
they are — the crops and the `object-position` values in them are
decisions, and a decision that lives only in a shell history is one the
next person has to re-make by eye:

    tools/assets/speaker-photos.mjs   -> public/speakers/<id>.webp
    tools/assets/header-photos.mjs    -> public/headers/<route>.webp

## The supplied artwork is not photographs

**Read this before re-cutting anything.** None of the seven speaker files
is a photograph. Each is a 1:1 SOCIAL POSTER card: the person cut out onto
the camp meeting's plum ground, with their role in a script face and their
name in a heavy sans burnt into the lower fifth of the frame.

That text cannot ship. The site sets the name and role in type directly
beside the picture, so the burnt-in line is the same words a second time in
someone else's typeface, and at the 48px the card avatar renders it is four
illegible grey bars. **The crop is not art direction, it is the only way to
use these files at all.**

What is actually wanted from the committee is the source photographs: no
crop needed, not pre-tinted to the poster's plum, and lightable
consistently with each other.

### The crop, and the two numbers per speaker

A 3:4 portrait window, as tall as each caption allows, centred on the
head-and-shoulders mass. `cx` is not 0.5 on any of them, because every card
sets the person off-centre to leave room for the type.

`imagePosition` — a new optional field on `Speaker` — is the vertical
`object-position` the round card avatar needs. A 1:1 window onto a 3:4
frame keeps the full width and 75% of the height, so the value decides
which 75%. It is derived rather than chosen: it puts the face's centre at
42% of the circle. The script renders the resulting circle to a PNG with
`--preview`, so the choice is checked instead of assumed.

| id | source px | crop taken | output px | KB | object-position |
| --- | --- | --- | --- | --- | --- |
| kennedy-mfune | 1024x1024 | 261,0 522x696 | 522x696 | 18.0 | 50% 0% |
| allan-okoth | 1264x1264 | 324,0 654x872 | 540x720 | 46.9 | 50% 19% |
| priskillah-munda | 1264x1264 | 284,0 721x961 | 540x720 | 55.0 | 50% 69% |
| janet-oyiende | 1264x1264 | 319,0 701x935 | 540x720 | 49.7 | 50% 4% |
<!-- The last two ids were later migrated to preskilla-munda and
     janet-oyende-kariuki; the crops are unchanged. See "Two names,
     marked and not changed" below. -->

| john-clement | 1024x1024 | 271,0 553x737 | 540x720 | 43.0 | 50% 24% |
| isaac-oenga | 1264x1264 | 270,0 673x897 | 540x720 | 50.5 | 50% 60% |
| barrack-bosire | 1264x1264 | 332,0 664x885 | 540x720 | 65.0 | 50% 0% |

The values that come out at 0% are the well-composed frames: a portrait's
face is already high, so centring it in a square crop means starting at the
top edge. **720px tall is the 160x213 CSS portrait at device pixel ratio 3
and not a byte more.** Never upscaled — kennedy-mfune's crop is 696px and
is written at 696.

Eld. Ken Ochuka has no photograph, so the initials monogram stays. It is
not dead code waiting to be deleted: it is the state this list is in
whenever it grows.

## Four speakers with no sessions

janet-oyiende, john-clement, isaac-oenga and barrack-bosire appear in no
session in `program.ts`, because `Draft_Program_v2` predates their
appointment. **No session and no ministry tag was invented to fill that
in.** Note that Morning Devotion and Teens are not existing `MinistryTag`
values either, so adding these sessions may mean adding tags to
`types.ts`.

Their cards say "Sessions to be confirmed"; their pages say it through the
site's own `EmptyState`, with the sentence that they are on the programme
and the sessions have not been published yet, and a link to the full
programme. The share descriptions say the same, so a reader meets one
sentence wherever they arrive. `programSpeakers` already kept a profile
with no sessions out of the programme's speaker filter, so no facet offers
a search that returns nothing. DATA-NOTES.md items 7-10.

## The header bands

`src/lib/page-header-art.ts` holds one record per route — file, intrinsic
size, `position`, and `keeps`, a sentence saying what that crop leaves
visible. `PageDefinition` carries the record, so a page still says what it
is in one place.

### The band's height does not move, and that is structural

The image and both scrims are absolutely positioned, so they are out of
flow and contribute nothing. The band goes on being exactly as tall as
`band`'s own padding and the type inside it. Measured before and after at
390/768/1024/1440/1920 on all fourteen routes: identical to the pixel. That
is also why the image is `fill` rather than sized — a sized image has an
intrinsic height and wants to be in flow.

`-z-20` on the picture and `-z-10` on the scrims, against `isolate` on the
band. Negative z-index puts a positioned element behind the static in-flow
content that follows it; `isolate` keeps that index inside the band.

### The scrim is the hero's, and the coverage is not

Same two inks — now **exported** from `lib/hero.ts` rather than copied,
which is the difference between the site having one plum and having two
that agree today. Same 0.66 alpha floor, derived there against a pure white
pixel. Same warm-at-the-outer-edge, cool-as-it-eases-in direction.

What is not the hero's is that the scrim covers the whole band, and it
could not be otherwise. The hero leaves the middle of an 88svh frame
untouched because there is a middle with no type in it. On a 286px band
whose padding is 3rem, rising to 4rem at md, the type IS the middle. Two
scrim elements that **abut** at the half rather than overlapping: two 0.66
layers composite to 0.88, which is a third alpha nobody chose.

Composited over a pure white pixel, white type measures 5.49:1 under
PLUM_DEEP at 0.66 and 6.22:1 under PLUM_WARM at 0.72. The outer edges take
0.72 because that is where the band meets the page surface above and below
it, and the extra is what stops the join reading as a seam.

### The eyebrow goes white too

Grapevine over this scrim is about 1.3:1. Warm was the other candidate —
the share card uses it as an eyebrow on the poster plum and clears 4.81:1
there — but the card's ground is SOLID Grapevine, and over a 0.66 scrim on
a white pixel Warm measures **2.87:1 and fails**. Making it pass needs
about 0.85 alpha, at which point there is no photograph left to have put
behind the band. So: white, and hierarchy from size and weight.

The `children` colour moved out of /faq, /prayer-requests and
/ministries/[tag] and into `PageHeader`, because /faq's Provisional badge
is `text-foreground` on a `border-border` outline — ink on a hairline, and
invisible on the scrim. The badge override is scoped by its own
`data-slot`, not by a class name.

### Contrast, all five widths, both schemes

`tools/perf/verify-page-header.mjs`. 420 readings: fourteen routes, five
widths, three strings, two schemes. Eyebrow, title and meta are scored
**separately**, each against the brightest composited pixel inside its own
box — a union box lets the eyebrow's worst pixel score the title, which is
how a band with one blown highlight under one line reports as passing.

**All clear 4.5:1.** Worst per route, across both schemes and all widths:

| route | worst | string | at |
| --- | --- | --- | --- |
| /ministries/christian-education | **5.55:1** | meta | 390 |
| /ministries/health | 5.63:1 | title | 1024 |
| /schedule | 5.68:1 | title | 768 |
| /ministries/family-life | 5.72:1 | meta | 390 |
| /ministries | 5.80:1 | meta | 390 |
| /downloads | 5.89:1 | title | 768 |
| /contact | 6.04:1 | eyebrow | 1024 |
| /livestream | 6.05:1 | title | 390 |
| /prayer-requests | 6.11:1 | title | 390 |
| /about | 6.34:1 | title | 768 |
| /faq | 6.90:1 | title | 1920 |

Photo bands read identically in light and dark: white type on a fixed
scrim is scheme-independent. No page failed, so no scrim was deepened and
no text moved.

### One crop that did not survive, and what fixed it

`/about`. Removing its meta line — see below — made it the shortest band on
the site at 213px, so at 1920 it keeps **17% of the source height**, less
than any other route. At `50% 45%` that slice landed on the join between
the bokeh and the Bible's top edge: a soft horizontal gradient with no
legible subject, which is the strip of background this exercise exists to
avoid. `50% 70%` drops the window onto the open pages, where the printed
text and the gutter survive the scrim. Checked by rendering at 390, 768 and
1920, not by arithmetic. Nothing else failed.

### What actually limits these pictures

Not the 1600px ceiling. **Seven of the ten supplied sources are between 555
and 736 pixels wide**, and they are not upscaled to disguise it — an
upscaled file is the same softness at four times the bytes. So the browser
stretches them itself, against the file on disk:

| route | file | 390 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| /livestream | 555x260 | 0.70x | 1.38x | 1.85x | 2.59x | **3.46x** |
| /prayer-requests | 588x306 | 1.00x | 1.31x | 1.74x | 2.45x | 3.27x |
| /schedule | 612x328 | 0.82x | 1.25x | 1.67x | 2.35x | 3.14x |
| /ministries | 735x245 | 0.98x | 1.17x | 1.39x | 1.96x | 2.61x |
| /downloads | 736x404 | 0.67x | 1.04x | 1.39x | 1.96x | 2.61x |
| /ministries/health | 736x412 | 0.87x | 1.04x | 1.39x | 1.96x | 2.61x |
| /ministries/christian-education | 735x414 | 0.86x | 1.04x | 1.39x | 1.96x | 2.61x |
| /about, /faq, /family-life | 1600x1067 | ~0.30x | 0.48x | 0.64x | 0.90x | 1.20x |
| /contact | 1634x962 | 0.24x | 0.47x | 0.63x | 0.88x | 1.18x |

**Larger sources from the committee are the only fix.** Ask in the same
request as the hero's original and the poster lockup.

`/contact` reuses `public/hero/church.webp`, the photograph the home hero
carried before the poster's own picture replaced it. It costs nothing — the
file never left the repo and was already precached — and it was always a
better wayfinding picture than a home hero. `50% 31%` is the one crop on
the site with a name in it: the green NEWLIFE SDA CHURCH sign spans
y 0.29-0.38 and a centred crop at 1920 lands on the car park.

`/ministries/children` has no photograph, and the lookup returns undefined
rather than being told about it. **Do not pick a stand-in** — a children's
ministry page illustrated with somebody else's stock photograph is worse
than one with no picture.

## The meta line is optional now

Four pages had one that restated the page. /speakers counted the presenters
above a grid of exactly those presenters; /about and /contact set the
church name and address the header lockup already sets on every page, and
that /contact then sets again beside a map of it; /livestream named the
church and the timezone. /ministries had a paragraph saying its four cards
are worth a page of their own, above four cards each carrying its own
description and count, and a second sentence the band below repeats in its
own first line.

A meta line that restates the page is worse than none: it teaches a reader
that the line under the rule is not worth reading, on the seven pages where
it still is.

**The rule is a separator, so it is drawn only when something is under it**
— the meta line, or the paragraph a page passes as children. Keeping it as
a terminal flourish was the other option and is worse: a full-width
hairline with nothing after it reads as a line of type that failed to
render. `ogCard` does the same, so a preview and the page it opens still
describe themselves identically; conditionally rather than with an empty
string, because Satori lays out a zero-height flex row as a real row.

**This is the one place the brief could not be met literally.** The padding
and the mt-3 / mt-6 / mt-5 rhythm are untouched, so nothing was re-tuned —
but a band whose height is content-driven cannot lose a line of type and
stay the same height without inventing filler to replace it. At 768 and up:

| route | before | after |
| --- | --- | --- |
| /speakers | 326px | 213px |
| /about | 314px | 213px |
| /contact | 314px | 213px |
| /livestream | 286px | 213px |
| /ministries | 350px | 286px (children only; its meta stays) |

Every other band is identical to the pixel.

## Payload

**Every file in `public/` is precached** — confirmed by grepping the built
worker, not assumed. So a picture is bytes a phone on campground signal
pays for whether or not it opens that page.

| | KB | precache total |
| --- | --- | --- |
| `public/speakers/` (7 files) | 328.2 | 1961.68 -> 2290.62 KiB |
| `public/headers/` (10 files) | 576.2 | 2290.62 -> 2764.87 KiB |
| /contact | 0 | reuses a file already in the precache |

**576.2 KB is about 176 KB over the ~400 KB line, and three files are the
whole of it:** family-life 202, faq 120, about 106 — 428 KB between them.
The other seven come to 148 KB.

**Recommendation, not applied:** serve those three outside the precache.
/about, /faq and /ministries/family-life are documents read once, and the
campground case is the schedule. That drops the added precache to about
148 KB with no loss to the offline programme.

q82 effort 6 throughout. q88 was measured and not kept: it costs 213 KB
more across the ten and puts no visible difference behind a scrim holding
0.66 alpha over every pixel of them.

## Gate

`npx tsc --noEmit`, `pnpm lint` and `pnpm build` all pass on `4dbe5a4`.

**CLS 0.0000** — median, min and max — on /schedule, /about, /contact,
/speakers, /livestream, /faq and /ministries/health.

**Reduced motion:** eleven of twelve routes pixel-identical across eight
frames; **zero running animations and zero stalled transforms on all
twelve.** `/schedule` is not fully static: 50px in a region at y 485, over
a day-rail tile. **Verified against a build of the pre-session commit
rather than assumed** — it was already not static there, 33px at the same
y 485 over `select#schedule-ministry`, in two runs of three. Both are
control repaints on hydration, below the header band, which ends at y 366.
The extra image request plausibly shifts hydration timing so a second
control's repaint also lands after the first frame.

## Harness correction

`verify-page-header.mjs` reported /schedule's source as 525px wide. The
file is 612px. `naturalWidth` on an image chosen from a `w`-descriptor
srcset is the **density-corrected** intrinsic width, so it moves when
`sizes` moves and it is smaller than the file — every upscale in that
column was understated by about 15%, in the direction that makes a soft
picture look sharper than it is. It now carries the source dimensions as a
constant, the way `verify-hero.mjs` already did.

## Not asked for, done anyway

Called out so they can be reverted cleanly.

1. **The speaker crops.** The brief said convert, not crop. The burnt-in
   captions made it unavoidable.
2. **`SpeakerPortrait`.** The speaker page's media slot takes a 160x213
   portrait instead of the 80px circle, and "Biography to follow." is gone
   with it. An 80px circle was right while every speaker was a monogram; a
   monogram repeated at 160px is just a bigger absence, and these pages
   have a photograph, no biography, and no prospect of one soon.
3. **`imagePosition` on the `Speaker` type**, so the crop lives with the
   photograph rather than in a lookup somewhere else.
4. **`PLUM_WARM` / `PLUM_DEEP` exported** from `lib/hero.ts`.
5. **The header `children` colour** moved into `PageHeader`.
6. **`verify-page-header.mjs`** and the two `tools/assets/` converters.
7. **Zero-session wording in `speakerPageDefinition`**, so a share card
   does not say "0 sessions across the programme".

## Still open with the committee

Everything the previous sessions listed, minus the speaker photographs,
plus:

- **The speaker source photographs**, not the poster cards.
- **Eld. Ken Ochuka's photograph**, still absent.
- **Speaker biographies**, still absent for all eight.
- **Sessions for the four new speakers**, and the ministry tags they need.
- **Two names that disagree with their own artwork**: "Dr. Preskilla
  Munda" against the PDF's Priskillah, and "Janet Oyende Kariuki" against
  `janet-oyiende` — a different surname spelling and a third name.
- **Larger header sources** for the seven that are under 740px wide.

---

# Session 5 (2026-08-06) — the rotating hero, two new bands, and the precache

Six commits: `43a9fdf`, `5717ad7`, `ae4883d`, `00e2ace`, `2d99f11`,
`059c3f5`. Six rather than five, and the extra one is a fix reported from
looking at the built page — see "taji" below.

`npx tsc --noEmit`, `pnpm lint` and `pnpm build` all pass on `059c3f5`.

**This session measured narrowly on purpose.** Every new or changed surface
was measured once at 390 / 768 / 1440, and the eight bands nothing touched
were not re-swept. Both header harnesses gained `--routes` and `--widths`
for that: a full `verify-page-header` run is 140 page loads, and
re-measuring an unchanged band is not evidence, it is time.

## The precache overrun had three files in it

about, faq and family-life came off 6000x4000 sources and were written at
the full 1600x1067. **The band is never taller than 403px and is
full-bleed**, so at 1920 `cover` threw away 62% of that height before it
painted anything. Those three alone were 425 KB of a 576 KB precached
directory.

They are now **1600x620**, the window extracted from the full-resolution
source at the fraction of the height each page's own `position` already
named — so the subject is the one that page had already chosen, resampled
from 6000x4000 rather than cropped out of the 1600x1067 intermediate.

| file | before | after |
| --- | --- | --- |
| about.webp | 105,846 B / 103.4 KiB | **84,140 B / 82.2 KiB** |
| faq.webp | 122,740 B / 119.9 KiB | **98,964 B / 96.6 KiB** |
| family-life.webp | 206,840 B / 202.0 KiB | **134,662 B / 131.5 KiB** |
| `public/headers/` | 576.2 KiB | **461.3 KiB** |
| precache | 2764.87 KiB | **2649.96 KiB** |

`position` becomes `50% 50%` on all three and is still a live control, not
a no-op: at 1920 a 2.58:1 file in a 403px band leaves `cover` 54% of its
height to move within. **Serving those three outside the precache was the
alternative and is rejected** — it trades the offline programme, which is
the whole reason Phase 6 exists, against a problem caused by three
oversized files.

What it costs, stated rather than discovered: those three are 2.58:1 now
instead of 1.5:1, so on a phone `cover` crops their WIDTH harder — 44% at
390 where they kept 75%. Checked by rendering. /about's band is short
enough that it still keeps 73%.

`HEADER_IMAGE_SIZES` went 165vw to **240vw** on the phone branch. That
number was derived from the widest aspect then present; the re-cut files
are 2.58:1 and the tallest of their bands at 390 renders 921px, which is
236vw. Left at 165 the three files this session made shorter would also
have been served softer. It is a cap, so the eight unchanged files serve
exactly what they served before.

**Contrast, the three re-cut bands only, both schemes, 390/768/1440:**

| route | worst | string | at |
| --- | --- | --- | --- |
| /about | **6.24:1** | title | 1440 |
| /faq | 6.92:1 | title | 1440 |
| /ministries/family-life | 6.38:1 | meta | 390 |

Band heights identical to session 4's table at every width.

### True upscale, all eleven headers, corrected method

`SOURCES` as a constant, not `naturalWidth` — the README's note. File on
disk against the box `cover` has to fill:

| route | file | 390 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| **/livestream** | 555x260 | 0.70x | 1.38x | 1.85x | 2.59x | **3.46x** |
| **/prayer-requests** | 588x306 | 1.00x | 1.31x | 1.74x | 2.45x | **3.27x** |
| **/schedule** | 612x328 | 0.82x | 1.25x | 1.67x | 2.35x | **3.14x** |
| /ministries | 735x245 | 0.98x | 1.17x | 1.39x | 1.96x | 2.61x |
| /downloads | 736x404 | 0.67x | 1.04x | 1.39x | 1.96x | 2.61x |
| /ministries/health | 736x412 | 0.87x | 1.04x | 1.39x | 1.96x | 2.61x |
| /ministries/christian-education | 735x414 | 0.86x | 1.04x | 1.39x | 1.96x | 2.61x |
| /about | 1600x620 | 0.34x | 0.48x | 0.64x | 0.90x | 1.20x |
| /faq | 1600x620 | 0.56x | 0.65x | 0.65x | 0.90x | 1.20x |
| /ministries/family-life | 1600x620 | 0.54x | 0.56x | 0.64x | 0.90x | 1.20x |
| /contact | 1634x962 | 0.24x | 0.47x | 0.63x | 0.88x | **1.00x** |
| /speakers | 1492x865 | 0.27x | 0.51x | 0.68x | 0.97x | 1.29x |

**Three will read soft, and /livestream is the worst of them at 3.46x.**
Then /prayer-requests at 3.27x and /schedule at 3.14x. Those three files are
555, 588 and 612 pixels wide against a band that is 1920 CSS px and 3840
device px on a retina laptop. Nothing was upscaled to disguise it: an
upscaled file is the same softness at four times the bytes. **Larger
sources from the committee are the only fix**, and this is now the third
session asking.

Note what the resize did to the /about, /faq and /family-life rows: it did
not change their upscale at all. Those three were the sharpest bands on the
site before and still are, because the resize took height the band could
never use and left the width alone.

/contact reaches 1.00x at 1920 for a different reason: its band is now as
tall as the photograph, so the picture is served at its own size.

## The home hero rotates three photographs

hands-bible, then migori, then taji. **Background image and caption line
only.** The theme, the key verse, the theme song, the dates, the venue and
the call to action do not move and gained no new animation: that block is
the page's LCP element.

| file | px | KB | caption |
| --- | --- | --- | --- |
| hands-bible.webp | 735x616 | 35.9 | none |
| migori-choir.webp | 1600x885 | 160.1 | Camp Meeting 2026 Guest Choir · Migori Central |
| taji-choir.webp | 1491x1055 | 150.4 | Camp Meeting 2026 Guest Choir · Taji |

800ms of crossfade, 6000ms of dwell, interval the sum of the two — at 6000
the next fade would start 800ms before the current one finished and each
image would be still for 5.2 seconds rather than six.

**Both captions fit on one line at 390**, measured against their own line
box at 390/768/1440, so neither was shortened. The brief's fallback of
shortening the prefix was not needed.

**Taji is in neither the programme nor `event.ts`.** Neither is Migori
Central. `Draft_Program_v2`'s only choir credits are to "Choristers" and to
"both choirs", unnamed — the same staleness the four session-less speakers
come from. The captions are the artwork's words and nothing was invented to
reconcile them. **DATA-NOTES.md item 11 is new**, and the committee owes both
names as they should be printed and which items each choir is singing.

### The first image is load-bearing three times over

It is the only one with `priority`, the only one the server renders, and the
only one that exists under `prefers-reduced-motion`. `mounted` is false
during SSR and on the first client render, so the first paint is one image
and nothing else: no second request competing with the LCP. The other two
mount in an effect, which by definition runs after that paint.

A reader with no JavaScript, or one reading before hydration, gets exactly
the hero that shipped before this existed.

### Two things the measurements failed, both fixed rather than noted

**1. The caption row grew the text footprint and broke AA on two images.**
The row's height is reserved whether or not the photograph on screen has a
caption — otherwise the block would move by its own height every six
seconds — and that pushed the footprint up:

| phase=before | 390 | 768 | 1440 |
| --- | --- | --- | --- |
| was, 26rem scrim | 323 | 310 | 336px |
| now | 341 | 358 | **380px** |

380px against a 416px scrim is 91% of it, and the curve only holds 0.66 to
88%. Measured on the built page at 1440: **taji 3.78:1, a real AA failure**,
and migori 4.57:1. hands-bible passed at 6.50:1 only because its bottom two
deciles are unlit ground.

The scrim heights are derived from the footprint, so they moved with it:
**before 26rem to 28rem, compact 16rem to 19rem**, putting the footprint at
85% in both phases. 27rem would have put it at exactly 88.0%, and a floor
that lands on its own boundary fails the next time a string wraps.

**2. CLS 0.0002 from the pause control appearing at hydration.** It is
`shrink-0` in a flex row beside a `flex-1` caption, so its arrival narrowed
that box — a width change, which counts as a shift even though nothing
moved. `tools/perf/cls.mjs` named the row. The control now sits in a fixed
20px slot that exists whether or not there is a button in it, which also
makes the reduced-motion branch the same shape as the rotating one. **CLS
back to 0.0000, median and max.**

### Contrast, per image, per phase

Each image carries its **own pair of scrims**, so a picture that fails can
be deepened without darkening the two that did not. `verify-hero.mjs`
gained `--layer N`, which pins one layer with an injected `!important`
stylesheet — an inline write is undone on the next render of a six-second
interval, and a shot taken mid-crossfade is two photographs at partial
alpha and a number that describes neither.

phase=before, white against the brightest composited pixel in the text box:

| layer | 390 | 768 | 1440 |
| --- | --- | --- | --- |
| hands-bible | 5.91:1 | 6.12:1 | 6.61:1 |
| migori | 6.77:1 | 7.00:1 | 5.84:1 |
| taji | 6.65:1 | 6.54:1 | **5.78:1** (worst) |

phase=during (compact), same three widths: hands-bible 5.99 / 5.89 / 6.37,
migori 6.30 / 5.93 / 5.91, taji 6.09 / 6.37 / 6.22.

**All three pass at the derived floor, so `scrimBoost` is 0 on every one of
them.** The lever exists for the fourth photograph rather than being
invented then.

### LCP on /

| | median of 5, 1440x900 | element |
| --- | --- | --- |
| before | 288 ms | `span` (the theme) |
| after | **228 ms** | `span` (the theme) |

Same element, and 60ms faster rather than slower — which is what deferring
two images past first paint buys. CLS 0.0000, median and max.

### Rotation, the pause control, and reduced motion

`tools/perf/hero-rotation.mjs` is new and answers the three questions that
are not about pixels. Verified in a browser:

- **It rotates**: layers 0, 1 and 2 all seen over 16 seconds.
- **The pause control is one Tab from the call to action**, reached by
  keyboard rather than by `el.click()`, and its accessible name changes with
  its state. **Enter stopped it dead** — one layer over the next 16 seconds
  — and Enter again resumed it.
- **Under `prefers-reduced-motion`, emulated before the document runs: 1
  layer in the DOM, 0 pause controls, first image only over 16 seconds.**
  Asserted on the DOM, not on opacity: a slowed rotation would also look
  like three layers held at 0.

`reduced-motion.mjs` on /: **STATIC**, one distinct frame of eight, zero
running animations, zero stalled transforms.

### taji's crop, reported from looking at the page

The singers stand at the **top** of that frame — heads and microphones span
y 0.15 to 0.42, and the bottom third is a foreground rank of graduation
caps. In the compact phase at 1440 the frame is 2.67:1 against a 1.413:1
source, so `cover` keeps 53% of the height and a centred window is
y 0.235-0.765, **beginning below the singers' chins**. Every face was cut
across the forehead.

`object-position` is now per image, on the image, the way the header bands
already do it. `object-position: 50% P` puts the window at
`[P(1-k), P(1-k)+k]`, k being the fraction of the height `cover` keeps:

| image | position | why |
| --- | --- | --- |
| hands-bible | 50% 50% | unchanged, and its reason is unchanged |
| migori | 50% 50% | checked, not defaulted. k=0.68 compact, heads at y 0.245-0.41, well inside. It also drops the white hall ceiling, the brightest part of that file |
| taji | **50% 25%** | window y 0.118-0.648 compact, y 0.029-0.912 full-bleed. Every face complete, with headroom |

Rendered and looked at, not inferred. Contrast re-measured on both changed
layers afterwards: worst 5.78:1, no scrim moved.

### What the two new photographs cost

310.5 KB into `public/hero/`, all of it precached. q82 effort 6, matching
the bands. Measured and not kept: migori q86 192.8 / q90 241.3 KiB, taji
q86 179.9 / q90 223.6 KiB.

**The headers' argument for q82 does not hold here** and it is worth saying
so: their justification was that a 0.66 scrim covers every pixel, and the
hero's scrims are sized to the header and the text block with the middle of
the frame untouched. The argument that does hold is bytes on campground
signal, and q86 is +63 KiB across the two for a difference nobody has
demonstrated at this size.

`heroImageSizes` is derived per image now. A single 190vw was there from
when there was one image, and it described the frame's HEIGHT rather than
the rendered width — so it under-requested even for hands-bible, by 1.19x.
Below md the frame is 0.53:1 and `cover` scales by height, so the rendered
width is 190 x aspect: 227vw, 344vw, 269vw.

## /speakers takes the poster's statement

The first band that draws neither the eyebrow nor the h1:

    Main Speaker
    Pr. Kennedy Mfune
    Obey and Live            (larger, display face)
    Key text: Isaiah 1:19-20

ranged left over Pr. Kennedy Mfune's photograph, with **"Speakers" moved
below the band**, where the grid it names begins.

`PageHeader` took a `lockup` slot rather than /speakers getting a band of
its own. Everything else about that band is shared and load-bearing: the
photograph and its `sizes`, the two abutting scrims and their derived alpha,
`isolate` against the negative z-index, the muted fallback surface, and both
harness hooks. A /speakers-shaped copy would be a second band to keep in
step.

**"Obey and Live", not "Obey and Believe", and this is a discrepancy in the
brief rather than in the data.** The brief for this band gave the theme as
"OBEY AND BELIEVE". The poster and `eventInfo.theme` both say Obey and
Live, and both give the same key text — and Isaiah 1:19-20 is "If ye be
willing and obedient, ye shall eat the good of the land", which is the verse
Obey and Live is drawn from. So they are one theme and a misremembering of
it, and the data wins. **The committee still owes a written confirmation of
the theme, open since session 1.**

Nothing in the lockup is typed out. The theme and key text come from
`eventInfo`, the name from `speakerLabel` and the role from the speakers
list by id, so the band cannot drift from the hero or the share cards.

**The eyebrow is gone from the BAND, not from `speakersPage`.**
`pageMetadata` and the share card read `eyebrow` and `title` off that
object, and a preview that stopped saying "Speakers" to match a change to
the page is exactly the drift `page-identity.ts` exists to prevent.

### The extra padding is the photograph's, not the type's

Four display-size lines already made this the tallest band on the site at
276px against the standard 213px, and the type needed nothing more. The
picture did: the band is full-bleed, so at 1440 a 276px band keeps 33% of a
1.725:1 source's height, and **a head spanning 40% of that source cannot
survive a 33% window at any `object-position`** — it was cropped through the
forehead. `md:py-10` takes the band to 356px, which keeps 43%.

`position: 50% 16%`, derived and then rendered:

| width | k | window at P=0.16 | what it holds |
| --- | --- | --- | --- |
| 768 | 0.80 | 0.031 - 0.831 | everything |
| 1440 | 0.43 | 0.092 - 0.518 | the whole head, air above it |
| 1920 | 0.32 | 0.109 - 0.429 | crown to chin and no more |

**1920 remains the tight one and is stated rather than hidden.** At 50% the
1440 window was 0.287-0.713, starting at his eyebrows.

| | |
| --- | --- |
| contrast | **worst 9.34:1** (role, 390), four lines scored separately, both schemes, 390/768/1440 — the poster's ground is a dark plum |
| band height | 234px at 390, 356px from 768, identical across runs |
| CLS | 0.0000, median and max |
| align.mjs | 85 of 85 pass; /speakers reports `start` rather than failing a centring assertion it is deliberately outside of |

## /contact shows the church whole

**100% x 100% of the source at 390, 768 and 1440.** Nothing is cropped at
any width. Someone who has not been to 5th Ngong Avenue is looking at this
picture to recognise the building when they arrive, and the best a 213px
band could do was 28% of the height: roofline and sign, no building. So the
band grew to the photograph rather than the photograph shrinking to the
band.

| width | 390 | 768 | 1024 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| band height | 230px | 452px | 603px | 848px | **1130px** |

**That is three to five times every other band and it is intended.**
`object-contain` would have kept the standard height and is worse: empty
letterbox bars above and below a photograph read as a loading state.

### How the height is reserved

This is the one band whose height is not content-driven, so getting the
reservation wrong is a shift. The picture is still absolutely positioned and
`fill` and contributes nothing. What reserves the height is an in-flow
**spacer** carrying `aspect-ratio`, as a GRID SIBLING of the content rather
than a block above it, so the row is as tall as whichever of the two is
taller. Its `-my-(--space-band)` cancels the band's own padding for that
item, so the band's total height is the ratio rather than the ratio plus
8rem.

**Not `calc(100vw / ratio)`.** `100vw` includes the classic scrollbar, so on
a desktop showing one it overshoots by about 15px — and a box 9px taller
than the image's ratio makes `object-cover` scale up and crop the width,
quietly undoing the entire point of the change.

At a viewport narrow enough that the type is taller than the ratio's height,
the row grows to the type instead of clipping it, and the photograph crops
by that difference. That is the correct trade: unreadable type is a fault
and a 1% crop is not.

### One scrim, not two

The half-and-half pair is right on a 286px band, and the reason is at the
top of `page-header-art.ts`: there the type IS the middle, so a scrim sized
to the box it protects is a scrim over the whole band. **That argument is
exactly false on a 1130px band**, where the type is the top 190px and the
other 940px is the photograph the tall band exists to show. Scrimming all of
it would be paying a page of scrolling for a picture and then covering the
picture.

So `HEADER_SCRIM_WHOLE` is the HERO's top scrim: measured px stops, 0.72 at
the edge easing to the 0.66 floor, held to 190px — the band's 4rem padding
plus the eyebrow, its margin and a 48px title — then eased out by 320px.
Concave, for the reason the hero's is.

| | |
| --- | --- |
| contrast | **worst 5.74:1** (title, 1440), both schemes, 390/768/1440 |
| CLS | median **0.0000** over 7 runs; max 0.0004 in some runs |

**The 0.0004 is reported rather than filed as noise.** It is a size-only
change of the header element with **0px of travel**, which is subpixel
rounding on a fractional row height — 1440/1.6985 is 847.8px. /about
measured 0.0000 median and max in the same run, so it is specific to this
band and not the instrument. It is two orders of magnitude below the 0.1
"good" threshold and below the 0.0061 max session 3 recorded as CLS 0.0000.

## Two names, marked and not changed

> **Superseded.** Draft Program v3 and the speakers' own supplied
> biographies later settled both. The ids are now `preskilla-munda` and
> `janet-oyende-kariuki`, and the portrait files moved with them. What
> follows is the record of the pass that decided to leave them alone,
> which was the right call at the time and is why the evidence was still
> written down where the next person would find it. See DATA-NOTES.md.

No spelling changed. Both records carry the disagreement in full, at the
point where the next person would be tempted to fix it.

- **priskillah-munda**: the PDF's "Priskillah Munda" against the poster
  card's own caption "Dr. Preskilla Munda" and the supplied file
  `preskillamunda.jpg`. The PDF wins as a **tie-break, not a decision** —
  it is the signed source and the id is already in URLs, the share card and
  the sitemap. If the artwork turns out to be right, the id needs migrating
  with a redirect rather than editing.
- **janet-oyiende**: "Janet Oyiende" against the card's "Janet Oyende
  Kariuki" — a different surname spelling AND a third name, which are two
  separate questions. She is in no session in `program.ts`, so the PDF
  offers no second opinion on either.

Both marked as needing written confirmation before launch, cross-referenced
to DATA-NOTES.md item 8.

## Payload, against the ~400 KB line

| | change | precache |
| --- | --- | --- |
| session start | | 2764.87 KiB |
| after the three resizes | -114.9 KB | **2649.96 KiB** |
| + migori and taji | +310.5 KB | 2990.38 KiB |
| + speakers.webp | +35.0 KB | **3025.85 KiB** |

`public/headers/` finished at **496.3 KiB against the ~400 KB line, so it is
about 96 KB over.** Stating that plainly rather than declaring the item
closed:

- The resize recovered **115 KB of session 4's 176 KB overrun**, and then
  /speakers spent 35 KB of it back. Net against session 4: 576.2 to 496.3
  KiB.
- What is left of the overrun is two files: **family-life 131.5 KB and faq
  96.6 KB**, 228 KB between them against 268 KB for the other nine. Both are
  detailed photographs at 1600px and q82, and neither has slack in it that
  is not either width or quality.
- Getting under 400 KB from here means dropping the band height below 620px,
  which starts making `object-position` a no-op at 1920, or dropping quality
  below q82, which the site does not do anywhere. **Neither is worth doing
  without the committee weighing 96 KB against those two costs.**

The precache as a whole is 3025.85 KiB, and **`public/hero/church.webp` at
410.9 KB is now the largest single file on the site** — bigger than the
whole of `public/headers/` was after the resize. It was never re-encoded
because it predates the converters; it is 1634x962 and would come down
substantially at q82. Not touched this session because it was not asked for
and because /contact now depends on it at full width, where quality is
visible in a way it never was behind a crop and a scrim.

## Not asked for, done anyway

Called out so they can be reverted cleanly.

1. **`HEADER_IMAGE_SIZES` 165vw to 240vw.** Derived from the aspect ratios
   this session changed. It is a cap, so it cannot make an unchanged file
   worse.
2. **`heroImageSizes` derived per image.** The single 190vw described the
   frame's height rather than the rendered width and under-requested for
   every image, including the one that was already there.
3. **`HERO_SCRIM_BOTTOM_HEIGHT` raised in both phases.** Not optional: two
   images failed AA without it.
4. **`object-position` per hero image.** Reported from the built page; taji
   was cut across every face in the compact phase.
5. **`tools/assets/hero-photos.mjs`**, a third converter, checked in for the
   same reason the other two are.
6. **`tools/perf/hero-rotation.mjs`**, new. Nothing else could answer "does
   it stop when told, by keyboard".
7. **Four harness corrections and three narrowing flags.**
   - `verify-hero.mjs`: `--layer`, `--widths`; its scrim query scoped to the
     forced layer, because three aria-hidden layer wrappers now match the
     old unscoped query and it reported the frame height as a scrim height;
     `button` added to the hide list, or the pause control's white icon
     becomes the brightest "backdrop" pixel — the exact trap that file's own
     header documents.
   - `verify-page-header.mjs`: `--routes`, `--widths`; /speakers moved from
     the flat list to the photo list; `data-header-line` parts measured
     separately, since the old queries would have found one string on a band
     that carries four.
   - `align.mjs`: emulates reduced motion, because the bands below an 848px
     header are off screen at scroll 0 and their Reveal wrappers are still
     at opacity 0, so the hidden-content filter correctly refused to measure
     a page that is fine. It also reports `start` for a deliberately
     left-aligned band instead of failing a centring assertion — and a band
     that LOSES its centring without declaring it still fails.
8. **`data-header-align` on `PageHeader`**, which is that last hook.
9. **`#home-hero-text` moved off the RevealGroup onto a wrapper** holding
   the entrance and the caption row, so the footprint the harness measures
   is the block the scrim actually has to protect.
10. **DATA-NOTES.md item 11**, the two unnamed guest choirs.

## Still open with the committee

Everything sessions 1-4 listed, plus:

- **The two guest choirs' names as they should be printed**, and which
  programme items each is singing. Neither appears in `program.ts`.
- **The theme, in writing.** Now with a third variant in circulation:
  "Obey and Live" (the poster and `event.ts`), "The Good News in the Great
  Controversy" (the stale pastor's letter on the main site), and "Obey and
  Believe" (this session's brief).
- **Larger sources for /livestream, /prayer-requests and /schedule**, at
  3.46x, 3.27x and 3.14x. Third session of asking.
- **The two name spellings above.**
- **Whether 96 KB over the header budget is acceptable**, or whether
  family-life and faq should lose quality to close it.

---

# Session 6 (2026-08-06) — two re-encodes, /contact's heading, recordings, immersive bands

Measured narrowly, the way session 5 was: only surfaces this session changed
were measured, and the bands it did not touch were not re-swept.

## The two heavy headers are heavy because of their SUBJECT

faq and family-life were re-encoded at **q78**. Both are now smaller, and
the reason they were the two largest files is worth writing down because the
brief's hypothesis was reasonable and wrong.

**They were not written at a higher quality setting.** about, faq and
family-life are all 1600x620, all written by `tools/assets/header-photos.mjs`
in one run, all at q82 and effort 6 — and they came out at 82.2, 96.6 and
131.5 KiB. What differs is detail. about is a shallow-depth-of-field frame
whose outer thirds are bokeh, which WebP encodes almost for free. faq is
printed text edge to edge; family-life is skin, knitted cuffs and fabric
weave with no soft region anywhere in the frame. There was no setting to
correct, only detail, and detail costs bytes at any quality.

So the drop is made on the argument q82 already rested on rather than as a
bug fix: every pixel of these two is behind a scrim holding 0.66 alpha, and
q78 -> q82 on a scrimmed band is not a difference anyone can see.

| quality | 76 | **78** | 79 | 80 | 82 |
| --- | --- | --- | --- | --- | --- |
| faq.webp | 70.4 | **77.9** | 81.5 | 85.5 | 96.6 KiB |
| family-life.webp | 104.8 | **113.9** | 117.5 | 122.9 | 131.5 KiB |

78 rather than 80: it is the bottom of the range asked for, it still looks
identical under the scrim, and it recovers **36.3 KB against 80's 19.7 KB**.
76 was measured and not taken — outside the range, and faq's letterforms are
where ringing would first show.

| file | before | after |
| --- | --- | --- |
| faq.webp | 98,964 B / 96.6 KiB | **79,762 B / 77.9 KiB** |
| family-life.webp | 134,662 B / 131.5 KiB | **116,674 B / 113.9 KiB** |
| `public/headers/` (11 files) | 496.3 KiB | **460.0 KiB** |
| against the ~400 KB line | 96 KB over | **60 KB over** |

The other nine files were re-run through the converter in the same pass and
came out **byte-identical**, which is the check that the change is the two
entries and not the script.

### Confirmed by eye, and the number behind it

Both files were rendered at the window `cover` shows at 1920 (1600x403 out
of the 620), composited under the band's real two-part scrim, and looked at
side by side at q82 and q78. **No visible difference on either**, and none
in the raw crops at 100% either.

| | mean abs channel delta | max | channels off by more than 2 |
| --- | --- | --- | --- |
| faq, unscrimmed | 2.076 | 28 | 29.6% |
| faq, **under the scrim** | **0.489** | 10 | **2.4%** |
| family-life, unscrimmed | 2.388 | 28 | 33.5% |
| family-life, **under the scrim** | **0.564** | 10 | **4.3%** |

That is the scrim's whole argument in one table: q78 moves about a third of
the channels in the bare file, and the 0.66 alpha absorbs four fifths of it
before anything reaches the screen. Half a level out of 255 is below what a
display resolves.

**Still 60 KB over the line, and that is now width and detail rather than
slack.** Closing it needs either a band shorter than 620px, which starts
making `object-position` a no-op at 1920, or a quality the site does not use
anywhere. The committee's call, unchanged from session 5 except that the
number is smaller.

## /contact's band is the photograph alone

"Camp Meeting 2026" and "Contact" are gone from over the church. The band
already carries the building's own green NEWLIFE SDA CHURCH, NAIROBI sign
legible across the middle of it, and the nav item the reader just clicked
says Contact — so the two lines were the page naming itself twice on top of
a building that names itself a third time.

### The h1 stayed. It is `sr-only`, not deleted

Two options, and the other one was a visible "Contact" heading below the
band, which is what /speakers does. On /speakers that is right: "Speakers"
names the grid of speaker cards it sits directly above, so the word does
work on the page. **Nothing below this band is called Contact.** The first
thing under it is "Send a message", then "Get in touch", then "Give", each
already labelled with its own h2. A visible "Contact" above them would be
the nav item re-typed one band lower — the same redundancy, moved rather
than removed.

So the h1 is where it always was, inside the band, and it is not painted.
A visually hidden h1 is a real h1: it is in the accessibility tree, it is
heading level one for a screen reader's heading list and for `main`'s
outline, and it is indexed — a 1px clipped box is not `display: none` and is
not cloaking, since the same string is the metadata title and the visible
nav label.

**The metadata title is untouched**, and structurally so: `pageMetadata`
and the share card read `eyebrow` and `title` off `contactPage`, and this
change is to how `PageHeader` renders, not to that object. Same arrangement
as /speakers' lockup. A shared link and a search result still say Contact.

### No layout shift, and the band is now MORE stable than before

`sr-only` is `position: absolute`, so the heading is out of flow and the
band's height is the aspect-ratio spacer alone. It already was at every
width — the eyebrow and title together never reached the ratio's height —
so nothing moved:

| width | 390 | 768 | 1440 |
| --- | --- | --- | --- |
| band height, session 5 | 230px | 452px | 848px |
| band height, now | **230px** | **452px** | **848px** |

CLS on /contact, 5 runs at 1440x900: **0.0000 median and 0.0000 max.**
Session 5 recorded 0.0000 median with a 0.0004 max from the header element
resizing by a subpixel on a fractional row height. With no in-flow content
in that row there is nothing left to round.

**No contrast table for this band, and that is the reading.** It carries no
painted type, so there is nothing on it to score. `verify-page-header.mjs`
now reports it as a band with zero strings rather than measuring the 1x1
sr-only box and printing a number that describes one pixel behind an
invisible heading.

## /about drops its eyebrow

Asked for mid-session. The eyebrow on that band is the edition, "Camp
Meeting 2026", set small above a title that reads "About Camp Meeting" —
the same three words twice in one band, and the edition is already in the
header lockup on every page, in the footer, and in this page's own metadata
title.

`aboutPage.eyebrow` is **not** changed. `hideEyebrow` is a rendering flag on
`PageHeader`, the same shape as `lockup` and `imageOnly`, so `pageMetadata`
and the share card go on reading the same object — a card has room for a
line this band does not.

The title's `mt-3` goes with it. That margin is the gap under the eyebrow;
with nothing above the title but the band's own padding it is 12px the band
would grow by for nothing.

| width | 390 | 768 | 1440 |
| --- | --- | --- | --- |
| band height before | 208px | 213px | 213px |
| band height after | 176px | 181px | 181px |

**A content-driven band cannot lose a line of type and keep its height**,
which is the same thing session 4 recorded when the meta lines came off four
pages. It is moot two commits later: the immersive-band work below gives
every photographic band a reserved height that does not come from its type.

Contrast, title only, both schemes: **6.22:1 worst** (768), 6.45 at 390 and
6.27 at 1440. It went up rather than down — the title now sits where the
eyebrow was, higher in the band and deeper into the top scrim.

## Recordings on /livestream, curated by hand

`recordings` is a new array in `src/features/livestream/config.ts`:
`{ dayId, label, videoId }`, keyed to the day ids in `program.ts`. **It
ships empty**, with no example entries in it — one line per day gets pasted
in during the week.

**No YouTube Data API, and it is not a shortcut being taken.** For eight
videos a year it is a key to hold and rotate, a daily quota to stay under,
and a rebuild trigger so a statically generated site notices a video posted
after its last deploy — three moving parts to save eight lines of typing,
once, in a week that already has someone at a laptop.

### What the after phase renders

**Empty, which is what ships:** one sentence and the channel link.

> Camp Meeting 2026 has ended. Recordings are being posted to the church's
> YouTube channel, and each one is listed here as it goes up. Nothing has
> been published yet.
>
> Watch for them on YouTube

The wording is the part that had to change, not just the fallback. The old
line — "Recordings from the week are posted to the church's YouTube
channel" — describes a habit, so a reader arriving the day after the closing
Sabbath and finding nothing cannot tell "not yet" from "this page is
broken". It now names the state and the place, so an empty list is an
answer.

**With two present:** the count, then the rows, then the channel link
kept rather than replaced — the list is what somebody chose to publish,
the channel is everything the church has ever posted, and those are two
different offers.

> Camp Meeting 2026 has ended. 2 recordings from the week, most recent
> first.
>
> **Evening Service** · Sunday 16th August 2026 · See that day's programme
> **Divine Service** · Sabbath 15th August 2026 · See that day's programme
>
> See the whole channel on YouTube

Two links per row and two destinations on purpose. The video takes the
row's title; the programme day beside it is what the recording is OF, and
someone catching up on a Tuesday morning wants to know what else was in
that morning — a page that already exists and already works offline. The
day is also in the video link's accessible name, or a screen reader reading
the page's links out of context hears "Divine Service" eight times.

**During the event**, the same list renders under the live player as
"Earlier this week", and renders **nothing at all** when empty. That is a
different decision from the after phase deliberately: there the reader has
arrived expecting recordings and the page has to say something, while here
the player is directly above and is what they came for. An empty heading
under it would be a hole announcing that nobody has done the typing yet.

### The order is derived, not the array's

Sorted by the day's own position in `program`, reversed. **Verified by
pasting the two test entries oldest-first and getting them back
newest-first.** The workflow is "append one line", and if the array's order
were the rendered order then "newest first" would mean pasting at the top —
the one instruction someone typing at the end of a long day gets wrong, and
getting it wrong produces a quietly mis-ordered list rather than an error.
Two recordings of one day keep the order they were written in.

### An unknown dayId fails the build, and that is verified rather than claimed

Tested by mistyping one:

```
Error: Recording "Divine Service" has dayId "sabath-15", which is not a day
in src/data/program.ts. Valid ids: sabbath-15, sunday-16, monday-17,
tuesday-18, wednesday-19, thursday-20, friday-21, sabbath-22.
> Build error occurred
[Error: Failed to collect page data for /livestream]
```

The alternative is a "see that day's programme" link that 404s, from the
page whose whole job that week is catching people up. Same trade
`web3forms.ts` already makes: a loud failure at build time is cheaper than a
quiet one in front of readers.

The paste-one-line workflow is written up in **DEPLOY.md**, including the
four things it does not ask anyone to do by hand — order, the day's printed
name, the programme link and clearing the empty state.

## Immersive interior headers

Three changes, and the first is the one that mattered. Interior bands put
the photograph behind the type correctly, and still read as inserted
panels, because the picture began at a hard edge 80px down under a solid
white bar. The home hero never had that problem and the only reason was
the header.

### 1. The transparent header is no longer the home page's

`site-header.tsx` went from one hardcoded `OVERLAY_ROUTE = "/"` to
`hasPhotoHeader(pathname)`. Twelve routes now paint no surface, no rule and
no blur at scroll 0, and take the glass past 96px exactly as the home page
does. `/ministries/children`, `/announcements`, `/schedule/[day]`,
`/speakers/[id]`, `/offline` and `/styleguide` keep the solid header,
because there is nothing behind it to show through.

The predicate lives in `page-header-art.ts` and is derived from
`headerImages` with `satisfies Record<keyof typeof headerImages, string>`,
so **adding a photograph without saying which route it is on is a type
error**, not a page that quietly keeps a solid bar over its own picture. It
is there rather than in `page-identity.ts` because the header is a client
component and `page-identity` pulls the whole programme in with it.

The 96px threshold is unchanged and did not need to move: the shortest
band is 304px, so the header has its own surface long before the picture
runs out.

### 2. Full bleed, and a reserved height

`-mt-header` on the band, which is the line the hero has carried since
session 1, and `mt-header` on the content so the type is centred in the
part of the band a reader can see all of rather than on a point the header
covers. **A margin, not `pt-header`**: `band` sets `padding-block` and a
`padding-top` utility is the same specificity, so which won would be
settled by stylesheet order, the tie that once put every session time
where its title belonged.

    below md   19rem                304px
    md         min(26rem, 50svh)
    lg         min(30rem, 55svh)

Measured on the built page, and the `svh` cap is doing real work:

| viewport | 390x844 | 768x1024 | **1024x768** | 1440x900 | 1920x1080 |
| --- | --- | --- | --- | --- | --- |
| band | 304px | 416px | **422px** | 480px | 480px |
| content below the fold | 540px | 608px | **346px** | 420px | 600px |

**Why not a fraction of the viewport throughout.** 50svh on a 390x844
phone is 422px, half the screen given to a decorative band on the page
hardest to read on, so the base step is a flat rem and **304px is a
deliberate cut against the desktop number** - the brief's instruction, and
on a small screen reaching the content matters more than the photograph.
Why the cap on the two upper steps: 30rem is 62% of a 1024x768, which is
the full-viewport hero the brief rules out for a content page, and 55svh
takes it to 422px there.

**`min-height`, not `height`, and that is load-bearing.** /faq at 390
carries an eyebrow, a two-line title, a rule, a meta line and a paragraph
of children: 249px of type inside 96px of padding, more than 19rem holds.
A fixed height would eat the last line of its own subtitle. So the two
pages that need more take more. /faq is 425px at 390 and 483px above it,
and the ministry pages with a description run 413-437px.

### 3. Contrast, every changed surface, three widths, both schemes

**Site header, which is the surface that is new.** Transparent state
scored as white against the brightest composited pixel in the header's own
box, glass state as `--color-ink` against the darkest, with every
descendant hidden so the lockup is not scoring the nav.

| route | 390 trans / glass | 768 | 1440 |
| --- | --- | --- | --- |
| /schedule | 7.07 / 13.68 | 7.18 / 11.17 | 6.28 / 11.09 |
| /speakers | 7.60 / 12.10 | 8.08 / 10.98 | 8.79 / 11.09 |
| **/livestream** | **5.88** / 13.68 | 6.05 / 10.98 | **5.97** / 10.80 |
| /ministries | 7.76 / 13.68 | 7.76 / 11.23 | 8.55 / 10.98 |
| /about | 6.43 / 13.68 | 6.62 / 11.09 | 6.49 / 10.98 |
| /contact | 6.12 / 13.68 | 6.03 / 10.57 | 6.03 / 10.47 |
| /faq | 7.58 / 11.42 | 7.58 / 11.21 | 7.27 / 11.09 |
| /downloads | 6.18 / 13.68 | 6.08 / 11.20 | 6.20 / 10.98 |
| /prayer-requests | **5.92** / 13.68 | **5.89** / 11.18 | 6.03 / 10.98 |
| /ministries/health | 6.30 / 11.22 | 6.28 / 11.22 | 6.32 / 10.98 |
| /ministries/family-life | 7.34 / 11.54 | 7.16 / 11.54 | 6.50 / 10.98 |
| /ministries/christian-education | 10.55 / 11.56 | 9.69 / 11.45 | 6.43 / 10.94 |

Dark mode: transparent readings are identical (white type on a fixed scrim
is scheme-independent), glass is a flat 10.81:1 everywhere.
`/ministries/children` and `/announcements` correctly report **solid in
both columns**. They never go transparent.

**Worst on the site: 5.88:1**, /livestream transparent at 390. The floor
is 4.5. No scrim was deepened and no text moved.

**Band type, worst per route, across both schemes and 390/768/1440:**

| route | worst | string | at |
| --- | --- | --- | --- |
| **/livestream** | **5.57:1** | eyebrow | 390 |
| /ministries/health | 5.59:1 | title | 768 |
| /ministries/christian-education | 5.62:1 | meta | 390 |
| /schedule | 5.67:1 | eyebrow | 1440 |
| /ministries | 5.84:1 | meta | 390 |
| /downloads | 5.85:1 | title | 768 |
| /about | 6.23:1 | title | 390 |
| /prayer-requests | 6.39:1 | eyebrow | 390 |
| /ministries/family-life | 6.71:1 | meta | 390 |
| /faq | 6.91:1 | title | 1440 |
| /speakers | 10.19:1 | role | 390 |
| /contact | no readings | | the band carries no painted type |

All clear 4.5:1. The taller band moved these by hundredths, which is the
expected result: the scrim's alpha does not depend on the band's height.

### 4. What became visible, and three crops that had to move

At 1440 the crop keeps 57% to 100% of a source's height where it kept 25%
to 33%, and at 1920 43% to 75%. Rendered and looked at, per page, not
inferred:

| route | what the taller band recovered |
| --- | --- |
| /schedule | the fingertips. A 286px band cut them; the cupped hands are now whole, with the sun between them and sky above |
| /livestream | the lens whole, and the second bank of bokeh on the left of the frame |
| /ministries | **everything.** A 3:1 source in a 3:1 band at 1440, the one picture on the site the band no longer crops vertically at all |
| /ministries/health | the pineapple's crown above the heap and the table it stands on |
| /faq | the Psalm 23 spread from page edge to page edge, rather than one legible strip across the middle |
| /about, /ministries/family-life | 65% of the frame at 1920 against 32%; all four stacked hands and their cuffs |
| /downloads | the mug and the pencil tray beside the open book |
| /speakers | the collar and the bow tie, once the position was re-derived |

**Three positions were wrong at the new height and were changed.** In each
case the fault is the same shape: a taller window anchored at the same P
reaches further DOWN, so what the extra height bought landed below the
subject and the top of the subject sat on the frame edge.

| route | was | now | why |
| --- | --- | --- | --- |
| /speakers | 50% 16% | **50% 12%** | at 16% the 1440 window went from 0.092-0.518 to 0.069-0.639, so all the new height went onto his suit and the crown had no air above it. 8% was better at 1440 and cut the chin at 1920; 12% holds a complete head at both |
| /prayer-requests | 62% 50% | **62% 30%** | a centred 64% window is y 0.18-0.82 and cut the fingertips off, which are the subject of that frame. 30% puts it at 0.108-0.748 and the joined hands are whole |
| /ministries/christian-education | 50% 50% | **50% 60%** | 0.205-0.795 showed the whole alarm clock except the feet it stands on, so it floated on the bottom edge. 60% drops the window to 0.246-0.836 and it stands on its book |

All three are inert at 390 and effectively inert at 768, where the band
keeps 100% of the source's height. The nine `keeps` sentences were
rewritten against the new windows.

### 5. Upscale: the desktop numbers did not move at all

This is the finding worth keeping. **`cover` on these bands is
width-driven from 1024 up, in both the old shape and the new**, so the
scale is `viewport / file width` and the band's height does not enter it:

| route | file | 1024 | 1440 | 1920 | vs session 5 at 1920 |
| --- | --- | --- | --- | --- | --- |
| **/livestream** | 555x260 | 1.85x | 2.59x | **3.46x** | unchanged |
| **/prayer-requests** | 588x306 | 1.74x | 2.45x | **3.27x** | unchanged |
| **/schedule** | 612x328 | 1.67x | 2.35x | **3.14x** | unchanged |
| /ministries | 735x245 | 1.96x | 1.96x | 2.61x | unchanged |
| /downloads, /health, /christian-education | ~736x410 | 1.39x | 1.96x | 2.61x | unchanged |
| /speakers | 1492x865 | 0.69x | 0.97x | 1.29x | unchanged |
| /about, /faq, /family-life | 1600x620 | 0.77x | 0.90x | 1.20x | unchanged |
| /contact | 1634x962 | 0.63x | 0.88x | 1.18x | unchanged |

Where it did move is **390 and 768**, where the taller band becomes taller
in aspect than the source and `cover` starts scaling by height instead:

| route | 390 was | 390 now | 768 was | 768 now |
| --- | --- | --- | --- | --- |
| /ministries | 0.98x | **1.31x** | 1.17x | **1.70x** |
| /livestream | 0.70x | **1.17x** | 1.38x | **1.60x** |
| /prayer-requests | 1.00x | 1.26x | 1.31x | 1.36x |
| /schedule | 0.82x | 1.06x | 1.25x | 1.27x |
| /about | 0.34x | 0.49x | 0.48x | 0.67x |
| /faq | 0.56x | 0.69x | 0.65x | 0.78x |
| /ministries/family-life | 0.54x | 0.67x | 0.56x | 0.69x |
| /speakers | 0.27x | 0.36x | 0.51x | 0.51x |

**Nothing new crosses 2x below 1024, and the worst number on the site is
still 3.46x and still at 1920.** The taller band did not make the soft
files worse where they were already worst; it made three of them cross
1.0x on a phone, from a long way under it.

**The three that need larger sources are the same three, for the fourth
session running: /livestream at 3.46x, /prayer-requests at 3.27x,
/schedule at 3.14x.** 555, 588 and 612 pixels wide against a band that is
1920 CSS px and 3840 device px on a retina laptop. That is the list; it has
not changed and it is not going to be fixed by a converter setting.

### 6. No layout shift

**CLS 0.0000, median AND max**, five runs at 1440x900, on /about,
/contact, /faq, /livestream, /schedule, /speakers, /prayer-requests and
/ministries/health. The reserved height is a CSS `min-height`, so it is in
the first paint; the picture is still absolutely positioned and `fill` and
still contributes nothing; and `svh` is fixed at load, unlike `dvh`, so a
retracting browser chrome cannot resize a band mid-scroll.

`align.mjs`: **85 of 85 pass**, 0 off the grid, 0 header blocks not
centred.

Build, `npx tsc --noEmit` and `pnpm lint` all pass.

## The scrims come down 0.04, and it is the derivation that says how far

Asked for mid-session: the plum was too heavy over the photographs.

There was room, and it was room the code had already written down.
`SCRIM_ALPHA_FLOOR` was 0.66 with a note beside it saying that 0.66 was
"0.04 above the worse of the two inks" and that the margin was "bought
deliberately rather than saved". It has now been spent, in the other
direction.

**0.62 is the derived minimum for Grapevine plum, not a value picked by
eye.** Over a pure-white pixel, which is the worst case any of these
photographs can present:

| ink | alpha | white on it |
| --- | --- | --- |
| PLUM_DEEP `#291246` | 0.60 | 4.50:1, its own floor |
| PLUM_DEEP | **0.62** | **4.83:1** |
| PLUM_WARM `#461529` | **0.62** | **4.54:1**, its own floor |
| PLUM_WARM | 0.68 | 5.49:1, the band edges |

So this is the last step available without re-deriving that table. Every
stop came down by the same 0.04, so the **shape** of each gradient is
untouched and only its depth moved; the tail stops that ease to zero are
fade rather than protection and were left alone.

### One scrim kept its depth, and the measurement is why

The hero's TOP scrim went 0.66 to **0.65**, one step rather than four.
At 0.62 the home page's white lockup and nav measured **4.58:1 over the
migori photograph** — passing, and passing by 0.08, which is one rounding
step wide on the element that is on every page of the site. That is not a
margin, it is a coincidence.

It is also the cheapest scrim to keep: it is 176px tall and sits behind
the site header and nowhere else, so it is not what a reader means by too
much gradient on a photograph. The bottom scrim is 28rem of the frame and
it took the full change. 0.65 puts the header back to 5.08:1 and up.

### Measured after, everything, nothing failed

**Bands, worst per route, both schemes, 390/768/1440:**

| route | before | after |
| --- | --- | --- |
| **/livestream** | 5.57:1 | **4.91:1** |
| /ministries/health | 5.59:1 | 4.93:1 |
| /ministries/christian-education | 5.62:1 | 4.96:1 |
| /schedule | 5.67:1 | 5.00:1 |
| /ministries | 5.84:1 | 5.16:1 |
| /downloads | 5.85:1 | 5.21:1 |
| /about | 6.23:1 | 5.55:1 |
| /prayer-requests | 6.39:1 | 5.75:1 |
| /ministries/family-life | 6.71:1 | 6.01:1 |
| /faq | 6.91:1 | 6.18:1 |
| /speakers | 10.19:1 | 9.59:1 |

**Site header over the bands, transparent state, worst per route:**
5.19:1 (/livestream and /prayer-requests at 390) against 5.88:1 before.
Glass is unchanged at 10.47 to 13.68 in light and a flat 10.81 in dark:
the glass state has its own opaque surface and never sees the scrim.

**Home hero**, three photographs, both phases, 390/768/1440:

| | hero text | header transparent | header glass |
| --- | --- | --- | --- |
| hands-bible | 5.17 / 5.19 | 6.12 / 15.86 | 9.57 / 10.81 |
| migori | 5.09 / 5.15 | **5.08** / 5.11 | 9.78 / 10.81 |
| taji | **5.04** / 5.39 | 5.19 / 5.31 | 10.47 / 10.81 |

**Nothing on the site is below 4.91:1 and the floor is 4.5.** No page
needed deepening, so `scrimBoost` is still 0 on every hero image.

**CLS 0.0000, median and max**, on `/`, /about, /livestream and /contact.
A gradient's alpha cannot move layout and this confirms it did not.

### What it looks like

Rendered and looked at at 1440. /ministries/health is the clearest gain:
the produce reads in its own greens, oranges and reds instead of as a
plum-toned heap. /livestream's lens keeps the colour in its rings. The
band still reads as one deliberate ground rather than as a photograph with
a wash on it, which was the other half of what 0.66 was buying.

**This is a floor now, not a preference.** Anything lighter needs the
table above re-derived, and the answer it gives is that there is nothing
left: 0.62 is exactly what Grapevine needs for white type to reach 4.5:1.

## Session 6 gate

`npx tsc --noEmit`, `pnpm lint` and `pnpm build` all pass on `4f77c05`.
Lint reports one warning, `alpha` unused in `tools/perf/ab-interleave.mjs`,
which predates this session and is in a harness.

| | |
| --- | --- |
| `public/headers/` | 496.3 -> **460.0 KiB**, 60 KB over the ~400 KB line |
| precache | 3025.85 -> **2991.18 KiB** |
| worst contrast, band type | **4.91:1** (/livestream eyebrow, 390) |
| worst contrast, site header transparent | **5.08:1** (home hero over migori) |
| worst contrast, site header glass | 9.57:1 |
| worst contrast, hero text | 5.04:1 (taji, before phase) |
| CLS | **0.0000 median and max** on `/`, /about, /contact, /faq, /livestream, /schedule, /speakers, /prayer-requests, /ministries/health |
| align.mjs | 85 of 85 |
| worst upscale | **3.46x**, /livestream at 1920, unchanged for the fourth session |

## Not asked for, done anyway

Called out so they can be reverted cleanly.

1. **`verify-page-header.mjs` gained the site-header measurement**, both
   states, per route, per width, per scheme. Unavoidable: the gate asks for
   header contrast on eleven routes that did not have a transparent header
   before, and `verify-hero.mjs` is hardcoded to `/` and cannot be pointed
   elsewhere without gutting its hero geometry.
2. **`align.mjs` accepts `data-header-align="none"`.** An image-only band
   has no painted block to centre, and the offset computed from a 1x1
   clipped box reads as a 600px failure.
3. **`verify-page-header.mjs` drops parts under 4px in either dimension.**
   Without it /contact's `sr-only` h1 is scored against one pixel behind an
   invisible heading, which is a number describing nothing.
4. **A `quality` field on `tools/assets/header-photos.mjs`**, and a `q`
   column in the table it prints, so a per-file quality is visible rather
   than being a thing someone did once by hand.
5. **Nine `keeps` sentences rewritten.** They document what survives the
   crop at 1920 and most of them said "loses X" about something the taller
   band now keeps.
6. **`imageOnly` and `hideEyebrow` on `PageHeader`.** Rendering flags, not
   changes to `contactPage` or `aboutPage` — `pageMetadata` and the share
   cards read the same objects, the same arrangement `lockup` already uses.
7. **`hasPhotoHeader` and the `HEADER_ROUTES` map**, with the `satisfies`
   check that makes a new photograph without a route a type error.
8. **The hero's top scrim held at 0.65** while everything else went to
   0.62. Measured rather than chosen; the reason is above.

Two of the changes in this session were asked for mid-session rather than
in the brief, and are marked as such where they appear: **/about's
eyebrow** and **the scrim alphas**.

## Still open with the committee

Everything sessions 1-5 listed. Two items moved:

- **The header budget is now 60 KB over rather than 96 KB**, and what is
  left is width and detail rather than slack. Closing it needs a band
  shorter than 620px, which starts making `object-position` a no-op at
  1920, or a quality below 78, which is now below what the site uses
  anywhere. Still the committee's call.
- **Larger sources for /livestream, /prayer-requests and /schedule**, at
  3.46x, 3.27x and 3.14x. Fourth session of asking, and the taller bands
  did not change those numbers by a hundredth: `cover` is width-driven at
  1920 whatever the band's height, so this is the file and nothing else.

New:

- **The recordings for /livestream**, one line per meeting during the
  week. Not a question, a task, and DEPLOY.md is written for whoever does
  it.
- **Whether /contact should keep a visible "Contact" heading somewhere.**
  It has an `sr-only` h1 and the reasoning is in the page, but it is the
  one page on the site with no visible h1 and that is worth someone
  agreeing to rather than discovering.

## The compact hero on a phone (2026-08-15)

The first day of the event, and the first time the `during` phase had ever
been rendered on a phone in production. The site had spent its whole life
in `before`, which passes at every phone width, so nothing here had been
seen before it was live.

Two defects, both below `md`, both in `during` and `after`, neither
present on any desktop width.

**1. The text block was taller than its own band, and was clipped.** The
compact band is `55svh`, which is 312px at 320x568 and 352px at 360x640.
The compact text block is 340px at those widths, because two things happen
that never happen on a desktop: the call-to-action pair stops fitting on
one line and stacks (+60px, and it must stack — 48px tap targets), and the
verse row wraps (+28px). The section is `justify-end` with
`overflow-hidden`, so the overflow went off the TOP: at 320x568 the block
started 60px above the band, and "Camp Meeting 2026" and the top half of
"Obey and Live" were cut off. What survived collided with the header.

**2. White type sat on unprotected photograph.** `HERO_SCRIM_BOTTOM_HEIGHT.compact`
was 19rem (304px), derived only from the 258px footprint at 1440. Against
the phone footprints that is 96% at 390 and 414 and 122% at 320 and 360, so
the top of the type was in the 92-100% band of the gradient, where the
alpha is on its way to zero by design, or above the scrim entirely.

Measured on the deployed page, phase forced, against the brightest
composited pixel under the type:

| layer | 390x844 | 414x896 | 1440x900 |
| --- | --- | --- | --- |
| hands-bible | 4.47:1 FAIL | — | 5.33:1 |
| migori-choir | **1.98:1 FAIL** | 2.03:1 FAIL | 5.37:1 |
| taji-choir | 2.91:1 FAIL | — | 4.98:1 |

This is the same class of failure the `before` phase had when the caption
row grew the block, and it came back for the same reason: the new value was
re-derived at one width.

**The fix, both halves measured rather than chosen.**

- A floor under the compact band below `md`: `min-h-[29rem]` (464px) —
  340px of block, 32px of `pb-8`, and 92px left above, which clears the
  80px header. It is also exactly `55svh` at 390x844, so no phone that was
  already correct moves; the floor only bites below about 375px wide.
- A phone value for the compact scrim: 28rem below `md`, the same the
  full-bleed phase takes, because with the floor above the worst phone
  footprint is 372px and 372 against 448 is 83%, inside the held section of
  the curve. `md` and up is untouched at 19rem.

After, every width passes at every layer, worst 4.94:1 (768, unchanged and
pre-existing):

| layer | 320 | 360 | 390 | 414 | 768 | 1440 |
| --- | --- | --- | --- | --- | --- | --- |
| hands-bible | 5.61 | 5.57 | 5.55 | 5.17 | 5.55 | 5.33 |
| migori-choir | 5.32 | 5.36 | 5.44 | 5.44 | 5.15 | 5.37 |
| taji-choir | 5.01 | 5.04 | 4.97 | 5.21 | 4.94 | 4.98 |

`before` is unchanged at every width, and CLS is 0.0000 at 320x568,
360x640, 390x844 and 1440x900. Both values are CSS resolved against the
phase attribute before first paint, so neither adds anything to the shift.

## Still open with the committee

- **The hero text collides with the header at 320x568 in the `before`
  phase.** The block is 438px in a 500px band, so it starts 22px down and
  runs under an 80px header. Not fixed here: `before` is in the past for
  2026 and cannot render again this year, and the fix is a design decision
  about what the narrowest phone drops. It will matter again in 2027.

---

# The compact hero band is withdrawn (2026-08-15)

## A deliberate reversal, not a fix

The section above this one derived a compact hero for the two event
phases: a shorter band (55svh below `md` with a 29rem floor, 60svh above),
a shorter bottom scrim to match (28rem below `md`, 19rem above), and
smaller type inside it. The whole point of that band was **fold space** —
keeping the live session card visible under the hero during the week the
card actually means something.

That trade has been reversed on request. The hero is now the full band in
all three phases, so the photograph is shown whole all week. The cost is
exactly what the compact band bought: on a 568px phone the live card now
sits about 150px lower than it did, and on a laptop the section below the
hero starts a screen further down. That is understood and accepted — the
photograph earns the space.

## What that removed

Three things went, none of them replaced:

- `COMPACT_HERO_HEIGHT` in `hero.tsx` — the whole phase-dependent height
  override, including the 29rem phone floor that had been added a few
  hours earlier to stop the compact band clipping its own text.
- `COMPACT_SCRIM_HEIGHT` in `hero-rotation.tsx`, and the two CSS variables
  it read (`--scrim-h-compact`, `--scrim-h-compact-md`).
- The `compact` / `compactMd` keys on `HERO_SCRIM_BOTTOM_HEIGHT`, which is
  now a single string. One band height means one footprint to protect and
  one scrim, and 28rem is the value already derived for it.

The compact **type** stays: `during` and `after` keep the smaller theme,
verse and meta line and the tighter spacing. It is kept deliberately.
It is the denser setting the hero wants once the countdown is no longer
the point, and it makes the block shorter than the `before` block the
28rem scrim was measured against — so those two phases sit further inside
the held part of the scrim curve, not closer to its edge. It is also what
keeps `data-hero-phase` meaningful, and therefore keeps the pre-paint
phase script and its client-side sync from becoming dead code.

## The narrow-phone clipping this fixes outright

The compact band clipped its own text at 320x568 before the 29rem floor
was added. With the band tall in every phase there is nothing to clip.
Measured on the built site, phase driven by the attribute directly:

| viewport | phase | band | block | top of type | verdict |
| --- | --- | --- | --- | --- | --- |
| 320x568 | before | 500 | 438 | 22px | tight, under the 80px header |
| 320x568 | during | 500 | 340 | 128px | ok |
| 320x568 | after | 500 | 340 | 128px | ok |
| 360x640 | before | 563 | 393 | 130px | ok |
| 360x640 | during | 563 | 340 | 191px | ok |
| 360x640 | after | 563 | 340 | 191px | ok |
| 390x844 | before | 743 | 333 | 370px | ok |
| 390x844 | during | 743 | 260 | 451px | ok |
| 390x844 | after | 743 | 260 | 451px | ok |

No clipping at any width in any phase, and no horizontal overflow. The one
tight row is `before` at 320x568, which is the open item already recorded
above and is unchanged by this pass.

## Contrast, three layers x three phases x ten widths

`verify-hero.mjs`, both schemes, widths 320 / 360 / 390 / 414 / 430 / 560
/ 640 / 768 / 1024 / 1440. Worst reading in each run:

| layer | phase | hero text | caption |
| --- | --- | --- | --- |
| hands-bible | before | **1.76** | none |
| hands-bible | during | 5.23 | none |
| hands-bible | after | 5.23 | none |
| migori-choir | before | 5.50 | 9.41 |
| migori-choir | during | 5.81 | 13.65 |
| migori-choir | after | 5.81 | 13.65 |
| taji-choir | before | **1.42** | 10.81 |
| taji-choir | during | 5.20 | 9.78 |
| taji-choir | after | 5.20 | 9.78 |

**`during` and `after` pass everywhere** — every layer, every caption,
every width, both schemes. Worst text 5.20:1, worst caption 9.78:1. Both
captions ("Newlife Migori Adventist Church Choir" and "Taji Kenya") clear
the floor with a wide margin in every phase.

## The `before` failure is pre-existing and was measured, not assumed

`before` fails at 320 and 360 on hands-bible and taji-choir. It would be
easy to read that as this change's doing, so it was checked against the
previous deploy rather than reasoned about: the same script pointed at
production, which was still running the old code, returned **1.76:1 at 320
and 2.80:1 at 360, with the same 478px and 433px footprints against the
same 448px scrim**. Identical numbers. Nothing in the `before` phase moved
in this pass — its band is still `h-[88svh] md:h-svh` and its scrim is
still 28rem — and the measurement confirms it.

The cause is the same one already open above: below about 375px the block
grows to 478px, past the 448px scrim, so the top of the type sits on
unprotected photograph. It is not fixed here for the same reason it was
not fixed there — `before` is in the past for 2026 and cannot render again
this year — but it now has numbers attached rather than only a collision
description, and it will matter in 2027.

## CLS

0.0000 median and worst over five cold runs at 1900x1000 and 390x844, no
layout shifts recorded. Unchanged. Both the band height and the scrim
height are CSS resolved against the phase attribute before first paint, so
neither can contribute a shift.

## Still open with the committee

- **The `before` phase fails AA below 375px**, on hands-bible (1.76:1 at
  320, 2.80:1 at 360) and taji-choir (1.42:1 at 320, 2.33:1 at 360). The
  block is 478px against a 448px scrim. Pre-existing and measured against
  the previous deploy; unreachable in 2026, live again in 2027. The fix is
  a design decision about what the narrowest phone drops, or a taller
  scrim in `before` only. This supersedes the collision note above, which
  is the same defect described geometrically.

## The compact type goes too (2026-08-15)

The band was restored to full height earlier today; the type has now
followed it. `COMPACT_BOTTOM_PADDING`, `COMPACT_STACK_GAP`,
`COMPACT_THEME`, `COMPACT_VERSE`, `COMPACT_META` and `COMPACT_CTA_OFFSET`
are all gone, so "Camp Meeting 2026", "Obey and Live", the key text, the
theme song, the dates and both buttons render at full size in every phase.

There is one hero now. `before`, `during` and `after` are pixel-identical,
which is why the sweep below measures one phase: the block footprint is
the same number at every width in all three.

**The narrow scrim had to widen with it.** The 36rem below-390px scrim was
scoped to `before` when it landed, correctly, because the compact type
made the `during` block 372px and the 448px default still covered that.
With full-size type every phase renders the 478px block below 390, so the
phase scope was removed. Left in place it would have failed `during` at
320 and 360 in exactly the way `before` was failing.

Contrast, three layers x ten widths x both schemes, phase `during`
(therefore all three): every cell clears 4.5:1. Worst per layer —
hands-bible 5.23:1, migori-choir 5.50:1 (caption 9.41:1), taji-choir
4.87:1 (caption 10.81:1). The worst cell is taji at 390, a width nothing
in this pass touches.

### What it costs at 320x568

| viewport | band | block | top of type |
| --- | --- | --- | --- |
| 320x568 | 500 | 438 | 22px |
| 360x640 | 563 | 393 | 130px |
| 390x844 | 743 | 333 | 370px |

Nothing is clipped at any width — the block never starts above the band.
But at 320x568 it starts 22px down and so runs under the 80px header, in
**all three phases now** rather than only in `before`. That is the open
item recorded above, and restoring full-size type has widened it from a
phase nobody will see again this year to one that is live all week. It is
a legibility problem at the very narrowest phone, not a contrast one:
320 passes AA at 6.87:1 and 6.20:1 on the two photographs that carry type
there.
