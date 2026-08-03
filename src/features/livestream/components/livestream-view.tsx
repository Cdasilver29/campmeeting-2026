import Link from "next/link";
import { eventInfo } from "@/data";
import { ACTION_LINK } from "@/lib/link-styles";
import { eventPhaseScript } from "@/lib/event-phase-script";
import { eventStartInstant, eventPhase } from "@/features/schedule/lib/time";
import { LIVESTREAM_CHANNEL_URL } from "../config";
import { LiveEmbed } from "./live-embed";
import { NowSlot } from "./now-slot";

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

function AfterStream() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-muted">
        {eventInfo.edition} has ended. Recordings from the week are posted to
        the church&apos;s YouTube channel.
      </p>
      <a
        href={LIVESTREAM_CHANNEL_URL}
        target="_blank"
        rel="noreferrer"
        className={linkClassName}
      >
        Watch recordings on YouTube
      </a>
    </div>
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
