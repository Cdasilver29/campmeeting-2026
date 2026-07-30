# Visual design pass — progress and handoff

Sessions of 2026-07-29 and 2026-07-30. Art direction and typographic
hierarchy, then the layout system underneath it. **All chunks are done and
pushed.**

Session 3 is the layout system, responsiveness and interaction pass and is
written up at the bottom of this file, after the two art-direction
sessions. If you are only reading one part, read that one: it contains the
width system every page now depends on.

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
