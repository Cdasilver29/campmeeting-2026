# Measurement harnesses

Four standalone scripts used for the visual pass. They are not part of the
build and nothing in `src/` imports them.

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
    node <path-to-repo>/tools/perf/layout-cost.mjs

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
| `hero-contrast.mjs` | hero scrim contrast against a standalone mock, for iterating on gradient stops. |
| `verify-hero.mjs` | the same measurement against the real built page at six widths, plus object-cover upscale factors. Use this one to confirm. |

Both contrast scripts hide the type with `visibility: hidden` before
screenshotting, keeping its layout box, and then report the **brightest**
pixel in that box as a ratio against white. Filtering "near-white" pixels
out of a shot that still contains white text also filters out the blown
highlights that are the entire hazard, which is how an early version of
this returned a passing number for a hero that failed.
