"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { eventInfo } from "@/data";
import { ACTION_LINK } from "@/lib/link-styles";
import { NowCard } from "@/features/schedule/components/now-card";
import { eventStartInstant } from "@/features/schedule/lib/time";
import { getTodayState, type TodayState } from "@/features/schedule/lib/today";
import { useNow } from "@/features/schedule/use-now";
import { LIVESTREAM_CHANNEL_URL } from "../config";
import { LiveEmbed } from "./live-embed";

const linkClassName = `${ACTION_LINK} -ml-2`;

const startLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: eventInfo.timezone,
}).format(eventStartInstant);

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

function DuringStream({ state }: { state: TodayState }) {
  return (
    <div className="flex flex-col gap-8">
      <LiveEmbed label={`${eventInfo.edition} livestream`} />
      {state.current ? (
        <NowCard current={state.current} />
      ) : (
        <p className="text-sm text-ink-muted">
          Nothing is scheduled right now. Check the programme for the next
          session.
        </p>
      )}
    </div>
  );
}

/** Reserves the space the player will take, so mounting shifts nothing. */
function LivestreamSkeleton() {
  return <Skeleton className="aspect-video w-full rounded-card" />;
}

/**
 * Driven by getTodayState so "before / during / after" and "what's on
 * now" stay on Africa/Nairobi wall-clock, exactly like the Today view —
 * this reuses that resolution rather than deriving its own.
 */
export function LivestreamView() {
  const now = useNow();

  if (!now) return <LivestreamSkeleton />;

  const state = getTodayState(now);

  if (state.phase === "before") return <BeforeStream />;
  if (state.phase === "after") return <AfterStream />;
  return <DuringStream state={state} />;
}
