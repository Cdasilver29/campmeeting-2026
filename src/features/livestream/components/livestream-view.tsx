import Link from "next/link";
import { eventInfo } from "@/data";
import { ACTION_LINK } from "@/lib/link-styles";
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
    <div className="flex flex-col gap-4">
      {hasRecordings ? (
        <>
          <p className="text-ink-muted">
            {eventInfo.edition} has ended. {recordingCount} of {totalSlots}{" "}
            streams from the week are posted, morning and afternoon, in
            programme order. The rest are added here as they go up.
          </p>
          <RecordingsList />
        </>
      ) : (
        <p className="text-ink-muted">
          {eventInfo.edition} has ended. Recordings are being posted to the
          church&apos;s YouTube channel, and each one is listed here as it goes
          up. Nothing has been published yet.
        </p>
      )}
      <a
        href={LIVESTREAM_CHANNEL_URL}
        target="_blank"
        rel="noreferrer"
        className={linkClassName}
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
    <section className="flex flex-col gap-3">
      <h2 className={DOC_HEADING}>Earlier this week</h2>
      <p className="text-ink-muted">
        Every day of the week, morning and afternoon. {recordingCount} of{" "}
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
        <div className={`${SHOW_BEFORE} flex-col gap-3`}>
          <BeforeStream />
        </div>

        <div className={`${SHOW_AFTER} flex-col gap-3`}>
          <AfterStream />
        </div>

        <div className={`${SHOW_DURING} flex-col gap-8`}>
          <LiveEmbed label={`${eventInfo.edition} livestream`} />
          <NowSlot />
          <CatchUp />
        </div>
      </div>

      {/* Runs during parse, immediately after the element it corrects, so
          the final state is in place before the first paint. */}
      <script
        dangerouslySetInnerHTML={{
          __html: eventPhaseScript(VIEW_ID, PHASE_ATTRIBUTE),
        }}
      />
    </>
  );
}
