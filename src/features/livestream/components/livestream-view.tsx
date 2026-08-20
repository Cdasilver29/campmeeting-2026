import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Video } from "lucide-react";
import { eventInfo } from "@/data";
import { ACTION_LINK } from "@/lib/link-styles";
import { EventPhaseSync } from "@/components/event-phase-sync";
import { eventPhaseScript } from "@/lib/event-phase-script";
import { eventStartInstant, eventPhase } from "@/features/schedule/lib/time";
import { DOC_HEADING } from "@/lib/typography";
import { LIVESTREAM_CHANNEL_URL } from "../config";
import { hasRecordings, recordingCount, totalSlots } from "../lib/recordings";
import { LiveEmbed } from "./live-embed";
import { NowSlot } from "./now-slot";
import { RecordingsList } from "./recordings-list";

const linkClassName = `${ACTION_LINK} -ml-2`;

const startLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: eventInfo.timezone,
}).format(eventStartInstant);

const VIEW_ID = "livestream-view";
const PHASE_ATTRIBUTE = "data-livestream-phase";

/**
 * ── THE STAGE ────────────────────────────────────────────────────────
 *
 * A tray the player sits in, and the one thing on this page that says
 * "this is the main event".
 *
 * The problem it fixes: the player, the archive thumbnails and the empty
 * states were all a rounded-card on the page surface with a 1px ring, so
 * the reason the page exists had the same visual weight as a thumbnail a
 * third its size. Nothing was above anything else.
 *
 * A tray rather than a shadow. The brief rules out elevation heavier than
 * the site already uses, and this site's whole emphasis vocabulary is
 * rings and grounds — see NOW_SURFACE in schedule/components/now-card.tsx,
 * which marks the live card with a 2px ring and a tint rather than a lift.
 * So the player is separated by being INSET into a surface of its own
 * instead of raised off the page.
 *
 * `surface-muted`, which is theme-aware, holding an Emperor poster, which
 * is not. That pairing is the point: in light the tray is a pale ground
 * around a deep plum rectangle, in dark it is a plum ground around the
 * same deep plum rectangle with the ring separating them. The poster
 * itself never changes colour between themes, so the white type on it
 * measures 11.59:1 at noon and at midnight. See the note in live-embed.tsx.
 *
 * The outer radius is the card radius plus the padding, which is what
 * keeps the tray's corner concentric with the player's rather than
 * running a fat corner around a tight one.
 *
 * No text of its own except the caption strip below, which is at
 * `ink`/`ink-muted` on `surface-muted`: 15.76:1 / 5.96:1 light, 14.83:1 /
 * 10.49:1 dark.
 */
const STAGE =
  "flex flex-col gap-2 rounded-[1.25rem] bg-surface-muted p-2 ring-1 ring-line sm:gap-2.5 sm:rounded-[1.5rem] sm:p-3";

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className={STAGE}>
      {children}
      {/* The caption strip. It gives the tray a bottom edge that is content
          rather than padding, and it puts the one link the during phase
          never had — the channel — beside the player instead of only in
          the before and after copy. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1.5 pb-0.5">
        <p className="text-sm font-medium text-ink">
          {eventInfo.edition} livestream
        </p>
        <a
          href={LIVESTREAM_CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline underline-offset-4 transition-colors duration-fast hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          On YouTube
          <ExternalLink aria-hidden className="size-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}

/**
 * An empty state that looks decided rather than broken.
 *
 * The three places this page can have nothing to show — no recordings
 * posted, no stream link published, nothing scheduled right now — were
 * each a bare grey sentence sitting where content would have been, which
 * is indistinguishable from content that failed to arrive. One shape for
 * all of them: a dashed panel, an icon, and a sentence that says which of
 * "not yet" and "not ever" this is.
 *
 * Dashed rather than solid, matching PendingSlot in recordings-list.tsx,
 * so "a thing that is coming" has one look across the whole page.
 *
 * `ink-muted` on `surface-muted` at 50%: the panel composites to #fcfbfd
 * in light and #230f3b in dark, where ink-muted measures 6.17:1 and
 * 10.79:1. Both clear 4.5, and both are asserted in tools/perf/contrast.mjs.
 */
function EmptyPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-[var(--width-prose)] items-start gap-3 rounded-card border border-dashed border-line bg-surface-muted/50 p-4">
      <Video aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-muted" />
      <p className="text-ink-muted">{children}</p>
    </div>
  );
}

function BeforeStream() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-muted">
        The livestream opens with the first session of {eventInfo.edition}, on{" "}
        {startLabel}. Nothing streams here before then.
      </p>
      <Link href="/schedule" className={linkClassName}>
        See the full programme
      </Link>
    </div>
  );
}

/**
 * The after phase, in its two shapes.
 *
 * WITH RECORDINGS: the archive, day 1 to day 8, above the channel link.
 * The channel link stays rather than being replaced — this list is curated
 * by hand and is the meetings somebody chose to publish, while the channel
 * is everything the church has ever posted, which is a different and still
 * useful thing.
 *
 * WITH NONE: one sentence and the channel link, which is what this page
 * has always said. The wording is the part that had to change. "Recordings
 * from the week are posted to the church's YouTube channel" describes a
 * habit, and a reader who arrives the day after the closing Sabbath and
 * finds nothing cannot tell whether that means "not yet" or "this page is
 * broken". It now says they are added here as they go up, which is a
 * promise with a place attached to it.
 *
 * The branch is resolved at BUILD time, not by the clock, because
 * `recordings` is a constant in a source file. There is no state in which
 * a reader sees the wrong one.
 */
function AfterStream() {
  return (
    <div className="flex w-full flex-col gap-4">
      {hasRecordings ? (
        <>
          {/* Capped at the measure, left aligned with the grid below it —
              see the note in CatchUp on why not `prose-column` here. */}
          <p className="max-w-[var(--width-prose)] text-ink-muted">
            {eventInfo.edition} has ended. {recordingCount} of {totalSlots}{" "}
            streams from the week are posted, in programme order. The rest
            are added here as they go up.
          </p>
          <RecordingsList />
        </>
      ) : (
        <EmptyPanel>
          {eventInfo.edition} has ended. Recordings are being posted to the
          church&apos;s YouTube channel, and each one is listed here as it goes
          up. Nothing has been published yet.
        </EmptyPanel>
      )}
      <a
        href={LIVESTREAM_CHANNEL_URL}
        target="_blank"
        rel="noreferrer"
        className={`w-fit ${linkClassName}`}
      >
        {hasRecordings
          ? "See the whole channel on YouTube"
          : "Watch for them on YouTube"}
      </a>
    </div>
  );
}

/**
 * Catch-up during the event: the archive, below the live player, so
 * somebody who missed a morning can find it without leaving the page.
 *
 * Nothing at all until the FIRST video is posted, and that is not the same
 * decision the after phase made. There the page has to say something,
 * because a reader has arrived expecting recordings. Here the live player
 * is directly above and is what the reader came for, and sixteen empty
 * boxes under it on the opening morning would be a hole in the page
 * announcing that somebody has not done the typing yet. From the first
 * upload on, the unposted slots are the useful half of the answer.
 */
function CatchUp() {
  if (!hasRecordings) return null;
  return (
    /* THE RULE IS THE FIX FOR "THREE UNRELATED BLOCKS".

       The player, the live card and the archive were separated by one flat
       gap-6 each, so the page read as three things that happened to be
       stacked. They are not three things: the player and the card are one
       unit about right now, and the archive is a different unit about the
       rest of the week. So the gap inside the unit is tightened to gap-4
       and the boundary between the units is marked the way this site marks
       every other section boundary — --space-section of air and a
       hairline — with the heading held close under it at --space-item.

       See the `during` block below for the other half of the arrangement. */
    <section className="flex w-full flex-col gap-(--space-item) border-t border-line pt-(--space-item)">
      {/* Capped but NOT centred. `prose-column` adds `margin-inline: auto`,
          which would have floated this heading into the middle of the shell
          above a grid that starts at its left edge — a heading indented
          from the thing it heads. The measure still applies; only the
          centring is dropped. */}
      <h2 className={`max-w-[var(--width-prose)] ${DOC_HEADING}`}>
        Earlier this week
      </h2>
      <p className="max-w-[var(--width-prose)] text-ink-muted">
        Every stream of the week, in programme order. {recordingCount} of{" "}
        {totalSlots} are posted so far; the rest appear here as they go up.
      </p>
      {/* The anchored copy. The home hero's "Watch live" button links to a
          slot in this one — see recordings-list.tsx on why only one copy
          carries the ids. */}
      <RecordingsList anchors />
    </section>
  );
}

/*
 * Every variant is a literal class string. Tailwind finds class names by
 * scanning source text, so a name assembled at runtime is a name it never
 * generates and the rule silently does not exist. Same rule the hero's
 * phase variants are written under.
 */
const SHOW_BEFORE =
  "hidden group-data-[livestream-phase=before]/live:flex";
const SHOW_AFTER = "hidden group-data-[livestream-phase=after]/live:flex";
const SHOW_DURING = "hidden group-data-[livestream-phase=during]/live:flex";

/**
 * The livestream page's three states, and why all three are in the HTML.
 *
 * THE BUG THIS REPLACES
 *
 * This used to paint one `aspect-video` skeleton until `useNow()` resolved,
 * on the reasoning that it reserved the player's height. It reserved the
 * *player's* height, and the player exists in only one of the three phases.
 * Before the event that skeleton resolved to two lines of text and a link,
 * so a 350px box collapsed to 68px on mount and took the footer with it:
 * 282px of travel, and a CLS of 0.1204 at 768x1024, measured — over the 0.1
 * threshold on its own.
 *
 * WHY THE SERVER CANNOT JUST RENDER THE RIGHT ONE
 *
 * Because the build clock is not the viewer's clock, and on this site the
 * gap between them is the whole point. Every page is statically generated,
 * so a deploy made on the 10th serves `before` to every visitor between the
 * 15th and the 22nd — which is precisely the week this page exists for.
 * Rendering the build phase and correcting it on mount was measured and is
 * worse than the bug it replaced: 598px of footer travel and a CLS of
 * 0.2186, because mount happens after first paint.
 *
 * WHAT IS DONE INSTEAD
 *
 * All three states are rendered, and one `data-livestream-phase` attribute
 * on the group decides which is shown. The attribute is resolved at build
 * time and corrected during parse, before first paint, by the script at the
 * bottom of this file — the same technique, and now literally the same
 * generator, that lets the home hero size itself by phase without a
 * 40%-of-viewport shift. See src/lib/event-phase-script.ts.
 *
 * The cost is about twelve extra DOM elements, none of them per-row and
 * none of them clock-dependent: two short paragraphs with a link each, plus
 * the player's poster. The gain is that the correct state is painted once,
 * nothing swaps, and the before/after copy reads with JavaScript disabled.
 *
 * This is a server component again. Only the "what is on now" card inside
 * the during state needs the viewer's clock, and that is the one piece that
 * ships as client JavaScript — see now-slot.tsx.
 */
export function LivestreamView() {
  return (
    <>
      <div
        id={VIEW_ID}
        {...{ [PHASE_ATTRIBUTE]: eventPhase(new Date()) }}
        className="group/live"
      >
        <div className={`${SHOW_BEFORE} prose-column w-full flex-col gap-3`}>
          <BeforeStream />
        </div>

        <div className={`${SHOW_AFTER} flex-col gap-3`}>
          <AfterStream />
        </div>

        {/* --space-section between the stage row and the archive, which is
            the same step every other section boundary on this site takes,
            and CatchUp draws the hairline on its own top edge. Inside the
            row the gap is 4, so the player and the live card group and the
            archive separates. It was one flat gap-6 for both, which is why
            the page read as three unrelated blocks. */}
        <div className={`${SHOW_DURING} flex-col gap-(--space-section)`}>
          {/*
            THE PLAYER AND THE LIVE CARD: STACKED, CAPPED, LEFT ALIGNED.

            Capped because a 16:9 frame at the full 80rem shell is 720px
            tall — taller than the laptop viewport it has to sit inside.
            That was always the reason and it has not changed.

            LEFT aligned, which has. `prose-column` centres what it caps,
            and that was invisible while the whole page was one column;
            the moment the archive below went full width it left a player
            floating in the middle of the shell above a heading and a
            four-column grid that start at its left edge. Everything on
            this page now begins at the same left edge.

            ── AND SIDE BY SIDE FROM xl, WHICH IS WHERE THE GAP GOES ──

            Stacked, the live card sits in a reserved box sized to the
            TALLEST card of the week (see now-slot.tsx). Most sessions are
            nowhere near that, so most of the time the reserve shows as
            dead space between the card and "Earlier this week" — which is
            the gap this pass was asked to close.

            From xl it closes completely, because the card moves into the
            column beside the player and the row is then as tall as the
            PLAYER, not as tall as the reserve. Measured at 1280 and 1440:
            the player is 784x441 and the card column is 392 wide, where
            the worst card in the week is 306. 306 fits inside 441 with
            135px to spare, so the reserve costs nothing there and is
            switched off — `xl:min-h-0` in now-slot.tsx.

            lg was tried first and is wrong: at 1024 the column is only
            307px and the same card grows to 438px in it, taller than the
            player beside it. The breakpoint is where the column stops
            making the card worse, and that is 1280, not 1024.
          */}
          <div className="flex w-full max-w-[var(--width-prose)] flex-col gap-4 xl:grid xl:max-w-none xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start xl:gap-6">
            <Stage>
              <LiveEmbed label={`${eventInfo.edition} livestream`} />
            </Stage>
            <NowSlot />
          </div>
          <CatchUp />
        </div>
      </div>

      {/* Runs during parse, immediately after the element it corrects, so
          the final state is in place before the first paint — on a COLD
          load. A client-side navigation to this page never parses a
          document, so React restores the build-time phase and this page
          would show the countdown during the event. The sync below covers
          that path; the hero had the same fault and the evidence is in
          @/components/event-phase-sync. */}
      <script
        dangerouslySetInnerHTML={{
          __html: eventPhaseScript(VIEW_ID, PHASE_ATTRIBUTE),
        }}
      />
      <EventPhaseSync elementId={VIEW_ID} attribute={PHASE_ATTRIBUTE} />
    </>
  );
}
