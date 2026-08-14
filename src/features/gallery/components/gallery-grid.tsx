"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/data";

/**
 * ── THE GALLERY, AND ITS VIEWER ──────────────────────────────────────
 *
 * A masonry grid of thumbnails; tapping one opens it full size in a
 * dialog you can page through and dismiss.
 *
 * ── WHY THIS IS A CLIENT COMPONENT AND THE PAGE IS NOT ───────────────
 *
 * Only the viewer needs JavaScript. The grid is server-rendered inside
 * this component and the dialog is `null` until something is opened, so
 * the page still ships its 31 images as plain markup: it renders,
 * scrolls and reads with JavaScript off, and the pictures are the point.
 * The interaction is what is added on top, not what the page is made of.
 *
 * ── THE DIALOG ───────────────────────────────────────────────────────
 *
 * A real `<dialog>` opened with `showModal()`, not a div with a high
 * z-index. That is what buys the top layer, the backdrop, the inert rest
 * of the page, the focus trap and Escape — five things a hand-rolled
 * overlay has to reimplement and usually gets three of.
 *
 * Escape is handled by the element itself; `onClose` is what puts the
 * state back, so closing by Escape, by the button and by the backdrop all
 * run through one path.
 *
 * Arrow keys page. The buttons are real buttons in the tab order for
 * anyone who does not use them.
 *
 * ── NO LAYOUT SHIFT ──────────────────────────────────────────────────
 *
 * Every thumbnail reserves its own space from an `aspect-ratio` computed
 * out of the file's real dimensions, before anything downloads. That is
 * why src/data/gallery.ts is generated rather than typed — see the note
 * in tools/assets/gallery-photos.mjs.
 *
 * ── ALT TEXT ─────────────────────────────────────────────────────────
 *
 * There is none, and empty `alt` is correct rather than lazy: the
 * committee supplied photographs and no captions, so nothing here knows
 * who is in them. A generated description would be a guess read out to a
 * screen reader as fact. The grid carries one accessible name for the
 * set, and the dialog is labelled by its position ("Photograph 4 of 31"),
 * which is true and useful. Captions are one field on GalleryImage away.
 */
/**
 * ── THE CONTROLS ARE SOLID EMPEROR WITH A WHITE RING ─────────────────
 *
 * They were `bg-white/15` with `ring-white/40`. On a photograph that is a
 * pane of glass: 15% white over an unknown picture is whatever the
 * picture is, and a 40% ring is a suggestion of an edge. The close
 * control in particular was the one thing in the corner a reader had to
 * find in a hurry, and it was the least visible thing on the screen.
 *
 * The fill is Emperor, the brand token the scrim itself is set in. White
 * on Emperor measures **11.59:1**, computed from #ffffff against #4b207f
 * — far past the 4.5 floor CLAUDE.md sets, and the same number the
 * palette block in globals.css asserts for this pair.
 *
 * ── THE RING IS WHAT SEPARATES IT, NOT THE FILL ──────────────────────
 *
 * This is the part that is not obvious and is worth writing down. The
 * dialog's ::backdrop is ALSO Emperor — solid, deliberately, see the note
 * on the dialog below — and this control row sits above the picture on
 * that backdrop rather than over the picture itself. So an Emperor pill
 * on an Emperor ground has 1.00:1 of edge, and Grapevine, the obvious
 * second reach, is only 1.26:1 against Emperor. No brand fill separates
 * from this scrim, because the scrim is the brand.
 *
 * A ring at FULL white does, at 11.59:1 against both the fill and the
 * ground, and it is also the one edge that survives a photograph behind
 * it if the frame ever grows into this row. So the fill carries the glyph
 * and the ring carries the shape.
 *
 * Hover moves the fill to Grapevine, which is the accent's own 500 -> 600
 * hue step and is 9.22:1 with white, so the hover state is a change a
 * reader can see and not a downgrade.
 */
const LIGHTBOX_FILL = "bg-emperor text-white";
const LIGHTBOX_CONTROL =
  `${LIGHTBOX_FILL} ring-1 ring-white transition-colors duration-fast hover:bg-grapevine` +
  " focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Where focus goes back to on close. Without this, dismissing the
  // dialog drops focus onto <body> and a keyboard reader loses their
  // place in a 31-item grid.
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null
          ? current
          : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openIndex === null) {
      if (dialog.open) dialog.close();
      returnFocusRef.current?.focus();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, step]);

  const open = images[openIndex ?? -1];

  return (
    <>
      <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <li key={image.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
              aria-label={`View photograph ${index + 1} of ${images.length}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-card bg-surface-muted ring-1 ring-line transition-[box-shadow] duration-fast ease-out-soft hover:ring-ink-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <Image
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                /* The first three are the only ones that can be above the
                   fold at any width this site supports, so they are eager
                   and everything after them is lazy. Lazy on all 31 would
                   delay the ones already on screen; eager on all 31 is
                   3.2 MB on open, which is the thing this page is trying
                   not to do. */
                loading={index < 3 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                className="h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        /* Clicking the backdrop closes. The test is that the click landed
           on the dialog element ITSELF rather than on anything inside it,
           which is what the backdrop reports as its target. */
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        aria-label={
          open
            ? `Photograph ${(openIndex ?? 0) + 1} of ${images.length}`
            : undefined
        }
        /* ── THE SCRIM IS EMPEROR, NOT `ink` ─────────────────────────
           `backdrop:bg-ink/80` was the obvious reach and is wrong in
           exactly one place: --color-ink flips with the theme. It is
           #251637 in light and #f2eef6 in dark, so a dark scrim in the
           day would have been a WHITE flash over the photograph at
           night. Emperor is a brand token with one value in both themes,
           it is the colour the poster is anchored in, and white controls
           measure 11.59:1 on it.

           SOLID, not 95%. At 95% the page behind stayed legible through
           it — the header lockup and the grid's own cards ghosted over
           the photograph, which is the one thing a viewer is for. A
           lightbox that lets you read the page underneath is a lightbox
           that has not opened. */
        className="max-h-none max-w-none bg-transparent backdrop:bg-emperor open:fixed open:inset-0 open:flex open:h-full open:w-full open:items-center open:justify-center open:px-3 open:pt-20 open:pb-3 sm:open:p-6"
      >
        {open ? (
          // h-full, not max-h-full: the column has to BE the height of
          // the dialog for `flex-1` on the frame below to have a leftover
          // to take. With max-h-full it sized to its content, and its
          // content was a picture with no ceiling.
          <div className="flex h-full w-full max-w-5xl flex-col gap-3">
            {/* ── THE CONTROL ROW SITS BELOW THE HEADER'S LINE ────────
                On a phone this row started at the very top of the
                viewport, which is exactly where the site header's own
                menu button is — so the close control landed on top of a
                control the reader had been tapping a second earlier, and
                on some phones under the status bar as well. `pt-20` is
                the header band's own 80px, so the row starts where the
                page's content does; `env(safe-area-inset-top)`
                clears a notch on top of that, and is additive rather than
                a replacement because a phone with no notch reports 0.

                The button is a filled pill rather than a bare glyph. A
                white X on the scrim was legible in the abstract and hard
                to FIND: it was the only thing in the corner with no edges
                on a full-screen field of one colour. A ring and a fill
                make it read as a control. */}
            <div
              className="flex shrink-0 items-center justify-between gap-3"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <p className={`tabular-figures rounded-control px-3 py-1.5 text-sm font-medium ${LIGHTBOX_FILL} ring-1 ring-white/70`}>
                {(openIndex ?? 0) + 1} / {images.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className={`flex size-11 items-center justify-center rounded-full ${LIGHTBOX_CONTROL}`}
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            {/* ── THE FRAME TAKES THE LEFTOVER HEIGHT. IT DOES NOT SET IT.

                This carried `aspect-ratio: w / h` at first, to stop the
                controls jumping as you paged from a landscape to a
                portrait. On a phone that is exactly backwards: a portrait
                photograph's own ratio is TALLER than what is left after
                the counter and the arrows, so the frame grew past the
                viewport, the picture overlapped the controls and the
                arrows sat on top of the page behind. An aspect-ratio is a
                height instruction, and inside a fixed-height column the
                height is not the picture's to choose.

                `flex-1 min-h-0` gives it everything left over and no
                more, and the controls hold still for a better reason than
                before: the frame is the same height whatever is in it.
                `min-h-0` is load-bearing — a flex child's default
                `min-height: auto` refuses to shrink below its content,
                which is how a too-tall image escapes a flex column. */}
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <Image
                key={open.id}
                src={open.src}
                alt=""
                width={open.width}
                height={open.height}
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="max-h-full w-auto max-w-full rounded-card object-contain"
                priority
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photograph"
                className={`flex size-11 items-center justify-center rounded-full ${LIGHTBOX_CONTROL}`}
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photograph"
                className={`flex size-11 items-center justify-center rounded-full ${LIGHTBOX_CONTROL}`}
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
