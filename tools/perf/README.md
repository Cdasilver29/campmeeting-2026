# Measurement harnesses

Nine standalone scripts used for the visual pass. They are not part of the
build and nothing in `src/` imports them.

`tools/assets/` is a different kind of thing and lives next door: two
converters that write `public/speakers/` and `public/headers/` from the
committee's supplied artwork. They are checked in for the same reason
these are — the crops and the `object-position` values in them are
decisions, and a decision that lives only in a shell history is one the
next person has to re-make by eye.

**Every one of these has, at some point, returned a confident wrong
number.** Four separate instances are documented below and in
`VISUAL-PASS.md`. Before quoting a reading that looks too good or too bad,
check what the script actually measured — most of them now print it.

## Why these exist rather than Lighthouse

Lighthouse cannot resolve a 50ms difference on this machine. Measured
2026-07-29 on `/schedule`, identical code, five runs:

    TBT median 11,266 ms   range 10,438 - 13,252

A 2,800 ms spread on an unchanged page. The cause is background load: 8
logical CPUs sitting at ~70% with 32 Chrome processes, 11 VS Code
processes and 1.8 GB free of 7.85 GB, which Lighthouse's 4x CPU throttle
then multiplies. See the `lighthouse-noise-on-this-box` note.

`layout-cost.mjs` is the instrument to trust. It forces a full style
recalc and layout of the rendered programme hundreds of times in one page
and takes the median, which is stable to a few percent and is exactly the
quantity a styling pass can move. It is also what `content-visibility:
auto` is supposed to change, since skipping offscreen subtrees removes
them from this work.

## Setup

`puppeteer-core` is deliberately not a project dependency. Install it in a
throwaway directory and run the scripts from there:

    mkdir /tmp/perf && cd /tmp/perf
    pnpm add puppeteer-core@24.12.1
    cp <path-to-repo>/tools/perf/layout-cost.mjs .
    node layout-cost.mjs

**Copy the script in; do not run it in place.** ESM resolves a bare
import from the SCRIPT's directory, not the working directory, so
`node <path-to-repo>/tools/perf/foo.mjs` from the throwaway directory
fails with ERR_MODULE_NOT_FOUND however the shell's cwd is set. This
paragraph exists because the instruction above used to say otherwise.

Chrome is found at `C:\Program Files\Google\Chrome\Application\chrome.exe`
(150.0.7871.187 when these were written). Serve the site first with
`pnpm build && pnpm start --port 3100`; every script defaults to that port.

All of them block `/serwist/` and `sw.js`. Left alone the service worker
starts precaching the whole site on load, and under a CPU throttle that
work lands inside the trace window and swamps the page's own cost by an
order of magnitude. It also means these numbers say nothing about the
offline behaviour.

## The scripts

| script | what it measures |
| --- | --- |
| `layout-cost.mjs` | forced style+layout of the full programme, median of N reflows across M pages. The primary instrument. |
| `measure.mjs` | CDP trace: long-task total, style recalc, layout, paint, CLS, element count, at a fixed CPU throttle. |
| `hero-contrast.mjs` | hero scrim contrast against a standalone mock, for iterating on gradient stops without a rebuild. |
| `verify-hero.mjs` | the same measurement against the real built page at six widths, both header states and either hero phase, plus upscale factors. Use this one to confirm. |
| `verify-page-header.mjs` | the eleven interior header bands that carry a photograph, plus three that do not. Eyebrow, title and meta scored **separately** against the brightest composited pixel inside each of their own boxes, five widths, both colour schemes. Also prints band height, how far the file on disk is stretched, and what fraction of the source each crop keeps. |
| `crop-sweep.mjs` | brightest **raw** photographic pixel behind the text block, per `object-position`. Answers "would a different crop let the scrim be lighter" before any scrim is designed. |
| `align.mjs` | the x position of the header lockup against the x position of the **first left-aligned content below the page-header band**, at five widths on seventeen routes, plus the content column's width and gutter. Also checks that the header block is centred inside its own shell. Fails if either disagrees. It used to measure the `h1`; see the note below. |
| `responsive.mjs` | nine widths x seventeen routes: horizontal overflow with the offending elements named, clipped text, tap targets under 44px, and whether the day rail is scrollable. |
| `reduced-motion.mjs` | emulates the preference before the document runs, byte-compares eight frames per route, and reports where they differ. Also checks `.live-pulse` directly, since the live dot only renders during the event. |
| `card-contrast.mjs` | every text pair on the home page's three clock-driven cards — Happening now, Next up, On duty — plus the host cards, a host letter, /children and /gallery, in both themes, against the floor each pair's own size and weight requires. Stubs the clock to a mid-camp-meeting Tuesday morning, which is the only phase where all three cards are on the page at once. |

`contrast.mjs` and `card-contrast.mjs` answer different questions and both
are needed. The first checks the PALETTE: every ratio asserted in a
comment in `globals.css`, computed from the hexes, no browser involved.
The second checks what a reader actually sees on those cards, which is
composited — the live card's ground is `primary` at 6% over the band, the
"On now" pill is `accent-50` under a 25%-alpha ring — and only the browser
knows what those resolve to.

**It composites by painting on a 1x1 canvas rather than by parsing
`getComputedStyle`.** That is the fifth instance of the confident wrong
number this README opens with: the first version parsed colours with a
number regex, and Tailwind emits an alpha like `ink-muted/70` as
`color-mix(in oklab, ...)`, which Chrome resolves to `oklab(...)`. Pulling
four numbers out of that reported the time range's separator dash at
1.11:1 in dark mode, for a dash that is plainly visible. Painted properly
it is 5.72:1 there and was 3.13:1 in LIGHT mode, which was a real failure
and is fixed.

**It SKIPS type over a photograph rather than scoring it**, and reports
what it skipped. It composites background-colour only, so a page-header
band's picture is invisible to it and it would score the band's fallback
surface — which on /children produced four failures at 1.07:1, white type
on #f8f7fa, for four lines that are actually over a scrimmed photograph.
`verify-page-header.mjs` is the tool for those; it scores each line
against the brightest composited pixel inside that line's own box.

The skip test is deliberately narrow, and took two goes. "Any ancestor
with an `<img>` child" skipped every host card on /speakers, where the
text sits beside the portrait rather than over it. "Any `<img>` in the
band" then skipped the host letter pages, whose band has no backdrop —
its picture is the portrait in the media slot. The test is now a
negative computed z-index, which is what only the backdrop has.

## Why `align.mjs` stopped measuring the `h1`

`PageHeader` became a full-bleed band whose contents are centred, so on
the thirteen routes that carry one the `h1` is deliberately not on the
left edge. Left as written the harness reported **65 failures for a
layout doing exactly what it was asked to do**, which is worse than no
harness: the next person to run it un-fixes the thing it complains about.

The grid check moved down one element, to the first left-aligned content
below the band, which is where left-aligned reading actually resumes. A
second assertion replaces the one that was lost: the header block's
midpoint against its shell's midpoint, so the band's own intent is
checked rather than merely exempted.

Three things had to be right before the new version was worth reading,
and all three produced confident wrong answers first:

- **`main header` is not the page header.** `/offline` hand-rolls a
  `<header>` inside a plain `Band` and `/styleguide` has one too, so
  shape-sniffing scored both as uncentred page headers. `PageHeader` now
  carries `data-page-header` and the harness selects on that.
- **The honeypot escaped the hidden filter.** The spam trap is a 1x1
  clipped wrapper at `left: -9999px` holding a full-size input. The input
  is statically positioned, so an element-only check saw a 215px-wide
  field and reported `/prayer-requests` as aligning at **x = -9999**.
  Ancestors are now walked, not just the element.
- **Centred content is not misaligned content.** `/downloads` and
  `/announcements` both open with an `EmptyState`, which is `text-center`
  by design, and measuring its paragraph reported a 120px offset on ten
  combinations. Centred elements are skipped, and a page with no
  left-aligned body content at all is reported as that rather than failed.

## Three false positives `responsive.mjs` filters, and why each had to be

Without these the report is 126 rows of noise and the real findings are
invisible inside it.

**`sr-only` subtrees.** Screen-reader-only text is a 1x1 clipped box
holding a full sentence, by construction, so it reports as "clipped by
346px" and as a 1x1 tap target on every page. Detected by the clip and by
walking ancestors, not by class name, so a hand-rolled visually-hidden
helper is caught too.

**The spam honeypot.** Deliberately parked at `left: -9999px` inside an
`aria-hidden` wrapper, and reported as a 215x24 tap target on every form
on the site.

**Pseudo-element hit areas.** A 32px control with
`before:absolute before:-inset-1.5` is a 44px target;
`getBoundingClientRect` reports 32 and knows nothing about the
pseudo-element. Reporting that as a failure sends you off to inflate a
control that is already correct — which is the worse outcome, because the
instrument then drives the design. The negative insets of `::before` and
`::after` are read and added back. Radios and checkboxes are measured
against their wrapping `<label>` for the same reason: the label is the
target and the 16px box is only the part that gets drawn.

## The overflow a rect-based check cannot see

An element whose own box fits but whose *content* does not, with overflow
visible — an unbreakable 365px token inside a 320px paragraph — pushes the
document out while every rect on the page stays inside the viewport. That
reported as `OVERFLOW +25px []`, an overflow with no offender, which is
the sort of output that gets written off as instrument noise. It was a
real horizontal scrollbar on `/faq` at 360. There is now a fallback pass
over leaf elements whose `scrollWidth` exceeds their `clientWidth`.

Both contrast scripts hide the type with `visibility: hidden` before
screenshotting, keeping its layout box, and then report the **brightest**
pixel in that box as a ratio against white. Filtering "near-white" pixels
out of a shot that still contains white text also filters out the blown
highlights that are the entire hazard, which is how an early version of
this returned a passing number for a hero that failed.

## Two traps in the hiding step, both of which produced wrong numbers

**`transition-all` defeats `visibility: hidden`.** `visibility` is a
transitionable property, so an element carrying `transition-all` — which
is every shadcn `Button`, including the theme toggle in the header —
stays visible for the full 150ms and flips at the end. Screenshotting
immediately after the hide caught the toggle's white icon and reported it
as the brightest backdrop pixel: 1.00:1, in both header states, on a
header that actually measures 5.05:1 and 10.31:1. `verify-hero.mjs` now
injects `transition: none !important` before hiding anything and waits two
frames.

**A tag list is not a subtree.** Hiding `a, button, span` leaves the
`<svg>` inside a button visible if the button itself was missed. Hide
every descendant.

**A `:scope >` query is not a subtree either.** `verify-hero.mjs` found
the scrims with `hero.querySelectorAll(":scope > div[aria-hidden]")`. When
the scrims moved one level down into the frame element it returned `[]`
and reported the scrim heights as empty rather than failing.

## Measure against the colour the type actually is

Not against white, and not against black, but against whichever the
element's own computed `color` resolves to at that width — then take the
extreme that can hurt it: the brightest backdrop pixel for light type, the
darkest for dark type.

This bit twice. First on the header, where the glass state's type is
`--color-ink` and measuring white against it scored a colour that is never
used there. Then on the hero text, which below `md` is now ink on the page
surface rather than white over the photograph: hardcoding white would have
returned **1.00:1 for a 390px hero that measures 16.56:1 and is fine**.
Both scripts now read `getComputedStyle(el).color` and branch on it.

## `naturalWidth` is not the width of the file

`verify-page-header.mjs` reported /schedule's source as 525px wide. The
file is 612px. On an image chosen from a `w`-descriptor srcset,
`naturalWidth` is the **density-corrected** intrinsic width — the served
variant divided by the ratio between its descriptor and the CSS slot
`sizes` declares — so it moves when `sizes` moves and it is smaller than
the file. Every upscale in that column was understated by about 15%, in
the direction that makes a soft picture look sharper than it is.

Both header harnesses now carry the source dimensions as a constant and
compute the stretch from the rendered box, the way `verify-hero.mjs`
already did with its `SOURCE`.

## Scope an animation assertion to the element

`reduced-motion.mjs`'s check on `.live-pulse` first asserted on
`document.getAnimations()`, which returns every animation on the page at
that instant. It reported "4 running" for an element that is
`display: none` and therefore cannot have any, and failed a rule that
works. `el.getAnimations()` is the question that was being asked.

## Measuring the header against the right colour

The header's type is white over the photograph and `--color-ink` once it
takes its own glass surface. So the transparent state is measured as white
against the **brightest** backdrop pixel, and the glass state as ink
against the **darkest** one. Running white against both would be scoring a
colour that is never used there, and would fail a header that is fine.
